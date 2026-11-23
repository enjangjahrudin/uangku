import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Shell } from "@/components/shell";
import { RegisterSW } from "@/components/register-sw";
import { getCategories, getMembers, getPending, getWallets } from "@/lib/queries";
import { currentMemberId } from "@/lib/member";

export const metadata: Metadata = {
  title: "UangKu",
  description: "Pencatat keuangan pribadi & keluarga",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
  appleWebApp: { capable: true, title: "UangKu", statusBarStyle: "default" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#1f5f4a" };
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const members = getMembers();
  const memberId = await currentMemberId();
  return (
    <html lang="id">
      <body>
        <RegisterSW />
        <Shell wallets={getWallets()} categories={getCategories()} pendingCount={getPending().length} members={members} memberId={memberId}>
          {children}
        </Shell>
      </body>
    </html>
  );
}

