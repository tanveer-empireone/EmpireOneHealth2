import Script from "next/script";

export const metadata = {
  title: {
    default: "EmpireOne Health | Healthcare Operations Support",
    template: "%s | EmpireOne Health"
  },
  description:
    "EmpireOne Health supports providers and payers with healthcare operations, revenue cycle workflows, member services, and HIPAA-conscious delivery."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google tag (gtag.js) - keep this on main branch only. Do not remove. */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-69S13CLQFC"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-69S13CLQFC');
`
          }}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
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


