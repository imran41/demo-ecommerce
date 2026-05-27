import { Outfit } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import { ToastContainer } from "@/components/Toast";
import HeaderFooterWrapper from "@/components/HeaderFooterWrapper";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "Apex E-Store | Premium Digital Tech & Gear",
  description: "Explore curated high-end ANC headphones, customizable mechanical keyboards, automatic watches, cameras, and premium accessories.",
  keywords: "ecommerce, tech store, mechanical keyboards, premium headphones, gadgets, smart watches",
  openGraph: {
    title: "Apex E-Store",
    description: "Curated High-End Tech and Lifestyle Accessories",
    type: "website"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full font-sans bg-white text-slate-800 flex flex-col">
        <StoreProvider>
          <HeaderFooterWrapper>
            {children}
          </HeaderFooterWrapper>
          <ToastContainer />
        </StoreProvider>
      </body>
    </html>
  );
}
