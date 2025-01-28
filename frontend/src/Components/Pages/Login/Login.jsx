/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import backgroundImage04 from "../../.././Assets/backgroundImage04.png";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../../Utils/apiService";
import { useAppContext } from "../../../contextApi/context";
import strings from "../../../Utils/constant/stringConstant";
import { getInitialValues } from "../../../Utils/getInitialState";
import { LoginSchema } from "../../../Utils/schema";
import { useFormik } from "formik";
import { useLocation } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const { dispatch, store, showLoader, hideLoader } = useAppContext();
  const [error, setError] = useState(""); // For error handling
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginFromStore = store.admin.isLogin;

  useEffect(() => {
    if (location.pathname == "/" && !isLoginFromStore) {
      navigate("/login");
    } else if (isLoginFromStore) {
      navigate("/dashboard");
    }
  }, []);

  // const {
  //   values,
  //   errors,
  //   touched,
  //   handleBlur,
  //   handleChange,
  //   handleSubmit,
  //   resetForm,
  // } = useFormik({
  //   initialValues: getInitialValues(),
  //   validationSchema: LoginSchema,
  //   onSubmit: async (values, action) => {
  //     console.log("Submitted values:", values);
  //     await loginHandler(values);
  //     resetForm();
  //   },
  //   enableReinitialize: true,
  // });
  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    resetForm,
  } = useFormik({
    initialValues: getInitialValues(),
    validationSchema: LoginSchema,
    onSubmit: async (values, action) => {
      console.log("Submitted values:", values);
      showLoader(); // Show loader before starting the async operation
      try {
        await loginHandler(values);
        resetForm();
      } catch (error) {
        console.error("Error during login:", error);
      } finally {
        hideLoader(); // Hide loader in the finally block
      }
    },
    enableReinitialize: true,
  });
  
  async function loginHandler(values) {
    const response = await adminLogin(values);
    console.log("Response from login:", response);
    if (response && response.success) {
      localStorage.setItem(
        strings.LOCAL_STORAGE_KEY,
        JSON.stringify({
          admin: {
            accessToken: response.data.accessToken,
          },
        })
      );
      dispatch({
        type: strings.LOG_IN,
        payload: response.data,
      });
      navigate("/dashboard");
    } else {
      setError(response?.errMessage || "Login failed");
    }
    dispatch({
      type: strings.isLoading,
      payload: false,
    });
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Image Overlay */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          right: "10px",
          bottom: "10px",
          width: "auto",
          height: "120%",
          backgroundImage: `url(${backgroundImage04})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(4px)",
        }}
      ></div>

      <div className="col-lg-12">
        <div
          className="white_box p-4 rounded shadow-lg mt-5"
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            backgroundColor: "hsla(0, 0%, 100%, 0.15)", // Light frosted effect for the background
            backdropFilter: "blur(10px)", // Glassy frosted look
            borderRadius: "15px", // Slightly more rounded corners for elegance
            position: "relative",
            animation: "fadeIn 1s ease-out",
            zIndex: 1,
            minHeight: "500px", // Fixed height
            maxHeight: "500px", // Fixed height
            overflow: "hidden", // Prevent expansion on validation errors
          }}
        >
          <div className="row justify-content-center">
            <div className="col-lg-12">
              <div
                className="modal-content cs_modal"
                style={{
                  borderRadius: "15px",
                  border: "none",
                  backgroundColor: "rgba(255, 255, 255, 0.3)", // Slightly transparent background
                }}
              >
                <div
                  className="modal-header justify-content-center "
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "15px 15px 0 0",
                    padding: "15px",
                  }}
                >
                  <h5
                    className="text-white font-weight-bold"
                    style={{
                      fontSize: "3rem", // Increased size for impact
                      fontFamily: "'Merriweather', serif",
                      textShadow: "3px 3px 8px rgba(0, 0, 0, 0.4)",
                      letterSpacing: "2px",
                      fontWeight: "600",
                    }}
                  >
                    Lottery Admin Login
                  </h5>
                </div>
                <div className="" style={{ padding: "30px" }}>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <input
                        type="text"
                        name="userName"
                        className="form-control"
                        placeholder="Enter Username"
                        style={{
                          borderRadius: "30px",
                          padding: "12px 20px",
                          border: "1px solid #4682B4",
                          backgroundColor: "rgba(255, 255, 255, 0.15)", // Frosted white glass effect
                          color: "white",
                          backdropFilter: "blur(10px)", // Frost effect for the background
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Soft shadow for a floating effect
                        }}
                        value={values.userName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {errors.userName && touched.userName && (
                        <p className="fw-bold text-danger mb-0 mt-0">
                          {errors.userName}
                        </p>
                      )}
                    </div>
                    <div className="mb-4" style={{ position: "relative" }}>
                      <input
                        type="password"
                        name="password"   
                        className="form-control mt-"
                        placeholder="Enter Password"
                        style={{
                          borderRadius: "30px",
                          padding: "12px 20px",
                          border: "1px solid #4682B4",
                          backgroundColor: "rgba(255, 255, 255, 0.15)", // Frosted white glass effect
                          color: "white",
                          backdropFilter: "blur(10px)", // Frost effect for the background
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Soft shadow for a floating effect
                        }}
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {errors.password && touched.password && (
                        <p className="fw-bold text-danger mb-0 mt-0">
                          {errors.password}
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="w-100"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.2)", // Transparent white background
                        borderRadius: "30px",
                        padding: "10px",
                        fontSize: "1.7rem", // Increased font size for more impact
                        fontWeight: "bold",
                        color: "grey", // Using your chosen color for the text
                        textTransform: "uppercase", // Making the text more striking
                        letterSpacing: "1px", // Slight letter spacing for a modern look
                        border: "none", // Remove border for a cleaner look
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Soft shadow for depth
                        backdropFilter: "blur(8px)", // Frosted glass effect
                        transition: "all 0.3s ease-in-out",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor =
                          "rgba(65, 75, 83, 0.27)"; // Subtle color change on hover
                        e.target.style.transform = "scale(1.05)"; // Slight scale effect on hover
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor =
                          "rgba(255, 255, 255, 0.2)";
                        e.target.style.transform = "scale(1)";
                      }}
                    >
                      Log in
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
