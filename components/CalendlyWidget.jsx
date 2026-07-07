import Script from "next/script";

export default function CalendlyWidget() {
  return (
    <div className="book-your-consulting rts-section-gap calendly-booking-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-11">
            <div className="appoinment-area-main bg_image calendly-booking-card">
              <h2 className="title mb--30">Book Your 30 Minute Call</h2>
              <div
                className="calendly-inline-widget"
                data-url="https://calendly.com/empireonehealth-info/30min"
                style={{ minWidth: "320px", height: "700px" }}
              />
            </div>
          </div>
        </div>
      </div>
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="afterInteractive" />
    </div>
  );
}