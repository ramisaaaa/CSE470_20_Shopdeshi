import type { Metadata } from "next";
import "./globals.css";
import SidebarLayout from "@/components/SidebarLayout";
import Header from "@/components/Header";
import ClientLayout from "@/components/ClientLayout";
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";
import UserSync from "@/components/UserSync";

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
        <ClientLayout>
          <CartProvider>
            <WishlistProvider>
              <UserSync />
              <Header />
              <SidebarLayout>{children}</SidebarLayout>
            </WishlistProvider>
          </CartProvider>
        </ClientLayout>
      </body>
    </html>
  );
}
