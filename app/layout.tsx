import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./component/Navbar.css";
import "./component/hero.css";
import "./booking/[id]/booking.css";
import "./booking/[id]/seats/seats.css";
import "./payment/payment.css";
import StoreProvider from "../store/StoreProvider";
import NavbarWrapper from "./component/NavbarWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Online Movie Ticket Booking",
  description: "Book your favorite movies easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <NavbarWrapper />
          <div className="page-wrapper fade-in">
            {children}
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
