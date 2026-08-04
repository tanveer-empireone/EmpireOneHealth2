import LegacyScripts from "../components/LegacyScripts";
import ServiceWorkerRegistration from "../components/ServiceWorkerRegistration";

export const metadata = {
  title: "Medical & Health Care HTML Template",
  description:
    "Your trusted source for expert healthcare services and medical information. Providing personalized care, advanced treatments, and reliable health resources to help you achieve better health."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="EmpireOne Health" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="EmpireOne Health" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#5353ff" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/pwa/apple-touch-icon.png" />
        <link rel="icon" type="image/webp" href="/assets/images/favicon.webp" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" as="image" href="/assets/images/main-hero-background.jpg" fetchPriority="high" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@400..800&family=Rubik:ital,wght@0,300..900;1,300..900&display=swap" />
        <link rel="stylesheet" href="/assets/css/vendor/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/plugins/plugins.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
      </head>
      <body suppressHydrationWarning>
        <ServiceWorkerRegistration />
        {children}
        <LegacyScripts />
      </body>
    </html>
  );
}