import React from "react";

const SkillsSection = ({ skills }) => (
  <div className="skills-section" id="skills">
    <h3>Skills</h3>
    {skills ? (
      <ul>
        {skills.split(",").map((skill, index) => (
          <li key={index}>{skill.trim()}</li>
        ))}
      </ul>
    ) : (
      <p>No skills listed.</p>
    )}
  </div>
);

export default SkillsSection;
