import React from "react";
import { useFormik } from "formik";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { getAdminResetPasswordInitialState, getSubAdminResetPasswordInitialState } from "../../Utils/initialState";
import { resetPasswordSchema, resetPasswordSchemaSubAdmin } from "../../Utils/validationSchema";
import { ResetAdminPassword, ResetSubAdminPassword } from "../../Utils/apiService";
import { ReusableResetPasswordInput } from "../ReusableInput/ReusableInput";
import { useAppContext } from "../../contextApi/context";
const SubAdminReset = () => {
  const { store } = useAppContext();
console.log('line 12',store)
  const navigate = useNavigate();
  const location = useLocation();
  const state = location?.state || {};
console.log('line 16',state.userName)
  const handleResetPassword = async (values) => {
    const { confirmPassword, ...resetValues } = values;
    try {
      const response = await ResetSubAdminPassword(resetValues, true);
      if (response?.success) {
        navigate("/login");
        // toast.success("Password changed successfully!");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  const inputFields = [
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
    initialValues: getSubAdminResetPasswordInitialState({
      userName: state.userName,
      oldPassword: state?.password, // Kept in the state but not shown in UI
      newPassword: "", // Empty initially
      confirmPassword: "", // Empty initially
    }),
    validationSchema: resetPasswordSchemaSubAdmin,
    onSubmit: handleResetPassword,
  });
  
  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ background: "#f0f0f0", minHeight: "75vh" }}
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
            {formik.values.userName}
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

export default SubAdminReset;
