import { MarketingHeader } from "@/components/MarketingHeader";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col bg-background">
      <MarketingHeader />
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  );
}
