"use client";

import { useEffect } from "react";

function setStatus(form, type, message) {
  const status = form.querySelector(".lead-form-status");

  if (!status) {
    return;
  }

  status.className = `lead-form-status ${type || ""}`.trim();
  status.textContent = message || "";
  status.hidden = !message;
}

export default function LandingPageForm() {
  useEffect(() => {
    const forms = Array.from(document.querySelectorAll('[data-landing-page-form="true"] form'));
    const cleanups = [];

    forms.forEach((form) => {
      async function handleSubmit(event) {
        event.preventDefault();
        setStatus(form, "", "");

        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton?.textContent || "Get My Healthcare Operations Plan";

        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = "Sending...";
        }

        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());
        payload.privacy_consent = formData.get("privacy_consent") === "on";
        payload.page_url = window.location.href;

        try {
          const response = await fetch("/api/contact", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          });
          const result = await response.json().catch(() => ({}));

          if (!response.ok || result.status !== "success") {
            console.error("Landing page form submit failed:", result.message || "Request failed");
            setStatus(form, "", "");
            return;
          }

          form.reset();
          setStatus(form, "success", result.message || "Thank you! We will contact you soon.");
        } catch (error) {
          console.error("Landing page form submit failed:", error);
          setStatus(form, "", "");
        } finally {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
          }
        }
      }

      form.addEventListener("submit", handleSubmit);
      cleanups.push(() => form.removeEventListener("submit", handleSubmit));
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return null;
}