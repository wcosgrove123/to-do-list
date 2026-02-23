import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ADHD Productivity OS",
  description: "Chat-first, AI-powered productivity system for ADHD workflows",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
