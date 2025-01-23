import React, { useState, useEffect } from "react";
import { GetResultMarket, GetWiningResult } from "../../Utils/apiService";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import "./Result.css";

const Result = () => {
  const { marketId } = useParams(); 
  const navigate = useNavigate(); 
  const [markets, setMarkets] = useState([]);
  const [results, setResults] = useState([]); 
  const [error, setError] = useState(null); 
  const [scrollIndex, setScrollIndex] = useState(0); 

  const maxVisibleMarkets = 5;
  const visibleMarkets = markets.slice(scrollIndex, scrollIndex + maxVisibleMarkets);

  // Fetch markets using the API
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await GetResultMarket({ date: new Date().toISOString().slice(0, 10) });
        if (response && response.success && response.data) {
          setMarkets(response.data);
          // If no marketId in URL, default to the first market
          if (!marketId) {
            navigate(`/results/${response.data[0].marketId}`);
          }
        } else {
          setError("Failed to fetch markets or no data available.");
        }
      } catch (err) {
        setError("No markets has been declared with any prizes yet so far.");
      }
    };

    fetchMarkets();
  }, [marketId, navigate]);

  // Fetch results based on the selected marketId from the URL
  useEffect(() => {
    if (!marketId) return;

    const fetchResults = async () => {
      try {
        const response = await GetWiningResult({ marketId });
        if (response && response.success) {
          setResults(response.data || []);
          setError(null);
        } else {
          setResults([]);
          setError("No prize data available.");
        }
      } catch (err) {
        setError("Error fetching results.");
      }
    };

    fetchResults();
  }, [marketId]);

  const handleScrollLeft = () => {
    if (scrollIndex > 0) setScrollIndex(scrollIndex - 1);
  };

  const handleScrollRight = () => {
    if (scrollIndex + maxVisibleMarkets < markets.length) setScrollIndex(scrollIndex + 1);
  };

  const handleMarketSelect = (market) => {
    navigate(`/results/${market.marketId}`); // Update URL when selecting a market
  };

  const handleOldResults = () => {
    alert("This portion is under development.");
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
