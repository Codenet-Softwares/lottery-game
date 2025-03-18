import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const ReusableMiniModal = ({ show, message, type = "info", handleClose }) => {
  if (!show) return null; // Don't render if not visible

  return (
    <div
      className="mini-modal rounded-3 bg-white w-25 py-3"
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        // padding: "15px 20px",
        textAlign: "center",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        zIndex: 1050,
        border: "2px solid black",
      }}
    >
      <p className="text-dark fw-bold">
      "ARE YOU SURE YOU WANT TO DELETE "?
      </p>
      <div>
        <button className="btn btn-success me-2">OK</button>
        <button className="btn btn-danger" onClick={handleClose}>
          Cancle
        </button>
      </div>
      <button
        className="btn btn-light"
        onClick={handleClose}
        style={{
          position: "absolute",
          top: "5px",
          right: "10px",
          fontSize: "18px",
          padding: "5px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        &times; {/* Cross Icon */}
      </button>
    </div>
  );
};

export default ReusableMiniModal;
