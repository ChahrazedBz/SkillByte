import { Geist } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata = { 
  title: "SkillByte", 
  description: "Learn anything." 
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}