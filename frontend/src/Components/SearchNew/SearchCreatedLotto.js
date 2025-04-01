import React, { useState } from "react";
import "./SearchCreatedLotto.css";
import ReusableDropdown from "../Reusables/ReusableDropdown";
import UseSearchData from "./UseSearchData";

const SearchCreatedLotto = () => {
  // Demo search results
  const demoSearchResults = {
    tickets: ["A1001234", "A1001235", "A1001236", "A1001237"],
    price: "200",
    sem: "50",
    message: "4 tickets found",
  };

  const [showSearch, setShowSearch] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [isGroupPickerVisible, setIsGroupPickerVisible] = useState(false);
  const [isSeriesPickerVisible, setIsSeriesPickerVisible] = useState(false);
  const [isNumberPickerVisible, setIsNumberPickerVisible] = useState(false);
  const [formValues, setFormValues] = useState({
    sem: "",
    group: "",
    series: "",
    number: "",
  });

  const [marketSearchTerm, setMarketSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuspend, setIsSuspend] = useState(false);
  // Use the custom hook
  const {
    lotteryData,
    handleSubmit: hookHandleSubmit,
    handleBack,
    DROPDOWN_FIELDS,
  } = UseSearchData(selectedMarket?.marketId);

  // Use the markets data from the hook instead of demo data
  const filteredMarkets =
    lotteryData.markets?.filter((market) =>
      market.marketName.toLowerCase().includes(marketSearchTerm.toLowerCase())
    ) || [];

  // Dummy handlers
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setShowSearch(false);
      setIsSubmitting(false);
    }, 1000);
  };

  const handleMarketClick = (market) => {
    setSelectedMarket(market);
  };

  const handleMarketSearch = (e) => {
    setMarketSearchTerm(e.target.value);
    setSelectedMarket(null); // Reset selected market when searching
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
      <aside className="sc-lotto-sidebar ">
        <div className="sc-lotto-sidebar-header ">
          <h5 className="sc-lotto-sidebar-title">LOTTERY MARKETS</h5>
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
        {/* Search Bar */}
        <div className="sc-lotto-market-search-container">
          <input
            type="text"
            placeholder="Search markets..."
            className="sc-lotto-market-search"
            value={marketSearchTerm}
            onChange={handleMarketSearch}
          />
        </div>
        {filteredMarkets.length === 0 ? (
          <div className="sc-lotto-no-markets-message">
            No markets found with that name
          </div>
        ) : showSearch ? (
          <>
            {selectedMarket ? (
              <div className="form-wrapper position-relative">
                <div className="sc-lotto-search-form">
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

                  <form onSubmit={handleSubmit}>
                    {/* SEM Dropdown */}
                    <div className="sc-lotto-form-group">
                      <ReusableDropdown
                        label="SEM"
                        name="sem"
                        options={["5", "10", "25", "50", "100", "200"]}
                        onSelect={(value) =>
                          setFormValues({ ...formValues, sem: value })
                        }
                      />
                    </div>

                    {/* Group Dropdown */}
                    <div className="sc-lotto-form-group">
                      <ReusableDropdown
                        label="Group"
                        name="group"
                        // options={generateOptions(
                        //   "group",
                        //   "series",
                        //   selectedMarket.group_start,
                        //   selectedMarket.group_end
                        // )}
                        // onSelect={(value) =>
                        //   setFormValues({ ...formValues, group: value })
                        // }
                      />
                    </div>

                    {/* Series Dropdown */}
                    <div className="sc-lotto-form-group">
                      <ReusableDropdown
                        label="Series"
                        name="series"
                        // options={generateOptions(
                        //   "series",
                        //   selectedMarket.group_start,
                        //   selectedMarket.group_end
                        // )}
                        // onSelect={(value) =>
                        //   setFormValues({ ...formValues, series: value })
                        // }
                      />
                    </div>

                    {/* Number Dropdown */}
                    <div className="sc-lotto-form-group">
                      <ReusableDropdown
                        label="Number"
                        name="number"
                        // options={generateOptions(
                        //   "number",
                        //   selectedMarket.number_start,
                        //   selectedMarket.number_end,
                        //   formValues.group + formValues.series
                        // )}
                        // onSelect={(value) =>
                        //   setFormValues({ ...formValues, number: value })
                        // }
                      />
                    </div>

                    <div className="sc-lotto-form-submit">
                      <button
                        type="submit"
                        className="text-uppercase text-white"
                        disabled={isSubmitting || isSuspend}
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
              onClick={() => setShowSearch(true)}
            >
              <i className="bi bi-arrow-left-circle-fill"></i>
            </div>
            <div className="sc-lotto-results-container">
              <h4>Search Results:</h4>
              <h5>Tickets:</h5>
              <div className="sc-lotto-tickets-list">
                <ul>
                  {demoSearchResults.tickets.map((ticket, index) => (
                    <li key={index}>{ticket}</li>
                  ))}
                </ul>
              </div>
              <div className="sc-lotto-results-summary">
                <h5>
                  Price: <span>₹{demoSearchResults.price}</span>
                </h5>
                <h5>
                  SEM: <span>{demoSearchResults.sem}</span>
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
