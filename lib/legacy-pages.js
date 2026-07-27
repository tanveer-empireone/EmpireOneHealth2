import fs from "node:fs";
import path from "node:path";

const rootDirectory = process.cwd();
const sharedSourceFile = "index.html";
const landingPageFormPartialFile = "components/landingpageform.html";
const allowedLegacyPages = [
  "index.html",
  "about-us.html",
  "appoinment.html",
  "blog.html",
  "blog-details.html",
  "blog-list.html",
  "contactus.html",
  "faq.html",
  "privacy-policy.html",
  "service.html",
  "appointment/index.html",
  "case-study/index.html",
  "case-study/self-pay-revenue-optimization.html",
  "case-study/third-party-healthcare-collections-transformation.html",
  "payer-services/index.html",
  "payer-services/enrollment-support.html",
  "payer-services/member-services.html",
  "payer-services/provider-data-management.html",
  "provider-services/index.html",
  "provider-services/appointment-scheduling-referral-management.html",
  "provider-services/benefits-verification-eligibility.html",
  "provider-services/denial-management.html",
  "provider-services/patient-self-pay-collections.html",
  "provider-services/prior-authorization-management.html"
];

function readHtmlFile(fileName) {
  return fs.readFileSync(path.join(rootDirectory, fileName), "utf8");
}

function extractBody(html) {
  return html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? "";
}

function stripScripts(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

function normalizeHtmlForHydration(html) {
  return html.replace(/\r\n?/g, "\n");
}

function stripSharedShell(body) {
  return body
    .replace(/<header\b[\s\S]*?<\/header>/i, "")
    .replace(/\s*<!-- rts footer area start -->[\s\S]*?<!-- progress area end -->\s*/i, "");
}


function normalizeLegacyLinks(html) {
  return html
    .replace(/\b(href|action)=("|\')appoinment\.html([?#][^"\']*)?\2/gi, (_match, attr, quote, suffix = "") => {
      return `${attr}=${quote}appointment${suffix}${quote}`;
    })
    .replace(/\b(href|action)=("|\')contactus\.html([?#][^"\']*)?\2/gi, (_match, attr, quote, suffix = "") => {
      return `${attr}=${quote}contact${suffix}${quote}`;
    })
    .replace(/\b(href|action)=("|')\/?index\.html([?#][^"']*)?\2/gi, (_match, attr, quote, suffix = "") => {
      return `${attr}=${quote}/${suffix}${quote}`;
    })
    .replace(/\b(href|action)=("|')([^"':?#]+)\.html([?#][^"']*)?\2/gi, (_match, attr, quote, page, suffix = "") => {
      return `${attr}=${quote}${page}${suffix}${quote}`;
    });
}

const animatedImageExcludePattern =
  /(logo|icon|arrow|favicon|avatar|provider-services|payer-services|eligibility-benefits|prior-authorization|denial-management|patient-collections|dedicated-healthcare-teams|hipaa-conscious-delivery|ai-assisted-workflows|payer-provider-alignment)/i;

function addImageAnimations(html) {
  return html.replace(/<img\b([^>]*)>/gi, (tag) => {
    if (/\bclass=(["'])[^"']*\bwow\b/i.test(tag)) {
      return tag;
    }

    const src = tag.match(/\bsrc=(["'])(.*?)\1/i)?.[2] ?? "";

    if (!src || animatedImageExcludePattern.test(src)) {
      return tag;
    }

    let nextTag = tag;

    if (/\bclass=(["'])(.*?)\1/i.test(nextTag)) {
      nextTag = nextTag.replace(/\bclass=(["'])(.*?)\1/i, (_match, quote, value) => {
        return `class=${quote}${value} wow fadeInUp${quote}`;
      });
    } else {
      nextTag = nextTag.replace(/<img\b/i, '<img class="wow fadeInUp"');
    }

    if (!/\bdata-wow-duration=/i.test(nextTag)) {
      nextTag = nextTag.replace(/<img\b/i, '<img data-wow-duration=".8s"');
    }

    if (!/\bdata-wow-delay=/i.test(nextTag)) {
      nextTag = nextTag.replace(/<img\b/i, '<img data-wow-delay=".1s"');
    }

    return nextTag;
  });
}

function getLandingPageFormPartial() {
  const partialPath = path.join(rootDirectory, landingPageFormPartialFile);

  if (!fs.existsSync(partialPath)) {
    return "";
  }

  return fs.readFileSync(partialPath, "utf8");
}

function addLandingPageFormMount(html) {
  const formMarkup = getLandingPageFormPartial();

  return html.replace(
    /<!-- LANDING_PAGE_FORM_COMPONENT -->/g,
    `<div class="col-lg-5"><div class="provider-hero-form wow fadeInRight" data-wow-delay=".3s" data-wow-duration=".8s" data-landing-page-form="true">${formMarkup}</div></div>`
  );
}
function readSharedBody() {
  return stripScripts(extractBody(readHtmlFile(sharedSourceFile)));
}

function isSafeLegacyPath(fileName) {
  return !path.isAbsolute(fileName) && !fileName.split(/[\\/]/).includes("..");
}

export function getSharedHeader() {
  return normalizeLegacyLinks(readSharedBody().match(/<header\b[\s\S]*?<\/header>/i)?.[0] ?? "");
}

export function getSharedFooter() {
  return normalizeLegacyLinks((
    readSharedBody().match(/<!-- rts footer area start -->[\s\S]*?<!-- progress area end -->/i)?.[0] ?? ""
  ).replace(/href="contact\.html"/g, 'href="contactus.html"'));
}

export function listLegacyHtmlPages() {
  return allowedLegacyPages
    .filter((fileName) => fs.existsSync(path.join(rootDirectory, fileName)))
    .sort();
}

export function resolveLegacyPage(slugSegments) {
  if (!slugSegments || slugSegments.length === 0) {
    return "index.html";
  }

  const requested = slugSegments.join("/");
  const pageAliases = {
    about: "about-us.html",
    appointment: "appoinment.html",
    contact: "contactus.html"
  };
  const candidates = [
    pageAliases[requested],
    `${requested}/index.html`,
    requested.endsWith(".html") ? requested : `${requested}.html`
  ].filter(Boolean);

  const fileName = candidates.find((candidate) => {
    return (
      isSafeLegacyPath(candidate) &&
      allowedLegacyPages.includes(candidate) &&
      fs.existsSync(path.join(rootDirectory, candidate))
    );
  });

  return fileName ?? null;
}

export function readLegacyPage(fileName) {
  if (!isSafeLegacyPath(fileName)) {
    return null;
  }

  const fullPath = path.join(rootDirectory, fileName);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const html = fs.readFileSync(fullPath, "utf8");
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim();
  const description = html
    .match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1]
    ?.trim();
  const body = normalizeHtmlForHydration(addLandingPageFormMount(addImageAnimations(normalizeLegacyLinks(stripSharedShell(stripScripts(extractBody(html)))))));

  return {
    title,
    description,
    body
  };
}

export function readLegacyFullPage(fileName) {
  if (!isSafeLegacyPath(fileName)) {
    return null;
  }

  const fullPath = path.join(rootDirectory, fileName);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const html = fs.readFileSync(fullPath, "utf8");
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim();
  const description = html
    .match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1]
    ?.trim();
  const body = normalizeHtmlForHydration(addLandingPageFormMount(addImageAnimations(normalizeLegacyLinks(stripScripts(extractBody(html))))));

  return {
    title,
    description,
    body
  };
}
