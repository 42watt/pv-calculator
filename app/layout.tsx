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

const siteUrl = "https://tools.42watt.de";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "42watt Tools – Rechner für PV, Wärmepumpe & Förderung",
    template: "%s | 42watt Tools",
  },
  description:
    "Kostenlose Online-Rechner für Photovoltaik, Wärmepumpe und KfW-Förderung. Berechne Amortisation, Rendite und Einsparpotenzial – auf Basis aktueller Marktdaten 2025.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: siteUrl,
    siteName: "42watt Tools",
    title: "42watt Tools – Rechner für PV, Wärmepumpe & Förderung",
    description:
      "Kostenlose Online-Rechner für Photovoltaik, Wärmepumpe und KfW-Förderung. Berechne Amortisation, Rendite und Einsparpotenzial.",
  },
  twitter: {
    card: "summary_large_image",
    title: "42watt Tools – Rechner für PV, Wärmepumpe & Förderung",
    description:
      "Kostenlose Online-Rechner für Photovoltaik, Wärmepumpe und KfW-Förderung.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

// Global Schema.org: Organization
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.42watt.de/#organization",
  name: "42watt",
  url: "https://www.42watt.de",
  logo: {
    "@type": "ImageObject",
    url: "https://cdn.prod.website-files.com/66bac08ccb78d7417a017bc5/678ebd4b9aa559d5709b2891_logo_blue.svg",
    width: "600",
    height: "60",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Infanteriestr. 11",
    addressLocality: "München",
    postalCode: "80797",
    addressCountry: "DE",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+49-89-215-250-90",
    email: "kundenservice@42watt.de",
    contactType: "customer service",
    availableLanguage: "German",
  },
  sameAs: [
    "https://www.linkedin.com/company/42watt",
  ],
};

// Global Schema.org: WebSite
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  url: siteUrl,
  name: "42watt Tools",
  description:
    "Kostenlose Online-Rechner für Photovoltaik, Wärmepumpe und KfW-Förderung.",
  publisher: { "@id": "https://www.42watt.de/#organization" },
  inLanguage: "de-DE",
  isPartOf: {
    "@type": "WebSite",
    "@id": "https://www.42watt.de/#website",
    url: "https://www.42watt.de",
    name: "42watt",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationSchema, websiteSchema]),
          }}
        />
      </head>
      <body className={`${manrope.variable} antialiased`}>
        <LoadingScreen />
        {children}
      </body>
    </html>
  );
}
