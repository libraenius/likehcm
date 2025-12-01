import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/sidebar-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { AppProviders } from "@/components/app-providers";
import { AppHeader } from "@/components/app-header";
import { AuroraBackground } from "@/components/aurora-background";

/**
 * Настройка шрифта Geist Sans для приложения
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/**
 * Метаданные приложения для SEO и отображения в браузере
 */
export const metadata: Metadata = {
  title: "РИТМ",
  description: "Система управления компетенциями и карьерными треками",
};

/**
 * Корневой layout компонент приложения
 * 
 * Определяет основную структуру HTML документа и оборачивает приложение
 * всеми необходимыми провайдерами и компонентами навигации.
 * 
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние компоненты (страницы)
 * @returns {JSX.Element} Корневой layout приложения
 */
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
            <SidebarInset className="min-h-screen z-0">
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
