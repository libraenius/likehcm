import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/sidebar-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { AppProviders } from "@/components/app-providers";
import { AppHeader } from "@/components/app-header";
import { AuroraBackground } from "@/components/aurora-background";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "РИТМ",
  description: "Система управления компетенциями и карьерными треками",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} antialiased`}
      >
        <AppProviders>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="min-h-screen">
              <AuroraBackground className="min-h-full w-full">
                <AppHeader />
                <div className="flex flex-1 flex-col gap-4 p-4 pt-6 overflow-x-hidden">
                  {children}
                </div>
              </AuroraBackground>
            </SidebarInset>
          </SidebarProvider>
        </AppProviders>
      </body>
    </html>
  );
}
