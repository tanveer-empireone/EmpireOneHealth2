export default function Header() {
  return (
    <header className="header-one header--sticky">
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
                <a href="/appointment" className="rts-btn btn-primary">
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