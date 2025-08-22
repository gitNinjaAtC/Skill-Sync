import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./recoverEnroll.scss";

const RecoverEnrollment = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchEnrollmentNo = async () => {
      if (!isMounted) return;
      try {
        console.log("Fetching enrollment with token:", token);
        const res = await axios.get(
          `http://localhost:8800/API_B/auth/recover-enrollment/${token}`,
          `https://skill-sync-backend-522o.onrender.com/API_B/auth/recover-enrollment/${token}`,
          { withCredentials: true }
        );
        setEnrollmentNo(res.data.enrollmentNo);
        toast.success("Enrollment number retrieved", {
          toastId: "enrollment-success",
        });
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          "❌ Failed to recover enrollment number";
        setError(msg);
        toast.error(msg, {
          position: "top-center",
          autoClose: 3000,
          toastId: "enrollment-error", // Prevent duplicates
        });
      }
    };

    fetchEnrollmentNo();

    return () => {
      isMounted = false; // Cleanup to prevent race conditions
    };
  }, [token, navigate]);

  return (
    <div className="recover-enrollment">
      <div className="card">
        <h2>Recover Your Enrollment Number</h2>
        {enrollmentNo && (
          <div className="enrollment-display">
            <p>Your enrollment number is:</p>
            <p className="enrollment-number">{enrollmentNo}</p>
            <p>Please save this number for future use.</p>
          </div>
        )}
        {error && <p className="error">{error}</p>}
        <button className="register-button" onClick={() => navigate("/")}>
          Go to Home Page
        </button>
        <ToastContainer />
      </div>
    </div>
  );
};

export default RecoverEnrollment;
