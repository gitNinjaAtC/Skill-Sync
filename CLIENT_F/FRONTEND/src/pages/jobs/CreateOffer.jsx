import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import axios from "axios";
import "./createOffer.scss";

const CreateOffer = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    jobTitle: "",
    organizationName: "",
    offerType: "",
    joiningDate: "",
    locations: "",
    remoteWorking: "",
    ctc: 0,
    fixedGross: 0,
    bonuses: "",
    offerLetter: null,
    loi: null,
    jobDescription: "",
    bondDetails: "",
    otherBenefits: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentUser || currentUser.role !== "Alumni") {
      setError("Only Alumni can create job offers.");
      return;
    }

    try {
      const data = new FormData();
      data.append("job_title", formData.jobTitle);
      data.append("organisation_name", formData.organizationName);
      data.append("offer_type", formData.offerType);
      data.append("joining_date", formData.joiningDate);
      data.append("location", formData.locations);
      data.append("remote_working", formData.remoteWorking);
      data.append("cost_to_company", formData.ctc);
      data.append("fixed_gross", formData.fixedGross);
      data.append("bonuses", formData.bonuses);
      if (formData.offerLetter) {
        data.append("offer_letter", formData.offerLetter);
      }
      if (formData.loi) {
        data.append("letter_of_intent", formData.loi);
      }
      data.append("job_description", formData.jobDescription);
      data.append("bond_details", formData.bondDetails);
      data.append("other_benefits", formData.otherBenefits);

      console.log("Submitting job data:", Object.fromEntries(data));

      const res = await axios.post("http://localhost:8800/API_B/jobs", data, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Job created:", res.data);
      setSuccess("Job created successfully! Redirecting to jobs...");
      setTimeout(() => {
        navigate("/jobs");
      }, 2000);
    } catch (err) {
      console.error("Error creating job:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to create job.");
    }
  };

  const handleGoBack = () => {
    navigate("/jobs");
  };

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
        <label>
          <span className="label-with-required">
            Job Title <span className="required">*</span>
          </span>
          <input
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            placeholder="Specify Title"
            required
          />
        </label>

        <label>
          <span className="label-with-required">
            Organisation Name <span className="required">*</span>
          </span>
          <input
            type="text"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleChange}
            placeholder="Specify the name of organisation / company"
            required
          />
        </label>

        <label>
          Offer Type
          <select
            name="offerType"
            value={formData.offerType}
            onChange={handleChange}
          >
            <option value="">Select Offer Type</option>
            <option value="Permanent">Permanent</option>
            <option value="Internship">Internship</option>
          </select>
        </label>

        <label>
          Joining Date
          <input
            type="date"
            name="joiningDate"
            value={formData.joiningDate}
            onChange={handleChange}
          />
        </label>

        <label>
          Location(s)
          <textarea
            name="locations"
            value={formData.locations}
            onChange={handleChange}
            placeholder="Please mention the work location(s)"
          />
        </label>

        <label>
          Remote Working
          <input
            type="text"
            name="remoteWorking"
            value={formData.remoteWorking}
            onChange={handleChange}
            placeholder="Specify if remote working is available"
          />
        </label>

        <label>
          Cost to Company (INR) <span className="required">*</span>
          <input
            type="number"
            name="ctc"
            value={formData.ctc}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Fixed Gross (INR)
          <input
            type="number"
            name="fixedGross"
            value={formData.fixedGross}
            onChange={handleChange}
          />
        </label>

        <label>
          Bonuses
          <textarea
            name="bonuses"
            value={formData.bonuses}
            onChange={handleChange}
            placeholder="Mention any bonus components"
          />
        </label>

        <label>
          Offer Letter
          <input
            type="file"
            name="offerLetter"
            accept=".pdf, .doc, .docx"
            onChange={handleFileChange}
          />
        </label>

        <label>
          Letter of Intent
          <input
            type="file"
            name="loi"
            accept=".pdf, .doc, .docx"
            onChange={handleFileChange}
          />
        </label>

        <label>
          Job Description / Specifications
          <textarea
            name="jobDescription"
            value={formData.jobDescription}
            onChange={handleChange}
            placeholder="Specify job description"
            maxLength="6000"
          />
          <div className="char-count">
            {formData.jobDescription.length}/6000 characters
          </div>
        </label>

        <label>
          Bond Details
          <textarea
            name="bondDetails"
            value={formData.bondDetails}
            onChange={handleChange}
            placeholder="Specify bond details"
            maxLength="6000"
          />
        </label>

        <label>
          Other Benefits
          <textarea
            name="otherBenefits"
            value={formData.otherBenefits}
            onChange={handleChange}
            placeholder="Specify other benefits"
            maxLength="6000"
          />
        </label>

        <div className="form-buttons">
          <button type="button" className="cancel-btn" onClick={handleGoBack}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            Submit For Approval
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateOffer;
