import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
    title: "Broken Alley — Inventory & Orders",
    description:
        "Production-ready inventory and order management system for Broken Alley clothing brand.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="bg-zinc-50 font-[Inter,sans-serif] antialiased">
                <ToastProvider>
                    <Sidebar />
                    {/* Offset content for sidebar */}
                    <main className="lg:pl-60 pt-14 lg:pt-0 min-h-screen">
                        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                            {children}
                        </div>
                    </main>
                </ToastProvider>
            </body>
        </html>
    );
}
