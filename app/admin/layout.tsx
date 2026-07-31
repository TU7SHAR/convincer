import type { Metadata } from "next";

import "./admin.css";

export const metadata: Metadata = {
  title: "Super Admin",
  description: "Private page administration.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
