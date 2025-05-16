import React from "react";

const EducationSection = ({ education }) => (
  <div className="education-section" id="education">
    <h3>Education</h3>
    {education ? (
      <ul>
        {education.split("\n").map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    ) : (
      <p>No education information available.</p>
    )}
  </div>
);

export default EducationSection;
