import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/context/CartContext";
import { CustomerAuthProvider } from "@/lib/context/CustomerAuthContext";

export const metadata: Metadata = {
  title: "InfraPro Store",
  description: "Your one-stop shop for quality products",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <CustomerAuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
