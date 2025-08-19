import React from "react";

const ProfessionalExperienceSection = ({ experience }) => {
  let items = [];

  if (typeof experience === "string") {
    items = experience.split("\n");
  } else if (Array.isArray(experience)) {
    items = experience;
  } else if (experience) {
    items = [String(experience)];
  }

  return (
    <div className="experience-section" id="experience">
      <h3>Professional Experience</h3>
      {items.length > 0 ? (
        <ul>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>No professional experience provided.</p>
      )}
    </div>
  );
};

export default ProfessionalExperienceSection;
