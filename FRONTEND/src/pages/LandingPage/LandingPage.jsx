import React, { useEffect, useState } from "react";
import "./LandingPage.scss";
import Marquee from "react-fast-marquee";
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
import axios from "axios";
import logo from "./about-image/logo.png";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8800"
    : "https://skill-sync-backend-522o.onrender.com";

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
  const [alumniUpdates, setAlumniUpdates] = useState([]);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });

    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 3000);

    fetchAlumniUpdates();

    return () => clearInterval(imageInterval);
  }, []);

  const fetchAlumniUpdates = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/API_B/alumni-updates`);
      setAlumniUpdates(res.data);
    } catch (err) {
      console.error("Error fetching alumni updates:", err);
    }
  };

  const getInitials = (name) => {
    if (!name) return "A";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

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
              Welcome to <WavyText text="AlumniConnect" />
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
            What is AlumniConnect?
          </h2>
          <p>
            AlumniConnect is more than just a platform—it's a thriving ecosystem
            for alumni, students, and faculty to connect and grow together. From
            sharing job opportunities and mentorship to collaborating on
            projects and hosting events, AlumniConnect helps bridge generations and
            spark innovation. Whether you're seeking guidance or looking to give
            back, this is your space to make an impact.
          </p>
          <button className="btn gold">Join the Network</button>
        </div>
        <div className="about-image">
          <EventCarousel />
        </div>
      </section>

      <section className="alumni-updates-section">
        <div className="section-header" data-aos="fade-up">
          <h2>Alumni Success & Career Updates</h2>
          <p>Celebrating the achievements and career milestones of our SISTec graduates</p>
        </div>
        
        <div className="updates-carousel-wrapper">
          {alumniUpdates.length > 0 ? (
            <Marquee speed={40} pauseOnHover={true} gradient={true} gradientColor={[251, 251, 251]}>
              {alumniUpdates.map((update) => (
                <div className="update-card-premium" key={update._id}>
                  <div className="card-top">
                    <div className="alumni-avatar">
                      {getInitials(update.studentId?.StudentName)}
                    </div>
                    <div className="alumni-basic-info">
                      <span className="name">{update.studentId?.StudentName}</span>
                      <span className={`badge ${update.category?.toLowerCase().replace(/\s+/g, '-')}`}>
                        {update.category || "Update"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="achievement-content">
                    <p className="note">{update.note}</p>
                  </div>
                  
                  <div className="card-footer">
                    <div className="academic-info">
                      <span>{update.studentId?.batch}</span>
                      <span className="separator">•</span>
                      <span>{update.studentId?.branch}</span>
                    </div>
                    <span className="update-date">
                      {new Date(update.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </Marquee>
          ) : (
            <div className="no-updates">
              <p>New success stories coming soon!</p>
            </div>
          )}
        </div>
      </section>

      <AlumniMarquee />
      <Footer />
    </div>
  );
};

export default LandingPage;
