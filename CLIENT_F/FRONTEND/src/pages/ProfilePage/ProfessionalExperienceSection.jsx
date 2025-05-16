import React from "react";

const ProfessionalExperienceSection = ({ experience }) => (
  <div className="experience-section" id="experience">
    <h3>Professional Experience</h3>
    {experience ? (
      <ul>
        {experience.split("\n").map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    ) : (
      <p>No professional experience provided.</p>
    )}
  </div>
);

export default ProfessionalExperienceSection;
