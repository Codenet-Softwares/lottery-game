import React, { useRef, useState, useEffect } from "react";
import useDebounce from "../../Utils/customHook/useDebounce ";
import { FixedSizeGrid as Grid } from "react-window";

export const ReusableInput = ({
  placeholder,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
}) => (
  <div className="form-group mb-3">
    <input
      type={type}
      name={name}
      className={`form-control ${error ? "is-invalid" : ""}`}
      placeholder={placeholder} // Using placeholder instead of label
      value={value}
      onChange={onChange}
      onBlur={onBlur}
    />
    <div
      className="text-danger d-flex align-items-center  mt-1"
      style={{ minHeight: "20px", fontSize: "0.85rem" }} // Reserves space for error messages
    >
      {error && (
        <>
          <i className="bi bi-info-circle me-1"></i>
          <span>{error}</span>
        </>
      )}
    </div>
  </div>
);

export const FromToInput = ({
  placeholder,
  fromName,
  toName,
  fromValue,
  toValue,
  onChangeFrom,
  onChangeTo,
  onBlur,
  fromError,
  toError,
  options,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeInput, setActiveInput] = useState(null);
  const [typedFromValue, setTypedFromValue] = useState(fromValue);
  const [typedToValue, setTypedToValue] = useState(toValue);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null); // Ref for the container
  const [containerWidth, setContainerWidth] = useState(0);

  const debouncedFromValue = useDebounce(typedFromValue, 300);
  const debouncedToValue = useDebounce(typedToValue, 300);

  useEffect(() => {
    setTypedFromValue(fromValue || "");
  }, [fromValue]);

  useEffect(() => {
    setTypedToValue(toValue || "" );
  }, [toValue]);

  useEffect(() => {
    // Set container width dynamically
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, [containerRef.current]); // Recalculate width when the container is resized

  const handleInputClick = (inputName) => {
    setActiveInput(inputName);
    setIsDropdownOpen(true);
  };

  const handleOptionClick = (value, inputName) => {
    console.log("Option clicked:", value, inputName, fromName);

    if (inputName === fromName) {
      setTypedFromValue(value);
      onChangeFrom({ target: { name: fromName, value } });
    } else if (inputName === toName) {
      setTypedToValue(value);
      onChangeTo({ target: { name: toName, value } });
    }
    setIsDropdownOpen(false);
  };

  const filteredOptions =
    activeInput === fromName
      ? options.filter((option) =>
        option.toString().includes(debouncedFromValue)
      )
      : options.filter((option) =>
        option.toString().includes(debouncedToValue)
      );

  const Row = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * 3 + columnIndex; // 3 columns per row
    if (index >= filteredOptions.length) return null;

    return (
      <button
        style={{
          ...style,
          display: "block",
          margin: "0",
          padding: "8px",
          textAlign: "left",
          border: "1px solid #ddd",
          borderRadius: "4px",
          backgroundColor: "#f8f9fa",
          transition: "background-color 0.3s",
        }}
        className="btn btn-light btn-sm text-start"
        onClick={() => {
          handleOptionClick(filteredOptions[index], activeInput);
        }}
        onKeyUp={() => {
          console.log("filteredOptions[index]:", filteredOptions[index]);
          console.log("activeInput:", activeInput);
          handleOptionClick(filteredOptions[index], activeInput);
        }}
      onMouseEnter={(e) => (e.target.style.backgroundColor = "#e6f7ff")}
      onMouseLeave={(e) => (e.target.style.backgroundColor = "#f8f9fa")}
      >
        {filteredOptions[index]}
      </button>
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // const handleFromChange = (e) => setTypedFromValue(e.target.value);
  // const handleToChange = (e) => setTypedToValue(e.target.value);
  const handleFromChange = (e) => {
    const value = e.target.value;
    setTypedFromValue(value);
    onChangeFrom({ target: { name: fromName, value } });
  };
  
  const handleToChange = (e) => {
    const value = e.target.value;
    setTypedToValue(value);
    onChangeTo({ target: { name: toName, value } });
  };

  return (
    <div className="form-group mb-3">
      <div className="d-flex gap-2">
        <div className="position-relative" style={{ flex: 1 }}>
          <input
            type="text"
            name={fromName}
            className={`form-control ${fromError ? "is-invalid" : ""}`}
            placeholder={placeholder}
            value={typedFromValue}
            onClick={() => handleInputClick(fromName)}
            onChange={handleFromChange}
            style={{ height: "40px" }}
          />
          {/* Consistent error message space */}
          <div
            className="text-danger no-cursor d-flex align-items-center mt-1"
            style={{
              height: "20px", // Fixed height for error message
              fontSize: "0.85rem",
            }}
          >
            {fromError && (
              <>
                <i className="bi bi-info-circle me-1"></i>
                {fromError}
              </>
            )}
          </div>
          {isDropdownOpen && activeInput === fromName && containerWidth > 0 && (
            <div
              ref={dropdownRef}
              className="dropdown-grid"
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                maxHeight: "200px",
                overflowY: "hidden",
                overflowX: "hidden", // Allow horizontal scroll if needed
                zIndex: 10,
                width: "100%", // Ensure it takes full width
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: "#fff",
              }}
            >
              {filteredOptions.length > 0 ? (
                <Grid
                  columnCount={3}
                  columnWidth={containerWidth / 3}
                  height={200}
                  rowCount={Math.ceil(filteredOptions.length / 3)}
                  rowHeight={40}
                  width={containerWidth}
                >
                  {Row}
                </Grid>
              ) : (
                <div
                  style={{
                    padding: "8px",
                    textAlign: "center",
                    color: "#999",
                    fontStyle: "italic",
                  }}
                >
                  No data
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className="position-relative"
          style={{ flex: 1 }}
          ref={containerRef}
        >
          <input
            type="text"
            name={toName}
            className={`form-control ${toError ? "is-invalid" : ""}`}
            placeholder={placeholder}
            value={typedToValue}
            onClick={() => handleInputClick(toName)}
            onChange={handleToChange}
            style={{ height: "40px" }}
          />
          {/* Consistent error message space */}
          <div
            className="text-danger no-cursor d-flex align-items-center mt-1"
            style={{
              height: "20px", // Fixed height for error message
              fontSize: "0.85rem",
            }}
          >
            {toError && (
              <>
                <i className="bi bi-info-circle me-1"></i>
                {toError}
              </>
            )}
          </div>
          {isDropdownOpen && activeInput === toName && containerWidth > 0 && (
            <div
              ref={dropdownRef}
              className="dropdown-grid"
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                maxHeight: "200px",
                overflowY: "hidden",
                overflowX: "hidden",
                zIndex: 10,
                width: "100%", // Ensure it takes full width
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: "#fff",
              }}
            >
              {filteredOptions.length > 0 ? (
                <Grid
                  columnCount={3}
                  columnWidth={containerWidth / 3}
                  height={200}
                  rowCount={Math.ceil(filteredOptions.length / 3)}
                  rowHeight={40}
                  width={containerWidth}
                >
                  {Row}
                </Grid>
              ) : (
                <div
                  style={{
                    padding: "8px",
                    textAlign: "center",
                    color: "#999",
                    fontStyle: "italic",
                  }}
                >
                  No matching data found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ReusableResetPasswordInput = ({
  placeholder,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  showEyeIcon = false, // Optional prop to determine if the eye icon should be displayed
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prevState) => !prevState);
  };

  // If showEyeIcon is true, toggle type between "password" and "text"
  const inputType = showEyeIcon && isPasswordVisible ? "text" : type;

  return (
    <div className="form-group mb-3 position-relative">
      <input
        type={inputType}
        name={name}
        className={`form-control ${error ? "is-invalid" : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
      
      {showEyeIcon && (
        <div
          className={`bi ${inputType === "password" ? "bi-eye-slash" : "bi-eye"} position-absolute end-0 me-5`}
          onClick={togglePasswordVisibility}
          style={{
            cursor: "pointer",
            top: "50%", 
            transform: "translateY(-100%)", 
            right: "15px", 
          }}
        ></div>
      )}

      <div
        className="text-danger d-flex align-items-center mt-1"
        style={{ minHeight: "20px", fontSize: "0.85rem" }}
      >
        {error && (
          <>
            <i className="bi bi-info-circle me-1"></i>
            <span>{error}</span>
          </>
        )}
      </div>
    </div>
  );
};

