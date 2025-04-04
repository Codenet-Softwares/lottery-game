import React from "react";
import { Formik, Form } from "formik";
import "./SearchCreatedLotto.css";
import ReusableDropdown from "../Reusables/ReusableDropdown";
import UseSearchData from "./UseSearchData";

const SearchCreatedLotto = () => {
  const {
    lotteryData,
    allMarkets,
    searchTerm,
    selectedMarket,
    showSearch,
    validationSchema,
    DROPDOWN_FIELDS,
    handleSearchChange,
    handleMarketClick,
    handleSubmit,
    handleBack,
  } = UseSearchData();

  const filteredMarkets = allMarkets.filter((market) =>
    market.marketName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sc-lotto-container">
      <aside className="sc-lotto-sidebar">
        <div className="sc-lotto-sidebar-header">
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
            <div className="d-flex justify-content-center align-items-center ">
              <h4
                className="text-center bg-white p-5 rounded-4"
                style={{ color: "#2b3a67", fontWeight: "900" }}
              >
                No <br />
                Markets <br />
                Found
              </h4>
            </div>
          )}
        </div>
      </aside>

      <main className="sc-lotto-main-content">
        <div className="sc-lotto-market-search-wrapper">
          <div className="sc-lotto-market-search-container">
            <input
              type="text"
              placeholder="Search Markets..."
              className="sc-lotto-market-search"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {showSearch ? (
          selectedMarket ? (
            <div className="form-wrapper">
              <div className="sc-lotto-search-border-form border border-2 border-secondary py-4 rounded-3">
                <div className="sc-lotto-search-form ">
                  <div className="price-pill">
                    PRICE: <strong>{selectedMarket.price}</strong>
                  </div>
                  <div className="sc-lotto-form-header">
                    <h6>{selectedMarket.marketName}</h6>
                  </div>
                  <Formik
                    key={selectedMarket?.marketId || "form"}
                    initialValues={{
                      Sem: "",
                      Group: "",
                      Series: "",
                      Number: "",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ setFieldValue, errors, touched, isSubmitting }) => (
                      <Form>
                        {DROPDOWN_FIELDS.map(({ label, stateKey, field }) => (
                          <div key={field} className="sc-lotto-form-group">
                            <ReusableDropdown
                              label={label}
                              name={field}
                              options={lotteryData[stateKey] || []}
                              onSelect={(value) => setFieldValue(field, value)}
                              error={errors[field]}
                              touched={touched[field]}
                            />
                          </div>
                        ))}
                        <div className="sc-lotto-form-submit">
                          <button
                            type="submit"
                            className="text-uppercase text-white"
                          >
                            {isSubmitting ? "Processing..." : "Search"}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
            </div>
          ) : (
            <div className="sc-lotto-select-market ">
              <div className="sc-select-message fw-bold border border-2 h4">
                Please Select a Market From The Sidebar
              </div>
            </div>
          )
        ) : (
          <div className="sc-lotto-results-view">
            <div className="sc-lotto-back-button" onClick={handleBack}>
              <i className="bi bi-arrow-left-circle-fill"></i>
            </div>
            <div className="sc-lotto-search-border-form border border-2 border-secondary py-4 rounded-3">
              <div className="sc-lotto-results-container">
                <h4>Search Results:</h4>
                <h5>Tickets:</h5>

                {lotteryData.searchResult?.tickets?.length ? (
                  <div className="ticket-grid-container">
                    <div className="ticket-grid">
                      {lotteryData.searchResult.tickets.map((ticket, index) => (
                        <div key={index} className="ticket-card">
                          <div className="ticket-left">
                            {ticket.slice(0, 4)}
                          </div>
                          <div className="ticket-center">
                            <div className="ticket-title">Lottery Ticket</div>
                            <div className="ticket-number">{ticket}</div>
                          </div>
                          <div className="ticket-right">{ticket.slice(-5)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="no-tickets">No tickets found</div>
                )}

                {lotteryData.searchResult && (
                  <div className="results-summary mt-3">
                    <h5>
                      Price: <span>₹{lotteryData.searchResult.price}</span>
                    </h5>
                    <h5>
                      SEM: <span>{lotteryData.searchResult.sem}</span>
                    </h5>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchCreatedLotto;
