"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Lines from "@/components/Lines";
import ScrollToTop from "@/components/ScrollToTop";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import "../globals.css";
import Head from "@/app/(site)/head"
import { usePathname } from "next/navigation";
const inter = Inter({ subsets: ["latin"] });

import ToasterContext from "../context/ToastContext";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <html lang="en" suppressHydrationWarning>

<head>
<Head />
</head>

      <body className={`dark:bg-black ${inter.className}`}>
        <ThemeProvider
          enableSystem={false}
          attribute="class"
          defaultTheme="light"
        >
          <AuthProvider>
            <Lines />
            <Header />
            <ToasterContext />
            {children}
            {pathname !== '/dashboard' && <Footer />}
            <ScrollToTop />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
