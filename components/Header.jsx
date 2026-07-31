export default function Header() {
  return (
    <header className="header-one header--sticky">
      <div className="header-top-area">
        <div className="container-full-header">
          <div className="col-lg-12">
            <div className="header-top">
              <div className="left">
                <div className="map-area">
                  <a href="/">EmpireOne Health BPO &amp; RCM Support</a>
                </div>
              </div>
              <div className="right">
                <div className="map-area">
                  <i className="fa-regular fa-e-mail" />
                  <a href="mailto:info@empireonehealth.com">info@empireonehealth.com</a>
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
                  <img src="/assets/images/logo/empireone-health-logo.png" alt="EmpireOne Health" width="2127" height="590" decoding="async" />
                </a>
                <div className="nav-area">
                  <ul>
                    <li className="main-nav">
                      <a href="/">Home</a>
                    </li>
                    <li className="main-nav">
                      <a href="/about">About</a>
                    </li>
                    <li className="main-nav has-dropdown">
                      <a href="#">Service</a>
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
                      <a href="/contact">Contactss</a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="header-right">
                <div className="input-area">
                  <input id="myInput" type="text" placeholder="Search..." />
                  <i className="fa-light fa-magnifying-glass" />
                </div>
                <a href="/appointment" className="rts-btn btn-primary">
                  Book a Call
                  <img src="/assets/images/banner/icons/arrow--up-right.svg" alt="" width="18" height="18" decoding="async" />
                </a>
                <button type="button" className="menu-btn" id="menu-btn" aria-label="Open menu">
                  <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect y="14" width="20" height="2" fill="#1F1F25" />
                    <rect y="7" width="20" height="2" fill="#1F1F25" />
                    <rect width="20" height="2" fill="#1F1F25" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}