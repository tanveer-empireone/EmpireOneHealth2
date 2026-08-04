import StaticHtmlPage, { getStaticPageMetadata } from "../../components/StaticHtmlPage";
import { staticPages } from "../../lib/static-page-content";

const page = staticPages["case-study"];

export function generateMetadata() {
  return getStaticPageMetadata(page);
}

export default function Page() {
  return <StaticHtmlPage page={page} />;
}