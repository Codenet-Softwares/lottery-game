import React, { useState, useEffect } from "react";
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
    <div className="login-container text-uppercase">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className=" border border-3 border-dark rounded-4 wrapper ">
              <div className="card-body p-3 px-1 py-2">
                <div className="frosted-header text-center mb-4 text-dark">
                  <h3 className="text-uppercase fw-bold mb-0">Login</h3>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Username */}

                  <div className="mb-4 position-relative">
                    <label
                      htmlFor="userName"
                      className="form-label fw-semibold text-dark"
                    >
                      Username
                    </label>
                    <div className="input-password-group">
                      <input
                        type="text"
                        id="userName"
                        name="userName"
                        className="input-box-login"
                        placeholder="Enter Username"
                        value={values.userName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </div>
                    {errors.userName && touched.userName && (
                      <div className="position-absolute text-danger small">
                        {errors.userName}
                      </div>
                    )}
                  </div>

                  {/* Password */}
                  <div className="mb-4 position-relative">
                    <label
                      htmlFor="password"
                      className="form-label fw-semibold text-dark"
                    >
                      Password
                    </label>
                    <div className="input-password-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        className="input-box-login"
                        placeholder="Enter Password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <button
                        type="button"
                        className="input-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i
                          className={`bi ${
                            showPassword ? "bi-eye-slash" : "bi-eye"
                          }`}
                        ></i>
                      </button>
                    </div>
                    {errors.password && touched.password && (
                      <div className="position-absolute text-danger small">
                        {errors.password}
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="d-flex justify-content-center mt-5">
                    <button
                      type="submit"
                      className="btn btn-light px-5 py-2 rounded-pill fw-semibold text-uppercase"
                    >
                      Log In
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
