import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "Fynora - Connect with Your Community",
  description: "A vibrant social platform where communities thrive. Share, connect, and grow with Fynora.",
  keywords: ["social network", "community", "connections", "fynora"],
  authors: [{ name: "Fynora Team" }],
  creator: "Fynora",
  publisher: "Fynora",
  openGraph: {
    title: "Fynora - Connect with Your Community",
    description: "A vibrant social platform where communities thrive",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
