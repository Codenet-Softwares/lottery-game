import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ReusableInput } from "./ReusableInput";
import "./CreateSubadmin.css";

const CreateSubadmin = () => {
  const formik = useFormik({
    initialValues: {
      userName: "",
      password: "",
      permissions: "",
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
        permissions: values.permissions,
      };
      
      console.log("Submitting:", requestBody);
      // API call can be implemented here
    },
  });

  return (
    <div className="createsubadmin-container">
      <h2 className="createsubadmin-title">Create Subadmin</h2>
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
  );
};

export default CreateSubadmin;
