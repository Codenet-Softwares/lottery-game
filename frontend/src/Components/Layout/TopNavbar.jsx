import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppContext } from "../../contextApi/context";
import "./TopNavbar.css"; // Includes profile_info styling

const TopNavbar = () => {
  const { dispatch, store } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      dispatch({ type: "LOG_OUT" });
      toast.success("Logged out successfully!");
      navigate("/");
    } else {
      toast.info("Logout cancelled.");
    }
  };

  const openModal = () => {
    toast.info("Open reset password modal"); // Replace this with your modal trigger logic
  };

  const user = store?.admin || {};

  return (
    <div className="header_right d-flex justify-content-end align-items-center px-4">
      <div className="profile_info position-relative">
        <img
          src="/img/client_img.png"
          alt="user"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            objectFit: "cover",
            cursor: "pointer"
          }}
        />
        <div className="profile_info_iner shadow">
          <div className="profile_author_name">
            <h5>{user.userName}</h5>
          </div>
          <div className="profile_info_details p-3">
            {user.roles === "admin" && (
              <a style={{ cursor: "pointer" }} onClick={openModal}>
                <b className="text-primary">Reset Password</b>
              </a>
            )}
            <a style={{ cursor: "pointer" }} onClick={handleLogout}>
              <b className="text-danger">Logout</b>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;
