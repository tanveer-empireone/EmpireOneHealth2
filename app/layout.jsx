import Script from "next/script";
import { Syne, Rubik } from "next/font/google";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-syne",
  preload: true,
});

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-rubik",
  preload: true,
});

export const metadata = {
  title: "EmpireOne Health | Healthcare BPO & RCM Services",
  description:
    "Healthcare BPO and RCM support for providers and payers, focused on foundation services ready for outsourcing."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${syne.variable} ${rubik.variable}`}>
      <head>
        <link rel="icon" type="image/webp" href="/assets/images/favicon.webp" />
        {/* Preload LCP images — banner background and hero person image */}
        <link rel="preload" as="image" href="/assets/images/banner/01.webp" fetchPriority="high" />
        <link rel="preload" as="image" href="/assets/images/banner/02.png" fetchPriority="high" />
        {/* Critical render-blocking CSS only */}
        <link rel="stylesheet" href="/assets/css/vendor/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
        {/* Preload non-critical CSS so browser fetches it early */}
        <link rel="preload" href="/assets/css/plugins/plugins.css" as="style" />
      </head>
      <body suppressHydrationWarning>
        {children}
        {/* Apply plugins CSS after first paint to unblock rendering */}
        <Script id="apply-plugins-css" strategy="afterInteractive">
          {`(function(){var l=document.querySelector('link[rel="preload"][href="/assets/css/plugins/plugins.css"]');if(l){l.rel='stylesheet';}else{var n=document.createElement('link');n.rel='stylesheet';n.href='/assets/css/plugins/plugins.css';document.head.appendChild(n);}})()`}
        </Script>
        <Script src="/assets/js/plugins/jquery.js" strategy="lazyOnload" />
        <Script src="/assets/js/vendor/waw.js" strategy="lazyOnload" />
        <Script src="/assets/js/plugins/metismenu.js" strategy="lazyOnload" />
        <Script src="/assets/js/vendor/bootstrap.min.js" strategy="lazyOnload" />
        <Script src="/assets/js/main.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}