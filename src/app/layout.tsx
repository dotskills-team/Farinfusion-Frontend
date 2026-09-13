import type { Metadata } from "next";
import { Geist, Geist_Mono, Open_Sans } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import ReduxProvider from "@/providers/ReduxProvider";
import Script from "next/script";
import { AnalyticsPageView } from "@/hooks/analyticsPageView";
import AppBootstrap from "@/components/shared/AppBootstrap";
import { Toaster } from "sonner";
import SonnerProvider from "@/components/shared/SonnerProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Farin Fusion | Premium Skincare & Beauty Products",

  description:
    "Discover premium skincare and beauty products from Farin Fusion. Nourish your skin with carefully selected beauty essentials and enjoy fast delivery across Bangladesh.",

  keywords: [
    "Farin Fusion",
    "skincare products",
    "beauty products Bangladesh",
    "face care",
    "skin care",
    "beauty essentials",
    "cosmetics Bangladesh",
    "glowing skin",
    "organic skincare",
    "premium skincare",
    "online beauty shop",
    "Bangladesh skincare brand",
  ],

  metadataBase: new URL("https://farinfusion.com"),

  openGraph: {
    title: "Farin Fusion | Premium Skincare & Beauty Products",
    description:
      "Discover premium skincare and beauty products from Farin Fusion. Nourish your skin with carefully selected beauty essentials and enjoy fast delivery across Bangladesh.",
    url: "https://farinfusion.com",
    siteName: "Farin Fusion",
    images: [
      {
        url: "/favicon.ico",
        width: 1200,
        height: 630,
        alt: "Farin Fusion - E-commerce Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Farin Fusion | Premium Skincare & Beauty Products",
    description:
      "Discover premium skincare and beauty products from Farin Fusion. Nourish your skin with carefully selected beauty essentials and enjoy fast delivery across Bangladesh.",
    images: ["/favicon.ico"],
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },

  applicationName: "Farin Fusion",

  authors: [{ name: "Farin Fusion Team", url: "https://farinfusion.com" }],

  creator: "Farin Fusion",
  publisher: "Farin Fusion",

  category: "e-commerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${openSans.variable}  h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Google Tag Manager */}
        <Script id="gtm-init" strategy="afterInteractive">
          {`
    (function(w,d,s,l,i){
      w[l]=w[l]||[];
      w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
      var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),
          dl=l!='dataLayer'?'&l='+l:'';
      j.async=true;
      j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
      f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-PV53DVVC');
  `}
        </Script>

        {/* Google Analytics (Client Measurement ID) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-WN91GRQ2TH"
          strategy="afterInteractive"
        />

        <Script id="ga4-init" strategy="afterInteractive">
          {`
    window.dataLayer = window.dataLayer || [];

    function gtag(){
      dataLayer.push(arguments);
    }

    window.gtag = gtag;

    gtag('js', new Date());

    gtag('config', 'G-WN91GRQ2TH', {
      send_page_view: false
    });
  `}
        </Script>

        {/* GTM NoScript */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PV53DVVC"
            height="0"
            width="0"
            style={{
              display: "none",
              visibility: "hidden",
            }}
          />
        </noscript>

        <AnalyticsPageView />
        <ReduxProvider>
          <UserProvider>
            <SonnerProvider />
            {/* <AppBootstrap> */}
            {children}
            {/* </AppBootstrap> */}
          </UserProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
