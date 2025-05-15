import React from "react";
import { useParams, useLocation } from "react-router-dom";
import EventNav from "../../components/EventNav/EventNav";
import "./eventDescription.scss";

const EventDescription = () => {
  const { id } = useParams();
  const location = useLocation();
  const activeTab = location.state?.activeTab || "upcoming";

  const events = {
    upcoming: [
      {
        id: 1,
        title: "Annual Tech Fest",
        date: "June 15, 2025",
        description:
          "Join us for a day of innovation and networking with industry leaders.",
        image: require("../../assets/techfest.jpg"),
      },
      {
        id: 2,
        title: "Alumni Meet",
        date: "July 10, 2025",
        description:
          "A reunion event for all alumni to reconnect and share experiences.",
        image: require("../../assets/alumni-meet.jpeg"),
      },
    ],
    ongoing: [
      {
        id: 3,
        title: "48-Hour Coding Marathon",
        date: "May 10–12, 2025",
        description:
          "Real-time coding challenge with exciting prizes for the top performers.",
        image: require("../../assets/coding-marathon.jpg"),
      },
    ],
  };

  const allEvents = [...events.upcoming, ...events.ongoing];
  const event = allEvents.find((e) => e.id.toString() === id);

  return (
    <div className="event-description-container">
      <div className="header">
        <EventNav activeTab={activeTab} />
      </div>

      {event ? (
        <div className="event-details">
          <img src={event.image} alt={event.title} className="event-image" />
          <h1 className="event-title">{event.title}</h1>
          <div className="event-date">{event.date}</div>
          <p className="event-desc">{event.description}</p>
        </div>
      ) : (
        <p className="not-found">Event not found!</p>
      )}
    </div>
  );
};

export default EventDescription;
