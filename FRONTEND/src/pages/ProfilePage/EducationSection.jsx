import React from "react";

const EducationSection = ({ education }) => {
  let items = [];

  if (typeof education === "string") {
    items = education.split("\n");
  } else if (Array.isArray(education)) {
    items = education;
  } else if (education) {
    items = [String(education)];
  }

  return (
    <div className="education-section" id="education">
      <h3>Education</h3>
      {items.length > 0 ? (
        <ul>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>No education information available.</p>
      )}
    </div>
  );
};

export default EducationSection;
