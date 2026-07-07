import { notFound } from "next/navigation";
import BookCallForm from "../../components/BookCallForm";
import CalendlyWidget from "../../components/CalendlyWidget";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { listLegacyHtmlPages, readLegacyFullPage, readLegacyPage, resolveLegacyPage } from "../../lib/legacy-pages";

const componentPlaceholders = {
  "<!-- BOOK_CALL_FORM_COMPONENT -->": BookCallForm,
  "<!-- CALENDLY_WIDGET_COMPONENT -->": CalendlyWidget
};

function renderLegacyBody(body) {
  const pattern = new RegExp(`(${Object.keys(componentPlaceholders).join("|")})`);
  const pieces = body.split(pattern).filter(Boolean);

  if (pieces.length === 1) {
    return <div dangerouslySetInnerHTML={{ __html: body }} />;
  }

  return pieces.map((piece, index) => {
    const Component = componentPlaceholders[piece];

    if (Component) {
      return <Component key={index} />;
    }

    return <div key={index} dangerouslySetInnerHTML={{ __html: piece }} />;
  });
}

export function generateStaticParams() {
  const params = listLegacyHtmlPages().map((fileName) => ({
    slug: fileName === "index.html" ? [] : [fileName === "contactus.html" ? "contact" : fileName.replace(/\.html$/i, "")]
  }));

  params.push({ slug: ["provider-services", "benefits-verification-eligibility"] });
  params.push({ slug: ["provider-services", "prior-authorization-management"] });
  params.push({ slug: ["provider-services", "appointment-scheduling-referral-management"] });
  params.push({ slug: ["provider-services", "patient-self-pay-collections"] });
  params.push({ slug: ["provider-services", "denial-management"] });
  params.push({ slug: ["payer-services", "member-services"] });
  params.push({ slug: ["payer-services", "enrollment-support"] });
  params.push({ slug: ["payer-services", "provider-data-management"] });

  return params;
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
        <Footer />
      </div>
    );
  }

  return (
    <div className="legacy-page home">
      <Header />
      {renderLegacyBody(page.body)}
      <Footer />
    </div>
  );
}
