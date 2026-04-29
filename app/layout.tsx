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
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://storage.googleapis.com" />
        <link rel="dns-prefetch" href="https://cdn.prod.website-files.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://storage.googleapis.com" crossOrigin="anonymous" />
        {/* Google Consent Mode v2 default — must run before GA loads */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                analytics_storage: localStorage.getItem('silktideCookieChoice_statistiken') === 'true' ? 'granted' : 'denied',
                ad_storage: localStorage.getItem('silktideCookieChoice_marketing') === 'true' ? 'granted' : 'denied',
                ad_user_data: localStorage.getItem('silktideCookieChoice_marketing') === 'true' ? 'granted' : 'denied',
                ad_personalization: localStorage.getItem('silktideCookieChoice_marketing') === 'true' ? 'granted' : 'denied',
              });
              function syncConsentCookie() {
                var s = localStorage.getItem('silktideCookieChoice_statistiken') === 'true';
                var m = localStorage.getItem('silktideCookieChoice_marketing') === 'true';
                var val = 'statistiken=' + s + '&marketing=' + m;
                var host = window.location.hostname;
                var domainAttr = /42watt\\.de$/i.test(host) ? ';domain=.42watt.de' : '';
                document.cookie = '_consent=' + val + ';path=/' + domainAttr + ';max-age=' + (390 * 86400) + ';SameSite=Lax';
              }
              function clearCookiesForCategory(category) {
                var patterns = {
                  statistiken: [/^_ga$/, /^_ga_/, /^_gid$/, /^_ftd$/, /^_vis_opt_/, /^_vwo_/],
                  marketing: [/^_gcl_/, /^_gac_/, /^_fbp$/, /^_fbc$/]
                };
                var toDelete = patterns[category] || [];
                var domains = ['.42watt.de', '.' + location.hostname, location.hostname];
                var paths = ['/', ''];
                document.cookie.split(';').forEach(function(c) {
                  var name = c.split('=')[0].trim();
                  toDelete.forEach(function(pattern) {
                    if (pattern.test(name)) {
                      domains.forEach(function(domain) {
                        paths.forEach(function(path) {
                          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=' + domain + '; path=' + path;
                        });
                      });
                      paths.forEach(function(path) {
                        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + path;
                      });
                    }
                  });
                });
              }
              window.syncConsentCookie = syncConsentCookie;
              window.clearCookiesForCategory = clearCookiesForCategory;
              if (localStorage.getItem('silktideCookieBanner_InitialChoice') === '1') syncConsentCookie();
            `,
          }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XHCSWCENVZ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            gtag('js', new Date());
            gtag('config', 'G-XHCSWCENVZ');
          `}
        </Script>
        {/* Silktide Cookie Manager */}
        <link
          rel="stylesheet"
          id="silktide-consent-manager-css"
          href="https://storage.googleapis.com/42watt-public-assets/cdn/css/silktide-consent-manager.css"
        />
        <Script
          src="https://storage.googleapis.com/42watt-public-assets/cdn/js/silktide-consent-manager.js"
          strategy="afterInteractive"
        />
        <Script id="silktide-config" strategy="afterInteractive">
          {`
            (function applyConfig() {
              if (typeof window.silktideCookieBannerManager === 'undefined') {
                setTimeout(applyConfig, 50);
                return;
              }
              window.silktideCookieBannerManager.updateCookieBannerConfig({
                background: { showBackground: true },
                cookieIcon: { position: "bottomRight" },
                cookieTypes: [
                  {
                    id: "notwendig",
                    name: "Notwendig",
                    description: "<p>Diese Cookies sind für die grundlegende Funktion der Website erforderlich und können nicht deaktiviert werden.</p>",
                    required: true
                  },
                  {
                    id: "statistiken",
                    name: "Statistiken",
                    description: "<p>Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren, indem sie Informationen anonym sammeln und auswerten.</p>",
                    required: false,
                    onAccept: function() {
                      gtag('consent', 'update', { analytics_storage: 'granted' });
                      dataLayer.push({ 'event': 'consent_accepted_statistiken' });
                      syncConsentCookie();
                    },
                    onReject: function() {
                      gtag('consent', 'update', { analytics_storage: 'denied' });
                      dataLayer.push({ 'event': 'consent_denied_statistiken' });
                      clearCookiesForCategory('statistiken');
                      syncConsentCookie();
                    }
                  },
                  {
                    id: "marketing",
                    name: "Marketing",
                    description: "<p>Diese Cookies werden verwendet, um Werbung relevanter für Sie zu gestalten und die Wirksamkeit von Werbekampagnen zu messen.</p>",
                    required: false,
                    onAccept: function() {
                      gtag('consent', 'update', {
                        ad_storage: 'granted',
                        ad_user_data: 'granted',
                        ad_personalization: 'granted'
                      });
                      dataLayer.push({ 'event': 'consent_accepted_marketing' });
                      syncConsentCookie();
                    },
                    onReject: function() {
                      gtag('consent', 'update', {
                        ad_storage: 'denied',
                        ad_user_data: 'denied',
                        ad_personalization: 'denied'
                      });
                      clearCookiesForCategory('marketing');
                      syncConsentCookie();
                    }
                  }
                ],
                text: {
                  banner: {
                    description: "<p>Wir verwenden Cookies, um unsere Website zu optimieren und relevante Inhalte bereitzustellen. Mehr dazu in unserer <a href=\\"/datenschutz\\" target=\\"_blank\\">Datenschutzerklärung</a>.</p>",
                    acceptAllButtonText: "Alle akzeptieren",
                    acceptAllButtonAccessibleLabel: "Alle Cookies akzeptieren",
                    rejectNonEssentialButtonText: "Nur notwendige",
                    rejectNonEssentialButtonAccessibleLabel: "Nur notwendige Cookies zulassen",
                    preferencesButtonText: "Einstellungen",
                    preferencesButtonAccessibleLabel: "Cookie-Einstellungen anpassen"
                  },
                  preferences: {
                    title: "Cookie-Einstellungen",
                    description: "<p>Hier können Sie festlegen, welche Cookies Sie zulassen möchten. Ihre Einstellungen gelten für die gesamte Website und können jederzeit geändert werden.</p>",
                    creditLinkText: "Get this banner for free",
                    creditLinkAccessibleLabel: "Get this banner for free"
                  }
                }
              });
            })();
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
