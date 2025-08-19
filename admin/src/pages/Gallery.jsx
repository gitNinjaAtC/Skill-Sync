import React, { useState, useRef, useEffect } from "react";
import "./gallery.scss";
import { ChevronLeft, ChevronRight } from "lucide-react";

const images = [
  "https://images.pexels.com/photos/25539491/pexels-photo-25539491.jpeg",
  "https://images.pexels.com/photos/32802262/pexels-photo-32802262.jpeg",
  "https://images.pexels.com/photos/1586299/pexels-photo-1586299.jpeg",
  "https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg",
  "https://images.pexels.com/photos/2103127/pexels-photo-2103127.jpeg",
  "https://images.pexels.com/photos/25539491/pexels-photo-25539491.jpeg",
  "https://images.pexels.com/photos/32802262/pexels-photo-32802262.jpeg",
  "https://images.pexels.com/photos/1586299/pexels-photo-1586299.jpeg",
  "https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg",
  "https://images.pexels.com/photos/2103127/pexels-photo-2103127.jpeg",
  "https://images.pexels.com/photos/25539491/pexels-photo-25539491.jpeg",
  "https://images.pexels.com/photos/32802262/pexels-photo-32802262.jpeg",
  "https://images.pexels.com/photos/1586299/pexels-photo-1586299.jpeg",
  "https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg",
  "https://images.pexels.com/photos/2103127/pexels-photo-2103127.jpeg",
    "https://images.pexels.com/photos/25539491/pexels-photo-25539491.jpeg",
  "https://images.pexels.com/photos/32802262/pexels-photo-32802262.jpeg",
  "https://images.pexels.com/photos/1586299/pexels-photo-1586299.jpeg",
  "https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg",
  "https://images.pexels.com/photos/2103127/pexels-photo-2103127.jpeg",
  "https://images.pexels.com/photos/25539491/pexels-photo-25539491.jpeg",
  "https://images.pexels.com/photos/32802262/pexels-photo-32802262.jpeg",
  "https://images.pexels.com/photos/1586299/pexels-photo-1586299.jpeg",
  "https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg",
  "https://images.pexels.com/photos/2103127/pexels-photo-2103127.jpeg",
  "https://images.pexels.com/photos/25539491/pexels-photo-25539491.jpeg",
  "https://images.pexels.com/photos/32802262/pexels-photo-32802262.jpeg",
  "https://images.pexels.com/photos/1586299/pexels-photo-1586299.jpeg",
  "https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg",
  "https://images.pexels.com/photos/2103127/pexels-photo-2103127.jpeg",
    "https://images.pexels.com/photos/25539491/pexels-photo-25539491.jpeg",
  "https://images.pexels.com/photos/32802262/pexels-photo-32802262.jpeg",
  "https://images.pexels.com/photos/1586299/pexels-photo-1586299.jpeg",
  "https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg",
  "https://images.pexels.com/photos/2103127/pexels-photo-2103127.jpeg",
  "https://images.pexels.com/photos/25539491/pexels-photo-25539491.jpeg",
  "https://images.pexels.com/photos/32802262/pexels-photo-32802262.jpeg",
  "https://images.pexels.com/photos/1586299/pexels-photo-1586299.jpeg",
  "https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg",
  "https://images.pexels.com/photos/2103127/pexels-photo-2103127.jpeg",
  "https://images.pexels.com/photos/25539491/pexels-photo-25539491.jpeg",
  "https://images.pexels.com/photos/32802262/pexels-photo-32802262.jpeg",
  "https://images.pexels.com/photos/1586299/pexels-photo-1586299.jpeg",
  "https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg",
  "https://images.pexels.com/photos/2103127/pexels-photo-2103127.jpeg",
    "https://images.pexels.com/photos/25539491/pexels-photo-25539491.jpeg",
  "https://images.pexels.com/photos/32802262/pexels-photo-32802262.jpeg",
  "https://images.pexels.com/photos/1586299/pexels-photo-1586299.jpeg",
  "https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg",
  "https://images.pexels.com/photos/2103127/pexels-photo-2103127.jpeg",
  "https://images.pexels.com/photos/25539491/pexels-photo-25539491.jpeg",
  "https://images.pexels.com/photos/32802262/pexels-photo-32802262.jpeg",
  "https://images.pexels.com/photos/1586299/pexels-photo-1586299.jpeg",
  "https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg",
  "https://images.pexels.com/photos/2103127/pexels-photo-2103127.jpeg",
  "https://images.pexels.com/photos/25539491/pexels-photo-25539491.jpeg",
  "https://images.pexels.com/photos/32802262/pexels-photo-32802262.jpeg",
  "https://images.pexels.com/photos/1586299/pexels-photo-1586299.jpeg",
  "https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg",
  "https://images.pexels.com/photos/2103127/pexels-photo-2103127.jpeg",
    "https://images.pexels.com/photos/25539491/pexels-photo-25539491.jpeg",
  "https://images.pexels.com/photos/32802262/pexels-photo-32802262.jpeg",
  "https://images.pexels.com/photos/1586299/pexels-photo-1586299.jpeg",
  "https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg",
  "https://images.pexels.com/photos/2103127/pexels-photo-2103127.jpeg",
  "https://images.pexels.com/photos/25539491/pexels-photo-25539491.jpeg",
  "https://images.pexels.com/photos/32802262/pexels-photo-32802262.jpeg",
  "https://images.pexels.com/photos/1586299/pexels-photo-1586299.jpeg",
  "https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg",
  "https://images.pexels.com/photos/2103127/pexels-photo-2103127.jpeg",
  "https://images.pexels.com/photos/25539491/pexels-photo-25539491.jpeg",
  "https://images.pexels.com/photos/32802262/pexels-photo-32802262.jpeg",
  "https://images.pexels.com/photos/1586299/pexels-photo-1586299.jpeg",
  "https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg",
  "https://images.pexels.com/photos/2103127/pexels-photo-2103127.jpeg",
    "https://images.pexels.com/photos/25539491/pexels-photo-25539491.jpeg",
  "https://images.pexels.com/photos/32802262/pexels-photo-32802262.jpeg",
  "https://images.pexels.com/photos/1586299/pexels-photo-1586299.jpeg",
  "https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg",
  "https://images.pexels.com/photos/2103127/pexels-photo-2103127.jpeg",
  "https://images.pexels.com/photos/25539491/pexels-photo-25539491.jpeg",
  "https://images.pexels.com/photos/32802262/pexels-photo-32802262.jpeg",
  "https://images.pexels.com/photos/1586299/pexels-photo-1586299.jpeg",
  "https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg",
  "https://images.pexels.com/photos/2103127/pexels-photo-2103127.jpeg",
  "https://images.pexels.com/photos/25539491/pexels-photo-25539491.jpeg",
  "https://images.pexels.com/photos/32802262/pexels-photo-32802262.jpeg",
  "https://images.pexels.com/photos/1586299/pexels-photo-1586299.jpeg",
  "https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg",
  "https://images.pexels.com/photos/2103127/pexels-photo-2103127.jpeg",

];

const Gallery = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const tapeRef = useRef(null);

  const goToIndex = (index) => {
    setCurrentIndex((index + images.length) % images.length);
  };

  const scrollToCenter = (index) => {
    const tape = tapeRef.current;
    if (!tape || !tape.children[index]) return;

    const imgEl = tape.children[index];
    const centerOffset = imgEl.offsetLeft - tape.offsetWidth / 2 + imgEl.offsetWidth / 2;
    tape.scrollTo({ left: centerOffset, behavior: "smooth" });
  };

  const autoAdvance = () => {
    goToIndex(currentIndex + 1);
  };

  useEffect(() => {
    const interval = setInterval(autoAdvance, 1500);
    return () => clearInterval(interval);
  }, [currentIndex]);

  useEffect(() => {
    scrollToCenter(currentIndex);
  }, [currentIndex]);

  const scrollTape = (direction) => {
    const tape = tapeRef.current;
    const scrollBy = tape.scrollWidth / images.length * 4; // scroll by approx 4 thumbs
    tape.scrollBy({ left: direction * scrollBy, behavior: "smooth" });
  };

  return (
    <div className="gallery-container">
        <div className="slider">
            <img src={images[currentIndex]} alt="Main Display" className="main-image" />

            <button className="nav-btn left" onClick={() => goToIndex(currentIndex - 1)}>
                <ChevronLeft size={32} />
            </button>

            <button className="nav-btn right" onClick={() => goToIndex(currentIndex + 1)}>
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
              className={`thumbnail ${index === currentIndex ? "active" : ""}`}
              onClick={() => goToIndex(index)}
            />
          ))}
        </div>

        <button className="tape-nav right" onClick={() => scrollTape(1)}>
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default Gallery;
