import React, { useCallback, useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Search.css";
import { LotteryRange, SearchLotteryTicket } from "../../Utils/apiService";
import { getLotteryRange } from "../../Utils/getInitialState";
import {
  generateGroups,
  generateNumbers,
  generateSeries,
} from "../../Utils/helper";
import useDebouncedFilter from "../../Utils/customHook/useDebouncedFilter";
import { getInitialLotteryValues } from "../../Utils/getInitialState.js";
import { searchLottery } from "../../Utils/schema";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { FixedSizeGrid as Grid } from "react-window";

const Search = ({
  marketName, // Receiving the marketName prop
marketId,
  filteredNumbers,
  filteredGroups,
  filteredSeries,
  setFilteredNumbers,
  setFilteredGroups,
  setFilteredSeries,
  lotteryRange,
}) => {

  const [sem, setSem] = useState("");
  const [group, setGroup] = useState("");
  const [series, setSeries] = useState("");
  const [number, setNumber] = useState("");
  const [isGroupPickerVisible, setIsGroupPickerVisible] = useState(false);
  const [isSeriesPickerVisible, setIsSeriesPickerVisible] = useState(false);
  const [isNumberPickerVisible, setIsNumberPickerVisible] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [showSearch, setShowSearch] = useState(true);
  const [errors, setErrors] = useState({});
  const [filteredMarket, setFilteredMarket] = useState(null);

  const navigate = useNavigate();

  const { debouncedFilter } = useDebouncedFilter();

  const formik = useFormik({
    initialValues: getInitialLotteryValues(),
    validationSchema: searchLottery,
    onSubmit: async (values, { resetForm }) => {
      const requestBody = {
        marketId,
        group: values.group ? String(values.group) : null,
        series: values.series ? String(values.series) : null,
        number: values.number ? String(values.number) : null,
        sem: values.sem ? String(values.sem) : null,
      };

      try {
        const response = await SearchLotteryTicket(requestBody);
        setResponseData(response.data);
        setShowSearch(false);

        resetForm();
      } catch (error) {
        console.error("Error:", error);
      }
    },
  });

  const handleNumberInputChange = (e) => {
    const inputValue = e.target.value;
    setNumber(inputValue);

    debouncedFilter(
      inputValue,
      () => generateNumbers(lotteryRange.number_start, lotteryRange.number_end),
      1500,
      setFilteredNumbers
    );
  };

  const handleGroupInputChange = (e) => {
    const inputValue = e.target.value;
    setGroup(inputValue);

    debouncedFilter(
      inputValue,
      () => generateNumbers(lotteryRange.group_start, lotteryRange.group_end),
      1500,
      setFilteredGroups
    );
  };

  const handleSeriesInputChange = (e) => {
    const inputValue = e.target.value;
    setSeries(inputValue);

    debouncedFilter(
      inputValue,
      () => generateSeries(lotteryRange.series_start, lotteryRange.series_end),
      1500,
      setFilteredSeries
    );
  };

  const groupLength =
    Math.abs(lotteryRange.group_end - lotteryRange.group_start) + 1;

  const renderGroupGrid = () => {
    const groups = Array.from({ length: groupLength }, (_, i) =>
      (i + lotteryRange.group_start).toString()
    );
    return (
      <div className="calendar-grid">
        {filteredGroups.map((group) => (
          <button
            key={group}
            className="calendar-cell"
            onClick={() => handleGroupSelect(group)}
          >
            {group}
          </button>
        ))}
      </div>
    );
  };

  const renderNumberGrid = () => {
    const containerWidth = 320; 
    const columnCount = 3; 
    const rowHeight = 40; 
    const rowCount = Math.ceil(filteredNumbers.length / columnCount); 

    const Row = ({ columnIndex, rowIndex, style }) => {
      const numIndex = rowIndex * columnCount + columnIndex;
      if (numIndex >= filteredNumbers.length) return null; 
      const num = filteredNumbers[numIndex];
      return (
        <div
          style={{
            ...style,
          }}
          className="m-1"
        >
          <button
            style={{
              width: "80%",
              height:"90%",
              padding: "10px",
              backgroundColor: "#e6f7ff",
              border: "none",
              cursor: "pointer",
              borderRadius: "5px",
              textAlign: "center",
              fontWeight: "bold",
              color: "#4682B4",
              transition: "background-color 0.3s ease",
            }}
            onClick={() => handleNumberSelect(num.toString().padStart(5, "0"))}
          >
            {num.toString().padStart(5, "0")}
          </button>
        </div>
      );
    };

    return (
      <div className="">
        {filteredNumbers.length === 0 ? (
          <div className="text-center">No Results</div>
        ) : (
          <Grid
            columnCount={columnCount}
            columnWidth={containerWidth / columnCount}
            height={200} 
            rowCount={rowCount}
            rowHeight={rowHeight}
            width={containerWidth} 
          >
            {Row}
          </Grid>
        )}
      </div>
    );
  };

  const renderSeriesGrid = () => {
    return (
      <div className="calendar-grid">
        {filteredSeries.length === 0 ? (
          <div className="text-center">No Results</div>
        ) : (
          filteredSeries.map((letter) => (
            <button
              key={letter}
              className="calendar-cell"
              onClick={() => handleSeriesSelect(letter)}
            >
              {letter}
            </button>
          ))
        )}
      </div>
    );
  };

  const handleSemChange = (e) => {
    setSem(e.target.value);
    if (e.target.value) {
      setErrors((prevErrors) => ({ ...prevErrors, sem: undefined }));
    }
  };

  const handleGroupSelect = (selectedGroup) => {
    formik.setFieldValue("group", selectedGroup); // Update Formik's state
    setGroup(selectedGroup); // Optional: if you still need local state
    setIsGroupPickerVisible(false); // Close the dropdown
  };

  const handleSeriesSelect = (selectedSeries) => {
    formik.setFieldValue("series", selectedSeries); // Update Formik's state
    setSeries(selectedSeries); // Optional: if you still need local state
    setIsSeriesPickerVisible(false); // Close the dropdown
  };

  const handleNumberSelect = (value) => {
    formik.setFieldValue("number", value);
    setNumber(value);
    setIsNumberPickerVisible(false);
  };

  return (
    <div
      className="container-fluid d-flex justify-content-center"
      style={{ minHeight: "55vh", backgroundColor: "#f0f4f8" }}
    >
      <div
        className="border border-3 rounded-3 shadow-lg"
        style={{
          padding: "40px",
          width: "80%",
          maxWidth: "800px",
          backgroundColor: "#ffffff",
        }}
      >
        {showSearch ? (
          <>
            <form  onSubmit={formik.handleSubmit}>
              {filteredMarket && filteredMarket.marketName && (
                <div className="text-center mb-4">
                  <h2
                    className="mb-1"
                    style={{
                      color: "#4682B4",
                      fontWeight: "bold",
                      letterSpacing: "1px",
                    }}
                  >
                    🔍 Search Lottery Tickets For {filteredMarket.marketName}
                  </h2>
                </div>
              )}

              {/* Existing "Search Lottery Tickets" heading */}
              {/* <div className="text-center mb-4">
    <h2
      className="mb-1"
      style={{
        color: "#4682B4",
        fontWeight: "bold",
        letterSpacing: "1px",
      }}
    >
      🔍 Search Lottery Tickets
    </h2>
  </div> */}

              {/* SEM Input Field */}
              <div className="mb-4">
                <label
                  htmlFor="sem"
                  className="form-label"
                  style={{ color: "#4682B4", fontWeight: "bold" }}
                >
                  Select SEM
                </label>
                <select
                  id="sem"
                  className="form-select"
                  value={formik.values.sem}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="">Choose SEM</option>
                  <option value="5">5 SEM</option>
                  <option value="10">10 SEM</option>
                  <option value="25">25 SEM</option>
                  <option value="50">50 SEM</option>
                  <option value="100">100 SEM</option>
                  <option value="200">200 SEM</option>
                </select>
                {formik.touched.sem && formik.errors.sem && (
                  <small className="text-danger">{formik.errors.sem}</small>
                )}
              </div>

              {/* Group Input */}
              <div className="mb-3">
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Group"
                    className="form-control"
                    value={formik.values.group}
                    onFocus={() => {
                      setIsGroupPickerVisible(true);
                    }}
                    onChange={handleGroupInputChange}
                    onBlur={formik.handleBlur}
                  />
                  {isGroupPickerVisible && (
                    <div className="picker-dropdown">{renderGroupGrid()}</div>
                  )}
                  {formik.touched.group && formik.errors.group && (
                    <small className="text-danger">{formik.errors.group}</small>
                  )}
                </div>
              </div>

              {/* Series Input */}
              <div className="mb-3">
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Series"
                    className="form-control"
                    value={formik.values.series}
                    onFocus={() => {
                      setIsSeriesPickerVisible(true);
                    }}
                    onChange={handleSeriesInputChange}
                    onBlur={formik.handleBlur}
                  />
                  {isSeriesPickerVisible && (
                    <div className="picker-dropdown">{renderSeriesGrid()}</div>
                  )}
                  {formik.touched.series && formik.errors.series && (
                    <small className="text-danger">
                      {formik.errors.series}
                    </small>
                  )}
                </div>
              </div>

              {/* Number Input */}
              <div className="mb-4">
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Number"
                    className="form-control"
                    value={formik.values.number}
                    onFocus={() => {
                      setIsNumberPickerVisible(true);
                    }}
                    onChange={handleNumberInputChange}
                  />
                  {isNumberPickerVisible && (
                    <div >{renderNumberGrid()}</div>
                  )}
                  {formik.touched.number && formik.errors.number && (
                    <small className="text-danger">
                      {formik.errors.number}
                    </small>
                  )}
                </div>
              </div>

              <div className="text-center">
                <button
                  className="btn btn-primary"
                  style={{ backgroundColor: "#4682B4" }}
                >
                  Search
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div
              style={{ transform: "scale(2)", float: "left", color: "#2B3A67" }}
              onClick={() => setShowSearch(true)}
            >
              <i
                className="bi bi-arrow-left-circle-fill"
                style={{ float: "left" }}
              ></i>
            </div>
            <div className="text-center">
              <h4 style={{ color: "#4682B4", fontWeight: "bold" }}>
                Search Results:
              </h4>
                  <h5>Tickets:</h5>
              <div
                className="mt-3"
                style={{
                  maxHeight:
                    responseData &&
                    responseData.tickets &&
                    responseData.tickets.length > 8
                      ? "150px"
                      : "auto",
                  overflowY:
                    responseData &&
                    responseData.tickets &&
                    responseData.tickets.length > 8
                      ? "auto"
                      : "visible",
                }}
              >
                {responseData &&
                responseData.tickets &&
                responseData.tickets.length > 0 ? (
                  <>
                    <ul>
                      {responseData.tickets.map((ticket, index) => (
                        <li key={index} style={{ color: "#3b6e91"}}>
                          {ticket}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <h5 style={{ color: "#3b6e91" }}>
                    {responseData
                      ? responseData.message || "No tickets found."
                      : "No data available."}
                  </h5>
                )}
              </div>
              <div className="mt-5">
                    <h5>
                      Price:{" "}
                      <span style={{ color: "#3b6e91" }}>
                        ₹{responseData.price}
                      </span>
                    </h5>
                    <h5>
                      SEM:{" "}
                      <span style={{ color: "#3b6e91" }}>
                        {responseData.sem}
                      </span>
                    </h5>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Search;
