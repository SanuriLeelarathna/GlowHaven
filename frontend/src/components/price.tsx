import { useState } from "react";

export default function Pricing() {
  const [activeTab, setActiveTab] = useState("Haircuts");

  const categories = ["Haircuts", "Coloring", "Styling", "Treatments"];

  const pricingData: Record<string, { name: string; price: string; duration: string }[]> = {
    Haircuts: [
      { name: "Ladies Cut & Style", price: "3,500 LKR", duration: "45 mins" },
      { name: "Gentleman's Cut & Finish", price: "2,500 LKR", duration: "30 mins" },
      { name: "Child's Haircut (under 12)", price: "1,500 LKR", duration: "25 mins" },
      { name: "Fringe Trim", price: "800 LKR", duration: "10 mins" },
    ],
    Coloring: [
      { name: "Root Touch-Up", price: "4,500 LKR", duration: "60 mins" },
      { name: "Full Hair Coloring", price: "8,500 LKR", duration: "90 mins" },
      { name: "Balayage / Ombre", price: "14,500 LKR", duration: "120 mins" },
      { name: "Highlights (Half Head)", price: "7,500 LKR", duration: "75 mins" },
    ],
    Styling: [
      { name: "Blow Dry & Style", price: "2,200 LKR", duration: "30 mins" },
      { name: "Luxury Blow Dry & Treatment", price: "4,000 LKR", duration: "50 mins" },
      { name: "Updo / Occasion Styling", price: "6,000 LKR", duration: "60 mins" },
      { name: "Bridal Hair Design", price: "8,000 LKR", duration: "75 mins" },
    ],
    Treatments: [
      { name: "Deep Conditioning Hair Mask", price: "2,500 LKR", duration: "30 mins" },
      { name: "Keratin Revitalizing Treatment", price: "12,000 LKR", duration: "90 mins" },
      { name: "Olaplex Bond Repair", price: "6,500 LKR", duration: "45 mins" },
      { name: "Scalp Care & Massage", price: "3,500 LKR", duration: "30 mins" },
    ],
  };

  return (
    <section className="pricing" id="pricing">
      <div className="pricing-container">
        <span className="section-subtitle">EXQUISITE SERVICES</span>
        <h2>Our Pricing</h2>

        {/* Category Tabs */}
        <div className="pricing-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`pricing-tab-btn ${activeTab === cat ? "active" : ""}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Pricing List (Responsive Two-Column Grid) */}
        <div className="pricing-list-grid">
          {pricingData[activeTab].map((item, idx) => (
            <div key={idx} className="pricing-item">
              <div className="pricing-item-header">
                <span className="pricing-name">{item.name}</span>
                <span className="pricing-dots"></span>
                <span className="pricing-price">{item.price}</span>
              </div>
              <div className="pricing-item-sub">
                <span className="pricing-duration">{item.duration}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer See All Prices Link */}
        <div className="pricing-footer">
          <button className="pricing-see-all-btn">See all prices</button>
        </div>
      </div>
    </section>
  );
}