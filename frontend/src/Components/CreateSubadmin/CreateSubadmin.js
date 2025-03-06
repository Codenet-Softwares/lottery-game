import React from "react";
import { useFormik } from "formik";
import { createSubadminSchema } from "../../Utils/validationSchema";
import "./CreateSubadmin.css";
import { ReusableInput } from "../ReusableInput/ReusableInput";
import { createSubAdmin } from "../../Utils/apiService";
import { ReusablePermissionBox } from "../Reusables/ReusablePermissionBox";

const inputConfig = [
  { placeholder: "Username", name: "userName" },
  { placeholder: "Password", type: "password", name: "password" },
];

const CreateSubadmin = ({ permissionsList = ["win-Lottery-Result"] }) => {
  const formik = useFormik({
    initialValues: {
      userName: "",
      password: "",
      permissions: [],
    },
    validationSchema: createSubadminSchema,
    onSubmit: (values) => {
      const requestBody = {
        ...values,
        permissions: values.permissions.map(String).join(","), // Ensure each permission is a string
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
        }}
      >
        <h2 className="createsubadmin-title text-uppercase mb-5 text-center">
          Create Subadmin
        </h2>
        <form onSubmit={formik.handleSubmit} className="createsubadmin-form">
          {inputConfig.map((input) => (
            <ReusableInput
              key={input.name}
              placeholder={input.placeholder}
              type={input.type || "text"}
              name={input.name}
              value={formik.values[input.name]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched[input.name] && formik.errors[input.name]}
            />
          ))}

          <ReusablePermissionBox
            permissions={formik.values.permissions}
            onChange={(updatedPermissions) =>
              formik.setFieldValue("permissions", updatedPermissions.map(String)) // Ensure permissions are strings
            }
            error={formik.touched.permissions && formik.errors.permissions}
            permissionsList={permissionsList}
          />
          <div className="text-center mt-4">
            <button type="submit" className=" btn btn-info createsubadmin-button">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSubadmin;
