import React, { useState, useEffect } from "react";
import { Accordion, Button, Form } from "react-bootstrap";
import { useAppContext } from "../../contextApi/context";
import { AllActiveLotteryMarkets, CustomWining } from "../../Utils/apiService";
import "./Win.css";
import { validateAllInputs } from "../../Utils/helper";

const Win = () => {
  const { showLoader, hideLoader, isLoading } = useAppContext();

  const [prizes, setPrizes] = useState({});
  const [allActiveMarket, setAllActiveMarket] = useState([]);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleMarketStatusToggle = async () => {
    const newStatus = !selectedMarket.isActive;

    try {
      showLoader();
      const response = await isActiveLottery(
        { status: newStatus, marketId: selectedMarket.marketId },
        true
      );
      if (response.success) {
        toast.success(`Market is now ${newStatus ? "Active" : "Inactive"}`);
      } else {
        toast.error("Failed to update market status");
      }
    } catch (error) {
      console.error("Error activating/deactivating lottery:", error);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      showLoader();
      try {
        await handleGetAllLotteryMarket();
      } catch (error) {
        console.error("Error fetching lottery markets:", error);
      } finally {
        hideLoader();
      }
    };

    fetchData();
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (allActiveMarket.length > 0) {
      const initialPrizes = allActiveMarket.reduce((acc, market) => {
        acc[market.marketName] = {
          1: { amount: "", complementaryAmount: "", ticketNumbers: [""] },
          2: { amount: "", ticketNumbers: Array(10).fill("") },
          3: { amount: "", ticketNumbers: Array(10).fill("") },
          4: { amount: "", ticketNumbers: Array(10).fill("") },
          5: { amount: "", ticketNumbers: Array(50).fill("") },
        };
        return acc;
      }, {});
      setPrizes(initialPrizes);
    }
  }, [allActiveMarket]);

  const handleGetAllLotteryMarket = async () => {
    try {
      const allmarket = await AllActiveLotteryMarkets({
        search: debouncedSearchTerm,
      });
      setAllActiveMarket(allmarket.data);
    } catch (error) {
      console.error("Error fetching lottery markets:", error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handlePrizeChange = (time, rank, value) => {
    setPrizes((prevPrizes) => ({
      ...prevPrizes,
      [time]: {
        ...prevPrizes[time],
        [rank]: { ...prevPrizes[time][rank], amount: value },
      },
    }));
  };

  const handleTicketChange = (time, rank, index, value) => {
    setPrizes((prevPrizes) => {
      const updatedTickets = [...(prevPrizes[time][rank]?.ticketNumbers || [])];
      updatedTickets[index] = value;
      return {
        ...prevPrizes,
        [time]: {
          ...prevPrizes[time],
          [rank]: {
            ...prevPrizes[time][rank],
            ticketNumbers: updatedTickets,
          },
        },
      };
    });
  };

  const handleComplementaryChange = (time, rank, value) => {
    setPrizes((prevPrizes) => ({
      ...prevPrizes,
      [time]: {
        ...prevPrizes[time],
        [rank]: { ...prevPrizes[time][rank], complementaryAmount: value },
      },
    }));
  };

  const submitPrizes = async (time, id) => {
    const validationErrors = validateAllInputs({ [time]: prizes[time] });
    if (Object.keys(validationErrors).length > 0) {
      setErrors((prevErrors) => ({ ...prevErrors, ...validationErrors }));
      return;
    }

    const timeData = prizes[time];
    const resultArray = [];

    for (let rank in timeData) {
      const { amount, complementaryAmount, ticketNumbers } = timeData[rank];
      if (amount) {
        const prizeCategory =
          rank === "1"
            ? "First Prize"
            : rank === "2"
            ? "Second Prize"
            : rank === "3"
            ? "Third Prize"
            : rank === "4"
            ? "Fourth Prize"
            : "Fifth Prize";

        const validTickets = ticketNumbers
          .map((ticket) => ticket.trim())
          .filter((ticket) => ticket !== "");

        if (validTickets.length > 0) {
          const requestBody = {
            prizeCategory,
            prizeAmount: parseFloat(amount) || 0,
            ticketNumber: validTickets,
          };

          if (rank === "1" && complementaryAmount) {
            requestBody.complementaryPrize =
              parseFloat(complementaryAmount) || 0;
          }

          resultArray.push(requestBody);
        }
      }
    }

    try {
      const response = await CustomWining({ resultArray, marketId: id });
      console.log("API call successful:", response);
      await handleGetAllLotteryMarket();
    } catch (error) {
      console.error("API call failed:", error);
    }
  };

  const prizeData = {
    1: { rank: "1st", description: "Top prize for the winner" },
    2: { rank: "2nd", description: "Prize for 10 winners" },
    3: { rank: "3rd", description: "Prize for 10 winners" },
    4: { rank: "4th", description: "Prize for 10 winners" },
    5: { rank: "5th", description: "Prize for 50 winners" },
  };

  return (
    <div
      className="container-fluid d-flex flex-column align-items-center"
      style={{
        backgroundColor: "#f4f9fd",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div
        className="text-center w-100"
        style={{
          backgroundColor: "#e6f7ff",
          padding: "20px 0",
          borderBottom: "3px solid #4682B4",
          borderBottomLeftRadius: "15px",
          borderBottomRightRadius: "15px",
          marginBottom: "20px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="search-bar-container-win d-flex justify-content-center mb-2">
          <input
            type="text"
            className="form-control w-80"
            placeholder="Search for Win Lottery market..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div
        className="border border-3 rounded-4 shadow-lg p-4"
        style={{ width: "90%", maxWidth: "1000px", backgroundColor: "#ffffff" }}
      >
        {allActiveMarket.length > 0 ? (
          <div>
            {allActiveMarket.map((data, index) => (
              <div
                key={index}
                className="mb-4 p-3 rounded-3 shadow-sm"
                style={{ backgroundColor: "#e6f7ff" }}
              >
                <h4 style={{ color: "#007bb5", fontWeight: "bold" }}>
                  {data.marketName}
                </h4>

                <Accordion defaultActiveKey="0">
                  {Object.entries(prizeData).map(
                    ([key, { rank, description }]) => (
                      <Accordion.Item eventKey={key} key={key}>
                        <Accordion.Header>
                          {rank} Prize - {description}
                        </Accordion.Header>
                        <Accordion.Body>
                          {/* For the 1st Prize, include ticket number input */}
                          {key === "1" && (
                            <div>
                              <Form.Label
                                style={{ color: "#555", fontSize: "0.9rem" }}
                              >
                                Enter Ticket Number:
                              </Form.Label>
                              <Form.Control
                                type="text"
                                value={
                                  prizes[data.marketName]?.[key]
                                    ?.ticketNumbers[0] || ""
                                }
                                onChange={(e) =>
                                  handleTicketChange(
                                    data.marketName,
                                    key,
                                    0,
                                    e.target.value
                                  )
                                }
                                placeholder="Enter ticket number"
                                style={{
                                  borderRadius: "8px",
                                  fontSize: "0.95rem",
                                  marginBottom: "15px",
                                }}
                              />
                              {errors[data.marketName]?.[key]
                                ?.ticketNumber0 && (
                                <small className="text-danger">
                                  {errors[data.marketName][key].ticketNumber0}
                                </small>
                              )}

                              <Form.Label
                                style={{ color: "#555", fontSize: "0.9rem" }}
                              >
                                Enter Complementary Amount:
                              </Form.Label>
                              <Form.Control
                                type="text"
                                value={
                                  prizes[data.marketName]?.[key]
                                    ?.complementaryAmount || ""
                                }
                                onChange={(e) =>
                                  handleComplementaryChange(
                                    data.marketName,
                                    key,
                                    e.target.value
                                  )
                                }
                                placeholder="Enter complementary amount"
                                style={{
                                  borderRadius: "8px",
                                  fontSize: "0.95rem",
                                  marginBottom: "15px",
                                }}
                              />
                              {errors[data.marketName]?.[key]
                                ?.complementaryAmount && (
                                <small className="text-danger">
                                  {
                                    errors[data.marketName][key]
                                      .complementaryAmount
                                  }
                                </small>
                              )}
                            </div>
                          )}

                          {/* Prize Amount Input */}
                          <Form.Label
                            style={{ color: "#555", fontSize: "0.9rem" }}
                          >
                            Enter Prize Amount:
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={prizes[data.marketName]?.[key]?.amount || ""}
                            onChange={(e) =>
                              handlePrizeChange(
                                data.marketName,
                                key,
                                e.target.value
                              )
                            }
                            placeholder="Enter amount"
                            style={{
                              borderRadius: "8px",
                              fontSize: "0.95rem",
                              marginBottom: "15px",
                            }}
                          />
                          {errors[data.marketName]?.[key]?.amount && (
                            <small className="text-danger">
                              {errors[data.marketName][key].amount}
                            </small>
                          )}

                          {/* Ticket Numbers Input for other prizes */}
                          {key !== "1" && (
                            <div>
                              <Form.Label
                                style={{ color: "#555", fontSize: "0.9rem" }}
                              >
                                Enter Ticket Numbers (
                                {prizeData[key].description}):
                              </Form.Label>
                              <div className="d-flex flex-wrap gap-2 mt-1">
                                {(
                                  prizes[data.marketName]?.[key]
                                    ?.ticketNumbers || []
                                ).map((ticket, idx) => (
                                  <Form.Group
                                    key={idx}
                                    style={{
                                      width: "calc(20% - 10px)", // Same width as before
                                    }}
                                  >
                                    <Form.Control
                                      type="text"
                                      value={ticket}
                                      onChange={(e) =>
                                        handleTicketChange(
                                          data.marketName,
                                          key,
                                          idx,
                                          e.target.value,
                                          prizeData[key].rank
                                        )
                                      }
                                      placeholder={`Ticket ${idx + 1}`}
                                      style={{
                                        borderRadius: "8px",
                                        fontSize: "0.85rem",
                                      }}
                                    />
                                    {errors[data.marketName]?.[key]?.[
                                      `ticketNumber${idx}`
                                    ] && (
                                      <small className="text-danger">
                                        {
                                          errors[data.marketName][key][
                                            `ticketNumber${idx}`
                                          ]
                                        }
                                      </small>
                                    )}
                                  </Form.Group>
                                ))}
                              </div>
                            </div>
                          )}
                        </Accordion.Body>
                      </Accordion.Item>
                    )
                  )}
                </Accordion>

                <div className="text-center mt-3">
                  <Button
                    variant="primary"
                    onClick={() => submitPrizes(data.marketName, data.marketId)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      fontSize: "1rem",
                    }}
                  >
                    Submit Prizes for {data.marketName}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="container-fluid d-flex justify-content-center">
            {!isLoading && <div>No draw times available.</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Win;
