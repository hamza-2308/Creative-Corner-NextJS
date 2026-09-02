import "./globals.css";
import "./gallery-admin.css";
import { SiteChrome } from "@/components/SiteChrome";

export const metadata = {
  title: "Creative Corner | Event Management",
  description: "Professional event planning, management and booking platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
