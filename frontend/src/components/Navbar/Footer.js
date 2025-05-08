import React from "react";
import { Link } from "react-router-dom";
import "./footer.css"; // Import the CSS file

function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          {/* Logo and Description */}
          <div className="footer-logo">
            <img src={require("./icons/coir-logo.png")} alt="Nesasa Coir Logo" />
            <p className="footer-text">
              Nesasa Coir (Pvt) Ltd., a leading manufacturer of coir products from Sri Lanka.
            </p>
          </div>

          {/* Contact Details */}
          <div className="footer-contact">
            <h3 className="footer-heading">Contact</h3>
            <p className="contact-info">Nesasa Coir (Pvt) Ltd. Aluthgama, Wellarawa, Sri Lanka</p>
            <p className="contact-info"><strong>+94 77 718 6598</strong></p>
            <p className="contact-info"><strong>nesasa.coir@gmail.com</strong></p>
            <p className="contact-info"><strong>info@nesasacoco.com</strong></p>
          </div>

          {/* Product List */}
          <div className="footer-products">
            <h3 className="footer-heading">Our Products</h3>
            <ul>
              <li>Grow Bags</li>
              <li>Coco Briquettes</li>
              <li>Coir Sheets</li>
              <li>Coco Poles</li>
              <li>Weed Mats</li>
              <li>Terrariums</li>
            </ul>
          </div>

          {/* Social Media Links */}
          <div className="footer-links">
            <h3 className="footer-heading">Connect with us</h3>
            <div className="social-icons">
              <Link>
                <img src={require("./icons/facebook.png")} className="social-icon" alt="Facebook" />
              </Link> 
              <Link>
                <img src={require("./icons/instagram .png")} className="social-icon" alt="Instagram" />
              </Link>
              <Link>
                <img src={require("./icons/twitter.jpeg")} className="social-icon" alt="Twitter" />
              </Link>   
              <Link>
                <img src={require("./icons/LinkedinIn.png")} className="social-icon" alt="LinkedIn" />
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="copyright">
          © 2023 – Nesasa Coir (Pvt) Ltd. | All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
