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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" as="image" href="/assets/images/home-banner.jpeg" fetchPriority="high" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@400..800&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap" />
        <link rel="stylesheet" href="/assets/css/vendor/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/plugins/plugins.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Script src="/assets/js/plugins/jquery.js" strategy="lazyOnload" />
        <Script src="/assets/js/vendor/waw.js" strategy="lazyOnload" />
        <Script src="/assets/js/plugins/metismenu.js" strategy="lazyOnload" />
        <Script src="/assets/js/vendor/bootstrap.min.js" strategy="lazyOnload" />
        <Script src="/assets/js/main.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}