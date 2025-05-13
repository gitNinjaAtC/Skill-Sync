import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";  // Import useParams
import EventNav from "../../components/EventNav/EventNav";  // Import EventNav component
import "./events.scss";

const Events = () => {
  const { tab } = useParams();  // Get the tab from URL params
  const [activeTab, setActiveTab] = useState(tab || "upcoming");

  useEffect(() => {
    setActiveTab(tab || "upcoming");  // Update activeTab based on URL param
  }, [tab]);

  return (
    <div className="events-container">
      <div className="header">
        <EventNav activeTab={activeTab} />
      </div>
      <div className="main-section">
        {activeTab === "upcoming" && (
          <div className="events-section">
            <div className="event-list">
              <Link to={`/event/1`} state={{ activeTab }} className="event-card">
                <img
                  src={require("../../assets/techfest.jpg")}
                  alt="Tech Fest"
                  className="event-image"
                />
                <div className="event-details">
                  <h3>Annual Tech Fest</h3>
                  <div className="date">June 15, 2025</div>
                  <p>Join us for a day of innovation and networking with industry leaders.</p>
                </div>
              </Link>

              <Link to={`/event/2`} state={{ activeTab }} className="event-card">
                <img
                  src={require("../../assets/alumni-meet.jpeg")}
                  alt="Alumni Meet"
                  className="event-image"
                />
                <div className="event-details">
                  <h3>Alumni Meet</h3>
                  <div className="date">July 10, 2025</div>
                  <p>A reunion event for all alumni to reconnect and share experiences.</p>
                </div>
              </Link>
            </div>
          </div>
        )}

        {activeTab === "ongoing" && (
          <div className="events-section">
            <div className="event-list">
              <Link to={`/event/3`} state={{ activeTab }} className="event-card">
                <img
                  src={require("../../assets/coding-marathon.jpg")}
                  alt="Coding Marathon"
                  className="event-image"
                />
                <div className="event-details">
                  <h3>48-Hour Coding Marathon</h3>
                  <div className="date">May 10–12, 2025</div>
                  <p>Real-time coding challenge with exciting prizes for the top performers.</p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
