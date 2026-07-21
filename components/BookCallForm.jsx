"use client";

import { useState } from "react";

const initialStatus = {
  type: "",
  message: ""
};

export default function BookCallForm() {
  const [status, setStatus] = useState(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus(initialStatus);
    setIsSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.privacy_consent = formData.get("privacy_consent") === "on";
    payload.page_url = typeof window !== "undefined" ? window.location.href : "";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

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

  return (
    <div className="book-your-consulting rts-section-gap">
      <div className="container">
        <div className="row g-0 justify-content-center">
          <div className="col-xl-10 col-lg-11">
            <div className="appoinment-area-main bg_image compact-lead-card">
              <h2 className="title book-call-title">Book Your 30 Minute Call</h2>
              <form className="empire-lead-form" onSubmit={handleSubmit}>
                <input type="text" name="website" tabIndex="-1" autoComplete="off" className="lead-hidden-field" aria-hidden="true" />
                <div className="lead-form-grid">
                  <div className="form-field">
                    <label htmlFor="lead-full-name">Full Name <span className="required-mark">*</span></label>
                    <input id="lead-full-name" name="full_name" type="text" placeholder="Your Name" required />
                  </div>
                  <div className="form-field">
                    <label htmlFor="lead-company-name">Company Name</label>
                    <input id="lead-company-name" name="company_name" type="text" placeholder="Enter company name" />
                  </div>
                  <div className="form-field">
                    <label htmlFor="lead-email">Email Address <span className="required-mark">*</span></label>
                    <input id="lead-email" name="email" type="email" placeholder="name@company.com" required />
                  </div>
                  <div className="form-field">
                    <label htmlFor="lead-contact-number">Contact Number <span className="required-mark">*</span></label>
                    <input id="lead-contact-number" name="contact_number" type="tel" placeholder="800-233-1234" required />
                  </div>
                  <div className="form-field">
                    <label htmlFor="lead-verify-email">Verify Email <span className="required-mark">*</span></label>
                    <input id="lead-verify-email" name="verify_email" type="email" placeholder="Confirm email address" required />
                  </div>
                  <div className="form-field">
                    <label htmlFor="lead-source">Source</label>
                    <select id="lead-source" name="source" defaultValue="">
                      <option value="">How did you hear about us?</option>
                      <option value="google">Google</option>
                      <option value="chatgpt">ChatGPT</option>
                      <option value="referral">Referral</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="website">Website</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-field full-width">
                  <label htmlFor="lead-workflow">What are you looking to build?</label>
                  <select id="lead-workflow" name="workflow" defaultValue="">
                    <option value="">Need Help With?</option>
                    <option value="benefits-verification">Benefits Verification & Eligibility</option>
                    <option value="prior-authorization">Prior Authorization Management</option>
                    <option value="appointment-scheduling">Appointment Scheduling & Referral Management</option>
                    <option value="denial-management">Denial Management</option>
                    <option value="patient-self-pay">Patient / Self-Pay Collections</option>
                    <option value="member-services">Member Services</option>
                    <option value="enrollment-support">Enrollment Support</option>
                    <option value="provider-data">Provider Data Management</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-field full-width">
                  <label htmlFor="lead-message">Message</label>
                  <textarea
                    id="lead-message"
                    name="message"
                    rows="4"
                    placeholder="Tell us about your workflow goals. Do not include sensitive healthcare information."
                  />
                </div>
                <label className="lead-consent">
                  <input type="checkbox" name="privacy_consent" required />
                  <span>
                    By ticking this box I agree that I have read the <a href="#">privacy policy</a>.
                  </span>
                </label>
                {status.message ? (
                  <div className={`lead-form-status ${status.type}`} role="status">
                    {status.message}
                  </div>
                ) : null}
                <button type="submit" className="rts-btn btn-primary lead-submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}