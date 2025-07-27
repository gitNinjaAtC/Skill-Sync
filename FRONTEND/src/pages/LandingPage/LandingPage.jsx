import React, { useEffect, useState, useRef } from "react";
import "./LandingPage.scss";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import WavyText from "../../components/WavyText";
import Footer from "../../components/footer/Footer";
import useTilt from "../../customHooks/useTilt";
import ProfileCard from './ProfileCard'
import image1 from "./about-image/1.jpg";
import image2 from "./about-image/2.jpg";
import image3 from "./about-image/3.jpg";
import image4 from "./about-image/4.jpg";   
import image5 from "./about-image/5.jpg"; 
import image6 from "./about-image/6.jpg"; 
import image7 from "./about-image/7.jpg"; // Import the image for the about section
import { animate, scroll } from "@motionone/dom";
import Form from "../login/loginform";
import RegisterForm from "../login/registrationfrorm";


const heroImages = [
  "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg",
  "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg",
  "https://images.pexels.com/photos/1181289/pexels-photo-1181289.jpeg",
  "https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg"
];

const cards = [
  {
    name: "Shivam Kumar",
    title: "Software Engineer",
    batch: "Batch 2022-26",
    avatarUrl: "https://images.pexels.com/photos/3775537/pexels-photo-3775537.jpeg"
  },
  {
    name: "Sahil Chaurasiya",
    title: "IoT Engineer",
    batch: "Batch 2023-27",
    avatarUrl: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg"
  },
  {
    name: "Purushottam",
    title: "Backend Developer",
    batch: "Batch 2021-25",
    avatarUrl: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"
  },
  {
    name: "Anjali Verma",
    title: "Frontend Developer",
    batch: "Batch 2020-24",
    avatarUrl: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg"
  },
  {
    name: "Ravi Yadav",
    title: "DevOps Engineer",
    batch: "Batch 2019-23",
    avatarUrl: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg"
  },
  {
    name: "Sneha Mishra",
    title: "UX/UI Designer",
    batch: "Batch 2022-26",
    avatarUrl: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg"
  },
  {
    name: "Amit Singh",
    title: "AI/ML Engineer",
    batch: "Batch 2023-27",
    avatarUrl: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg"
  },
  {
    name: "Pooja Sharma",
    title: "Blockchain Developer",
    batch: "Batch 2020-24",
    avatarUrl: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg"
  },
  {
    name: "Neha Rajput",
    title: "Full Stack Developer",
    batch: "Batch 2021-25",
    avatarUrl: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg"
  },
  {
    name: "Vivek Soni",
    title: "Cybersecurity Analyst",
    batch: "Batch 2022-26",
    avatarUrl: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg"
  }
];


const LandingPage = () => {
  const navigate = useNavigate();
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const headingRef = useRef(null);
  const galleryRef = useRef(null);
  const progressRef = useRef(null);
  const [animateHeading, setAnimateHeading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);


    const cardRef = useRef(null);
  useTilt(cardRef);

useEffect(() => {
  AOS.init({ duration: 1000, once: true });

  // Scroll visibility tracking for hero section
  const handleScroll = () => {
    const heroSection = document.querySelector(".hero");
    const heroBottom = heroSection?.getBoundingClientRect().bottom || 0;
    setIsHeroVisible(heroBottom > 100);
  };
  window.addEventListener("scroll", handleScroll);

  // Auto image change
  const imageInterval = setInterval(() => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
  }, 3000);

  // Animate horizontal scroll of gallery
  const scrollLength = (heroImages.length - 1) * 100;

  scroll(
    animate(".img-group", {
      transform: ["none", `translateX(-${scrollLength}vw)`],
    }),
    {
      target: galleryRef.current,
      axis: "y",
      offset: ["start start", "end start"],
    }
  );

  // Animate progress bar
  scroll(
    animate(".progress", { scaleX: [0, 1] }),
    {
      target: galleryRef.current,
    }
  );

  // IntersectionObserver for heading animation
  const headingObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setAnimateHeading(true);
        headingObserver.disconnect();
      }
    },
    { threshold: 0.6 }
  );
  if (headingRef.current) {
    headingObserver.observe(headingRef.current);
  }

  // Show/hide progress bar on gallery in/out
  const galleryObserver = new IntersectionObserver(
    ([entry]) => {
      if (progressRef.current) {
        progressRef.current.classList.toggle("hide", !entry.isIntersecting);
      }
    },
    { threshold: 0.1 }
  );
  if (galleryRef.current) {
    galleryObserver.observe(galleryRef.current);
  }

  // Cleanup
  return () => {
    window.removeEventListener("scroll", handleScroll);
    clearInterval(imageInterval);
    headingObserver.disconnect();
    galleryObserver.disconnect();
  };
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


      <section className="gallery" id="gallery" ref={galleryRef}>
        <h2
          ref={headingRef}
          className={`typewriter-heading ${animateHeading ? "animate" : ""}`}
        >
          Our Community in Action
        </h2>        
          <div className="sticky-container">
            <ul className="img-group">
              {heroImages.map((src, index) => (
                <li className="img-container" key={index}>
                  <img src={src} alt={`Event ${index + 1}`} />
                  <h3>#{String(index + 1).padStart(3, "0")}</h3>
                </li>
              ))}
            </ul>
          </div>
        <div className="progress" ref={progressRef}></div>
      </section>


      <section className="about" id="about">
        <div className="about-text animation">
          <h2>What is Skill-Sync?</h2>
          <p>
            Skill-Sync is more than just a platform—it's a thriving ecosystem for alumni, students, and faculty to connect and grow together.
            From sharing job opportunities and mentorship to collaborating on projects and hosting events, Skill-Sync helps bridge generations and spark innovation.
            Whether you're seeking guidance or looking to give back, this is your space to make an impact.
          </p>
          <button className="btn gold">Join the Network</button>
        </div>
        <div className="about-image">
          <img src={image1} alt="" />
          <img src={image2} alt="" />
          <img src={image3} alt="" />
          <img src={image4} alt="" /> 
          <img src={image5} alt="" />
          <img src={image6} alt="" />
          <img src={image7} alt="" />
        </div>
      </section>

      <section className="distinguished" id="alumni">
        <h2>Distinguished Alumni</h2>

        <div
          className="alumni-cards-wrapper"
          onMouseEnter={() => {
            document.querySelector(".alumni-cards")?.classList.add("paused");
          }}
          onMouseLeave={() => {
            document.querySelector(".alumni-cards")?.classList.remove("paused");
          }}
        >
          <div className="alumni-cards">
            {[...cards, ...cards].map((alumni, index) => (
              <ProfileCard
                key={index}
                name={alumni.name}
                title={alumni.title}
                batch={alumni.batch}
                contactText="Contact Me"
                avatarUrl={alumni.avatarUrl}
                showUserInfo={true}
                enableTilt={true}
                enableMobileTilt={false}
                onContactClick={() =>
                  console.log(`Contact clicked for ${alumni.name}`)
                }
              />
            ))}
          </div>
        </div>
      </section>



      <Footer />

    </div>
  );
};

export default LandingPage;
