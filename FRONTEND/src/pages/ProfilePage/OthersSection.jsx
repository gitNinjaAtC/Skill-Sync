import React from "react";

const OthersSection = ({ others }) => (
  <div className="others-section" id="others">
    <h3>Other Information</h3>
    {others ? (
      <ul>
        {others.split("\n").map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    ) : (
      <p>No additional information available.</p>
    )}
  </div>
);

export default OthersSection;
