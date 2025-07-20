import React from "react";

const ProfessionalExperienceSection = ({ experience }) => {
  // Ensure experience is a string before splitting
  const experienceStr = typeof experience === "string" ? experience : "";

  return (
    <div className="experience-section" id="experience">
      <h3>Professional Experience</h3>
      {experienceStr ? (
        <ul>
          {experienceStr.split("\n").map((item, index) => (
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
