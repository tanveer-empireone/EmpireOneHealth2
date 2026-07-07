import fs from "node:fs";
import path from "node:path";

const rootDirectory = process.cwd();
const sharedSourceFile = "index.html";

function readHtmlFile(fileName) {
  return fs.readFileSync(path.join(rootDirectory, fileName), "utf8");
}

function extractBody(html) {
  return html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? "";
}

function stripScripts(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
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

function readSharedBody() {
  return stripScripts(extractBody(readHtmlFile(sharedSourceFile)));
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
  return fs
    .readdirSync(rootDirectory)
    .filter((file) => file.endsWith(".html"))
    .sort();
}

export function resolveLegacyPage(slugSegments) {
  if (!slugSegments || slugSegments.length === 0) {
    return "index.html";
  }

  const requested = slugSegments.join("/");
  const pageAliases = {
    appointment: "appoinment.html",
    contact: "contactus.html",
    "provider-services/benefits-verification-eligibility": "provider-services-benefits-verification-eligibility.html",
    "provider-services/prior-authorization-management": "provider-services-prior-authorization-management.html",
    "provider-services/appointment-scheduling-referral-management": "provider-services-appointment-scheduling-referral-management.html",
    "provider-services/patient-self-pay-collections": "provider-services-patient-self-pay-collections.html",
    "provider-services/denial-management": "provider-services-denial-management.html",
    "payer-services/member-services": "payer-services-member-services.html",
    "payer-services/enrollment-support": "payer-services-enrollment-support.html",
    "payer-services/provider-data-management": "payer-services-provider-data-management.html"
  };
  const fileName = pageAliases[requested] ?? (slugSegments.length === 1 ? (requested.endsWith(".html") ? requested : `${requested}.html`) : null);

  if (!fileName) {
    return null;
  }

  if (fileName !== path.basename(fileName)) {
    return null;
  }

  return fileName;
}

export function readLegacyPage(fileName) {
  const fullPath = path.join(rootDirectory, fileName);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const html = fs.readFileSync(fullPath, "utf8");
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim();
  const description = html
    .match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1]
    ?.trim();
  const body = normalizeLegacyLinks(stripSharedShell(stripScripts(extractBody(html))));

  return {
    title,
    description,
    body
  };
}
export function readLegacyFullPage(fileName) {
  const fullPath = path.join(rootDirectory, fileName);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const html = fs.readFileSync(fullPath, "utf8");
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim();
  const description = html
    .match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1]
    ?.trim();
  const body = normalizeLegacyLinks(stripScripts(extractBody(html)));

  return {
    title,
    description,
    body
  };
}
