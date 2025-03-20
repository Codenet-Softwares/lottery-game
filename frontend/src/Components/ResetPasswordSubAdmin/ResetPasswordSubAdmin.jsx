import React from "react";
import { useFormik } from "formik";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { getAdminResetPasswordInitialState } from "../../Utils/initialState";
import { resetPasswordSchema } from "../../Utils/validationSchema";
import { ResetAdminPassword } from "../../Utils/apiService";
import { ReusableResetPasswordInput } from "../ReusableInput/ReusableInput";
import { useAppContext } from "../../contextApi/context";

const ResetPasswordSubAdmin = ({ userName, onClose = () => {} }) => {

  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state || {};

  const handleResetPassword = async (values, { resetForm }) => {
    const { confirmPassword, ...resetValues } = values;

    try {
      const response = await ResetAdminPassword(resetValues, true);
      if (response?.success) {
        toast.success("Password changed successfully!");
        resetForm();
        onClose(); 
      } else {
        toast.error(response?.message || "Failed to reset password.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  const inputFields = [
    {
      id: "oldPassword",
      name: "oldPassword",
      type: "password",
      placeholder: "Enter old password",
      showEyeIcon: true,
    },
    {
      id: "newPassword",
      name: "newPassword",
      type: "password",
      placeholder: "Enter new password",
      showEyeIcon: true,
    },
    {
      id: "confirmPassword",
      name: "confirmPassword",
      type: "password",
      placeholder: "Confirm new password",
      showEyeIcon: true,
    },
  ];

  const formik = useFormik({
    initialValues: {
      userName: userName || "",
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: resetPasswordSchema,
    onSubmit: handleResetPassword,
    enableReinitialize: true,
  });

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ background: "#f0f0f0", minHeight: "60vh" }}
    >
      <div
        className="card shadow-lg p-4 rounded-4"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        <div className="text-center mb-4">
          <i
            className="bi bi-person-circle text-primary"
            style={{ fontSize: "4rem" }}
          ></i>
          <h2 className="mt-3 text-primary">Reset Password</h2>
          <p
            className="text-uppercase fw-bold text-glow mt-3"
            style={{
              color: "#4682B4",
              fontSize: "1.5rem",
              letterSpacing: "2px",
              animation: "glow 2s infinite alternate",
            }}
          >
            {userName}
          </p>
        </div>
        <form onSubmit={formik.handleSubmit}>
          {inputFields.map((field, index) => (
            <ReusableResetPasswordInput
              key={index}
              placeholder={field.placeholder}
              name={field.name}
              type={field.type}
              value={formik.values[field.name]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched[field.name] && formik.errors[field.name]}
              showEyeIcon={field.showEyeIcon}
            />
          ))}
          <div className="d-grid mt-3">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordSubAdmin;
