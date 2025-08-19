import React from "react";
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

const alumniData = [
  {
    name: "ADITYA SINGH",
    city: "Chhatarpur",
    companylogo: ibotix,
    isStartup: true,
    VALUATION: "₹50 CRORE",
    image: "IMAGE_URL_1",
  },
  {
    name: "MUNIRAJ CHOURE",
    city: "Betul, Madhya Pradesh",
    company: "UNIQUE",
    isStartup: true,
    VALUATION: "₹1.5 CRORE",
    image: "IMAGE_URL",
  },
  {
    name: "ARUNA RAJPUT",
    city: "Bengaluru",
    companylogo: mercedes,
    packageText: "₹25 LPA",
    image: "IMAGE_URL_2",
  },
  {
    name: "SONU VERMAN",
    city: "Bokaro, Jharkhand",
    companylogo: deloitte,
    packageText: "₹24 LPA",
    image: "IMAGE_URL_3",
  },
  {
    name: "AMAN GUPTA",
    city: "Jabalpur",
    companylogo: MindRuby,
    packageText: "₹22 LPA",
    image: "IMAGE_URL_4",
  },
  {
    name: "SHEKHAR YADAV",
    city: "Bhopal",
    companylogo: GlobalLogic,
    packageText: "₹35 LPA",
    image: "IMAGE_URL_5",
  },
  {
    name: "PANKAJ LAL",
    city: "Bhopal",
    companylogo: NIQ,
    packageText: "₹20 LPA",
    image: "IMAGE_URL_7",
  },
];

// Repeat the data list as needed
const repeatedData = [...alumniData, ...alumniData, ...alumniData];

const AlumniMarquee = () => (
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
        <Marquee gradient gradientColor="#f6f3f3" speed={40}>
          {repeatedData.map((alumnus, index) => (
            <AlumniCard key={`forward-${index}`} {...alumnus} />
          ))}
        </Marquee>
      </div>
      <div className="marquee-row reverse">
        <Marquee gradient gradientColor="#f6f3f3" speed={40} direction="right">
          {repeatedData.map((alumnus, index) => (
            <AlumniCard key={`reverse-${index}`} {...alumnus} />
          ))}
        </Marquee>
      </div>
    </div>
  </section>
);

export default AlumniMarquee;
