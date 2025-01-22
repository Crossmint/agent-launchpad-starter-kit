import type { Metadata } from "next";
import type React from "react";
import { Inter, Raleway } from "next/font/google";

import { cn } from "../lib/utils";
import "./globals.css";
import { Header } from "@/components/header";
import { Toaster } from "@/components/toaster";
import { Providers } from "./_lib/providers";

export const metadata: Metadata = {
    title: "Crossmint Agent Launchpad",
    description: "Crossmint Agent Launchpad",
};

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

const raleway = Raleway({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-raleway",
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            // Add font variables so they'll be available for tailwind
            className={cn(inter.variable, raleway.variable)}
        >
            <head>
                <title>{metadata.title as string}</title>
            </head>
            <body className="bg-background font-body text-foreground min-h-screen antialiased">
                <main id="main">
                    <Providers>
                        <Header />
                        <Toaster />

                        {children}
                    </Providers>
                </main>
            </body>
        </html>
    );
}
