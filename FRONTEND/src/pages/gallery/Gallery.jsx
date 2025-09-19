import React, { useState, useRef, useEffect } from "react";
import "./Gallery.scss";
import { ChevronLeft, ChevronRight } from "lucide-react";
import alumniimage1 from "../LandingPage/about-image/a1.jpg";
import alumniimage2 from "../LandingPage/about-image/a2.jpg";
import alumniimage3 from "../LandingPage/about-image/a3.jpg";
import alumniimage4 from "../LandingPage/about-image/a4.jpg";
import alumniimage5 from "../LandingPage/about-image/a5.jpg";
import alumniimage6 from "../LandingPage/about-image/s1.jpg";
import alumniimage7 from "../LandingPage/about-image/s2.jpg";
import alumniimage8 from "../LandingPage/about-image/a8.jpg";
import alumniimage9 from "../LandingPage/about-image/a9.jpg";
import alumniimage10 from "../LandingPage/about-image/s3.jpg";
import alumniimage11 from "../LandingPage/about-image/s4.jpg";
import alumniimage12 from "../LandingPage/about-image/s5.jpg";
import alumniimage13 from "../LandingPage/about-image/s6.jpg";
import alumniimage14 from "../LandingPage/about-image/s7.jpg";
import alumniimage15 from "../LandingPage/about-image/s8.jpg";
import alumniimage16 from "../LandingPage/about-image/s9.jpg";
import alumniimage17 from "../LandingPage/about-image/s10.jpg";
import alumniimage18 from "../LandingPage/about-image/s11.jpg";
import alumniimage19 from "../LandingPage/about-image/s12.jpg";
import alumniimage20 from "../LandingPage/about-image/s13.jpg";
import alumniimage21 from "../LandingPage/about-image/s14.jpg";
import alumniimage22 from "../LandingPage/about-image/s15.jpg";
import alumniimage23 from "../LandingPage/about-image/s16.jpg";
import alumniimage24 from "../LandingPage/about-image/s17.jpg";
import alumniimage25 from "../LandingPage/about-image/s18.jpg";
import alumniimage26 from "../LandingPage/about-image/s19.jpg";
import alumniimage27 from "../LandingPage/about-image/s20.jpg";
import alumniimage28 from "../LandingPage/about-image/s21.jpg";
import alumniimage29 from "../LandingPage/about-image/s22.jpg";
import alumniimage30 from "../LandingPage/about-image/s23.jpg";
import alumniimage31 from "../LandingPage/about-image/s24.jpg";
import alumniimage32 from "../LandingPage/about-image/s25.jpg";
import alumniimage33 from "../LandingPage/about-image/s26.jpg";
import alumniimage34 from "../LandingPage/about-image/s27.jpg";
import alumniimage35 from "../LandingPage/about-image/s28.jpg";

const images = [
  alumniimage1,
  alumniimage2,
  alumniimage3,
  alumniimage4,
  alumniimage5,
  alumniimage6,
  alumniimage7,
  alumniimage8,
  alumniimage9,
  alumniimage10,
  alumniimage11,
  alumniimage12, 
  alumniimage13,
  alumniimage14,
  alumniimage15,
  alumniimage16,
  alumniimage17,
  alumniimage18,
  alumniimage19,
  alumniimage20,
  alumniimage21,
  alumniimage22,
  alumniimage23,
  alumniimage24,
  alumniimage25,
  alumniimage26,
  alumniimage27,
  alumniimage28,
  alumniimage29,
  alumniimage30,
  alumniimage31,
  alumniimage32,
  alumniimage33,
  alumniimage34,
  alumniimage35,
];

const useIsDesktop = () => {
  const [desktop, setDesktop] = useState(window.innerWidth >= 959);
  useEffect(() => {
    const onResize = () => setDesktop(window.innerWidth >= 959);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return desktop;
};

const Gallery = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const tapeRef = useRef(null);
  const isDesktop = useIsDesktop();

  // Slider functions for desktop
  const goToIndex = (index) => {
    setCurrentIndex((index + images.length) % images.length);
  };

  const scrollToCenter = (index) => {
    const tape = tapeRef.current;
    if (!tape || !tape.children[index]) return;
    const imgEl = tape.children[index];
    const centerOffset =
      imgEl.offsetLeft - tape.offsetWidth / 2 + imgEl.offsetWidth / 2;
    tape.scrollTo({ left: centerOffset, behavior: "smooth" });
  };

  const autoAdvance = () => {
    goToIndex(currentIndex + 1);
  };

  useEffect(() => {
    if (!isDesktop) return; // Auto-advance only on desktop
    const interval = setInterval(autoAdvance, 1500);
    return () => clearInterval(interval);
  }, [currentIndex, isDesktop]);

  useEffect(() => {
    if (!isDesktop) return;
    scrollToCenter(currentIndex);
  }, [currentIndex, isDesktop]);

  const scrollTape = (direction) => {
    const tape = tapeRef.current;
    const scrollBy = (tape.scrollWidth / images.length) * 4; // scroll by ~4 thumbs
    tape.scrollBy({ left: direction * scrollBy, behavior: "smooth" });
  };

  // Modal navigation functions
  const openModal = (idx) => {
    setModalIndex(idx);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const prevModalImage = (e) => {
    e.stopPropagation();
    setModalIndex((modalIndex - 1 + images.length) % images.length);
  };

  const nextModalImage = (e) => {
    e.stopPropagation();
    setModalIndex((modalIndex + 1) % images.length);
  };

  // Swipe handlers for modal (basic implementation)
  useEffect(() => {
    if (!isModalOpen) return;

    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchEndX < touchStartX - 50) {
        nextModalImage(e);
      } else if (touchEndX > touchStartX + 50) {
        prevModalImage(e);
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isModalOpen, modalIndex]);

  return (
    <div className="gallery-container">
      {/* Grid gallery for phones/tablets */}
      {!isDesktop && (
        <div className="gallery-grid">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Gallery ${idx + 1}`}
              onClick={() => openModal(idx)}
            />
          ))}
        </div>
      )}

      {/* Desktop slider + tape */}
      {isDesktop && (
        <>
          <div className="slider">
            <img
              src={images[currentIndex]}
              alt="Main Display"
              className="main-image"
            />
            <button
              className="nav-btn left"
              onClick={() => goToIndex(currentIndex - 1)}
            >
              <ChevronLeft size={32} />
            </button>
            <button
              className="nav-btn right"
              onClick={() => goToIndex(currentIndex + 1)}
            >
              <ChevronRight size={32} />
            </button>
          </div>

          <div className="tape-wrapper">
            <button className="tape-nav left" onClick={() => scrollTape(-1)}>
              <ChevronLeft size={24} />
            </button>
            <div className="tape-strip" ref={tapeRef}>
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Thumb ${index}`}
                  className={`thumbnail ${
                    index === currentIndex ? "active" : ""
                  }`}
                  onClick={() => goToIndex(index)}
                />
              ))}
            </div>
            <button className="tape-nav right" onClick={() => scrollTape(1)}>
              <ChevronRight size={24} />
            </button>
          </div>
        </>
      )}

      {/* Fullscreen modal for phone/tablet */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <button className="modal-close" onClick={closeModal}>
            ×
          </button>
          <div
            className="modal-scroll-container"
            onClick={(e) => e.stopPropagation()} // Prevent modal close on image scroll
            ref={(el) => {
              if (el) {
                // Scroll to selected image on open
                const child = el.children[modalIndex];
                if (child)
                  el.scrollTo({ left: child.offsetLeft, behavior: "instant" });
              }
            }}
          >
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Full Image ${idx + 1}`}
                className="modal-image"
                draggable={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
