import { ThemeProvider } from "@/context/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/navigation/bottom-nav";
import Gradient from "@/components/gradients/main-gradient";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/header/header";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const poppins = Poppins({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "SparkMatch",
  description: "Find your perfect match with SparkMatch - the dating app that ignites connections.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={` ${inter.variable} ${poppins.variable} antialiased pb-16 sm:pb-0`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster position="top-center" richColors />
            <Gradient />
            <Header />
            {children}
            <BottomNav />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
