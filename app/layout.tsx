import type { Metadata } from "next";
import "./globals.css";
import "./local-font.css";
import "./personal.css";

export const metadata: Metadata = {
  title: "Something I wanted to say",
  description: "A private message.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  referrer: "no-referrer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body>{children}</body>
    </html>
  );
}
