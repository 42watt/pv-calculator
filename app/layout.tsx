import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import LoadingScreen from "./components/LoadingScreen";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const siteUrl = "https://tools.42watt.de";
const ogImage = "https://cdn.prod.website-files.com/66bac08ccb78d7417a017bc5/678ebd4b9aa559d5709b2891_logo_blue.svg";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "42watt Tools – Rechner für Photovoltaik, Wärmepumpe & KfW-Förderung",
    template: "%s | 42watt Tools",
  },
  description:
    "Kostenlose Online-Rechner für Photovoltaik, Wärmepumpe, Autarkie und KfW-Förderung. Amortisation, Rendite, Eigenverbrauch & Einsparung berechnen – mit aktuellen Marktdaten 2026.",
  applicationName: "42watt Tools",
  authors: [{ name: "Enovato GmbH", url: "https://www.42watt.de" }],
  creator: "Enovato GmbH",
  publisher: "Enovato GmbH",
  category: "finance",
  keywords: [
    "Photovoltaik Rechner",
    "PV Rechner",
    "Wärmepumpe Rechner",
    "KfW Förderrechner",
    "Autarkierechner",
    "PV Amortisation",
    "Eigenverbrauch berechnen",
    "Photovoltaik Rendite",
    "Wärmepumpe Amortisation",
    "Börsenstrompreis",
    "42watt",
  ],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: siteUrl,
    siteName: "42watt Tools",
    title: "42watt Tools – Rechner für Photovoltaik, Wärmepumpe & KfW-Förderung",
    description:
      "Kostenlose Online-Rechner für Photovoltaik, Wärmepumpe, Autarkie und KfW-Förderung. Basierend auf aktuellen Marktdaten 2026.",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "42watt Tools – Energierechner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "42watt Tools – Rechner für Photovoltaik, Wärmepumpe & KfW-Förderung",
    description:
      "Kostenlose Online-Rechner für Photovoltaik, Wärmepumpe, Autarkie und KfW-Förderung.",
    images: [ogImage],
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
    languages: {
      "de-DE": siteUrl,
      "x-default": siteUrl,
    },
  },
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
};

// Global Schema.org: Organization
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.42watt.de/#organization",
  name: "42watt",
  legalName: "Enovato GmbH",
  url: "https://www.42watt.de",
  logo: {
    "@type": "ImageObject",
    url: "https://cdn.prod.website-files.com/66bac08ccb78d7417a017bc5/678ebd4b9aa559d5709b2891_logo_blue.svg",
    width: "600",
    height: "60",
  },
  image: "https://cdn.prod.website-files.com/66bac08ccb78d7417a017bc5/678ebd4b9aa559d5709b2891_logo_blue.svg",
  description:
    "42watt unterstützt Hausbesitzer bei der Planung und Umsetzung von Wärmepumpen, Photovoltaik und energetischer Sanierung – inklusive Fördermittelservice.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Infanteriestr. 11",
    addressLocality: "München",
    postalCode: "80797",
    addressRegion: "Bayern",
    addressCountry: "DE",
  },
  areaServed: { "@type": "Country", name: "Deutschland" },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+49-89-215-250-90",
    email: "kundenservice@42watt.de",
    contactType: "customer service",
    availableLanguage: ["German", "English"],
    areaServed: "DE",
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
    "Kostenlose Online-Rechner für Photovoltaik, Wärmepumpe, Autarkie und KfW-Förderung.",
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
        <link rel="dns-prefetch" href="https://cdn.cookie-script.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://cdn.prod.website-files.com" />
        <link rel="preconnect" href="https://cdn.cookie-script.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <Script
          src="https://cdn.cookie-script.com/s/36bfe0190baf9d56e43e26cd44e5ecc4.js"
          strategy="lazyOnload"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XHCSWCENVZ"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
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
