import React from "react";
//import Navbar from "../Navbar/Navbar";
import Header from "../Navbar/Header";
import Footer from "../Navbar/Footer";
import "./home.css";

function Home() {
  return (
    <div>
      <Header />

      <div className="home-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1>High Quality Coir Products</h1>
            <h2>
              from <span className="highlight">Sri Lanka</span>
            </h2>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="info-section">
          <div className="info-column">
            <h2>Why Coco Coir?</h2>
            <ul>
              <li>It's 100% Natural and Organic</li>
              <li>
                It's a natural renewable resource, biodegradable, and
                eco-friendly
              </li>
              <li>Promotes better root growth and higher yields</li>
              <li>Excellent water retention medium</li>
              <li>Strong natural siking with high load-bearing capacity</li>
            </ul>
          </div>

          <div className="info-column">
            <h2>Why Nesasa?</h2>
            <ul>
              <li>
                Established in 2011 with over 10 years of industry experience
              </li>
              <li>Managed by professionals with 25+ years of experience</li>
              <li>Factories in the heart of Sri Lanka's Coconut Triangle</li>
              <li>Workforce with hundreds of experienced team members</li>
            </ul>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="video-section">
          <h2>What we do...</h2>
          <div className="video-container">
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/nd8Ke2ORBNQ"
              title="Corporate Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>

        {/* Projects Section */}
        <section className="projects-section">
          <h2>Our Projects...</h2>
          <div className="project-gallery">
            <img
              src={require("./images/052A9674-150x150.jpg")}
              alt="Project 1"
            />
            <img
              src={require("./images/IMG_5024-150x150.jpg")}
              alt="Project 2"
            />
            <img
              src={require("./images/IMG-20240330-WA0008-150x150.jpg")}
              alt="Project 3"
            />
            <img
              src={require("./images/052A0025-150x150.jpg")}
              alt="Project 4"
            />
            <img
              src={require("./images/IMG_5243-150x150.jpg")}
              alt="Project 5"
            />
          </div>
        </section>

        {/* Product Range Section */}
        <section className="products-section">
          <h2>Our Product Range...</h2>
          <div className="product-grid">
            <div className="product-card">
              <img
                src={require("./images/product_weedMatt-768x512.jpg")}
                alt="Weed Mats"
              />
              <h3>Weed Mats</h3>
            </div>
            <div className="product-card">
              <img
                src={require("./images/product_terrariums-768x512.jpg")}
                alt="Terrariums"
              />
              <h3>Terrariums</h3>
            </div>
            <div className="product-card">
              <img
                src={require("./images/product_growBags-768x512.jpg")}
                alt="Grow Bags"
              />
              <h3>Grow Bags</h3>
            </div>
            <div className="product-card">
              <img
                src={require("./images/FMTfiber-768x512.jpg")}
                alt="FMT Fiber"
              />
              <h3>FMT Fiber</h3>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default Home;
