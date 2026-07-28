import { notFound } from "next/navigation";
import BookCallForm from "../../components/BookCallForm";
import CalendlyWidget from "../../components/CalendlyWidget";
import LandingPageForm from "../../components/landingpageform";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import PopupForm from "../../components/PopupForm";
import { listLegacyHtmlPages, readLegacyFullPage, readLegacyPage, resolveLegacyPage } from "../../lib/legacy-pages";

const siteUrl = "https://empireonehealth.com";

function getCanonicalPath(fileName) {
  if (fileName === "index.html") {
    return "/";
  }

  if (fileName === "contactus.html") {
    return "/contact";
  }

  if (fileName === "appoinment.html") {
    return "/appointment";
  }

  return `/${fileName.replace(/\/index\.html$/i, "").replace(/\.html$/i, "")}`;
}

function getSocialImagePath(fileName) {
  if (fileName === "contactus.html") {
    return "/assets/images/contact-us.jpeg";
  }

  if (fileName.startsWith("case-study/")) {
    return "/assets/images/case-studies.jpeg";
  }

  if (fileName.startsWith("provider-services/")) {
    return "/assets/images/provider-services.jpg";
  }

  if (fileName.startsWith("payer-services/")) {
    return "/assets/images/payer-services.png";
  }

  if (fileName === "about-us.html") {
    return "/assets/images/about-background.jpeg";
  }

  return "/assets/images/home-banner.jpeg";
}

const organizationId = `${siteUrl}/#organization`;
const websiteId = `${siteUrl}/#website`;

const serviceNames = {
  "provider-services/index.html": "Provider Services",
  "provider-services/appointment-scheduling-referral-management.html": "Appointment Scheduling and Referral Management",
  "provider-services/benefits-verification-eligibility.html": "Benefits Verification and Eligibility",
  "provider-services/denial-management.html": "Denial Management",
  "provider-services/patient-self-pay-collections.html": "Patient Self-Pay Collections",
  "provider-services/prior-authorization-management.html": "Prior Authorization Management",
  "payer-services/index.html": "Payer Services",
  "payer-services/enrollment-support.html": "Enrollment Support",
  "payer-services/member-services.html": "Member Services",
  "payer-services/provider-data-management.html": "Provider Data Management"
};

const breadcrumbLabels = {
  "about-us": "About Us",
  service: "Services",
  "provider-services": "Provider Services",
  "payer-services": "Payer Services",
  "case-study": "Case Studies",
  appointment: "Book a Call",
  contact: "Contact",
  faq: "FAQ",
  blog: "Blog",
  "blog-list": "Blog List",
  "blog-details": "Blog Details",
  "privacy-policy": "Privacy Policy",
  "benefits-verification-eligibility": "Benefits Verification and Eligibility",
  "prior-authorization-management": "Prior Authorization Management",
  "denial-management": "Denial Management",
  "patient-self-pay-collections": "Patient Self-Pay Collections",
  "appointment-scheduling-referral-management": "Appointment Scheduling and Referral Management",
  "member-services": "Member Services",
  "enrollment-support": "Enrollment Support",
  "provider-data-management": "Provider Data Management",
  "self-pay-revenue-optimization": "Self-Pay Revenue Optimization",
  "third-party-healthcare-collections-transformation": "Third-Party Healthcare Collections Transformation"
};

function stripHtml(value) {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function extractFaqItems(body) {
  const items = [];
  const itemPattern = /<div\s+class=["']accordion-item["'][\s\S]*?<button\b[^>]*>([\s\S]*?)<\/button>[\s\S]*?<div\s+class=["']accordion-body["']>([\s\S]*?)<\/div>/gi;
  let match;

  while ((match = itemPattern.exec(body)) !== null) {
    const question = stripHtml(match[1]);
    const answer = stripHtml(match[2]);

    if (question && answer) {
      items.push({ question, answer });
    }
  }

  return items;
}

function getPageSchemaType(fileName) {
  if (fileName === "about-us.html") {
    return "AboutPage";
  }

  if (fileName === "contactus.html") {
    return "ContactPage";
  }

  if (fileName === "faq.html") {
    return "FAQPage";
  }

  return "WebPage";
}

function getBreadcrumbName(segment, page, isCurrentPage) {
  if (isCurrentPage && page.title) {
    return page.title.replace(/\s*\|\s*EmpireOne(?:\s*Health|Health)?$/i, "");
  }

  return breadcrumbLabels[segment] || segment.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildBreadcrumbList(fileName, page, canonicalPath) {
  const segments = canonicalPath.split("/").filter(Boolean);
  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: siteUrl
    }
  ];

  segments.forEach((segment, index) => {
    const path = `/${segments.slice(0, index + 1).join("/")}`;
    const isCurrentPage = index === segments.length - 1;

    items.push({
      "@type": "ListItem",
      position: index + 2,
      name: getBreadcrumbName(segment, page, isCurrentPage),
      item: `${siteUrl}${path}`
    });
  });

  return {
    "@type": "BreadcrumbList",
    "@id": `${siteUrl}${canonicalPath === "/" ? "" : canonicalPath}#breadcrumb`,
    itemListElement: items
  };
}

function buildStructuredData(fileName, page) {
  const canonicalPath = getCanonicalPath(fileName);
  const canonicalUrl = `${siteUrl}${canonicalPath}`;
  const pageId = `${canonicalUrl}#webpage`;
  const description = page.description || "EmpireOne Health healthcare operations support page.";
  const graph = [
    {
      "@type": ["Organization", "LocalBusiness"],
      "@id": organizationId,
      name: "EmpireOne Health",
      legalName: "EmpireOne Health",
      url: siteUrl,
      logo: `${siteUrl}/assets/images/logo/empireone-health-logo.png`,
      image: `${siteUrl}/assets/images/home-banner.jpeg`,
      email: "info@empireonehealth.com",
      telephone: "+1-833-200-6002",
      address: {
        "@type": "PostalAddress",
        streetAddress: "250 Consumers Rd suite 810",
        addressLocality: "Toronto",
        addressRegion: "ON",
        postalCode: "M2J 4V6",
        addressCountry: "CA"
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+1-833-200-6002",
          email: "info@empireonehealth.com",
          contactType: "sales",
          areaServed: ["US", "CA"],
          availableLanguage: ["English"]
        }
      ],
      sameAs: ["https://careers.empireonecx.com/"]
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: "EmpireOne Health",
      url: siteUrl,
      publisher: {
        "@id": organizationId
      },
      inLanguage: "en"
    }
  ];

  const pageSchema = {
    "@type": getPageSchemaType(fileName),
    "@id": pageId,
    url: canonicalUrl,
    name: page.title || "EmpireOne Health",
    description,
    isPartOf: {
      "@id": websiteId
    },
    about: {
      "@id": organizationId
    },
    publisher: {
      "@id": organizationId
    },
    inLanguage: "en",
    breadcrumb: {
      "@id": `${canonicalUrl}#breadcrumb`
    }
  };

  if (fileName === "contactus.html") {
    pageSchema.mainEntity = {
      "@id": organizationId
    };
  }

  if (fileName === "faq.html") {
    const faqItems = extractFaqItems(page.body);

    if (faqItems.length > 0) {
      pageSchema.mainEntity = faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer
        }
      }));
    }
  }

  graph.push(pageSchema);
  graph.push(buildBreadcrumbList(fileName, page, canonicalPath));

  if (serviceNames[fileName]) {
    graph.push({
      "@type": "Service",
      "@id": `${canonicalUrl}#service`,
      name: serviceNames[fileName],
      description,
      url: canonicalUrl,
      provider: {
        "@id": organizationId
      },
      areaServed: [
        {
          "@type": "Country",
          name: "United States"
        },
        {
          "@type": "Country",
          name: "Canada"
        }
      ],
      serviceType: serviceNames[fileName]
    });
  }

  if (fileName.startsWith("case-study/") && fileName !== "case-study/index.html") {
    graph.push({
      "@type": "Article",
      "@id": `${canonicalUrl}#article`,
      headline: page.title || "EmpireOne Health Case Study",
      description,
      url: canonicalUrl,
      author: {
        "@id": organizationId
      },
      publisher: {
        "@id": organizationId
      },
      mainEntityOfPage: {
        "@id": pageId
      },
      inLanguage: "en"
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph
  };
}
function StructuredData({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
function stripComponentPlaceholders(body) {
  return body
    .replace(/<!--\s*BOOK_CALL_FORM_COMPONENT\s*-->/g, "")
    .replace(/<!--\s*CALENDLY_WIDGET_COMPONENT\s*-->/g, "");
}

function renderLegacyBody(body) {
  return <div dangerouslySetInnerHTML={{ __html: stripComponentPlaceholders(body) }} />;
}

function ContactOfficeCard() {
  return (
    <aside className="contact-office-card" aria-label="Corporate head office">
      <div className="contact-office-card__inner">
        <span className="contact-office-card__eyebrow">Contact Details</span>
        <h3 className="contact-office-card_location">Corporate Head Office</h3>
        <p className="contact-office-card__address">250 Consumers Rd suite 810, Toronto, ON M2J 4V6</p>
        <div className="contact-office-card__divider" />
        <h3>Philippines Site 1</h3>
        <p className="contact-office-card__address">EmpireOne Bldg Gen. Luna St Poblacion II Carcar City, Cebu 6014</p>
        <div className="contact-office-card__divider" />
        <h3 className="contact-office-card_location">Philippines Site 2</h3>
        <p className="contact-office-card__address">EmpireOne Bldg., S. Carmona St., Barangay 6, SanCarlos City, Negros Occidental, 6127</p>
        <div className="contact-office-card__divider" />
        <h3 className="contact-office-card_location">Philippines Site 3</h3>
        <p className="contact-office-card__address">Unit 806 FLB Corporate Center Bohol Avenue Cebu Business Park, Cebu City, Cebu 6000</p>
        <div className="contact-office-card__divider" />
        <h3>Colombia</h3>
        <p className="contact-office-card__address">Calle 15 No. 4 - 81 Piso 10, Edificio del Cafe, Santa Marta, Magdalena.</p>
        <div className="contact-office-card__divider" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
  {/* Email Block */}
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <i
      className="far fa-envelope"
      aria-hidden="true"
      style={{ fontSize: '16px', marginRight: '10px', lineHeight: 1 }}
    />
    <a href="mailto:info@empireonehealth.com">
      info@empireonehealth.com
    </a>
  </div>

  {/* Phone Block */}
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <i
      className="far fa-phone fa-flip-horizontal"
      aria-hidden="true"
      style={{ fontSize: '16px', marginRight: '10px', lineHeight: 1 }}
    />
    <a href="tel:+18332006002">
      +1 (833) 200-6002
    </a>
  </div>
</div>
      </div>
    </aside>
  );
}

export function generateStaticParams() {
  return listLegacyHtmlPages().map((fileName) => {
    if (fileName === "index.html") {
      return { slug: [] };
    }

    if (fileName === "contactus.html") {
      return { slug: ["contact"] };
    }

    const routePath = fileName.replace(/\/index\.html$/i, "").replace(/\.html$/i, "");

    return { slug: routePath.split("/") };
  });
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const fileName = resolveLegacyPage(slug);
  const page = fileName ? readLegacyPage(fileName) : null;

  if (!page) {
    return {};
  }

  const canonicalUrl = `${siteUrl}${getCanonicalPath(fileName)}`;
  const title = page.title || "EmpireOne Health";
  const description = page.description || "EmpireOne Health supports healthcare operations, revenue cycle workflows, and payer/provider service delivery.";
  const socialImageUrl = `${siteUrl}${getSocialImagePath(fileName)}`;
  const openGraphType = fileName.startsWith("case-study/") && fileName !== "case-study/index.html" ? "article" : "website";

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: canonicalUrl,
        "x-default": canonicalUrl
      }
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true
      }
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "EmpireOne Health",
      type: openGraphType,
      locale: "en_US",
      images: [
        {
          url: socialImageUrl,
          width: 1200,
          height: 630,
          alt: `${title} | EmpireOne Health`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImageUrl]
    }
  };
}

export default async function LegacyPage({ params }) {
  const { slug } = await params;
  const fileName = resolveLegacyPage(slug);
  const isStandaloneCopy = fileName === "home-copy.html";
  const page = fileName ? (isStandaloneCopy ? readLegacyFullPage(fileName) : readLegacyPage(fileName)) : null;

  if (!page) {
    notFound();
  }

  if (isStandaloneCopy) {
    return (
      <div className="legacy-page home-copy">
        <StructuredData data={buildStructuredData(fileName, page)} />
        <Header />
        <div dangerouslySetInnerHTML={{ __html: page.body }} />
        <PopupForm />
        <Footer />
      </div>
    );
  }

  const structuredData = buildStructuredData(fileName, page);
  const isContactPage = fileName === "contactus.html";
  const hasBookCallForm = page.body.includes("BOOK_CALL_FORM_COMPONENT");
  const hasCalendlyWidget = page.body.includes("CALENDLY_WIDGET_COMPONENT");
  const hasLandingPageForm = page.body.includes("data-landing-page-form");

  return (
    <div className="legacy-page home">
      <StructuredData data={structuredData} />
      <Header />
      {renderLegacyBody(page.body)}
      {hasBookCallForm && isContactPage ? (
        <section className="contact-split-shell rts-section-gap">
          <div className="container">
            <div className="contact-split-grid">
              <div className="contact-split-form">
                <BookCallForm />
              </div>
              <ContactOfficeCard />
            </div>
          </div>
        </section>
      ) : null}
      {hasBookCallForm && !isContactPage ? <BookCallForm /> : null}
      {hasCalendlyWidget ? <CalendlyWidget /> : null}
      {hasLandingPageForm ? <LandingPageForm /> : null}
      <PopupForm />
      <Footer />
    </div>
  );
}


