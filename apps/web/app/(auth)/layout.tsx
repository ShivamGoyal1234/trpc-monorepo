import { Card, CardContent } from "~/components/ui/card";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="ocean-glass w-full max-w-md border-white/15">
        <CardContent className="pt-6">{children}</CardContent>
      </Card>
    </div>
  );
}
