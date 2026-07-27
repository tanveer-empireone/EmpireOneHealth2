import { notFound } from "next/navigation";
import BookCallForm from "../../components/BookCallForm";
import CalendlyWidget from "../../components/CalendlyWidget";
import LandingPageForm from "../../components/landingpageform";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import PopupForm from "../../components/PopupForm";
import { listLegacyHtmlPages, readLegacyFullPage, readLegacyPage, resolveLegacyPage } from "../../lib/legacy-pages";

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
        <h3>Corporate Head Office</h3>
        <p className="contact-office-card__address">250 Consumers Rd suite 810, Toronto, ON M2J 4V6</p>
        <div className="contact-office-card__divider" />
        <p className="contact-office-card__label">Email</p>
        <a href="mailto:info@empireonehealth.com">info@empireonehealth.com</a>
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

  return {
    title: page.title,
    description: page.description
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
        <Header />
        <div dangerouslySetInnerHTML={{ __html: page.body }} />
        <PopupForm />
        <Footer />
      </div>
    );
  }

  const isContactPage = fileName === "contactus.html";
  const hasBookCallForm = page.body.includes("BOOK_CALL_FORM_COMPONENT");
  const hasCalendlyWidget = page.body.includes("CALENDLY_WIDGET_COMPONENT");
  const hasLandingPageForm = page.body.includes("data-landing-page-form");

  return (
    <div className="legacy-page home">
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


