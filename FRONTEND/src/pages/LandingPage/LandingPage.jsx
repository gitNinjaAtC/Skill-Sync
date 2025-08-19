import React, { useEffect, useState } from "react";
import "./LandingPage.scss";
import AOS from "aos";
import "aos/dist/aos.css";
import WavyText from "../../components/WavyText";
import Footer from "../../components/footer/Footer";
import Form from "../login/loginform";
import RegisterForm from "../login/registrationfrorm";
import AlumniMarquee from "./AlumniMarquee";
import EventCarousel from "./EventCarousel";
import alumniimage1 from "./about-image/a1.jpg";
import alumniimage2 from "./about-image/a2.jpg";
import alumniimage3 from "./about-image/a3.jpg";
import alumniimage4 from "./about-image/a4.jpg";
import alumniimage5 from "./about-image/a5.jpg";
import alumniimage8 from "./about-image/a8.jpg";
import alumniimage9 from "./about-image/a9.jpg";
import logo from "./about-image/logo.png";

const heroImages = [
  alumniimage1,
  alumniimage2,
  alumniimage3,
  alumniimage4,
  alumniimage5,
  alumniimage8,
  alumniimage9,
];

const LandingPage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });

    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 3000);

    return () => clearInterval(imageInterval);
  }, []);

  return (
    <div className="landingPage">
      <section className="hero">
        {heroImages.map((img, index) => (
          <div
            key={index}
            className={`hero-image ${
              index === currentImageIndex ? "active" : ""
            }`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}

        <nav className="header">
          <div className="logo" data-aos="fade-left">
            <img
              src={logo}
              alt="SISTec Alumni Portal Logo"
              style={{
                height: "30%",
                width: "30%",
                objectFit: "contain",
                filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.12))",
              }}
            />
          </div>
          {!showLoginForm && !showRegisterForm && (
            <div className="auth-buttons" data-aos="fade-right">
              <button
                className="btn-login"
                onClick={() => {
                  setShowRegisterForm(false);
                  setShowLoginForm(true);
                }}
              >
                Login
              </button>
              <button
                className="btn-register"
                onClick={() => {
                  setShowLoginForm(false);
                  setShowRegisterForm(true);
                }}
              >
                Register
              </button>
            </div>
          )}
        </nav>

        {!showLoginForm && !showRegisterForm && (
          <div className="hero-overlay" data-aos="fade-down-right">
            <h1 className="animated-text">
              Welcome to <WavyText text="Skill-Sync" />
            </h1>
            <p>Connect. Collaborate. Grow.</p>
          </div>
        )}

        {showLoginForm && (
          <div className="login-popup">
            <Form />
          </div>
        )}

        {showRegisterForm && (
          <div className="registration-popup">
            <RegisterForm />
          </div>
        )}
      </section>

      <section className="about" id="about">
        <div className="about-text animation">
          <h2
            data-aos="fade-right"
            data-aos-offset="300"
            data-aos-easing="ease-in-sine"
          >
            What is Skill-Sync?
          </h2>
          <p>
            Skill-Sync is more than just a platform—it's a thriving ecosystem
            for alumni, students, and faculty to connect and grow together. From
            sharing job opportunities and mentorship to collaborating on
            projects and hosting events, Skill-Sync helps bridge generations and
            spark innovation. Whether you're seeking guidance or looking to give
            back, this is your space to make an impact.
          </p>
          <button className="btn gold">Join the Network</button>
        </div>
        <div className="about-image">
          <EventCarousel />
        </div>
      </section>

      <AlumniMarquee />
      <Footer />
    </div>
  );
};

export default LandingPage;
