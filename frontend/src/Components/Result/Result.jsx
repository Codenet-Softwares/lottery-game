import React, { useState, useEffect } from "react";
import { GetResultMarket, GetWiningResult } from "../../Utils/apiService";
import { useNavigate, useParams } from "react-router-dom";

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
    <div style={{ fontFamily: "Arial, sans-serif", margin: "20px" }}>
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
          className={`btn ${market.marketId === marketId ? "btn-primary" : "btn-outline-light"}`}
          onClick={() => handleMarketSelect(market)}
          style={{
            fontSize: "16px",
            borderRadius: "4px",
            boxShadow: market.marketId === marketId ? "0px 4px 6px rgba(0, 0, 0, 0.2)" : "none",
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
        No markets found with result decalared
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

        {/* Old Results Button */}
        <button
          className="btn btn-warning"
          onClick={handleOldResults}
          style={{
            marginLeft: "auto",
            borderRadius: "20px",
            padding: "5px 15px",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          Old Results
        </button>
      </div>

      {/* Market Result Display */}
      <div className="mt-4">
        <h2 className="text-center" style={{ color: "#3b6e91" }}>
          Results for <span style={{ color: "#4682B4" }}>{markets.find((m) => m.marketId === marketId)?.marketName || "Selected Market"}</span>
        </h2>

        {/* Error Message */}
        {error && (
          <p className="text-danger text-center">
            {error}
          </p>
        )}

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
                  <div className="accordion-body">
                    <strong>Winning Ticket Numbers:</strong>
                    <ul>
                      {result.ticketNumber.map((ticket, idx) => (
                        <li key={idx}>{ticket}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Result;
