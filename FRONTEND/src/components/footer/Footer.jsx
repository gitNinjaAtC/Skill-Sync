import "./footer.scss";
import { Link } from "react-router-dom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MailIcon from "@mui/icons-material/Mail";
import PhoneIcon from "@mui/icons-material/Phone";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-section">
          <h2>Sagar Institute of Science and Technology</h2>
          <p>Empowering future leaders with quality education and innovation-driven learning.</p>
          <div className="contact-item">
            <LocationOnIcon />
            <span>Bhopal, Madhya Pradesh</span>
          </div>
          <div className="contact-item">
            <MailIcon />
            <span><a href="mailto:sagaralumni@sistec.ac.in">sagaralumni@sistec.ac.in</a></span>
          </div>
          <div className="contact-item">
            <PhoneIcon />
            <span><a href="tel:+919910128025">+919910128025</a></span>
          </div>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <Link to="/" className="quick-link">About Us</Link>
          <Link to="/"className="quick-link">Careers</Link>
          <Link to="https://www.sistec.ac.in/contact" target="_blank"className="quick-link">Contact</Link>
        </div>

        <div className="footer-section">
          <h3>Connect with Us</h3>
          <div className="social-icons">
            <a href="https://linkedin.com" target="_blank" rel="noreferrer"><LinkedInIcon /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer"><InstagramIcon /></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer"><TwitterIcon /></a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer"><FacebookIcon /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 Designed & Developed by <span>Shivam</span>, <span>Sahil</span> and <span>Purushottam</span>.</p>
      </div>
    </footer>
  );
};

export default Footer;
