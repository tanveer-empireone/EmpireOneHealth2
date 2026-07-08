export default function Footer() {
  return (
    <>
      <div className="rts-footer-area footer-bg pt--105 pt_sm--50">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="subscribe-area-start pb--30">
                <a href="/" className="logo">
                  <img src="/assets/images/logo/empireone-health-logo.png" alt="EmpireOne Health" />
                </a>
                <div className="subscribe-area">
                  <input type="text" placeholder="Enter your email" />
                  <button className="rts-btn btn-primary">Stay Updated</button>
                </div>
              </div>
            </div>
            <div className="col-lg-12">
              <div className="footer-wrapper-style-between">
                <div className="single-wized">
                  <h6 className="title">Contact</h6>
                  <div className="body">
                    <p className="location">Healthcare operations support for providers and payers.</p>
                    <a href="mailto:info@empireonehealth.com">info@empireonehealth.com</a>
                  </div>
                </div>
                <div className="single-wized">
                  <h6 className="title">Company</h6>
                  <div className="body">
                    <ul className="nav-bottom">
                      <li>
                        <a href="/about">About</a>
                      </li>
                      <li>
                        <a href="/appointment">Book a Call</a>
                      </li>
                      <li>
                        <a href="/contact">Contact</a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="single-wized">
                  <h6 className="title">Foundation Services</h6>
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
                  <h6 className="title">Working Time</h6>
                  <div className="body">
                    <p className="location">Human-led, AI-assisted delivery</p>
                    <p className="location">HIPAA-conscious workflows</p>
                    <p className="location">BAA-ready engagement</p>
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
                <a className="main mobile-menu-link" href="/about">About</a>
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
          <div className="rts-social-style-one pl--20 mt--50">
            <ul>
              <li>
                <a href="#" aria-label="Facebook"><i className="fa-brands fa-facebook-f" /></a>
              </li>
              <li>
                <a href="#" aria-label="Twitter"><i className="fa-brands fa-twitter" /></a>
              </li>
              <li>
                <a href="#" aria-label="YouTube"><i className="fa-brands fa-youtube" /></a>
              </li>
              <li>
                <a href="#" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in" /></a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="loader-wrapper">
        <div className="loader" />
        <div className="loader-section section-left" />
        <div className="loader-section section-right" />
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