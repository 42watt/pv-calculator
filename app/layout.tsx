import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";
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
      <head>
        <Script
          src="https://cdn.cookie-script.com/s/36bfe0190baf9d56e43e26cd44e5ecc4.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XHCSWCENVZ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XHCSWCENVZ');
          `}
        </Script>
      </head>
      <body className={`${manrope.variable} antialiased`}>
        <LoadingScreen />
        {children}
      </body>
    </html>
  );
}
