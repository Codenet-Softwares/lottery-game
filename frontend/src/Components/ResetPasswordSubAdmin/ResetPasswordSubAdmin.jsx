import React from "react";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import { resetPasswordSchema } from "../../Utils/validationSchema";
import { SubAdminResetPassword } from "../../Utils/apiService";
import { ReusableResetPasswordInput } from "../ReusableInput/ReusableInput";

const ResetPasswordSubAdmin = ({ userName, onClose = () => {} }) => {
  const handleResetPassword = async (values, { resetForm }) => {
    const { confirmPassword, ...resetValues } = values;

    try {
      const response = await SubAdminResetPassword(resetValues, true);
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
      id: "newPassword",
      name: "newPassword",
      type: "password",
      placeholder: "Enter New Password",
      showEyeIcon: true,
    },
    {
      id: "confirmPassword",
      name: "confirmPassword",
      type: "password",
      placeholder: "Confirm New Password",
      showEyeIcon: true,
    },
  ];

  const formik = useFormik({
    initialValues: {
      userName: userName || "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: resetPasswordSchema,
    onSubmit: handleResetPassword,
    enableReinitialize: true,
  });

  return (
    <div
      className="modal show fade d-block text-uppercase"
      tabIndex="-1"
      role="dialog"
    >
      <div
        className="modal-dialog modal-dialog-centered"
        role="document"
        style={{ maxWidth: "500px" }}
      >
        <div className="modal-content p-4 rounded-4 shadow-lg">
          <div className="modal-header justify-content-center border-0">
            <h5 className="modal-title text-primary w-100 text-center fw-bold">
              Reset Password
            </h5>
            <button
              type="button"
              className="btn-close position-absolute end-0 me-3"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            <div className="text-center mb-3">
              <i
                className="bi bi-person-circle text-primary"
                style={{ fontSize: "3rem" }}
              ></i>
              <p
                className="text-uppercase fw-bold mt-2"
                style={{
                  color: "#4682B4",
                  letterSpacing: "1px",
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
                  error={
                    formik.touched[field.name] && formik.errors[field.name]
                  }
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
      </div>
    </div>
  );
};

export default ResetPasswordSubAdmin;
