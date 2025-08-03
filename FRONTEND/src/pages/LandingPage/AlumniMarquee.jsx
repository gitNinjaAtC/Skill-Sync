// src/sections/AlumniMarquee.jsx
import React from "react";
import Marquee from "react-fast-marquee";
import AlumniCard from "./AlumniCard";
import "./AlumniMarquee.scss";
import "aos/dist/aos.css";

const alumniData = [
  {
    name: "Aditi Sharma",
    role: "Software Engineer, Google",
    image: "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg",
  },
  {
    name: "Raj Verma",
    role: "Data Analyst, Amazon",
    image: "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg",
  },
  {
    name: "Sneha Mehta",
    role: "AI Researcher, OpenAI",
    image: "https://images.pexels.com/photos/1181289/pexels-photo-1181289.jpeg",
  },
  {
    name: "Nikhil Joshi",
    role: "Product Manager, Meta",
    image: "/images/alumni4.jpg",
  },
];

const repeatedData = [...alumniData, ...alumniData, ...alumniData];

const AlumniMarquee = () => (
  <section className="alumni-marquee-section">
    <div className="triple-border-title" data-aos="fade-right" data-aos-offset="300" data-aos-easing="ease-in-sine">
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
        <Marquee gradient gradientColor="#f6f3f3" speed={25}>
          {repeatedData.map((alumnus, index) => (
            <AlumniCard key={`forward-${index}`} {...alumnus} />
          ))}
        </Marquee>
      </div>

      <div className="marquee-row reverse">
        <Marquee gradient gradientColor="#f6f3f3" speed={25} direction="right">
          {repeatedData.map((alumnus, index) => (
            <AlumniCard key={`reverse-${index}`} {...alumnus} />
          ))}
        </Marquee>
      </div>
    </div>
  </section>
);

export default AlumniMarquee;
