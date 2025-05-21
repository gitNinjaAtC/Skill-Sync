import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import axios from "axios";
import "./createOffer.scss";

const CreateOffer = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    job_title: "",
    organisation_name: "",
    offer_type: "",
    employment_type: "",
    job_description: "",
    skills_required: "",
    // eligibleCourses: "",
    bond_details: "",
    selection_process: "",
    registration_start_date: "",
    registration_end_date: "",
    joining_date: "",
    // duration: "",
    // timing: "",
    remote_working: "",
    cost_to_company: "",
    // stipend: "",
    fixed_gross: "",
    bonuses: "",
    other_benefits: "",
    // companyWebsite: "",
    // industry: "",
    // companySize: "",
    location: "",
    logo_path: null,
    offer_letter_path: null,
    letter_of_intent_path: null,
  });
  

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentUser || currentUser.role !== "Alumni") {
      return setError("Only Alumni can create job offers.");
    }

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      await axios.post("http://localhost:8800/API_B/jobs", data, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Job created successfully! Redirecting...");
      setTimeout(() => navigate("/job"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create job.");
    }
  };

  const handleGoBack = () => navigate("/job");

  return (
    <div className="create-offer-container">
      <div className="top-bar">
        <button className="back-btn" onClick={handleGoBack}>
          <span className="arrow-symbol">{"<"}</span>
          <span className="go-back-text">Back To Jobs</span>
        </button>
      </div>

      <h1>Create Job</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="offer-form">
        {/* Group 1: Basic Info */}
        <label>
          Job Title <span className="required">*</span>
          <input
            type="text"
            name="job_title"
            value={formData.job_title}
            onChange={handleChange}
            placeholder="e.g. Software Developer"
          />
          
        </label>

        <label>
          Organisation Name <span className="required">*</span>
          <input
            type="text"
            name="organisation_name"
            value={formData.organisation_name}
            onChange={handleChange}
            placeholder="e.g. Google India"
          />
        </label>

        <label>
          Offer Type
          <select name="offer_type" value={formData.offer_type} onChange={handleChange}>
            <option value="">Select</option>
            <option value="Permanent">Job</option>
            <option value="Internship">Internship</option>
          </select>
        </label>

        <label>
          Employment Type
          <select name="employment_type" value={formData.employment_type} onChange={handleChange}>
            <option value="">Select</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
          </select>
        </label>

        {/* Group 2: Description */}
        <label>
          Job Description
          <textarea
            name="job_description"
            value={formData.job_description}
            onChange={handleChange}
            maxLength={6000}
            placeholder="Describe the role, responsibilities..."
          />
          <div className="char-count">{formData.job_description.length}/6000</div>
        </label>

        <label>
          Skills Required
          <textarea
            name="skills_required"
            value={formData.skills_required}
            onChange={handleChange}
            placeholder="Comma-separated skills"
          />
        </label>

        {/* <label>
          Eligible Branch
          <textarea
            name="eligibleCourses"
            value={formData.eligibleCourses}
            onChange={handleChange}
            placeholder="Branches or degrees allowed"
          />
        </label> */}

        <label>
          Bond Details
          <textarea
            name="bond_details"
            value={formData.bond_details}
            onChange={handleChange}
            placeholder="Mention bond duration or conditions"
          />
        </label>

        <label>
          Selection Process
          <textarea
            name="selection_process"
            value={formData.selection_process}
            onChange={handleChange}
            placeholder="Describe interview rounds, tests etc."
          />
        </label>

        {/* Group 3: Dates & Timing */}
        <label>
          Registration Open Date
          <input type="date" name="registration_start_date" value={formData.registration_start_date} onChange={handleChange} />
        </label>

        <label>
          Registration Close Date
          <input type="date" name="registration_end_date" value={formData.registration_end_date} onChange={handleChange} />
        </label>

        <label>
          Joining Date
          <input type="date" name="joining_date" value={formData.joining_date} onChange={handleChange} />
        </label>

        {/* <label>
          Duration
          <input
            type="text"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="e.g. 6 months"
          />
        </label> */}

        {/* <label>
          Timing
          <input
            type="text"
            name="timing"
            value={formData.timing}
            onChange={handleChange}
            placeholder="e.g. 9AM - 5PM"
          />
        </label> */}

        <label>
          Working Mode (Remote/On-site/Hybrid)
          <input
            type="text"
            name="remote_working"
            value={formData.remote_working}
            onChange={handleChange}
          />
        </label>

        {/* Group 4: Compensation */}
        <label>
          Cost to Company (INR)
          <input type="number" name="cost_to_company" value={formData.cost_to_company} onChange={handleChange} />
        </label>

        {/* <label>
          Stipend (if any)
          <input type="text" name="stipend" value={formData.stipend} onChange={handleChange} />
        </label> */}

        <label>
          Fixed Gross (INR)
          <input type="number" name="fixed_gross" value={formData.fixed_gross} onChange={handleChange} />
        </label>

        <label>
          Bonuses
          <textarea name="bonuses" value={formData.bonuses} onChange={handleChange} />
        </label>

        <label>
          Other Benefits
          <textarea name="other_benefits" value={formData.other_benefits} onChange={handleChange} />
        </label>

        {/* Group 5: Company Info */}
        {/* <label>
          Company Website
          <input type="url" name="companyWebsite" value={formData.companyWebsite} onChange={handleChange} />
        </label> */}
{/* 
        <label>
          Industry
          <input type="text" name="industry" value={formData.industry} onChange={handleChange} />
        </label> */}

        {/* <label>
          Company Size
          <input type="text" name="companySize" value={formData.companySize} onChange={handleChange} />
        </label> */}

        <label>
          Location(s)
          <textarea name="location" value={formData.location} onChange={handleChange} />
        </label>

        {/* Files */}
        <label>
          Company Logo          
          <input type="file" name="logo_path" accept=".jpg,.jpeg,.png" onChange={handleFileChange} />
        </label>

        <label>
          Offer Letter
          <input type="file" name="offer_letter_path" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
        </label>

        <label>
          Letter of Intent
          <input type="file" name="letter_of_intent_path" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
        </label>

        {/* Buttons */}
        <div className="form-buttons">
          <button type="button" className="cancel-btn" onClick={handleGoBack}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            Submit for Approval
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOffer;
