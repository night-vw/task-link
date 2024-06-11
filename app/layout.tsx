import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SideMenu from "@/components/SideMenu";
import ClientWrapper from "@/components/ClientWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Task-Link",
  description: "Manage tasks on a map",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="md:flex">
          <ClientWrapper>
            <SideMenu/>
          </ClientWrapper>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
