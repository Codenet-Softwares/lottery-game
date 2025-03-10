import React, { useState, useEffect } from "react";

const SubAdminWinResult = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        margin: "20px",
        background: "#f0f0f0",
        minHeight: "75vh",
      }}
    >
      <div
        className="container-result mt-5 p-3"
        style={{
          background: "#e6f7ff",
          borderRadius: "10px",
          boxShadow: "0 0 15px rgba(0,0,0,0.1)",
        }}
      >
        {/* Top Navigation Bar */}
        <div
          className="d-flex align-items-center"
          style={{
            backgroundColor: "#4682B4",
            padding: "10px",
            borderRadius: "8px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Left Arrow */}
          <button
            className="btn btn-light"
            style={{
              padding: "5px 10px",
              fontSize: "18px",
              borderRadius: "50%",
              marginRight: "10px",
            }}
            //   onClick={handleScrollLeft}
            //   disabled={scrollIndex === 0}
          >
            &#8249;
          </button>

          {/* Market Buttons */}
          <div
            className="d-flex flex-nowrap justify-content-center"
            style={{
              overflow: "hidden",
              gap: "10px",
            }}
          >
            <div
              style={{
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              No markets found with results declared.
            </div>
          </div>

          {/* Right Arrow */}
          <button
            className="btn btn-light"
            style={{
              padding: "5px 10px",
              fontSize: "18px",
              borderRadius: "50%",
              marginLeft: "10px",
            }}
            //   onClick={handleScrollRight}
            //   disabled={scrollIndex + maxVisibleMarkets >= markets.length}
          >
            &#8250;
          </button>

          {/* Date Filter UI */}
          <div className="date-filter-container">
            <div>
              <label htmlFor="date-filter" className="date-filter-label">
                <i
                  className="fas fa-calendar-alt me-2"
                  style={{ color: "#4682B4" }}
                ></i>
                Select Declared Result Lottery Market Date:
              </label>
              <p className="date-filter-description">
                Please choose a date to view past available results of lottery
                markets.
              </p>
            </div>
            <input
              type="date"
              id="date-filter"
              className="date-filter-input"
              // value={selectedDate}
              // onChange={handleDateChange}
              // max={today}
              readonly
              onKeyDown={(e) => e.preventDefault()}
            />
          </div>
        </div>

        {/* Market Result Display */}
        <div className="mt-4">
          <h2 className="text-center" style={{ color: "#3b6e91" }}>
            Results for{" "}
            {/* <span style={{ color: "#4682B4" }}>
            {markets.find((m) => m.marketId === marketId)?.marketName ||
              "Selected Market"}
          </span> */}
          </h2>

          {/* Error Message */}
          {/* {error && <p className="text-danger text-center">{error}</p>} */}

          {/* Prize Distribution */}

          <div className="accordion mt-4">
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className={`accordion-button ${isOpen ? "" : "collapsed"}`}
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  Click to Expand
                </button>
              </h2>
              {isOpen && (
                <div className="accordion-collapse">
                  <div className="accordion-body">
                    <strong>Winning Ticket Numbers:</strong>
                    <div className="d-flex gap-2">
                      <div className="p-3 border rounded bg-white">1234</div>
                      <div className="p-3 border rounded bg-white">5678</div>
                      <div className="p-3 border rounded bg-white">91011</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubAdminWinResult;
