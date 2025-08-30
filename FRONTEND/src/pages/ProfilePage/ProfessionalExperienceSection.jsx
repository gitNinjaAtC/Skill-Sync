import React from "react";

const ProfessionalExperienceSection = ({ experience }) => {
  let items = [];

  if (typeof experience === "string") {
    items = experience.split(/\r?\n+/).map(s => s.trim()).filter(Boolean);
  } else if (Array.isArray(experience)) {
    items = experience
      .map(e => (typeof e === "string" ? e.split(/\r?\n+/) : [String(e)]))
      .flat()
      .map(s => s.trim())
      .filter(Boolean);
  } else if (experience) {
    items = [String(experience)];
  }

  return (
    <div className="experience-section" id="experience">
      <h3>Professional Experience</h3>
      {items.length > 0 ? (
        <div>
          {items.map((item, index) => (
            <div key={index}>• {item}</div>
          ))}
        </div>
      ) : (
        <p>No professional experience provided.</p>
      )}
    </div>
  );
};

export default ProfessionalExperienceSection;
