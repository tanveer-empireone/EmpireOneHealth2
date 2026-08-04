import StaticHtmlPage, { getStaticPageMetadata } from "../../../components/StaticHtmlPage";
import { staticPages } from "../../../lib/static-page-content";

const page = staticPages["provider-services/benefits-verification-eligibility"];

export function generateMetadata() {
  return getStaticPageMetadata(page);
}

export default function Page() {
  return <StaticHtmlPage page={page} />;
}