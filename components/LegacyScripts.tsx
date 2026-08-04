"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __empireOneLegacyScripts?: Promise<void>;
  }
}

const scripts = [
  "/assets/js/plugins/jquery.js",
  "/assets/js/vendor/waw.js",
  "/assets/js/plugins/metismenu.js",
  "/assets/js/vendor/bootstrap.min.js",
  "/assets/js/main.js"
];

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);

    if (existing?.dataset.loaded === "true") {
      resolve();
      return;
    }

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

export default function LegacyScripts() {
  useEffect(() => {
    window.__empireOneLegacyScripts ??= scripts.reduce(
      (chain, src) => chain.then(() => loadScript(src)),
      Promise.resolve()
    );
  }, []);

  return null;
}
