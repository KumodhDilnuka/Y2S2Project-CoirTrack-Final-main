import React from "react";
import { Link } from "react-router-dom";
import Header from "./Navbar/Header";
import Footer from "./Navbar/Footer";
import "./Contact.css";

function Contact() {
  return (
    <div>
      <Header />
      
      <div className="contact-container">
        <h1>Contact Us</h1>
        
        <div className="contact-layout">
          <div className="contact-info">
            <h2>Get in Touch</h2>
            <p>We'd love to hear from you. Please feel free to contact us using any of the methods below:</p>
            
            <div className="contact-details">
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <h3>Address</h3>
                  <p>Nesasa Coir (Pvt) Ltd. Aluthgama, Wellarawa, Sri Lanka</p>
                </div>
              </div>
              
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <div>
                  <h3>Phone</h3>
                  <p>+94 77 718 6598</p>
                </div>
              </div>
              
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <div>
                  <h3>Email</h3>
                  <p>nesasa.coir@gmail.com</p>
                  <p>info@nesasacoco.com</p>
                </div>
              </div>
              
              <div className="contact-item">
                <i className="fas fa-clock"></i>
                <div>
                  <h3>Business Hours</h3>
                  <p>Monday - Friday: 9am - 5pm</p>
                  <p>Saturday: 9am - 1pm</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="contact-buttons">
            <Link to="/inquiry" className="contact-button">
              Make an Inquiry
            </Link>
            <Link to="/feedback" className="contact-button">
              Submit Feedback
            </Link>
          </div>
        </div>
        
        <div className="contact-map">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.4982449674524!2d79.99955737582344!3d6.693900993323339!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae24b4a307e098d%3A0xd603fcb1a4a8a01!2sAluthgama%2C%20Sri%20Lanka!5e0!3m2!1sen!2sus!4v1709104543937!5m2!1sen!2sus" 
            width="100%" 
            height="400" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy"
            title="Company Location"
          ></iframe>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default Contact; 