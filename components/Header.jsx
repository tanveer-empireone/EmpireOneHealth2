export default function Header() {
  return (
    <header className="header-one header--sticky">
      <div className="header-top-area">
        <div className="container-full-header">
          <div className="col-lg-11">
            <div className="header-top">
              <div className="left">
                <div className="map-area">
                  <i className="far fa-envelope" aria-hidden="true" style={{ fontSize: '12px', marginRight: '6px', lineHeight: 1 }} />
                  <a href="mailto:info@empireonehealth.com">info@empireonehealth.com</a>
                </div>
              </div>
              <div className="right">
                <div className="map-area">
                  <a href="https://careers.empireonecx.com" target="_blank" rel="noopener noreferrer">Careers</a>
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
                  <img src="/assets/images/logo/empireone-health-logo.png" alt="EmpireOne Health" />
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
                <div className="input-area">
                  <input id="myInput" type="text" placeholder="Search..." />
                  <i className="fa-light fa-magnifying-glass" />
                </div>
                <a href="#" className="rts-btn btn-primary book-call-popup-trigger" data-popup-form-trigger="book-call">
                  Book a Call
                  <img src="/assets/images/banner/icons/arrow--up-right.svg" alt="" />
                </a>
                <div className="menu-btn" id="menu-btn">
                  <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
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