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
import "bootstrap-icons/font/bootstrap-icons.css";
import "./MarketInsight.css";
import {
  GetMarketTimings,
  GetPurchaseOverview,
  voidMarket,
  isActiveLottery,
  getUpdateMarket,
} from "../../Utils/apiService";
import { useAppContext } from "../../contextApi/context";
import { toast } from "react-toastify";
import UpdateMarketModal from "./UpdateMarketModal";
const MarketInsight = () => {
  const [marketTimes, setMarketTimes] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [purchasedTickets, setPurchasedTickets] = useState([]);
  const { showLoader, hideLoader } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [filteredMarkets, setFilteredMarkets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  console.log("selectedMarket", selectedMarket);

  // Function to handle opening the modal
  const openModal = (market) => {
    setSelectedMarket(market);
    setShowModal(true);
  };

  // Function to handle closing the modal
  const closeModal = () => {
    setShowModal(false);
  };

  const handleModalUpdate = (updatedMarket) => {
    // Update marketTimes state with the new updated market details
    setMarketTimes((prevMarkets) =>
      prevMarkets.map((market) =>
        market.marketId === updatedMarket.marketId ? updatedMarket : market
      )
    );

    // Also update selectedMarket so UI reflects new data immediately
    setSelectedMarket(updatedMarket);
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  //Api implementation for   toggling market status
  const handleMarketStatusToggle = async () => {
    const newStatus = !selectedMarket.isActive;
    let response;
    showLoader();
    response = await isActiveLottery(
      { status: newStatus, marketId: selectedMarket.marketId },
      true
    );

    console.log("line number 71", response);
    if (response && response.success) {
      setRefresh((prev) => !prev);
      setSelectedMarket((prevState) => ({
        ...prevState,
        isActive: newStatus,
      }));
      toast.success(`Market is now ${newStatus ? "Active" : "Inactive"}`);
    } else {
      toast.error("Failed to update market status");
    }

    hideLoader();
  };







  useEffect(() => {
    if (!refresh) {
      setFilteredMarkets(marketTimes); // Reset the filter when not active
    }
  }, [marketTimes]);

  useEffect(() => {
    const fetchMarketTimings = async () => {
      showLoader();

      const response = await GetMarketTimings({
        search: debouncedSearchTerm,
      });
      console.log("response for markets line 99", response);
      if (response.success) {
        setMarketTimes(response.data);
      }

      hideLoader();
      setLoading(false);
    };

    fetchMarketTimings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, debouncedSearchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  // This is the void api implementation
  const handleVoidMarket = async (marketId) => {
    showLoader();

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

    hideLoader();
  };

  useEffect(() => {
    if (selectedMarket) {
      const fetchPurchasedTickets = async () => {
        showLoader();
        setLoading(true);

        const response = await GetPurchaseOverview({
          marketId: selectedMarket.marketId,
        });
        if (response.success) {
          setPurchasedTickets(response.data.tickets || []);
        }

        hideLoader();
        setLoading(false);
      };

      fetchPurchasedTickets();
    }
  }, [selectedMarket, refresh]);

  const handleisActive = async (id, status) => {
    const response = await isActiveLottery(
      { status: status, marketId: id },
      true
    );
    setRefresh((prev) => !prev);
    console.log("Response:", response);
  };

  const handleMarketClick = (market) => {
    setSelectedMarket(market);
    setShowStats(true);
  };
  if (loading) return null;
  return (
    <Container fluid className="alt-dashboard-container">
      {/* Sidebar */}
      <aside className="alt-sidebar p-4">
        <h5
          className="text-center text-white"
          style={{ fontWeight: "800", letterSpacing: "1px" }}
        >
          LOTTERY MARKETS
        </h5>
        <div className="market-card-grid">
          {marketTimes.length > 0 ? (
            marketTimes.map((market) => (
              <Card
                key={market.marketId}
                className="market-card shadow"
                onClick={() => handleMarketClick(market)}
              >
                <Card.Body>
                  <Card.Title>{market.marketName}</Card.Title>
                  {market.isActive ? (
                    <Badge bg="success" className="ms-2">
                      Active
                    </Badge>
                  ) : (
                    <Button variant="secondary" size="sm" className="ms-2">
                      Inactive
                    </Button>
                  )}
                </Card.Body>
              </Card>
            ))
          ) : (
            <div
              className="d-flex justify-content-center align-items-center "
              style={{ minHeight: "480px", width: "100%" }}
            >
              <h4
                className="text-center bg-white p-5 rounded-5"
                style={{ color: "#2b3a67", fontWeight: "900" }}
              >
                No <br />
                Market <br />
                Available
              </h4>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="alt-main-content p-4">
        {/* Search Bar */}
        <div className="search-bar-container-custom d-flex justify-content-center mb-5">
          <input
            type="text"
            className="form-control w-80"
            placeholder="Search for a Lottery market..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {showStats && selectedMarket ? (
          <div className="stats-popup">
            <h3 className="market-title text-center mb-4">
              {selectedMarket.marketName} Stats
            </h3>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <i
                className="bi bi-pencil-square text-primary fs-4 fw-bold  cursor-pointer"
                title="Edit Market Stats"
                style={{
                  cursor: "pointer",
                  textShadow: "2px 2px 2px rgba(0, 0, 0, 0.15)", // Slight depth effect
                  transform: "scale(1.1)", // Slightly enlarges the icon


                }}
                onClick={() => openModal(selectedMarket)} // Open modal with market details
              ></i>
              {/* Switch for Market Status Filter */}
              <div className="d-flex justify-content-end mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input "
                    type="checkbox"
                    id="flexSwitchCheckActive"
                    checked={selectedMarket.isActive}
                    onChange={handleMarketStatusToggle}
                    style={{ cursor: "pointer" }}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexSwitchCheckActive"
                  >
                    {selectedMarket.isActive ? "Active" : "Inactive"}
                  </label>
                </div>
              </div>
            </div>
            <Row>
              {/* Group Range Card */}
              <Col md={6} className="mb-3">
                <Card className="stat-card group-card shadow">
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
                <Card className="stat-card series-card shadow">
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
                <Card className="stat-card number-card shadow">
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
                <Card className="stat-card time-card shadow">
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
                <Card className="stat-card time-card shadow">
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
                <Card className="stat-card time-card shadow">
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
                  className="btn btn-danger"
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
              className="close-btn mt-4"
              onClick={() => setShowStats(false)}
            >
              Close Details
            </Button>
          </div>
        ) : (
          <Card className="welcome-card shadow-sm">
            <Card.Body>
              <Card.Title className="welcome-title">
                Welcome to the Lottery Market Overview!
              </Card.Title>
              <Card.Text className="welcome-text">
                Select a market from the left sidebar to view its details.
              </Card.Text>
              {marketTimes.length === 0 && !showStats && (
                <div className="d-flex justify-content-center align-items-center">
                  <h4
                    className="text-center"
                    style={{ color: "#2b3a67", fontWeight: "800" }}
                  >
                    No Market Available
                  </h4>
                </div>
              )}
            </Card.Body>
          </Card>
        )}
      </main>
      <UpdateMarketModal
        showModal={showModal}
        closeModal={closeModal}
        market={selectedMarket}
        onUpdate={handleModalUpdate}
      />
    </Container>
  );
};

export default MarketInsight;
