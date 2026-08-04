import StaticHtmlPage, { getStaticPageMetadata } from "../../../components/StaticHtmlPage";
import { staticPages } from "../../../lib/static-page-content";

const page = staticPages["provider-services/prior-authorization-management"];

export function generateMetadata() {
  return getStaticPageMetadata(page);
}

export default function Page() {
  return <StaticHtmlPage page={page} />;
}