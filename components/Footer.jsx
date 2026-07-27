"use client";

import { useState } from "react";

export default function Footer() {
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState({ type: "", message: "" });
  const [isSubmittingSubscribe, setIsSubmittingSubscribe] = useState(false);

  async function handleSubscribeSubmit(event) {
    event.preventDefault();

    if (!subscriberEmail.trim()) {
      setSubscribeStatus({ type: "error", message: "Please enter your email address." });
      return;
    }

    setIsSubmittingSubscribe(true);
    setSubscribeStatus({ type: "", message: "" });

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: subscriberEmail,
          page_url: typeof window !== "undefined" ? window.location.href : ""
        })
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Subscribe failed.");
      }

      setSubscriberEmail("");
      setSubscribeStatus({ type: "success", message: "Thank you for subscribing." });
    } catch (error) {
      console.error("Footer subscribe failed", error);
      setSubscribeStatus({ type: "error", message: "We could not subscribe you right now." });
    } finally {
      setIsSubmittingSubscribe(false);
    }
  }

  return (
    <>
      <div className="rts-footer-area footer-bg pt--105 pt_sm--50">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="subscribe-area-start pb--30">
                <div className="footer-compliance-logos footer-compliance-logos-main" aria-label="Compliance and trust badges">
                  <img src="/assets/images/footerlogo1.png" alt="SOC 2 Type 2" />
                  <img src="/assets/images/footerlogo2.webp" alt="PCI DSS" />
                  <img src="/assets/images/footerlogo3.webp" alt="HIPAA Compliant" />
                  <img src="/assets/images/footerlogo4.webp" alt="GDPR" />
                  <img src="/assets/images/footerlogo5.webp" alt="ISO 27001" />
                  <img src="/assets/images/footerlogo6.webp" alt="BBB Accredited Business" />
                </div>
                <div className="footer-subscribe-form-wrap">
                  <form className="subscribe-area" onSubmit={handleSubscribeSubmit}>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={subscriberEmail}
                      onChange={(event) => setSubscriberEmail(event.target.value)}
                      required
                      disabled={isSubmittingSubscribe}
                      aria-label="Email address"
                    />
                    <button className="rts-btn btn-primary" type="submit" disabled={isSubmittingSubscribe}>
                      {isSubmittingSubscribe ? "Sending..." : "Stay Updated"}
                    </button>
                  </form>
                  {subscribeStatus.message ? (
                    <p className={`footer-subscribe-status ${subscribeStatus.type}`}>{subscribeStatus.message}</p>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="col-lg-12">
              <div className="footer-wrapper-style-between">
                <div className="single-wized">
                  <h6 className="title">Contact</h6>
                  <div className="body">
                    <p className="location">250 Consumers Rd suite 810, Toronto, ON M2J 4V6
</p>
                    <a href="mailto:info@empireonehealth.com">info@empireonehealth.com</a>
                  </div>
                </div>
                <div className="single-wized">
                  <h6 className="title">Company</h6>
                  <div className="body">
                    <ul className="nav-bottom">
                      <li>
                        <a href="/about-us">About Us</a>
                      </li>
                      <li>
                        <a href="/appointment">Book A Call</a>
                      </li>
                      <li>
                        <a href="https://careers.empireonecx.com/" target="_blank" rel="noopener noreferrer">Career</a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="single-wized">
                  <h6 className="title">Services</h6>
                  <div className="body">
                    <ul className="nav-bottom">
                      <li>
                        <a href="/provider-services">Provider Services</a>
                      </li>
                      <li>
                        <a href="/payer-services">Payer Services</a>
                      </li>
                      </ul>
                  </div>
                </div>
                <div className="single-wized">
                  <h6 className="title">Delivery Model</h6>
                  <div className="body">
                    <p className="location">Human-Led, AI-Assisted Delivery</p>
                    <p className="location">HIPAA-Conscious Workflows</p>
                    <p className="location">BAA-Ready Engagement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="copyright-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="copyright-area-inner">
                <p>&copy; 2026 EmpireOne Health. All Rights Reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="side-bar" className="side-bar header-two">
        <button className="close-icon-menu">
          <i className="far fa-times" />
        </button>
        <div className="mobile-menu-main">
          <nav className="nav-main mainmenu-nav mt--30">
            <ul className="mainmenu metismenu" id="mobile-menu-active">
              <li>
                <a href="/" className="main mobile-menu-link">Home</a>
              </li>
              <li>
                <a className="main mobile-menu-link" href="/about-us">About Us</a>
              </li>
              <li className="has-droupdown">
                <a href="#" className="main">Service</a>
                <ul className="submenu mm-collapse">
                  <li>
                    <a href="/provider-services">Provider</a>
                  </li>
                  <li>
                    <a href="/payer-services">Payer</a>
                  </li>
                </ul>
              </li>
              <li>
                <a href="/case-study" className="main">Case Study</a>
              </li>
              <li>
                <a href="/contact" className="main">Contact</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div id="anywhere-home" />
      <div className="progress-wrap">
        <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
          <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
        </svg>
      </div>
    </>
  );
}

=======
"use client";

import { useState } from "react";

export default function Footer() {
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState({ type: "", message: "" });
  const [isSubmittingSubscribe, setIsSubmittingSubscribe] = useState(false);

  async function handleSubscribeSubmit(event) {
    event.preventDefault();

    if (!subscriberEmail.trim()) {
      setSubscribeStatus({ type: "error", message: "Please enter your email address." });
      return;
    }

    setIsSubmittingSubscribe(true);
    setSubscribeStatus({ type: "", message: "" });

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: subscriberEmail,
          page_url: typeof window !== "undefined" ? window.location.href : ""
        })
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Subscribe failed.");
      }

      setSubscriberEmail("");
      setSubscribeStatus({ type: "success", message: "Thank you for subscribing." });
    } catch (error) {
      console.error("Footer subscribe failed", error);
      setSubscribeStatus({ type: "error", message: "We could not subscribe you right now." });
    } finally {
      setIsSubmittingSubscribe(false);
    }
  }

  return (
    <>
      <div className="rts-footer-area footer-bg pt--105 pt_sm--50">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="subscribe-area-start pb--30">
                <div className="footer-compliance-logos footer-compliance-logos-main" aria-label="Compliance and trust badges">
                  <img src="/assets/images/footerlogo1.png" alt="SOC 2 Type 2" />
                  <img src="/assets/images/footerlogo2.webp" alt="PCI DSS" />
                  <img src="/assets/images/footerlogo3.webp" alt="HIPAA Compliant" />
                  <img src="/assets/images/footerlogo4.webp" alt="GDPR" />
                  <img src="/assets/images/footerlogo5.webp" alt="ISO 27001" />
                  <img src="/assets/images/footerlogo6.webp" alt="BBB Accredited Business" />
                </div>
                <div className="footer-subscribe-form-wrap">
                  <form className="subscribe-area" onSubmit={handleSubscribeSubmit}>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={subscriberEmail}
                      onChange={(event) => setSubscriberEmail(event.target.value)}
                      required
                      disabled={isSubmittingSubscribe}
                      aria-label="Email address"
                    />
                    <button className="rts-btn btn-primary" type="submit" disabled={isSubmittingSubscribe}>
                      {isSubmittingSubscribe ? "Sending..." : "Stay Updated"}
                    </button>
                  </form>
                  {subscribeStatus.message ? (
                    <p className={`footer-subscribe-status ${subscribeStatus.type}`}>{subscribeStatus.message}</p>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="col-lg-12">
              <div className="footer-wrapper-style-between">
                <div className="single-wized">
                  <h6 className="title">Contact</h6>
                  <div className="body">
                    <p className="location">250 Consumers Rd suite 810, Toronto, ON M2J 4V6
</p>
                    <a href="mailto:info@empireonehealth.com">info@empireonehealth.com</a>
                  </div>
                </div>
                <div className="single-wized">
                  <h6 className="title">Company</h6>
                  <div className="body">
                    <ul className="nav-bottom">
                      <li>
                        <a href="/about-us">About Us</a>
                      </li>
                      <li>
                        <a href="/appointment">Book A Call</a>
                      </li>
                      <li>
                        <a href="https://careers.empireonecx.com/" target="_blank" rel="noopener noreferrer">Career</a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="single-wized">
                  <h6 className="title">Services</h6>
                  <div className="body">
                    <ul className="nav-bottom">
                      <li>
                        <a href="/provider-services">Provider Services</a>
                      </li>
                      <li>
                        <a href="/payer-services">Payer Services</a>
                      </li>
                      </ul>
                  </div>
                </div>
                <div className="single-wized">
                  <h6 className="title">Delivery Model</h6>
                  <div className="body">
                    <p className="location">Human-Led, AI-Assisted Delivery</p>
                    <p className="location">HIPAA-Conscious Workflows</p>
                    <p className="location">BAA-Ready Engagement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="copyright-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="copyright-area-inner">
                <p>&copy; 2026 EmpireOne Health. All Rights Reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="side-bar" className="side-bar header-two">
        <button className="close-icon-menu">
          <i className="far fa-times" />
        </button>
        <div className="mobile-menu-main">
          <nav className="nav-main mainmenu-nav mt--30">
            <ul className="mainmenu metismenu" id="mobile-menu-active">
              <li>
                <a href="/" className="main mobile-menu-link">Home</a>
              </li>
              <li>
                <a className="main mobile-menu-link" href="/about-us">About Us</a>
              </li>
              <li className="has-droupdown">
                <a href="#" className="main">Service</a>
                <ul className="submenu mm-collapse">
                  <li>
                    <a href="/provider-services">Provider</a>
                  </li>
                  <li>
                    <a href="/payer-services">Payer</a>
                  </li>
                </ul>
              </li>
              <li>
                <a href="/case-study" className="main">Case Study</a>
              </li>
              <li>
                <a href="/contact" className="main">Contact</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div id="anywhere-home" />
      <div className="progress-wrap">
        <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
          <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
        </svg>
      </div>
    </>
  );
}
