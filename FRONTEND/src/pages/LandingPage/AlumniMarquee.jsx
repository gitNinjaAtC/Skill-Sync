import React, { useState, useEffect } from "react";
import Marquee from "react-fast-marquee";
import AlumniCard from "./AlumniCard";
import "./AlumniMarquee.scss";
import "aos/dist/aos.css";
import ibotix from "./about-image/ibotix.png";
import mercedes from "./about-image/Mercedes-Benz.png";
import deloitte from "./about-image/deloitte.png";
import MindRuby from "./about-image/MindRuby.png";
import GlobalLogic from "./about-image/GlobalLogic.png";
import NIQ from "./about-image/NIQ.png";
import Adity from "./about-image/adity-I.jpg";
import Muniraj from "./about-image/muniraj.jpg";
import Aruna from "./about-image/aruna.jpg";
import Sonu from "./about-image/sonu.jpg";
import Aman from "./about-image/aman.jpg";
import Aditya from "./about-image/aditya-gl.jpg";
import Pankaj from "./about-image/pankaj.jpg";

const alumniData = [
  {
    name: "ADITYA SINGH",
    city: "Chhatarpur",
    companylogo: ibotix,
    isStartup: true,
    VALUATION: "₹50 CRORE",
    image: Adity,
  },
  {
    name: "MUNIRAJ CHOURE",
    city: "Betul, Madhya Pradesh",
    company: "UNIQUE",
    isStartup: true,
    VALUATION: "₹1.5 CRORE",
    image: Muniraj,
  },
  {
    name: "ARUNA RAJPUT",
    city: "Bengaluru",
    companylogo: mercedes,
    packageText: "₹25 LPA",
    image: Aruna,
  },
  {
    name: "SONU VERMAN",
    city: "Bokaro, Jharkhand",
    companylogo: deloitte,
    packageText: "₹24 LPA",
    image: Sonu,
  },
  {
    name: "AMAN GUPTA",
    city: "Jabalpur",
    companylogo: MindRuby,
    packageText: "₹22 LPA",
    image: Aman,
  },
  {
    name: "Shekhar Yadav",
    city: "Bhopal",
    companylogo: GlobalLogic,
    packageText: "₹35 LPA",
    image: Aditya,
  },
  {
    name: "PANKAJ LAL",
    city: "Bhopal",
    companylogo: NIQ,
    packageText: "₹20 LPA",
    image: Pankaj,
  },
];

// Repeat data for scrolling
const repeatedData = [...alumniData, ...alumniData, ...alumniData];

const AlumniMarquee = () => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 960);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 960);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="alumni-marquee-section">
      <div
        className="triple-border-title"
        data-aos="fade-right"
        data-aos-offset="300"
        data-aos-easing="ease-in-sine"
      >
        <div className="line-group left">
          <span className="line thick"></span>
          <span className="line medium"></span>
          <span className="line thin"></span>
        </div>
        <h2>Our Distinguished Alumni</h2>
        <div className="line-group right">
          <span className="line thin"></span>
          <span className="line medium"></span>
          <span className="line thick"></span>
        </div>
      </div>

      <div className="alumni-marquee-wrapper">
        <div className="marquee-row">
          <Marquee
            gradient={isDesktop} // ✅ gradient only for desktop
            gradientColor="#f6f3f3"
            speed={40}
          >
            {repeatedData.map((alumnus, index) => (
              <AlumniCard key={`forward-${index}`} {...alumnus} />
            ))}
          </Marquee>
        </div>

        <div className="marquee-row reverse">
          <Marquee
            gradient={isDesktop} // ✅ remove for mobile/tablet
            gradientColor="#f6f3f3"
            speed={40}
            direction="right"
          >
            {repeatedData.map((alumnus, index) => (
              <AlumniCard key={`reverse-${index}`} {...alumnus} />
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
};

export default AlumniMarquee;
