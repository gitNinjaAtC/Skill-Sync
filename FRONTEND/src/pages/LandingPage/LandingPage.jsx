import React, { useEffect, useState } from "react";
import "./LandingPage.scss";
import AOS from "aos";
import "aos/dist/aos.css";
import WavyText from "../../components/WavyText";
import Footer from "../../components/footer/Footer";
import Form from "../login/loginform";
import RegisterForm from "../login/registrationfrorm";
import AlumniMarquee from "./AlumniMarquee";
import EventCarousel from "./EventCarousel"

const heroImages = [
  "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg",
  "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg",
  "https://images.pexels.com/photos/1181289/pexels-photo-1181289.jpeg",
  "https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg"
];

const LandingPage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });

    // Auto image change
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 3000);
  }, []);

  return (
    <div className="landingPage">
      <section
        className="hero"
        style={{
          backgroundImage: `url(${heroImages[currentImageIndex]})`,
          transition: "background-image 1s ease-in-out"
        }}
      >
        <nav className="header">
          <div className="logo" data-aos="fade-left">Alumni Portal</div>
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
          <h2 data-aos="fade-right"
            data-aos-offset="300"
            data-aos-easing="ease-in-sine">What is Skill-Sync?</h2>
          <p>
            Skill-Sync is more than just a platform—it's a thriving ecosystem for alumni, students, and faculty to connect and grow together.
            From sharing job opportunities and mentorship to collaborating on projects and hosting events, Skill-Sync helps bridge generations and spark innovation.
            Whether you're seeking guidance or looking to give back, this is your space to make an impact.
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





