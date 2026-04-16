import type { Metadata } from "next";
import { Chakra_Petch } from "next/font/google";
import "./globals.css";

const chakraPetch = Chakra_Petch({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-chakra-petch",
});

export const metadata: Metadata = {
  title: "Ethiopian Airlines KMS - Knowledge Management System",
  description: "Strategic Knowledge Management System for Ethiopian Airlines - Digital Ethiopia 2030",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${chakraPetch.variable} h-full antialiased`}
    >
      <body className={`${chakraPetch.className} min-h-full flex flex-col`}>{children}</body>
    </html>
  );
}
