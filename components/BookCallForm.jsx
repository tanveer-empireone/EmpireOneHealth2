export default function BookCallForm() {
  return (
    <div className="book-your-consulting rts-section-gap">
      <div className="container">
        <div className="row g-0 justify-content-center">
          <div className="col-xl-10 col-lg-11">
            <div className="appoinment-area-main bg_image compact-lead-card">
              <h2 className="title book-call-title">Book Your 30 Minute Call</h2>
              <form action="#" className="empire-lead-form">
                <div className="lead-form-grid">
                  <div className="form-field">
                    <label htmlFor="lead-full-name">Full Name</label>
                    <input id="lead-full-name" name="full_name" type="text" placeholder="Your Name" />
                  </div>
                  <div className="form-field">
                    <label htmlFor="lead-company-name">Company Name</label>
                    <input id="lead-company-name" name="company_name" type="text" placeholder="Enter company name" />
                  </div>
                  <div className="form-field">
                    <label htmlFor="lead-email">Email Address</label>
                    <input id="lead-email" name="email" type="email" placeholder="name@company.com" />
                  </div>
                  <div className="form-field">
                    <label htmlFor="lead-contact-number">Contact Number</label>
                    <input id="lead-contact-number" name="contact_number" type="tel" placeholder="800-233-1234" />
                  </div>
                  <div className="form-field">
                    <label htmlFor="lead-verify-email">Verify Email</label>
                    <input id="lead-verify-email" name="verify_email" type="email" placeholder="Confirm email address" />
                  </div>
                  <div className="form-field">
                    <label htmlFor="lead-source">Source</label>
                    <select id="lead-source" name="source" defaultValue="">
                      <option value="">Where did you find us?</option>
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
                  <select id="lead-workflow" name="workflow" defaultValue="benefits-verification">
                    <option value="benefits-verification">Benefits Verification & Eligibility</option>
                    <option value="prior-authorization">Prior Authorization Management</option>
                    <option value="appointment-scheduling">Appointment Scheduling & Referral Management</option>
                    <option value="denial-underpayment">Denial & Underpayment Management</option>
                    <option value="patient-self-pay">Patient / Self-Pay Collections</option>
                    <option value="member-services">Member Services</option>
                    <option value="enrollment-support">Enrollment Support</option>
                    <option value="provider-data">Provider Data Management</option>
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
                  <input type="checkbox" name="privacy_consent" />
                  <span>
                    By ticking this box I agree that I have read the <a href="#">privacy policy</a>.
                  </span>
                </label>
                <button type="submit" className="rts-btn btn-primary lead-submit">
                  Get My Healthcare Operations Plan
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}