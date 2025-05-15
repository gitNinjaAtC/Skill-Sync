import {
  FacebookTwoTone as FacebookTwoToneIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
} from "@mui/icons-material";

const ProfileInfo = ({ userId }) => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth",
        block: "center",
       });
    }
  };

  return (
    <div className="profile-info">
      <div className="profile-header">
        <h2>Shivam Kumar Kesharwani</h2>
        <button className="edit-btn">Edit Profile</button>
      </div>

      <p className="description">
        Motivated Computer Science and Engineering student with practical experience
        in web development using HTML, CSS, JavaScript, React.js, and MySQL. Passionate
        about building responsive, user-friendly applications and contributing to impactful,
        real-world projects. Eager to grow as a full-stack developer while supporting the organization’s
        technological goals through continuous learning and collaboration.
      </p>

      <div className="profile-actions">
        <button className="message-btn">Message</button>
      </div>

      <div className="social-links">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <FacebookTwoToneIcon fontSize="large" />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <InstagramIcon fontSize="large" />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <TwitterIcon fontSize="large" />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
          <LinkedInIcon fontSize="large" />
        </a>
      </div>

      <div className="profile-tabs">
        <button onClick={() => scrollToSection("about")}>About</button>
        <button onClick={() => scrollToSection("skills")}>Skills</button>
        <button onClick={() => scrollToSection("education")}>Education</button>
        <button onClick={() => scrollToSection("experience")}>Professional Experience</button>
        <button onClick={() => scrollToSection("others")}>Others</button>
      </div>
    </div>
  );
};

export default ProfileInfo;
