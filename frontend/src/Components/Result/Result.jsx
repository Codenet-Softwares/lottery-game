import React, { useState, useEffect } from "react";
import { GetResultMarket, GetWiningResult } from "../../Utils/apiService";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import "./Result.css";

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
    <div className="refined-sci-fi-container">
    {/* Header Section */}
    <header className="refined-sci-fi-header">
      {/* Market Selection and Date Selection */}
      <div className="refined-sci-fi-market-date-selector">
        {/* Market Selection */}
        <div className="refined-sci-fi-market-selector">
          <label htmlFor="market-select" className="refined-sci-fi-market-label">
            Select Market:
          </label>
          <select
            id="market-select"
            className="refined-sci-fi-market-input"
            value={marketId}
            onChange={(e) => handleMarketSelect(e.target.value)}
          >
            {visibleMarkets.length > 0 ? (
              visibleMarkets.map((market) => (
                <option key={market.marketId} value={market.marketId}>
                  {market.marketName}
                </option>
              ))
            ) : (
              <option value="" disabled>No markets available for this date</option>
            )}
          </select>
        </div>
  
        {/* Date Selector */}
        <div className="refined-sci-fi-date-selector">
          <label htmlFor="date-filter" className="refined-sci-fi-date-label">
            Select Date:
          </label>
          <input
            type="date"
            id="date-filter"
            className="refined-sci-fi-date-input"
            value={selectedDate}
            onChange={handleDateChange}
            max={today}
          />
        </div>
      </div>
    </header>
  
    {/* Results Section */}
    <section className="refined-sci-fi-results">
      <h2 className="refined-sci-fi-results-title">
        Results for{" "}
        <span className="highlight">
          {markets.find((m) => m.marketId === marketId)?.marketName || "Market"}
        </span>
      </h2>
  
      {/* Error or No Results */}
      {error && <p className="refined-sci-fi-error">{error}</p>}
      {results.length === 0 && !error ? (
        <p className="refined-sci-fi-no-results">No results declared yet.</p>
      ) : (
        <div className="accordion refined-sci-fi-accordion" id="prizeAccordion">
          {results.map((result, index) => (
            <div className="accordion-item refined-sci-fi-accordion-item" key={result.resultId}>
              <h2 className="accordion-header refined-sci-fi-accordion-header" id={`heading${index}`}>
                <button
                  className="accordion-button refined-sci-fi-accordion-btn collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse${index}`}
                  aria-expanded="false"
                  aria-controls={`collapse${index}`}
                >
                  {result.prizeCategory} - ₹{result.prizeAmount}
                  {result.complementaryPrize > 0 && (
                    <span className="refined-sci-fi-complementary">
                      Complementary: ₹{result.complementaryPrize}
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
                <div className="accordion-body refined-sci-fi-accordion-body">
                  <p className="refined-sci-fi-winning-title">Winning Tickets:</p>
                  <div className="refined-sci-fi-tickets">
                    {result.ticketNumber.map((ticket, idx) => (
                      <div className="refined-sci-fi-ticket" key={idx}>
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
    </section>
  </div>
  
  
  
  
  
  
  
  
  
  );
};

export default Result;
