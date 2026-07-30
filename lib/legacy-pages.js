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

function normalizeHtmlForHydration(html) {
  return html.replace(/\r\n?/g, "\n");
}

const imageDimensionsCache = new Map();

function getImageDimensionsFromBuffer(buffer) {
  if (buffer.length > 24 && buffer[0] === 0x89 && buffer.toString("ascii", 1, 4) === "PNG") {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  if (buffer.length > 10 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;

    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }

      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);

      if (marker >= 0xc0 && marker <= 0xc3) {
        return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
      }

      offset += 2 + length;
    }
  }

  if (buffer.length > 30 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    const chunk = buffer.toString("ascii", 12, 16);

    if (chunk === "VP8X") {
      return { width: buffer.readUIntLE(24, 3) + 1, height: buffer.readUIntLE(27, 3) + 1 };
    }

    if (chunk === "VP8 ") {
      return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
    }

    if (chunk === "VP8L") {
      const bits = buffer.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
  }

  return null;
}

function resolveImageFile(src) {
  const cleanSrc = src.split(/[?#]/)[0].replace(/^\/+/, "");

  if (!cleanSrc || /^https?:/i.test(src) || cleanSrc.includes("..")) {
    return null;
  }

  const candidates = [
    path.join(rootDirectory, "public", cleanSrc),
    path.join(rootDirectory, cleanSrc)
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function getImageDimensions(src) {
  if (imageDimensionsCache.has(src)) {
    return imageDimensionsCache.get(src);
  }

  const imagePath = resolveImageFile(src);
  const dimensions = imagePath ? getImageDimensionsFromBuffer(fs.readFileSync(imagePath)) : null;
  imageDimensionsCache.set(src, dimensions);

  return dimensions;
}

function addImagePerformanceAttributes(html) {
  let imageIndex = 0;

  return html.replace(/<img\b([^>]*)>/gi, (tag) => {
    imageIndex += 1;
    let nextTag = tag;
    const src = tag.match(/\bsrc=(["'])(.*?)\1/i)?.[2] ?? "";
    const dimensions = src ? getImageDimensions(src) : null;

    if (dimensions && !/\bwidth=/i.test(nextTag)) {
      nextTag = nextTag.replace(/<img\b/i, `<img width="${dimensions.width}"`);
    }

    if (dimensions && !/\bheight=/i.test(nextTag)) {
      nextTag = nextTag.replace(/<img\b/i, `<img height="${dimensions.height}"`);
    }

    if (!/\bdecoding=/i.test(nextTag)) {
      nextTag = nextTag.replace(/<img\b/i, '<img decoding="async"');
    }

    if (imageIndex > 2 && !/\bloading=/i.test(nextTag)) {
      nextTag = nextTag.replace(/<img\b/i, '<img loading="lazy"');
    }

    return nextTag;
  });
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
  const body = normalizeHtmlForHydration(
    addImagePerformanceAttributes(addImageAnimations(injectReusablePartials(normalizeLegacyLinks(stripSharedShell(stripScripts(extractBody(html)))))))
  );

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
  const body = normalizeHtmlForHydration(
    addImagePerformanceAttributes(addImageAnimations(injectReusablePartials(normalizeLegacyLinks(stripScripts(extractBody(html))))))
  );

  return {
    title,
    description,
    body
  };
}
