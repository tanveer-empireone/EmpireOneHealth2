import Script from "next/script";

export const metadata = {
  title: "Medical & Health Care HTML Template",
  description:
    "Your trusted source for expert healthcare services and medical information. Providing personalized care, advanced treatments, and reliable health resources to help you achieve better health."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/webp" href="/assets/images/favicon.webp" />
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


