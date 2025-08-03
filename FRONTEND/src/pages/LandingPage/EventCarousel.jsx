// src/pages/LandingPage/EventCarousel.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import './EventCarousel.scss';
import image1 from "./about-image/1.jpg";
import image2 from "./about-image/2.jpg";
import image3 from "./about-image/3.jpg";
import image4 from "./about-image/4.jpg";
import image5 from "./about-image/5.jpg";
import image6 from "./about-image/6.jpg";
import image7 from "./about-image/7.jpg";

const imageData = [
    { id: 1, url: image1 },
    { id: 2, url: image2 },
    { id: 3, url: image3 },
    { id: 4, url: image4 },
    { id: 5, url: image5 },
    { id: 6, url: image6 },
    { id: 7, url: image7 },   
];

const EventCarousel = () => {
  return (
    <div className="event-carousel">
      <Swiper
        spaceBetween={30}
        slidesPerView={1}
        breakpoints={{
          768: { slidesPerView: 1 },
          1024: { slidesPerView: 1 },
        }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          el: '.swiper-pagination',
          bulletClass: 'swiper-pagination-bullet',
          bulletActiveClass: 'swiper-pagination-bullet-active',
        }}
        modules={[Autoplay, Pagination]}
        className="swiper-container"
      >
        {imageData.map((image) => (
          <SwiperSlide key={image.id}>
            <div className="image-slide">
              <img src={image.url} alt={`Slide ${image.id}`} />
            </div>
          </SwiperSlide>
        ))}
        <div className="swiper-pagination"></div>
      </Swiper>      
    </div>
  );
};

export default EventCarousel;
