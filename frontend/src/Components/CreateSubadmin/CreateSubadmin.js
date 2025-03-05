import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import "./CreateSubadmin.css";
import { ReusableInput } from "../ReusableInput/ReusableInput";
import { createSubAdmin } from "../../Utils/apiService";


const CreateSubadmin = () => {
  const formik = useFormik({
    initialValues: {
      userName: "",
      password: "",
      permissions: "win-Lottery-Result",
    },
    validationSchema: Yup.object({
      userName: Yup.string()
        .required("Username is required")
        .min(4, "Must be at least 4 characters"),
      password: Yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters"),
      permissions: Yup.string().required("Permissions are required"),
    }),
    onSubmit: (values) => {
      const requestBody = {
        userName: values.userName,
        password: values.password,
        permissions: `${values.permissions},win-Lottery-Result`,
      };

      createSubAdmin(requestBody);
    },
  });

  return (
    <div
    className="d-flex align-items-center justify-content-center"
    style={{ background: "#f0f0f0", minHeight: "75vh" }}
  >
    <div
      className="container mt-3 p-4 shadow rounded"
      style={{
        background: "#fff",
        border: "2px solid black",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
        maxWidth: "900px",
        position: "relative",
      }}
    >
      <h2 className="createsubadmin-title text-uppercase">Create Subadmin</h2>
      <form onSubmit={formik.handleSubmit} className="createsubadmin-form">
        <ReusableInput
          name="userName"
          placeholder="Enter username"
          value={formik.values.userName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.userName && formik.errors.userName}
        />
        <ReusableInput
          name="password"
          type="password"
          placeholder="Enter password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && formik.errors.password}
        />
        <ReusableInput
          name="permissions"
          placeholder="Enter permissions (comma-separated)"
          value={formik.values.permissions}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.permissions && formik.errors.permissions}
        />
        <button type="submit" className="createsubadmin-button">
          Submit
        </button>
      </form>
    </div>
    </div>
  );
};

export default CreateSubadmin;