import type { Metadata } from "next";

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Libreta",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
