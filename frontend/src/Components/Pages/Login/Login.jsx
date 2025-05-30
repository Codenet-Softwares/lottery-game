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
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginFromStore = store?.admin?.isLogin;

  useEffect(() => {
    if (location.pathname == "/" && !isLoginFromStore) {
      navigate("/login");
    } else if (isLoginFromStore) {
      navigate("/dashboard");
    }
  }, []);

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
      if (
        response?.data?.message ==
        "Password reset required. Please reset your password."
      ) {
        navigate("/subAdmin-reset-password", {
          state: { password: values.password, userName: values.userName },
        });
        return;
      }

      localStorage.setItem(
        strings.LOCAL_STORAGE_KEY,
        JSON.stringify({
          admin: {
            accessToken: response?.data?.accessToken,
          },
        })
      );
      dispatch({
        type: strings.LOG_IN,
        payload: response?.data,
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
      <style>
        {`
    input::placeholder {
      color: rgba(255, 255, 255, 0.8);
      text-shadow: 0 0 5px rgba(255, 255, 255, 1);
      font-weight: bold;
      font-style: italic;
      font-size: 1.1rem;
      font-family: "Poppins", sans-serif;
      letter-spacing: 1.5px;
   
    }
  `}
      </style>
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
          // backgroundImage: `url(${backgroundImage04})`,
          backgroundColor: "#203f52",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(4px) ",
        }}
      ></div>

      <div className="col-lg-12">
        <div
          className="white_box p-4 rounded shadow-lg mt-5"
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            backgroundColor: "#4f678ab0", // Light frosted effect for the background
            // backdropFilter: "blur(10px)", // Glassy frosted look
            borderRadius: "15px", // Slightly more rounded corners for elegance
            position: "relative",
            animation: "fadeIn 1s ease-out",
            zIndex: 1,
            minHeight: "350px", // Fixed height
            maxHeight: "450px", // Fixed height
            overflow: "hidden",
            border: "2px solid white",
            // boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)",
          }}
        >
          <div className="row justify-content-center">
            <div className="col-lg-12">
              <div
                style={{
                  borderRadius: "15px",
                  border: "none",
                  // backgroundColor: "rgba(255, 255, 255, 0.01)", // Slightly transparent background
                  width: "750px", // Fixed width
                  height: "400px", // Fixed height
                  // boxShadow: "0 0 25px rgba(255, 255, 255)",
                }}
              >
                <div
                  className="modal-header justify-content-center"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.06)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "15px 15px 0 0",
                    padding: "15px",
                  }}
                >
                  <h5
                    className="text-white font-weight-bold text-uppercase"
                    style={{
                      fontSize: "2.5rem", // Increased size for impact
                      fontFamily: "'Merriweather', serif",
                      textShadow: "3px 3px 8px rgba(0, 0, 0, 0.4)",
                      letterSpacing: "3px",
                      fontWeight: "600",
                    }}
                  >
                    Login
                  </h5>
                </div>

                <form
                  onSubmit={handleSubmit}
                  style={{
                    padding: "20px",
                  }}
                >
                  <div className="mb-3 ">
                    <input
                      type="text"
                      name="userName"
                      className={`form-control ${
                        errors.userName && touched.userName ? "is-invalid" : ""
                      }`}
                      placeholder="Enter Username"
                      style={{
                        height: "50px", // Fixed height
                        borderRadius: "30px",
                        padding: "12px 20px",
                        border:
                          errors.userName && touched.userName
                            ? "2px solid red"
                            : "1px solid #4682B4",
                        backgroundColor: "rgba(255, 255, 255, 0.01)", // Frosted white glass effect
                        color: "#fff",
                        backdropFilter: "blur(10px)", // Frost effect for the background
                        // boxShadow: "0 0 10px rgba(255, 255, 255, 50)", // Neon Glow
                        // transition: "0.3s ease-in-out",
                      }}
                      value={values.userName}
                      onChange={handleChange}
                      onFocus={(e) =>
                        (e.target.style.boxShadow =
                          "0 0 20px rgba(255, 255, 255, 50)")
                      }
                      onBlur={(e) =>
                        (e.target.style.boxShadow =
                          "0 0 10px rgba(255, 255, 255, 50)")
                      }
                    />

                    <div
                      style={{
                        minHeight: "30px", // Allocated space for error message
                        height: "20px",
                        paddingLeft: "25px",
                        display: "flex", // Keeps content aligned
                        alignItems: "center", // Centers error text vertically
                        overflow: "hidden", // Prevents extra spacing
                      }}
                    >
                      {errors.userName && touched.userName && (
                        <p
                          className="custom-error-message"
                          style={{
                            margin: -20,
                            color: "red",
                            visibility:
                              errors.userName && touched.userName
                                ? "visible"
                                : "hidden",
                          }}
                        >
                          {errors.userName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mb-3" style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className={`form-control ${
                        errors.password && touched.password ? "is-invalid" : ""
                      }`}
                      placeholder="Enter Password"
                      style={{
                        borderRadius: "30px",
                        padding: "12px 45px 12px 20px", // Extra padding to the right for the icon
                        border:
                          errors.password && touched.password
                            ? "2px solid red"
                            : "1px solid #4682B4",
                        backgroundColor: "rgba(255, 255, 255, 0.01)", // Frosted white glass effect
                        color: "#fff",
                        backdropFilter: "blur(10px)", // Frost effect for the background
                        // boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Soft shadow for a floating effect
                        // boxShadow: "0 0 10px rgba(255, 255, 255, 50)",
                        transition: "0.3s ease-in-out",
                      }}
                      value={values.password}
                      onChange={handleChange}
                      // onBlur={handleBlur}
                      onFocus={(e) =>
                        (e.target.style.boxShadow =
                          "0 0 20px rgba(255, 255, 255, 50)")
                      }
                      onBlur={(e) =>
                        (e.target.style.boxShadow =
                          "0 0 10px rgba(255, 255, 255, 50)")
                      }
                    />

                    <div
                      className="eye-icon"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "40px",
                        top: "30%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        color: "#fff",
                      }}
                    >
                      <i
                        className={`bi ${
                          showPassword ? "bi-eye-slash" : "bi-eye"
                        }`}
                      ></i>
                    </div>
                    <div
                      style={{
                        minHeight: "30px", // Space allocated for error message
                        height: "20px",
                        paddingLeft: "25px",
                        display: "flex", // Keeps content aligned
                        alignItems: "center", // Centers error text vertically
                        overflow: "hidden", // Prevents extra spacing
                      }}
                    >
                      {errors.password && touched.password && (
                        <p
                          className="custom-error-message"
                          style={{
                            margin: -20,
                            color: "red",
                            visibility:
                              errors.password && touched.password
                                ? "visible"
                                : "hidden",
                          }}
                        >
                          {errors.password}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <button
                      type="submit"
                      className="w-50"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.15)", // More transparent for deeper frosted look
                        borderRadius: "30px",
                        padding: "5px",
                        fontSize: "1.7rem",
                        fontWeight: "bold",
                        color: "#f8f9fa", // Light gray for better contrast
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        border: "1px solid rgba(255, 255, 255, 0.3)", // Soft frosted border
                        boxShadow: "0px 4px 10px rgba(255, 255, 255, 0.2)", // Soft inner glow effect
                        backdropFilter: "blur(12px)", // Stronger blur for a deeper frosted effect
                        transition: "all 0.4s ease-in-out",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor =
                          "rgba(255, 255, 255, 0.3)"; // More visible frosted effect on hover
                        e.target.style.color = "#fff"; // White text for better contrast
                        e.target.style.transform = "scale(1.08)"; // Slightly bigger for interactive feel
                        e.target.style.boxShadow =
                          "0px 6px 15px rgba(255, 255, 255, 0.4)"; // Glowing effect
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor =
                          "rgba(255, 255, 255, 0.15)";
                        e.target.style.color = "#f8f9fa";
                        e.target.style.transform = "scale(1)";
                        e.target.style.boxShadow =
                          "0px 4px 10px rgba(255, 255, 255, 0.2)";
                      }}
                    >
                      Log in
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
