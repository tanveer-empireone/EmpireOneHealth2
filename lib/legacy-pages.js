import fs from "node:fs";
import path from "node:path";

const rootDirectory = process.cwd();
const sharedSourceFile = "index.html";
const landingPageFormPartialFile = "components/landingpageform.html";

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


function injectReusablePartials(html) {
  const landingPageForm = readHtmlFile(landingPageFormPartialFile);

  return html.replace(/<!--\s*LANDING_PAGE_FORM_COMPONENT\s*-->/g, landingPageForm);
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
function readSharedBody() {
  return stripScripts(extractBody(readHtmlFile(sharedSourceFile)));
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

function isSafeLegacyPath(fileName) {
  return !path.isAbsolute(fileName) && !fileName.split(/[\\/]/).includes("..");
}

function collectHtmlPages(directory = rootDirectory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if ([".git", ".next", "node_modules"].includes(entry.name)) {
        return [];
      }

      return collectHtmlPages(fullPath);
    }

    if (!entry.isFile() || !entry.name.endsWith(".html")) {
      return [];
    }

    return [toPosixPath(path.relative(rootDirectory, fullPath))];
  });
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
  return collectHtmlPages().sort();
}

export function resolveLegacyPage(slugSegments) {
  if (!slugSegments || slugSegments.length === 0) {
    return "index.html";
  }

  const requested = slugSegments.join("/");
  const pageAliases = {
    appointment: "appoinment.html",
    contact: "contactus.html"
  };
  const candidates = [
    pageAliases[requested],
    `${requested}/index.html`,
    requested.endsWith(".html") ? requested : `${requested}.html`
  ].filter(Boolean);

  const fileName = candidates.find((candidate) => isSafeLegacyPath(candidate) && fs.existsSync(path.join(rootDirectory, candidate)));

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
  const body = addImageAnimations(injectReusablePartials(normalizeLegacyLinks(stripSharedShell(stripScripts(extractBody(html))))));

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
  const body = addImageAnimations(injectReusablePartials(normalizeLegacyLinks(stripScripts(extractBody(html)))));

  return {
    title,
    description,
    body
  };
}
