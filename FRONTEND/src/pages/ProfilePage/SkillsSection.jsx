import React from "react";
import "./skillsSection.scss"; // 👈 add styles here

const SkillsSection = ({ skills }) => {
  let skillsArray = [];

  if (typeof skills === "string") {
    skillsArray = skills.split(",").map((s) => s.trim());
  } else if (Array.isArray(skills)) {
    skillsArray = skills;
  }

  return (
    <div className="skills-section" id="skills">
      <h3>Skills</h3>
      {skillsArray.length > 0 ? (
        <ul className="skills-list">
          {skillsArray.map((skill, index) => (
            <li key={index}>{skill}</li>
          ))}
        </ul>
      ) : (
        <p>No skills listed.</p>
      )}
    </div>
  );
};

export default SkillsSection;
