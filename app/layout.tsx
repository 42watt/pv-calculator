import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import LoadingScreen from "./components/LoadingScreen";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
});

export const metadata: Metadata = {
  title: "42watt - PV & Wärmepumpe Wirtschaftlichkeitsrechner",
  description: "Berechnen Sie die Wirtschaftlichkeit Ihrer PV-Anlage mit Wärmepumpe",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${manrope.variable} antialiased`}>
        <LoadingScreen />
        {children}
      </body>
    </html>
  );
}
