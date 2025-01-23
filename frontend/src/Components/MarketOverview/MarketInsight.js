import React, { useState, useEffect } from "react";
import {
  Card,
  Col,
  Row,
  Container,
  Badge,
  Button,
  Accordion,
} from "react-bootstrap";
import moment from "moment";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css"; // Import Bootstrap icons
import "./MarketInsight.css";
import {
  GetMarketTimings,
  GetPurchaseOverview,
  voidMarket,
  isActiveLottery,
} from "../../Utils/apiService";
import { useAppContext } from "../../contextApi/context";
import { toast } from "react-toastify";
const MarketInsight = () => {
  const [marketTimes, setMarketTimes] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [purchasedTickets, setPurchasedTickets] = useState([]);
  const { showLoader, hideLoader } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState([]);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [filteredMarkets, setFilteredMarkets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Updated function for toggling market status
  const handleMarketStatusToggle = async () => {
    const newStatus = !selectedMarket.isActive;

    try {
      showLoader();
      const response = await isActiveLottery(
        { status: newStatus, marketId: selectedMarket.marketId },
        true
      );
      if (response.success) {
        setRefresh((prev) => !prev);
        setSelectedMarket((prevState) => ({
          ...prevState,
          isActive: newStatus,
        }));
        toast.success(`Market is now ${newStatus ? "Active" : "Inactive"}`);
      } else {
        toast.error("Failed to update market status");
      }
    } catch (error) {
      console.error("Error activating/deactivating lottery:", error);
      toast.error("An error occurred while updating market status");
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    if (!refresh) {
      setFilteredMarkets(marketTimes); // Reset the filter when not active
    }
  }, [marketTimes]);

  console.log("refresh", refresh);
  useEffect(() => {
    const fetchMarketTimings = async () => {
      showLoader();
      try {
        const response = await GetMarketTimings({
          search: debouncedSearchTerm,
        });
        if (response.success) {
          setMarketTimes(response.data);
        }
      } catch (error) {
        console.error("Error fetching market timings:", error);
      } finally {
        hideLoader();
        setLoading(false);
      }
    };

    fetchMarketTimings();
  }, [refresh, debouncedSearchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleVoidMarket = async (marketId) => {
    showLoader();
    try {
      const requestBody = { marketId };
      const response = await voidMarket(requestBody);

      if (response.success) {
        toast.success("Market voided successfully");

        // Remove the voided market from the marketTimes state
        setMarketTimes((prevMarketTimes) =>
          prevMarketTimes.filter((market) => market.marketId !== marketId)
        );

        if (selectedMarket?.marketId === marketId) {
          setSelectedMarket(null);
          setShowStats(false);
        }
      } else {
        toast.error(response.message || "Failed to void market");
      }
    } catch (error) {
      console.error("Error in voiding market:", error);
      toast.error("An error occurred while voiding the market");
    } finally {
      hideLoader();
    }
  };

  // useEffect(() => {
  //   const marketId = "a0587cfe-5600-4675-8d13-00aff76246c1";
  //   fetchMarketData(marketId);
  // }, []);`

  useEffect(() => {
    if (selectedMarket) {
      const fetchPurchasedTickets = async () => {
        showLoader();
        setLoading(true);
        try {
          const response = await GetPurchaseOverview({
            marketId: selectedMarket.marketId,
          });
          if (response.success) {
            setPurchasedTickets(response.data.tickets || []);
          }
        } catch (error) {
          console.error("Error fetching purchased tickets:", error);
        } finally {
          hideLoader();
          setLoading(false);
        }
      };

      fetchPurchasedTickets();
    }
  }, [selectedMarket, refresh]); // Runs when selectedMarket changes

  const handleisActive = async (id, status) => {
    try {
      const response = await isActiveLottery(
        { status: status, marketId: id },
        true
      );
      setRefresh((prev) => !prev);
      console.log("Response:", response);
    } catch (error) {
      console.error("Error activating/deactivating lottery:", error);
    }
  };

  const handleMarketClick = (market) => {
    setSelectedMarket(market);
    setShowStats(true);
  };
  if (loading) {
    return null;
  }
  return (
    <Container fluid className="sci-fi-dashboard">
      {/* Sidebar */}
      <aside className="sci-fi-sidebar p-4">
        <h5 className="sidebar-title">Lottery Markets</h5>
        <div className="sci-fi-market-grid">
          {marketTimes.length > 0 ? (
            marketTimes.map((market) => (
              <Card
                key={market.marketId}
                className="sci-fi-market-card"
                onClick={() => handleMarketClick(market)}
              >
                <Card.Body>
                  <Card.Title className="sci-fi-market-title">
                    {market.marketName}
                  </Card.Title>

                  <Badge
                    className={`market-status ${
                      market.isActive ? "active" : "inactive"
                    }`}
                  >
                    {market.isActive ? "Active" : "Inactive"}
                  </Badge>
                </Card.Body>
              </Card>
            ))
          ) : (
            <div className="no-market-available">
              <h4 className="text-center p-5 rounded-5">
                No <br />
                Market <br />
                Available
              </h4>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="sci-fi-main-content">
        {/* Search Bar */}
        <div className="sci-fi-search-bar">
          <input
            type="text"
            className="sci-fi-search-input"
            placeholder="Search for a Lottery market..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {showStats && selectedMarket ? (
          <div className="sci-fi-stats-popup">
            <h3 className="sci-fi-stats-title">
              {selectedMarket.marketName} Stats
            </h3>
            {/* Switch for Market Status Filter */}
            <div className="d-flex justify-content-end mb-3">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="flexSwitchCheckActive"
                  checked={selectedMarket.isActive}
                  onChange={handleMarketStatusToggle}
                />
                <label
                  className="form-check-label"
                  htmlFor="flexSwitchCheckActive"
                >
                  {selectedMarket.isActive ? "Active" : "Inactive"}
                </label>
              </div>
            </div>
            <Row>
              {/* Group Range Card */}
              <Col md={6} className="mb-3">
                <Card className="sci-fi-stats-card">
                  <Card.Body className="d-flex align-items-center">
                    <i className="bi bi-people-fill stat-icon me-3"></i>
                    <div>
                      <p className="mb-1">
                        <strong>Group Range</strong>
                      </p>
                      <p>
                        Start: {selectedMarket.group_start} | End:{" "}
                        {selectedMarket.group_end}
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Series Range Card */}
              <Col md={6} className="mb-3">
                <Card className="sci-fi-stats-card">
                  <Card.Body className="d-flex align-items-center">
                    <i className="bi bi-bar-chart-fill stat-icon me-3"></i>
                    <div>
                      <p className="mb-1">
                        <strong>Series Range</strong>
                      </p>
                      <p>
                        Start: {selectedMarket.series_start} | End:{" "}
                        {selectedMarket.series_end}
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Number Range Card */}
              <Col md={6} className="mb-3">
                <Card className="sci-fi-stats-card">
                  <Card.Body className="d-flex align-items-center">
                    <i className="bi bi-123 stat-icon me-3"></i>
                    <div>
                      <p className="mb-1">
                        <strong>Number Range</strong>
                      </p>
                      <p>
                        Start: {selectedMarket.number_start} | End:{" "}
                        {selectedMarket.number_end}
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Time Range Card */}
              <Col md={6} className="mb-3">
                <Card className="sci-fi-stats-card">
                  <Card.Body className="d-flex align-items-center">
                    <i className="bi bi-clock-fill stat-icon me-3"></i>
                    <div>
                      <p className="mb-1">
                        <strong>Time Range</strong>
                      </p>
                      <p>
                        Start:{" "}
                        {selectedMarket.start_time
                          ? moment
                              .utc(selectedMarket.start_time)
                              .format("HH:mm")
                          : "N/A"}
                        | End:{" "}
                        {selectedMarket.end_time
                          ? moment.utc(selectedMarket.end_time).format("HH:mm")
                          : "N/A"}
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Date Card */}
              <Col md={6} className="mb-3">
                <Card className="sci-fi-stats-card">
                  <Card.Body className="d-flex align-items-center">
                    <i className="bi bi-calendar-plus-fill stat-icon me-3"></i>
                    <div>
                      <p className="mb-1">
                        <strong>Date</strong>
                      </p>
                      <p>
                        {selectedMarket
                          ? moment(selectedMarket.date).format("MMMM Do YYYY")
                          : "N/A"}
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Date Card */}
              <Col md={6} className="mb-3">
                <Card className="sci-fi-stats-card">
                  <Card.Body className="d-flex align-items-center">
                    <i className="bi bi-currency-rupee stat-icon me-5"></i>
                    <div>
                      <p className="mb-1">
                        <strong>Price</strong>
                      </p>
                      <p>{selectedMarket ? selectedMarket.price : "N/A"}</p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <div className="d-flex justify-content-evenly">
                <button
                  className="void-button"
                  onClick={() =>
                    selectedMarket && handleVoidMarket(selectedMarket.marketId)
                  }
                >
                  Void
                </button>
              </div>
            </Row>

            <Button
              variant="outline-primary"
              className="sci-fi-close-btn"
              onClick={() => setShowStats(false)}
            >
              Close Details
            </Button>
          </div>
        ) : (
          <Card className="welcome-card">
            <Card.Body>
              <Card.Title className="welcome-title">
                Welcome to the Lottery Market Overview!
              </Card.Title>
              <Card.Text className="sci-fi-welcome-text">
                Select a market from the left sidebar to view its details.
              </Card.Text>
              {marketTimes.length === 0 && !showStats && (
                <div className="no-market-available">
                  <h4
                  // className="text-center"
                  // style={{ color: "#2b3a67", fontWeight: "800" }}
                  >
                    No Market Available
                  </h4>
                </div>
              )}
            </Card.Body>
          </Card>
        )}
      </main>
    </Container>
  );
};

export default MarketInsight;
