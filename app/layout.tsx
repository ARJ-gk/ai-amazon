import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Nav } from "@/components/nav";
import { AuthProvider } from "@/components/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Amazon - Your AI-Powered Shopping Experience",
  description: "Discover a smarter way to shop with AI-powered recommendations and personalized experiences.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <Nav />
          <main className="container mx-auto py-6">{children}</main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
