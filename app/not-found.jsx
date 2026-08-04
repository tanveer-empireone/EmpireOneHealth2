import Link from "next/link";
import Footer from "../components/Footer";
import Header from "../components/Header";
import PopupForm from "../components/PopupForm";

export const metadata = {
  title: "Page Not Found | EmpireOne Health",
  description: "The page you are looking for could not be found. Return to EmpireOne Health or contact our team for help.",
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true
    }
  }
};

const helpfulLinks = [
  { href: "/provider-services", label: "Provider Services" },
  { href: "/payer-services", label: "Payer Services" },
  { href: "/case-study", label: "Case Studies" },
  { href: "/appointment", label: "Book a Call" }
];

export default function NotFound() {
  return (
    <div className="legacy-page home not-found-page">
      <Header />
      <main className="empire-not-found" aria-labelledby="not-found-title">
        <section className="empire-not-found__hero">
          <div className="container">
            <div className="empire-not-found__content">
              <span className="empire-not-found__eyebrow">404 Error</span>
              <h1 id="not-found-title">This page is not available.</h1>
              <p>
                The link may have moved, expired, or been typed incorrectly. You can return to the homepage or use one of the common paths below.
              </p>
              <div className="empire-not-found__actions" aria-label="404 page actions">
                <Link className="rts-btn btn-primary" href="/">
                  Back to Home
                </Link>
                <Link className="rts-btn btn-primary empire-not-found__secondary" href="/contact">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="empire-not-found__links" aria-label="Helpful pages">
          <div className="container">
            <div className="empire-not-found__link-grid">
              {helpfulLinks.map((link) => (
                <Link key={link.href} href={link.href} className="empire-not-found__link-card">
                  <span>{link.label}</span>
                  <i className="fa-regular fa-arrow-right" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <PopupForm />
      <Footer />
    </div>
  );
}