import React, { useState } from "react";
import "./events.scss";

const Events = () => {
  const [activeTab, setActiveTab] = useState("upcoming");

  const upcomingEvents = [
    {
      id: 1,
      title: "SISTec Tech Fest 2025",
      date: "2025-08-15",
      location: "Main Auditorium",
      description: "Annual celebration of innovation and creativity across departments.",
    },
    {
      id: 2,
      title: "AI Workshop",
      date: "2025-09-10",
      location: "Lab Block - C2",
      description: "Hands-on session on building models using Python and TensorFlow.",
    },
  ];

  const pastEvents = [
    {
      id: 3,
      title: "Alumni Meet 2024",
      date: "2024-12-05",
      location: "Open Grounds",
      description: "A grand reunion of SISTec alumni and current students.",
    },
    {
      id: 4,
      title: "Hackathon 2024",
      date: "2024-11-20",
      location: "Innovation Lab",
      description: "24-hour coding marathon with exciting challenges and prizes.",
    },
  ];

  const renderEvents = (events) =>
    events.map((event) => (
      <div className="event-card" key={event.id}>
        <h3>{event.title}</h3>
        <p><strong>Date:</strong> {event.date}</p>
        <p><strong>Location:</strong> {event.location}</p>
        <p>{event.description}</p>
      </div>
    ));

  return (
    <div className="events-page">
      <div className="tabs">
        <button
          className={activeTab === "upcoming" ? "tab active" : "tab"}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming Events
        </button>
        <button
          className={activeTab === "past" ? "tab active" : "tab"}
          onClick={() => setActiveTab("past")}
        >
          Past Events
        </button>
      </div>

      <div className="events-container">
        {activeTab === "upcoming"
          ? renderEvents(upcomingEvents)
          : renderEvents(pastEvents)}
      </div>

      <button className="create-event-btn">＋ Create Event</button>
    </div>
  );
};

export default Events;
