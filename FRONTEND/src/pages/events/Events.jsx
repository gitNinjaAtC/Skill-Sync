import React, { useState } from "react";
import "./events.scss";
import techfestImg from "../../assets/techfest.jpg";
import alumniMeetImg from "../../assets/alumni-meet.jpeg";
import codingMarathonImg from "../../assets/coding-marathon.jpg";
import Event from "../../assets/Events.png";

const eventsData = {
  upcoming: [
    {
      id: 1,
      title: "Annual Tech Fest",
      date: "June 15, 2025",
      description: "Join us for a day of innovation and networking with industry leaders.",
      image: techfestImg,
    },
    {
      id: 2,
      title: "Alumni Meet",
      date: "July 10, 2025",
      description: "A reunion event for all alumni to reconnect and share experiences.",
      image: alumniMeetImg,
    },
    {
      id: 3,
      title: "Alumni Meet",
      date: "July 10, 2025",
      description: "A reunion event for all alumni to reconnect and share experiences.",
      image: alumniMeetImg,
    },
    {
      id: 4,
      title: "Alumni Meet",
      date: "July 10, 2025",
      description: "A reunion event for all alumni to reconnect and share experiences.",
      image: alumniMeetImg,
    },
    {
      id: 5,
      title: "Annual Tech Fest",
      date: "June 15, 2025",
      description: "Join us for a day of innovation and networking with industry leaders.",
      image: techfestImg,
    },
    {
      id: 6,
      title: "Annual Tech Fest",
      date: "June 15, 2025",
      description: "Join us for a day of innovation and networking with industry leaders.",
      image: techfestImg,
    },
    {
      id: 7,
      title: "Annual Tech Fest",
      date: "June 15, 2025",
      description: "Join us for a day of innovation and networking with industry leaders.",
      image: techfestImg,
    },
  ],
  ongoing: [
    {
      id: 3,
      title: "48-Hour Coding Marathon",
      date: "May 10–12, 2025",
      description: "Real-time coding challenge with exciting prizes for the top performers.",
      image: codingMarathonImg,
    },
  ],
};

const Events = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSelectedEvent(null);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const renderEventList = () => {
    const events = eventsData[activeTab];
    return (
      <div className="event-grid">
        {events.map((event) => (
          <div key={event.id} className="event-card" onClick={() => handleEventClick(event)}>
            <img src={event.image} alt={event.title} />
            <div className="event-content">
              <h3>{event.title}</h3>
              <span>{event.date}</span>
              <p>{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEventDetails = () => {
    return (
      <div className="event-details-view">
        <button onClick={() => setSelectedEvent(null)}>&larr; Back</button>
        <img src={selectedEvent.image} alt={selectedEvent.title} />
        <h2>{selectedEvent.title}</h2>
        <span>{selectedEvent.date}</span>
        <p>{selectedEvent.description}</p>
      </div>
    );
  };

  return (
    <div className="events">
      <div className="events-header">
        <h1>📅 Events</h1>
        <div className="tabs">
          <button className={activeTab === "upcoming" ? "active" : ""} onClick={() => handleTabClick("upcoming")}>Upcoming</button>
          <button className={activeTab === "ongoing" ? "active" : ""} onClick={() => handleTabClick("ongoing")}>Ongoing (Closed)</button>
        </div>
      </div>
      <div className="events-body">
        {selectedEvent ? renderEventDetails() : renderEventList()}
      </div>
    </div>
  );
};

export default Events;
