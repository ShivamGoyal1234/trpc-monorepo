import { MarketingFooter } from "~/src/components/marketing/footer";
import { MarketingNavbar } from "~/src/components/marketing/navbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate min-h-screen overflow-x-hidden pt-16">
      <MarketingNavbar />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}
