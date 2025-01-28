import React, { useState, useEffect } from "react";
import { GetResultMarket, GetWiningResult } from "../../Utils/apiService";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";

const Result = () => {
  const { marketId } = useParams(); // Extract current marketId from URL
  const navigate = useNavigate();
  const [markets, setMarkets] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const today = format(new Date(), "yyyy-MM-dd");
  const [selectedDate, setSelectedDate] = useState(today); // For date filter

  const maxVisibleMarkets = 3;
  const visibleMarkets = markets.slice(scrollIndex, scrollIndex + maxVisibleMarkets);

  // Fetch markets based on the selected date
  const fetchMarkets = async () => {
    try {
      const response = await GetResultMarket({ date: selectedDate });
      if (response && response.success && response.data) {
        setMarkets(response.data);
        if (response.data.length > 0) {
          // If markets exist for this day and no marketId is in URL, navigate to the first market of the selected date
          if (!marketId) {
            navigate(`/results/${response.data[0].marketId}`);
          } else if (!response.data.some((m) => m.marketId === marketId)) {
            // If the current marketId is not in the list, navigate to the first market of the day
            navigate(`/results/${response.data[0].marketId}`);
          }
        } else {
          // No markets found for the selected date
          setError("No markets found for the selected date.");
          setResults([]); // Ensure no results are displayed
          navigate(`/results`); // Navigate to results without marketId
        }
      } else {
        setError("Failed to fetch markets or no data available.");
        setResults([]); // Ensure no results are displayed
        navigate(`/results`); // Navigate to results without marketId
      }
    } catch (err) {
      setError("Error fetching markets.");
      setResults([]); // Ensure no results are displayed
      navigate(`/results`); // Navigate to results without marketId
    }
  };

  // Fetch results for the selected marketId
  const fetchResults = async () => {
    if (!marketId) return;
    try {
      const response = await GetWiningResult({ marketId });
      if (response && response.success) {
        setResults(response.data || []);
        setError(null); // Clear any existing error
      } else {
        setResults([]);
        setError("No prize data available.");
      }
    } catch (err) {
      setError("Error fetching results.");
      setResults([]);
    }
  };

  // Fetch markets when the selected date changes
  useEffect(() => {
    fetchMarkets();
  }, [selectedDate]);

  // Fetch results when marketId changes (either due to initial load or when a user selects a market)
  useEffect(() => {
    if (marketId) {
      fetchResults();
    }
  }, [marketId]);

  // Handle date change
  const handleDateChange = (event) => {
    const newDate = event.target.value;
    const formattedDate = format(new Date(newDate), "yyyy-MM-dd");
    setSelectedDate(formattedDate);
  };

  // Handle market scrolling
  const handleScrollLeft = () => {
    if (scrollIndex > 0) setScrollIndex(scrollIndex - 1);
  };

  const handleScrollRight = () => {
    if (scrollIndex + maxVisibleMarkets < markets.length)
      setScrollIndex(scrollIndex + 1);
  };

  // Handle market selection
  const handleMarketSelect = (market) => {
    navigate(`/results/${market.marketId}`); // Update URL when selecting a market
  };

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
            onClick={handleScrollLeft}
            disabled={scrollIndex === 0}
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
            {visibleMarkets.length > 0 ? (
              visibleMarkets.map((market) => (
                <button
                  key={market.marketId}
                  className={`btn ${
                    market.marketId === marketId ? "btn-primary" : "btn-outline-light"
                  }`}
                  onClick={() => handleMarketSelect(market)}
                  style={{
                    fontSize: "16px",
                    borderRadius: "4px",
                    boxShadow:
                      market.marketId === marketId
                        ? "0px 4px 6px rgba(0, 0, 0, 0.2)"
                        : "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {market.marketName}
                </button>
              ))
            ) : (
              <div
                style={{
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                No markets found with results declared.
              </div>
            )}
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
            onClick={handleScrollRight}
            disabled={scrollIndex + maxVisibleMarkets >= markets.length}
          >
            &#8250;
          </button>

          {/* Date Filter UI */}
          <div className="date-filter-container">
            <div>
              <label htmlFor="date-filter" className="date-filter-label">
                <i className="fas fa-calendar-alt me-2" style={{ color: "#4682B4" }}></i>
                Select Declared Result Lottery Market Date:
              </label>
              <p className="date-filter-description">
                Please choose a date to view past available results of lottery markets.
              </p>
            </div>
            <input
              type="date"
              id="date-filter"
              className="date-filter-input"
              value={selectedDate}
              onChange={handleDateChange}
              max={today} // Prevent selecting future dates
            />
          </div>
        </div>

        {/* Market Result Display */}
        <div className="mt-4">
          <h2 className="text-center" style={{ color: "#3b6e91" }}>
            Results for{" "}
            <span style={{ color: "#4682B4" }}>
              {markets.find((m) => m.marketId === marketId)?.marketName || "Selected Market"}
            </span>
          </h2>

          {/* Error Message */}
          {error && <p className="text-danger text-center">{error}</p>}

          {/* Prize Distribution */}
          {results.length === 0 && !error ? (
            <p className="text-center text-muted">No prize declared yet.</p>
          ) : (
            <div className="accordion mt-4" id="prizeAccordion">
              {results.map((result, index) => (
                <div className="accordion-item" key={result.resultId}>
                  <h2 className="accordion-header" id={`heading${index}`}>
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#collapse${index}`}
                      aria-expanded="false"
                      aria-controls={`collapse${index}`}
                    >
                      {result.prizeCategory} - Amount: ₹{result.prizeAmount}
                      {result.complementaryPrize > 0 && (
                        <span className="badge bg-success ms-2">
                          Complementary Prize: ₹{result.complementaryPrize}
                        </span>
                      )}
                    </button>
                  </h2>
                  <div
                    id={`collapse${index}`}
                    className="accordion-collapse collapse"
                    aria-labelledby={`heading${index}`}
                    data-bs-parent="#prizeAccordion"
                  >
                    <div
                      className="accordion-body"
                      style={{
                        padding: "20px",
                        fontFamily: "'Poppins', sans-serif",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "1.2rem",
                          color: "#3b6e91",
                          display: "block",
                          marginBottom: "15px",
                        }}
                      >
                        Winning Ticket Numbers:
                      </strong>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                          gap: "15px",
                          backgroundColor: "#f8faff",
                          padding: "20px",
                          borderRadius: "12px",
                          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {result.ticketNumber.map((ticket, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "15px",
                              backgroundColor: "#fff",
                              borderRadius: "10px",
                              fontSize: "1rem",
                              fontWeight: "600",
                              color: "#555",
                              textAlign: "center",
                              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                              transition: "transform 0.3s ease, box-shadow 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "scale(1.1)";
                              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "scale(1)";
                              e.currentTarget.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
                            }}
                          >
                            {ticket}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Result;
