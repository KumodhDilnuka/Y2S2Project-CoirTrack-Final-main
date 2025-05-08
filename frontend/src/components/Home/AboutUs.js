import React from "react";
import "./aboutUs.css";
import Header from "../Navbar/Header";
import Footer from "../Navbar/Footer";

function AboutUs() {
  return (
    <div className="page-wrapper">
      <Header />
      <div className="about-us-container">
        <section className="hero">
          <h1 className="company-title">
            Nesasa Coco - Necessity of a Green Globe
          </h1>
        </section>

        <section className="company-story">
          <p>
            Nesasa planted in the Sri Lankan soil by an inspiring man in 2011 with
            the desire of seeing the same one day as a giant tree to shelter many.
          </p>

          <p>
            With utmost dedication of the founder, Company grew as a giant in the
            industry today. Company started with a single machine and today we are
            operating multiple state of the art manufacturing plants in the heart
            of the region.
          </p>

          <p>
            Supplying high quality products within the agreed time frame,
            continuous follow-ups of results with the buyers, commitment to
            maintain highest quality standards with our most skilled staff and
            affordable prices are the main icons behind our success story.
          </p>

          <p>
            Company has bequeathed many innovative products to the world with over
            decade of continuous R&D. Further we are engaged with many CSR
            activities to uplift the living standard of rural community in the
            vicinity as well.
          </p>
        </section>

        <section className="founder-section">
          <div className="founder-image">
            <div className="image-container">
              <img
                src={require("./images/chairman_image01.jpg")}
                alt="Company Founder"
              />
            </div>
          </div>

          <div className="founder-info">
            <h2>Nesasa Founder Chairman</h2>
            <h3>Mr. Roshan Amila Kumara</h3>

            <p>
              Not every successful entrepreneur set out to conquer the business
              world. For an example our founder began his business career as a
              highly skilled craftsman and an affable human. His business story
              begins with his childhood as he is born with the talent of
              technology and the quality of benevolent.
            </p>

            <p>
              His customer service principles brought him a vast recognition in
              the business world. He focuses on customer and employee satisfaction
              despite the staggering growth of business. He is one of the most
              admired and popular entrepreneur in the region and his company's
              growth from a single machine to the giant it is today describes his
              success.
            </p>

            <p>
              Sacrifices, honesty, irrepressible ambitions and professionalism
              turn new pages of success in his journey.
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

export default AboutUs;
