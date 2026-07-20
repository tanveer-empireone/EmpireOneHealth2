"use client";

import { useEffect, useId, useState } from "react";

const initialStatus = {
  type: "",
  message: ""
};

export default function PopupForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formId = useId();

  useEffect(() => {
    function handleClick(event) {
      const trigger = event.target.closest(
        '.book-call-popup-trigger, [data-popup-form-trigger="book-call"], a[href="/appointment"], a[href="/appointment/"]'
      );

      if (!trigger) {
        return;
      }

      const triggerText = trigger.textContent || "";
      const isBookCallTrigger =
        trigger.classList.contains("book-call-popup-trigger") ||
        trigger.dataset.popupFormTrigger === "book-call" ||
        /book\s+(a\s+)?(30\s+minute\s+)?call/i.test(triggerText);

      if (!isBookCallTrigger) {
        return;
      }

      event.preventDefault();
      setStatus(initialStatus);
      setIsOpen(true);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus(initialStatus);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const payload = Object.fromEntries(formData.entries());

    payload.verify_email = email;
    payload.privacy_consent = true;
    payload.workflow = "Book a Call Popup";
    payload.source = "Book a Call CTA";
    payload.page_url = typeof window !== "undefined" ? window.location.href : "";

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
        setStatus({ type: "error", message: result.message || "Please check the form and try again." });
        return;
      }

      form.reset();
      setStatus({ type: "success", message: result.message || "Thank you! We will contact you soon." });
    } catch (_error) {
      setStatus({ type: "error", message: "We could not send your request right now. Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="popup-form-overlay" role="presentation" onMouseDown={() => setIsOpen(false)}>
      <div
        className="popup-form-modal appoinment-area-main bg_image"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-title`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="popup-form-close" aria-label="Close form" onClick={() => setIsOpen(false)}>
          x
        </button>
        <h2 id={`${formId}-title`} className="popup-form-title">Book a Call</h2>
        <form className="popup-form-fields" onSubmit={handleSubmit}>
          <input type="text" name="website" tabIndex="-1" autoComplete="off" className="lead-hidden-field" aria-hidden="true" />
          <div className="popup-form-field">
            <label htmlFor={`${formId}-name`}>Name</label>
            <input id={`${formId}-name`} name="full_name" type="text" placeholder="Your Name" required />
          </div>
          <div className="popup-form-field">
            <label htmlFor={`${formId}-email`}>Email Address</label>
            <input id={`${formId}-email`} name="email" type="email" placeholder="name@company.com" required />
          </div>
          <div className="popup-form-field">
            <label htmlFor={`${formId}-phone`}>Phone Number</label>
            <input id={`${formId}-phone`} name="contact_number" type="tel" placeholder="800-233-1234" required />
          </div>
          {status.message ? (
            <div className={`lead-form-status ${status.type}`} role="status">
              {status.message}
            </div>
          ) : null}
          <button type="submit" className="rts-btn btn-primary popup-form-submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}