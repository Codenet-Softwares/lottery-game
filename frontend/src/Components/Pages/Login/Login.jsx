import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../../Utils/apiService";
import { useAppContext } from "../../../contextApi/context";
import strings from "../../../Utils/constant/stringConstant";
import { getInitialValues } from "../../../Utils/getInitialState";
import { LoginSchema } from "../../../Utils/schema";
import { useFormik } from "formik";
import { useLocation } from "react-router-dom";

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
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light text-uppercase">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className="card shadow border-2 rounded-4">
              <div className="card-body p-4">
                <div className="bg-primary text-white rounded-top-4 text-center py-3 mb-4">
                  <h3 className="text-uppercase fw-bold mb-0">Login</h3>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Username */}
                  <div className="mb-4 position-relative">
                    <label
                      htmlFor="userName"
                      className="form-label fw-semibold"
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      id="userName"
                      name="userName"
                      className={`form-control rounded-3 px-3 py-2 ${
                        errors.userName && touched.userName ? "is-invalid" : ""
                      }`}
                      placeholder="Enter Username"
                      value={values.userName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
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
                      className="form-label fw-semibold"
                    >
                      Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        className={`form-control rounded-start-3 px-3 py-2 ${
                          errors.password && touched.password
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter Password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <span
                        className={`input-group-text ${
                          errors.password && touched.password
                            ? "border-danger is-invalid rounded-end-3"
                            : "rounded-end-3"
                        }`}
                        role="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i
                          className={`bi ${
                            showPassword ? "bi-eye-slash" : "bi-eye"
                          }`}
                        ></i>
                      </span>
                    </div>

                    {/* Error absolutely positioned – doesn't expand layout */}
                    {errors.password && touched.password && (
                      <div className="position-absolute text-danger small">
                        {errors.password}
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="d-grid mt-5">
                    <button
                      type="submit"
                      className="btn btn-primary rounded-3 py-2 fw-semibold text-uppercase"
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
