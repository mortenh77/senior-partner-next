import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Warnings from "./components/warnings";
import { assistantId } from "./assistant-config";
const inter = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "300"
});

export const metadata = {
  title: "Sors' Senior AI Partner",
  description: "An AI Representation of Sors' Senior Partner.",
  icons: {
    icon: "/sors-logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {assistantId ? children : <Warnings />}
        <img className="logo" src="/sors-logo.png" alt="Sors Logo" />
      </body>
    </html>
  );
}
