import React from "react";
import "./AlumniCard.scss";
import "aos/dist/aos.css";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

const AlumniCard = ({
  name,
  city,
  company,
  companylogo,
  packageText,
  VALUATION,
  image,
  isStartup, // boolean, true for startups
}) => (
  <div className="alumni-card">
    <div className="image-container">
      <img src={image} alt={name} />
      <div className="social-overlay">
        <a href="#">
          <FaFacebookF />
        </a>
        <a href="#">
          <FaTwitter />
        </a>
        <a href="#">
          <FaInstagram />
        </a>
        <a href="#">
          <FaLinkedinIn />
        </a>
      </div>
    </div>
    <div className="alumni-info">
      <h3>{name}</h3>
      {city && <p className="city">{city}</p>}
      <div className="company-row">
        {companylogo && (
          <img src={companylogo} alt="company logo" className="company-logo" />
        )}
        {company && <span className="unique">{company}</span>}
        {isStartup && <span className="startup-word">STARTUP</span>}
      </div>

      {isStartup && (
        <div className="lpa-box">
          <span className="valuation-label">VALUATION &nbsp; </span>
          {VALUATION && <span className="valuation-amount">{VALUATION}</span>}
        </div>
      )}
      {packageText && <div className="lpa-box">{packageText}</div>}
    </div>
  </div>
);

export default AlumniCard;
