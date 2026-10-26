// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @title PromptGateway (V4 — MUSD ERC-20)
/// @notice Immutable MUSD micropayment escrow with seller / platform split on Mezo.
/// @dev MUSD is an ERC-20 (18 decimals). Gas is paid in native BTC. Deploy with
///      minFee = 1e16 (0.01 MUSD). No proxy / no upgrades — constructor-locked.
contract PromptGateway {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    /// @notice MUSD token used for all deposits and withdrawals.
    IERC20 public immutable musd;
    /// @notice Deployer / operator — may trigger platform withdrawals.
    address public immutable owner;
    /// @notice Destination for platform fees.
    address public immutable treasury;
    /// @notice Minimum accepted deposit amount (floor). Catalog prices may be higher.
    uint256 public immutable minFee;
    /// @notice Maximum accepted deposit amount (fat-finger / griefing cap).
    uint256 public immutable maxFee;
    /// @notice Platform cut in basis points (e.g. 1000 = 10%). Seller receives the remainder.
    uint256 public immutable platformFeeBps;

    mapping(bytes32 => bool) public usedPaymentId;
    /// @notice Gross amount recorded per paymentId (for off-chain verification / disputes).
    mapping(bytes32 => uint256) public paymentAmount;
    mapping(address => uint256) public pendingSeller;
    uint256 public pendingPlatform;
    /// @notice Sum of all pending seller + platform balances.
    uint256 public totalPending;

    uint256 private _status;

    event PaymentDeposited(
        address indexed payer,
        address indexed seller,
        bytes32 indexed paymentId,
        uint256 amount,
        uint256 sellerAmount,
        uint256 platformAmount
    );
    event SellerWithdrawn(address indexed seller, uint256 amount);
    event PlatformWithdrawn(address indexed to, uint256 amount);

    error OnlyOwner();
    error InvalidPaymentId();
    error InvalidSeller();
    error InvalidTreasury();
    error InvalidToken();
    error InvalidFeeRange();
    error InvalidBps();
    error PaymentAlreadyUsed();
    error BelowMinFee();
    error AboveMaxFee();
    error NothingToWithdraw();
    error TransferFailed();
    error DirectDepositDisabled();
    error Reentrancy();

    constructor(
        address musd_,
        uint256 minFee_,
        uint256 maxFee_,
        uint256 platformFeeBps_,
        address treasury_
    ) {
        if (musd_ == address(0)) revert InvalidToken();
        if (minFee_ == 0 || maxFee_ < minFee_) revert InvalidFeeRange();
        if (platformFeeBps_ > 10_000) revert InvalidBps();
        if (treasury_ == address(0) || treasury_ == address(this)) {
            revert InvalidTreasury();
        }

        musd = IERC20(musd_);
        owner = msg.sender;
        treasury = treasury_;
        minFee = minFee_;
        maxFee = maxFee_;
        platformFeeBps = platformFeeBps_;
        _status = _NOT_ENTERED;
    }

    /// @notice Reject naked native transfers — payments are MUSD ERC-20 only.
    receive() external payable {
        revert DirectDepositDisabled();
    }

    fallback() external payable {
        revert DirectDepositDisabled();
    }

    /// @notice Preview seller / platform split for an amount (no state change).
    function previewSplit(
        uint256 amount
    ) external view returns (uint256 sellerAmount, uint256 platformAmount) {
        platformAmount = (amount * platformFeeBps) / 10_000;
        sellerAmount = amount - platformAmount;
    }

    /// @notice Pull `amount` MUSD from payer; credit seller and platform pending balances.
    /// @dev Caller must `approve` this contract for at least `amount` first.
    ///      `paymentId` must be unique forever. Bind it off-chain to payer + service + nonce.
    function depositPayment(
        bytes32 paymentId,
        address seller,
        uint256 amount
    ) external nonReentrant {
        if (paymentId == bytes32(0)) revert InvalidPaymentId();
        if (seller == address(0) || seller == address(this)) revert InvalidSeller();
        if (usedPaymentId[paymentId]) revert PaymentAlreadyUsed();
        if (amount < minFee) revert BelowMinFee();
        if (amount > maxFee) revert AboveMaxFee();

        usedPaymentId[paymentId] = true;
        paymentAmount[paymentId] = amount;

        uint256 platformAmount = (amount * platformFeeBps) / 10_000;
        uint256 sellerAmount = amount - platformAmount;

        pendingSeller[seller] += sellerAmount;
        pendingPlatform += platformAmount;
        totalPending += amount;

        bool ok = musd.transferFrom(msg.sender, address(this), amount);
        if (!ok) revert TransferFailed();

        emit PaymentDeposited(
            msg.sender,
            seller,
            paymentId,
            amount,
            sellerAmount,
            platformAmount
        );
    }

    function withdrawSeller() external nonReentrant {
        uint256 amount = pendingSeller[msg.sender];
        if (amount == 0) revert NothingToWithdraw();

        pendingSeller[msg.sender] = 0;
        totalPending -= amount;

        bool ok = musd.transfer(msg.sender, amount);
        if (!ok) revert TransferFailed();

        emit SellerWithdrawn(msg.sender, amount);
    }

    /// @notice Owner pulls accrued platform fees to the immutable treasury.
    function withdrawPlatform() external nonReentrant {
        if (msg.sender != owner) revert OnlyOwner();

        uint256 amount = pendingPlatform;
        if (amount == 0) revert NothingToWithdraw();

        pendingPlatform = 0;
        totalPending -= amount;

        bool ok = musd.transfer(treasury, amount);
        if (!ok) revert TransferFailed();

        emit PlatformWithdrawn(treasury, amount);
    }

    function isUsed(bytes32 paymentId) external view returns (bool) {
        return usedPaymentId[paymentId];
    }

    /// @dev Back-compat alias for minFee.
    function feeAmount() external view returns (uint256) {
        return minFee;
    }

    modifier nonReentrant() {
        if (_status == _ENTERED) revert Reentrancy();
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}
