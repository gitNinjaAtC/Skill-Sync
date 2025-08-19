// src/components/AlumniCard.jsx
import React from "react";
import "./AlumniCard.scss";
import "aos/dist/aos.css";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const AlumniCard = ({ name, role, image, isFeatured }) => (
  <div className={`alumni-card ${isFeatured ? "featured" : ""}`}>
    {isFeatured && <div className="badge">★ Featured</div>}
    <div className="image-container">
      <img src={image} alt={name} />
      <div className="social-overlay" >
        <a href="#"><FaFacebookF data-aos="fade-up"
     data-aos-duration="3000" /></a>
        <a href="#"><FaTwitter data-aos="fade-up"
     data-aos-duration="3000"/></a>
        <a href="#"><FaInstagram data-aos="fade-up"
     data-aos-duration="3000"/></a>
        <a href="#"><FaLinkedinIn data-aos="fade-up"
     data-aos-duration="3000"/></a>
      </div>
    </div>
    <h3>{name}</h3>
    <p>{role}</p>
  </div>
);

export default AlumniCard;
