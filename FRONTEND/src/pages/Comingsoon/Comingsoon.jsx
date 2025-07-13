import React from 'react';
import Particle from '../../Particle';
import { Container } from "react-bootstrap";
import "@lottiefiles/lottie-player";
import './comingsoon.scss';
import bgVideo from "../../assets/bg.mov"; // ✅ Import the video correctly

export default function ComingSoon() {
  return (
    <section className="home-section">
      {/* Background Video */}
      <video
        className="bg-video"
        autoPlay
        loop
        muted
        playsInline
        src={bgVideo}
        type="video/mp4"
      />
      {/* Content */}
      <Container className="comingsoon-content">
        <lottie-player
          src="https://assets7.lottiefiles.com/packages/lf20_10jxod3a.json"
          background="transparent"
          speed="1"
          loop
          autoplay
        ></lottie-player>        
      </Container>
    </section>
  );
}
