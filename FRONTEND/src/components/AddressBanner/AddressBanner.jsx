import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AddressBanner.scss";

const API = "https://skill-sync-backend-522o.onrender.com";

const AddressBanner = ({ userId }) => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    // Only show once per session
    const dismissed = sessionStorage.getItem("addressBannerDismissed");
    if (dismissed) return;

    axios
      .get(`${API}/API_B/profile/${userId}`, { withCredentials: true })
      .then(res => {
        const { state } = res.data;
        if (!state) setShow(true);
      })
      .catch(() => {});
  }, [userId]);

  const handleDismiss = () => {
    sessionStorage.setItem("addressBannerDismissed", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="address-banner">
      <span>📍 Your profile is incomplete — please add your address details so your institute can reach you.</span>
      <button className="address-banner__cta" onClick={() => navigate(`/edit-profile/${userId}`)}>
        Complete Now
      </button>
      <button className="address-banner__dismiss" onClick={handleDismiss}>✕</button>
    </div>
  );
};

export default AddressBanner;