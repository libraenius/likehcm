import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/sidebar-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { SidebarInset } from "@/components/ui/sidebar";
import { AppProviders } from "@/components/app-providers";
import { ThemeToggle } from "@/components/theme-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillMap - Система управления компетенциями",
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
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <AppBreadcrumb />
                <div className="ml-auto">
                  <ThemeToggle />
                </div>
              </header>
              <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </AppProviders>
      </body>
    </html>
  );
}
