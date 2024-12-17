/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import backgroundimage from "../../.././Assets/backgroundImage.jpg";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../../Utils/apiService";
import { useAppContext } from "../../../contextApi/context";
import strings from "../../../Utils/constant/stringConstant";
import { getInitialValues } from "../../../Utils/getInitialState";
import { LoginSchema } from "../../../Utils/schema";
import { useFormik } from "formik";
import { useLocation } from "react-router-dom";

const Login = () => {
  const { dispatch, store } = useAppContext();
  const [error, setError] = useState(""); // For error handling
  const navigate = useNavigate();
  const location = useLocation();
  
  const isLoginFromStore = store.admin.isLogin;

  useEffect (()=> {
    if (location.pathname == "/" && !isLoginFromStore) {
      navigate("/login")
    } else if (isLoginFromStore) {
      navigate("/dashboard")
    }
  }, [])

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
      await loginHandler(values);
      resetForm();
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
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${backgroundimage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(5px)",
        }}
      ></div>

      <div className="col-lg-12">
        <div
          className="white_box mb_30"
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
            borderRadius: "10px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div className="row justify-content-center">
            <div className="col-lg-12">
              <div
                className="modal-content cs_modal"
                style={{
                  borderRadius: "10px",
                  border: "1px solid black",
                }}
              >
                <div
                  className="modal-header justify-content-center theme_bg_1"
                  style={{
                    backgroundColor: "#4682B4",
                    borderRadius: "10px 10px 0 0",
                    padding: "15px",
                  }}
                >
                  <h5
                    className="modal-title text_white"
                    style={{ color: "white" }}
                  >
                    Log in
                  </h5>
                </div>
                <div className="modal-body" style={{ padding: "30px" }}>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <input
                        type="text"
                        name="userName"
                        className="form-control mb-0"
                        placeholder="Enter Username"
                        style={{
                          
                          borderRadius: "5px",
                          border: "1px solid",
                        }}
                        value={values.userName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {errors.userName && touched.userName && (
                        <p className=" fw-bold text-danger mb-0 mt-0">
                          {errors.userName}
                        </p>
                      )}
                    </div>
                    <div className="mb-3">
                      <input
                        type="password"
                        name="password"
                        className="form-control mb-0"
                        placeholder="Enter Password"
                        style={{
                          padding: "15px",
                          borderRadius: "5px",
                          border: "1px solid",
                        }}
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {errors.password && touched.password && (
                        <p className=" fw-bold text-danger mb-0 mt-0">
                          {errors.password}
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="btn_1 full_width text-center"
                      style={{
                        color: "white",
                        padding: "10px",
                        borderRadius: "5px",
                        display: "block",
                        width: "100%",
                        textDecoration: "none",
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
