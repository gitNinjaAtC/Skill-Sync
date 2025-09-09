import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/authContext";
import "./AlumniForm.scss";

const AlumniForm = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    batch: "",
    department: ""
  });

  const [formData, setFormData] = useState({
    attending: "No",
    phoneNumber: "",
    occupation: "",
    city: "",
    specialRequirements: "",
    accommodationRequired: false,
    accommodationDates: []
  });

  const [datesOptions] = useState([
    "2025-09-20",
    "2025-09-21",
    "2025-09-22"
  ]);

  // Redirect if not alumni
  useEffect(() => {
    if (!currentUser || currentUser.role !== "alumni") {
      navigate("/home", { replace: true });
    }
  }, [currentUser, navigate]);

  // Fetch user details on load and prefill
  useEffect(() => {
    if (currentUser && currentUser.role === "alumni") {
      axios.get("https://skill-sync-backend-522o.onrender.com/API_B/alumni/form", {
        withCredentials: true // This sends cookies with the request
      })
      .then(res => {
        // Prefill personal info
        setUserData({
          name: res.data.name,
          email: res.data.email,
          batch: res.data.batch,
          department: res.data.department
        });

        // Prefill form if already submitted
        if (res.data.form) {
          const { attending, phoneNumber, occupation, city, specialRequirements, accommodation } = res.data.form;
          setFormData({
            attending: attending || "No",
            phoneNumber: phoneNumber || "",
            occupation: occupation || "",
            city: city || "",
            specialRequirements: specialRequirements || "",
            accommodationRequired: accommodation?.required || false,
            accommodationDates: accommodation?.dates || []
          });
        }
      })
      .catch(err => {
        console.error("Error fetching user data", err);
        if (err.response) {
          console.error("Response status:", err.response.status);
          console.error("Response data:", err.response.data);
        }
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "accommodationRequired") {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        accommodationDates: []
      }));
    } else if (name === "accommodationDates") {
      const options = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prev => ({ ...prev, accommodationDates: options }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      attending: formData.attending,
      phoneNumber: formData.phoneNumber,
      occupation: formData.occupation,
      city: formData.city,
      specialRequirements: formData.specialRequirements,
      accommodation: {
        required: formData.accommodationRequired,
        dates: formData.accommodationDates
      }
    };

    axios.post("https://skill-sync-backend-522o.onrender.com/API_B/alumni/form", payload, {
      withCredentials: true // This sends cookies with the request
    })
    .then(res => {
      alert(res.data.message);
    })
    .catch(err => {
      console.error("Error submitting form", err);
      alert(err.response?.data?.message || "Submission failed");
    });
  };

  return (
    <div className="alumni-form-container">
      <h2>Alumni Meet Form</h2>
      
      <div className="personal-info">
        <h4>Personal Information</h4>
        
        <div>
          <label>Full Name:</label><br />
          <input type="text" name="name" value={userData.name} readOnly />
        </div>
        
        <div>
          <label>Email:</label><br />
          <input type="email" name="email" value={userData.email} readOnly />
        </div>
        
        <div>
          <label>Year of Graduation / Batch:</label><br />
          <input type="text" name="batch" value={userData.batch} readOnly />
        </div>
        
        <div>
          <label>Degree / Department:</label><br />
          <input type="text" name="department" value={userData.department} readOnly />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Will you attend the Alumni Meet?</label><br />
          <select name="attending" value={formData.attending} onChange={handleChange} required>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        {formData.attending === "Yes" && (
          <>
            <div>
              <label>Phone Number:</label><br />
              <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
            </div>

            <div>
              <label>Current Occupation/Organization:</label><br />
              <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} />
            </div>

            <div>
              <label>Current City / Address:</label><br />
              <input type="text" name="city" value={formData.city} onChange={handleChange} />
            </div>

            <div>
              <label>Special Requirements (Food/Accessibility/logistics):</label><br />
              <textarea name="specialRequirements" value={formData.specialRequirements} onChange={handleChange}></textarea>
            </div>

            <div>
              <label>
                <input
                  type="checkbox"
                  name="accommodationRequired"
                  checked={formData.accommodationRequired}
                  onChange={handleChange}
                /> Do you require accommodation?
              </label>
            </div>

            {formData.accommodationRequired && (
              <div>
                <label>Select accommodation dates:</label><br />
                <select
                  name="accommodationDates"
                  multiple
                  value={formData.accommodationDates}
                  onChange={handleChange}
                  size={datesOptions.length}
                >
                  {datesOptions.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              </div>
            )}

            <button type="submit">Submit</button>
          </>
        )}
      </form>
    </div>
  );
};

export default AlumniForm;