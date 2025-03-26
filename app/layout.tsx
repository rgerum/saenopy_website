import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Saenopy - 3D traction force microscopy",
  description:
    "An open-source software for calculating 3D traction forces in cell mechanics research",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
