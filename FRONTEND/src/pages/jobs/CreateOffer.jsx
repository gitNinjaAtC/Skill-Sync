import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import axios from "axios";
import "./createOffer.scss";

const CreateOffer = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

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
  setLoading(true);

  if (!currentUser || currentUser.role !== "alumni" ) {
    setLoading(false);
    return setError("Only Alumni can create job offers.");
  }

  try {
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    await axios.post("https://skill-sync-backend-522o.onrender.com/API_B/jobs", data, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    setSuccess("Job created successfully! Redirecting...");
    setTimeout(() => {
      navigate("/job");
    }, 2000);
  } catch (err) {
    setError(err.response?.data?.message || "Failed to create job.");
  } finally {
    setLoading(false);
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

      <form onSubmit={handleSubmit} className="offer-form">
        {/* Group 1: Basic Info */}
        <label>
          <span className="label-with-required">
          Job Title <span className="required">*</span>
          </span>
          <input
            type="text"
            name="job_title"
            value={formData.job_title}
            onChange={handleChange}
            required
            placeholder="e.g. Software Developer"
          />
          
        </label>

        <label>
          <span className="label-with-required">
          Organisation Name <span className="required">*</span>
          </span>
          <input
            type="text"
            name="organisation_name"
            value={formData.organisation_name}
            onChange={handleChange}
            required
            placeholder="e.g. Google India"
          />
        </label>

        <label>
          <span className="label-with-required">
          Offer Type <span className="required">*</span>
          </span>
          <select name="offer_type" value={formData.offer_type} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Permanent">Job</option>
            <option value="Internship">Internship</option>
          </select>
        </label>

        <label>
          <span className="label-with-required">
          Employment Type <span className="required">*</span>
          </span>  
          
          <select name="employment_type" value={formData.employment_type} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-Time</option>
            <option value="Both">Full-time & Part-time</option>
          </select>
        </label>

        {/* Group 2: Description */}
        <label>
          <span className="label-with-required">
          Job Description <span className="required">*</span>
          </span>          
          <textarea
            name="job_description"
            value={formData.job_description}
            onChange={handleChange}
            maxLength={6000}
            placeholder="Describe the role, responsibilities..."
            required
          />
          <div className="char-count">{formData.job_description.length}/6000</div>
        </label>

        <label>
          <span className="label-with-required">
          Skills Required <span className="required">*</span>
          </span>  
          
          <textarea
            name="skills_required"
            value={formData.skills_required}
            onChange={handleChange}
            placeholder="Comma-separated skills"
            required
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
          <span className="label-with-required">
          Bond Details
          </span>  
          
          <textarea
            name="bond_details"
            value={formData.bond_details}
            onChange={handleChange}
            placeholder="Mention bond duration or conditions"            
          />
        </label>

        <label>
          <span className="label-with-required">
          Selection Process <span className="required">*</span>
          </span>
          <textarea
            name="selection_process"
            value={formData.selection_process}
            onChange={handleChange}
            placeholder="Describe interview rounds, tests etc."
            required
          />
        </label>

        {/* Group 3: Dates & Timing */}
        <label>
          <span className="label-with-required">
          Registration Open Date <span className="required">*</span>
          </span>
          <input type="date" name="registration_start_date" value={formData.registration_start_date} onChange={handleChange} required />
        </label>

        <label>
          <span className="label-with-required">
          Registration Close Date <span className="required">*</span>
          </span>
          <input type="date" name="registration_end_date" value={formData.registration_end_date} onChange={handleChange} required />
        </label>

        <label>
          <span className="label-with-required">
          Joining Date
          </span>
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
          <span className="label-with-required">
          Working Mode<span className="required">*</span>
          </span>
          <input
            type="text"
            name="remote_working"
            value={formData.remote_working}
            onChange={handleChange}
            required
            placeholder="e.g. Remote, On-site, Hybrid"
          />
        </label>

        {/* Group 4: Compensation */}
        <label>
          <span className="label-with-required">
          Cost to Company (CTC) <span className="required">*</span>
          </span>
          <input type="number" name="cost_to_company" value={formData.cost_to_company} onChange={handleChange} 
          required placeholder="INR 00000" />
        </label>

        {/* <label>
          Stipend (if any)
          <input type="text" name="stipend" value={formData.stipend} onChange={handleChange} />
        </label> */}

        <label>
          <span className="label-with-required">
          Fixed Gross
          </span>
          <input type="number" name="fixed_gross" value={formData.fixed_gross} onChange={handleChange}
          placeholder="INR 00000" />
        </label>

        <label>
          <span className="label-with-required">
          Bonuses
          </span>
          <textarea name="bonuses" value={formData.bonuses} onChange={handleChange} 
          placeholder="Enter any bonuses or perks here..."/>
        </label>

        <label>
          <span className="label-with-required">
          Other Benefits
          </span>
          <textarea name="other_benefits" value={formData.other_benefits} onChange={handleChange} 
          placeholder="Mention other benefits here..."/>
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
          <span className="label-with-required">
          Location <span className="required">*</span>
          </span>
          <textarea name="location" value={formData.location} onChange={handleChange} required 
          placeholder="Enter the location of the company"/>
        </label>

        {/* Files */}
        <label>
          <span className="label-with-required">
          Company Logo <span className="required">*</span>
          </span> 
          <input type="file" name="logo_path" accept=".jpg,.jpeg,.png" onChange={handleFileChange} required />
        </label>

        <label>
          <span className="label-with-required">
          Offer Letter
          </span>
          <input type="file" name="offer_letter_path" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
        </label>

        <label>
          <span className="label-with-required">
          Letter of Intent
          </span>
          <input type="file" name="letter_of_intent_path" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
        </label>

        {/* Buttons */}
        <div className="form-buttons">
          <button type="button" className="cancel-btn" onClick={handleGoBack}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
  {loading ? (
    <>
      Submitting...
      <span className="spinner" />
    </>
  ) : (
    "Submit for Approval"
  )}
</button>

        </div>
      {success && <p className="success">{success}</p>}
      {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default CreateOffer;
