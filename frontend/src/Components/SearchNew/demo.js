import React, { useState } from "react";
import "./SearchCreatedLotto.css";
import ReusableDropdown from "../Reusables/ReusableDropdown";
import UseSearchData from "./UseSearchData"; // Import the custom hook

const SearchCreatedLotto = () => {
  // Use the custom hook
  const {
    lotteryData,
    handleSubmit: hookHandleSubmit,
    handleBack,
    DROPDOWN_FIELDS
  } = UseSearchData();

  const [showSearch, setShowSearch] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [marketSearchTerm, setMarketSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use the markets data from the hook instead of demo data
  const filteredMarkets = lotteryData.markets?.filter((market) =>
    market.marketName.toLowerCase().includes(marketSearchTerm.toLowerCase())
  ) || [];

  const handleMarketClick = (market) => {
    setSelectedMarket(market);
    // You might want to set the MarketId here if your hook uses it
  };

  const handleMarketSearch = (e) => {
    setMarketSearchTerm(e.target.value);
    setSelectedMarket(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Convert your form values to match what the hook expects
      const values = {
        selectedSem: formValues.sem,
        selectedGroup: formValues.group,
        selectedSeries: formValues.series,
        selectedNumber: formValues.number
      };
      
      await hookHandleSubmit(values, {
        setSubmitting: (value) => setIsSubmitting(value),
        resetForm: () => setFormValues({
          sem: "",
          group: "",
          series: "",
          number: ""
        })
      });
      
      setShowSearch(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sc-lotto-container">
      {/* Sidebar */}
      <aside className="sc-lotto-sidebar">
        <div className="sc-lotto-sidebar-header">
          <h5 className="sc-lotto-sidebar-title">LOTTERY MARKETS</h5>
        </div>
        <div className="sc-lotto-market-search-container">
          <input
            type="text"
            placeholder="Search markets..."
            className="sc-lotto-market-search"
            value={marketSearchTerm}
            onChange={handleMarketSearch}
          />
        </div>
        <div className="sc-lotto-market-card-grid">
          {filteredMarkets.length > 0 ? (
            filteredMarkets.map((market) => (
              <div
                key={market.marketId}
                className={`sc-lotto-market-card ${
                  selectedMarket?.marketId === market.marketId ? "active" : ""
                }`}
                onClick={() => handleMarketClick(market)}
              >
                <div className="sc-lotto-market-card-body">
                  <h6>{market.marketName}</h6>
                </div>
              </div>
            ))
          ) : (
            <div className="sc-lotto-no-markets">No markets found</div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="sc-lotto-main-content">
        {filteredMarkets.length === 0 ? (
          <div className="sc-lotto-no-markets-message">
            No markets found with that name
          </div>
        ) : showSearch ? (
          <>
            {selectedMarket ? (
              <div className="form-wrapper position-relative">
                {/* Suspended overlay */}
                {lotteryData.isSuspend && (
                  <div className="suspended-overlay">
                    <div className="suspended-message">
                      <h3>Lottery Market Suspended</h3>
                      <p>The lottery market is currently unavailable.</p>
                    </div>
                  </div>
                )}

                <div className={`sc-lotto-search-form ${lotteryData.isSuspend ? "blurred" : ""}`}>
                  {/* Price Display */}
                  <div className="price-pill fw-semibold">
                    PRICE: <strong>{selectedMarket.price}</strong>
                  </div>

                  <div className="sc-lotto-form-header">
                    <h6>
                      <span className="market-name">
                        {selectedMarket.marketName}
                      </span>
                    </h6>
                  </div>

                  <form onSubmit={handleFormSubmit}>
                    {DROPDOWN_FIELDS.map(({ label, stateKey, field }) => (
                      <div key={field} className="sc-lotto-form-group">
                        <ReusableDropdown
                          label={label}
                          name={field}
                          options={lotteryData[stateKey] || []}
                          onSelect={(value) => {
                            setFormValues(prev => ({
                              ...prev,
                              [field.replace('selected', '').toLowerCase()]: value
                            }));
                          }}
                        />
                      </div>
                    ))}

                    <div className="sc-lotto-form-submit">
                      <button
                        type="submit"
                        className="text-uppercase text-white"
                        disabled={isSubmitting || lotteryData.isSuspend}
                      >
                        {isSubmitting ? "Processing..." : "Search"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="sc-lotto-select-market">
                Please select a market from the sidebar
              </div>
            )}
          </>
        ) : (
          <>
            <div
              className="sc-lotto-back-button"
              onClick={() => {
                setShowSearch(true);
                handleBack();
              }}
            >
              <i className="bi bi-arrow-left-circle-fill"></i>
            </div>
            <div className="sc-lotto-results-container">
              <h4>Search Results:</h4>
              <h5>Tickets:</h5>
              <div className="sc-lotto-tickets-list">
                <ul>
                  {lotteryData.searchResult?.tickets?.map((ticket, index) => (
                    <li key={index}>{ticket}</li>
                  ))}
                </ul>
              </div>
              <div className="sc-lotto-results-summary">
                <h5>
                  Price: <span>₹{lotteryData.searchResult?.price}</span>
                </h5>
                <h5>
                  SEM: <span>{lotteryData.searchResult?.sem}</span>
                </h5>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SearchCreatedLotto;