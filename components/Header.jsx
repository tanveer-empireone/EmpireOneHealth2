import { FaEnvelope, FaPhone, FaSearch } from "react-icons/fa";

export default function Header() {
  return (
    <header className="header-one header--sticky">
      <div className="header-top-area">
        <div className="container-full-header">
          <div className="col-lg-12">
            <div className="header-top">
              <div className="left">
                <div className="map-area">
                  <FaEnvelope
                    style={{
                      fontSize: "12px",
                      marginRight: "6px",
                      lineHeight: 1,
                      color: "#ffffff",
                    }}
                  />
                  <a href="mailto:info@empireonehealth.com">
                    info@empireonehealth.com
                  </a>
                </div>
              </div>
              <div className="right">
                <div className="map-area">
                  <FaPhone
                    style={{
                      fontSize: "12px",
                      marginRight: "6px",
                      lineHeight: 1,
                      color: "#ffffff",
                    }}
                  />
                  <a href="tel:+18332006002">+1 (833) 200-6002</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container-full-header">
        <div className="row">
          <div className="col-lg-12">
            <div className="header-wrapper-1">
              <div className="logo-area-start">
                <a href="/" className="logo">
                  <img
                    src="/assets/images/logo/empireone-health-logo.png"
                    alt="EmpireOne Health"
                    width="220"
                    height="60"
                    fetchPriority="high"
                  />
                </a>
                <div className="nav-area">
                  <ul>
                    <li className="main-nav">
                      <a href="/">Home</a>
                    </li>
                    <li className="main-nav">
                      <a href="/about-us">About Us</a>
                    </li>
                    <li className="main-nav has-dropdown">
                      <a href="/provider-services">Service</a>
                      <ul className="submenu parent-nav">
                        <li>
                          <a href="/provider-services">Provider</a>
                        </li>
                        <li>
                          <a href="/payer-services">Payer</a>
                        </li>
                      </ul>
                    </li>
                    <li className="main-nav">
                      <a href="/case-study">Case Study</a>
                    </li>
                    <li className="main-nav">
                      <a href="/contact">Contact</a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="header-right">
                {/* <div className="input-area">
                  <input id="myInput" type="text" placeholder="Search..." />
                  <i className="fa-light fa-magnifying-glass" />
                </div> */}
                <a
                  href="#"
                  className="rts-btn btn-primary book-call-popup-trigger"
                  data-popup-form-trigger="book-call"
                >
                  Get in touch
                  <img
                    src="/assets/images/banner/icons/arrow--up-right.svg"
                    alt=""
                  />
                </a>
                <div className="menu-btn" id="menu-btn">
                  <svg
                    width="20"
                    height="16"
                    viewBox="0 0 20 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect y="14" width="20" height="2" fill="#1F1F25" />
                    <rect y="7" width="20" height="2" fill="#1F1F25" />
                    <rect width="20" height="2" fill="#1F1F25" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
