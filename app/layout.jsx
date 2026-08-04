import Script from "next/script";

const siteUrl = "https://empireonehealth.com/";
const siteName = "EmpireOne Health";
const defaultTitle = "EmpireOne Health | Healthcare BPO & RCM Services";
const defaultDescription =
  "EmpireOne Health supports providers and payers with healthcare BPO, RCM workflows, member services, and HIPAA-conscious delivery.";
const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}#website`,
  name: siteName,
  url: siteUrl
};

export const metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: defaultTitle,
    template: "%s"
  },
  description: defaultDescription,
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    shortcut: [{ url: "/favicon.ico" }]
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    siteName,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/assets/images/home-banner.jpeg",
        width: 1200,
        height: 630,
        alt: siteName
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/assets/images/home-banner.jpeg"]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData)
          }}
        />
        <link rel="stylesheet" href="/assets/css/plugins/plugins.css" />
        <link rel="stylesheet" href="/assets/css/plugins/magnifying-popup.css" />
        <link rel="stylesheet" href="/assets/css/vendor/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Script src="/assets/js/plugins/jquery.js" strategy="beforeInteractive" />

        <Script src="/assets/js/plugins/jquery-ui.js" strategy="afterInteractive" />
        <Script src="/assets/js/vendor/waw.js" strategy="afterInteractive" />
        <Script src="/assets/js/plugins/swiper.js" strategy="afterInteractive" />
        <Script src="/assets/js/plugins/metismenu.js" strategy="afterInteractive" />
        <Script src="/assets/js/plugins/jarallax.js" strategy="afterInteractive" />
        <Script src="/assets/js/plugins/smooth-scroll.js" strategy="afterInteractive" />
        <Script src="/assets/js/plugins/magnifying-popup.js" strategy="afterInteractive" />
        <Script src="/assets/js/vendor/bootstrap.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/main.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}


