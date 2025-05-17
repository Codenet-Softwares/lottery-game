import React, { useState } from "react";
import { useFormik } from "formik";
import { createSubadminSchema } from "../../Utils/validationSchema";
import "./CreateSubadmin.css";
import { ReusableInput } from "../ReusableInput/ReusableInput";
import { createSubAdmin } from "../../Utils/apiService";
import { ReusablePermissionBox } from "../Reusables/ReusablePermissionBox";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons

const inputConfig = [
  { placeholder: "Username", name: "userName" },
  { placeholder: "Password", type: "password", name: "password" },
];

const CreateSubadmin = ({
  permissionsList = ["win-Lottery-Result", "result-View", "win-Analytics"],
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      userName: "",
      password: "",
      permissions: [],
    },
    validationSchema: createSubadminSchema,
    validationContext: { permissionsList }, // 👈 pass context here
    onSubmit: (values) => {
      const requestBody = {
        ...values,
        permissions: values.permissions.map(String).join(","),
      };
      createSubAdmin(requestBody);
      formik.resetForm();
    },
  });
  

  return (
    <div
      className="d-flex align-items-center justify-content-center mt-5"
    >
      <div
        className="container mt-3 p-4 shadow rounded border"
        style={{
          background: "#fff",
          // background: "linear-gradient(135deg, #f0f9ff, #cce7f6):,

          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
          maxWidth: "900px",
        }}
      >
        <h2 className="createsubadmin-title text-uppercase mb-5 text-center">
          Create Subadmin
        </h2>
        <form onSubmit={formik.handleSubmit} className="createsubadmin-form">
          {inputConfig.map((input) => (
            <div key={input.name} className="position-relative">
              <ReusableInput
                key={input.name}
                placeholder={input.placeholder}
                type={
                  input.name === "password"
                    ? showPassword
                      ? "text"
                      : "password"
                    : input.type
                }
                name={input.name}
                value={formik.values[input.name]}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched[input.name] && formik.errors[input.name]}
              />
              {input.name === "password" && (
                <span
                  className="position-absolute"
                  style={{
                    right: "30px",
                    top: "30%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              )}
            </div>
          ))}

          <ReusablePermissionBox
            permissions={formik.values.permissions}
            onChange={
              (updatedPermissions) =>
                formik.setFieldValue(
                  "permissions",
                  updatedPermissions.map(String)
                ) // Ensure permissions are strings
            }
            error={formik.touched.permissions && formik.errors.permissions}
            permissionsList={permissionsList}
          />
          <div className="text-center mt-4">
            <button
              type="submit"
              className=" btn createsubadmin-button text-white"
              style={{background:"#284B63"}}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSubadmin;
