import type { Metadata } from "next";
import "./app/globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import SidebarLayout from "@/components/SidebarLayout";
import Header from "@/components/Header";


export const metadata: Metadata = {
  title: {
    template: "%s - Shopdeshi",
    default: "Shopdeshi",
  },
  description:
    "ShopDeshi is a direct marketplace that connects deshi artisans and buyers. This platform creates a bridge between handicraft makers and buyers without the involvement of any third parties",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-poppins">
        <ClerkProvider>
          <Header />
          <SidebarLayout>{children}</SidebarLayout>
        </ClerkProvider>
      </body>
    </html>
  );
};
