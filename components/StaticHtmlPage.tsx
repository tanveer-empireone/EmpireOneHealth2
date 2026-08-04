import { notFound } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import BookCallForm from "./BookCallForm";
import CalendlyWidget from "./CalendlyWidget";
import Footer from "./Footer";
import Header from "./Header";
import type { StaticPageContent } from "../lib/static-page-content";

const componentPlaceholders: Record<string, ComponentType> = {
  "<!-- BOOK_CALL_FORM_COMPONENT -->": BookCallForm,
  "<!-- CALENDLY_WIDGET_COMPONENT -->": CalendlyWidget
};

function renderHtmlBody(body: string): ReactNode {
  const pattern = new RegExp(`(${Object.keys(componentPlaceholders).join("|")})`);
  const pieces = body.split(pattern).filter(Boolean);
  const hasMainLandmark = /<main\b/i.test(body);

  if (pieces.length === 1) {
    if (hasMainLandmark) {
      return <div dangerouslySetInnerHTML={{ __html: body }} />;
    }

    return <main dangerouslySetInnerHTML={{ __html: body }} />;
  }

  const renderedPieces = pieces.map((piece, index) => {
    const Component = componentPlaceholders[piece];

    if (Component) {
      return <Component key={index} />;
    }

    return <div key={index} dangerouslySetInnerHTML={{ __html: piece }} />;
  });

  return hasMainLandmark ? renderedPieces : <main>{renderedPieces}</main>;
}

export function getStaticPageMetadata(page?: StaticPageContent) {
  if (!page) {
    return {};
  }

  return {
    title: page.title,
    description: page.description
  };
}

type StaticHtmlPageProps = {
  page?: StaticPageContent;
  className?: string;
};

export default function StaticHtmlPage({ page, className = "home" }: StaticHtmlPageProps) {
  if (!page) {
    notFound();
  }

  return (
    <div className={`legacy-page ${className}`}>
      <Header />
      {renderHtmlBody(page.body)}
      <Footer />
    </div>
  );
}