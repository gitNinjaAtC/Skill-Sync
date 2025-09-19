import React from "react";

const OthersSection = ({ others }) => {
  let items = [];

  if (typeof others === "string") {
    items = others.split(/\r?\n+/).map(s => s.trim()).filter(Boolean);
  } else if (Array.isArray(others)) {
    items = others
      .map(e => (typeof e === "string" ? e.split(/\r?\n+/) : [String(e)]))
      .flat()
      .map(s => s.trim())
      .filter(Boolean);
  } else if (others) {
    items = [String(others)];
  }

  return (
    <div className="others-section" id="others">
      <h3>Other Information</h3>
      {items.length > 0 ? (
        <div>
          {items.map((item, index) => (
            <div key={index}>• {item}</div>
          ))}
        </div>
      ) : (
        <p>No additional information available.</p>
      )}
    </div>
  );
};

export default OthersSection;
