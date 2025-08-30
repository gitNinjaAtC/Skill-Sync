import React from "react";

const EducationSection = ({ education }) => {
  let items = [];

  if (typeof education === "string") {
    // split by both \n and \r\n
    items = education.split(/\r?\n+/).map(s => s.trim()).filter(Boolean);
  } else if (Array.isArray(education)) {
    items = education
      .map(e => (typeof e === "string" ? e.split(/\r?\n+/) : [String(e)]))
      .flat()
      .map(s => s.trim())
      .filter(Boolean);
  } else if (education) {
    items = [String(education)];
  }

  return (
    <div className="education-section" id="education">
      <h3>Education</h3>
      {items.length > 0 ? (
        <div>
          {items.map((item, index) => (
            <div key={index}>• {item}</div>
          ))}
        </div>
      ) : (
        <p>No education information available.</p>
      )}
    </div>
  );
};

export default EducationSection;
