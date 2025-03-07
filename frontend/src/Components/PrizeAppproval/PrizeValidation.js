import React, { useEffect, useState } from "react";
import "./PrizeValidation.css";
import ReusableTable from "../Reusables/ReusableTable";
import ReusableModal from "../Reusables/ReusableModal";
import {
  PrizeValidationMarkets,
  ViewSubAdminsPrizeValidationMarkets,
  ViewSubAdminsPrizeValidationMarketsCompareCheck,
  ApproveReject
} from "../../Utils/apiService";
import ComparisonTable from "./ComparisonTable";

const PrizeValidation = () => {
  const [marketData, setMarketData] = useState([]);
  const [approvalData, setApprovalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);
  console.log('LINE 21',modalContent)

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        const allMarket = await PrizeValidationMarkets({ search: "" });
        console.log(allMarket); 

        const formattedMarkets = allMarket.data.map((item, index) => ({
          id: item.marketId,
          marketName: item.marketName,
          serialNumber: index + 1,
        }));

        setMarketData(formattedMarkets);
      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  const fetchApprovalData = async (market) => {
    try {
      const response = await ViewSubAdminsPrizeValidationMarkets({}, market.id);
      console.log("Approval Data Response:", response);

      if (response?.success) {
        setApprovalData(response.data || []);
      } else {
        setApprovalData([]);
      }
      setSelectedMarket(market);
    } catch (error) {
      console.error("Error fetching approval data:", error);
    }
  };

  const fetchComparisonData = async (marketId) => {
    try {
      setLoadingModal(true);
      const response = await ViewSubAdminsPrizeValidationMarketsCompareCheck(
        {},
        marketId
      );
      console.log("Comparison Data Response:", response);

      if (response?.success) {
        setModalContent(response.data || []);
      } else {
        setModalContent([]);
      }
    } catch (error) {
      console.error("Error fetching comparison data:", error);
      setModalContent([]);
    } finally {
      setLoadingModal(false);
      setShowModal(true);
    }
  };


  const handleApproveReject = async (type) => {
    if (!selectedMarket || !modalContent?.Matched?.length) return;
  
    // Extract and format matched data
    const formattedData = modalContent.Matched.flatMap((match) =>
      match.MatchData.map(({ ticketNumber, prizeAmount, tickets }) => ({
        prizeCategory: ticketNumber,
        prizeAmount,
        ticketNumber: tickets,
      }))
    );
  
    try {
      const response = await ApproveReject(formattedData, selectedMarket.id, type);
      if (response?.success) {
        alert(`${type} successful!`);
        setShowModal(false);
      }
    } catch (error) {
      console.error(`Error during ${type}:`, error);
    }
  };
  

  const marketColumns = [
    { key: "serialNumber", label: "S.No." },
    { key: "marketName", label: "Market Name" },
    {
      key: "approveButton",
      label: "Approval List",
      render: (row) => (
        <button
          className="btn btn-primary text-uppercase fw-bold"
          onClick={() => fetchApprovalData(row)}
        >
          View Approval
        </button>
      ),
    },
  ];

  const selectedMarketApprovals = approvalData.find(
    (item) => item.marketId === selectedMarket?.id
  );

  const filteredApprovalData = selectedMarketApprovals
    ? selectedMarketApprovals.subAdmins.reduce((acc, subAdmin, index) => {
        if (index % 2 === 0) {
          acc.push({
            id: acc.length + 1,
            subAdmin1: subAdmin.declearBy,
            subAdmin2: "",
          });
        } else {
          acc[acc.length - 1].subAdmin2 = subAdmin.declearBy;
        }
        return acc;
      }, [])
    : [];

  const approvalColumns = [
    { key: "subAdmin1", label: "Sub-Admin 1" },
    { key: "subAdmin2", label: "Sub-Admin 2" },
    {
      key: "compareCheck",
      label: "Compare Check",
      render: (row) => (
        <button
          className="btn btn-info fw-bold text-uppercase"
          onClick={() => fetchComparisonData(selectedMarket?.id)}
          disabled={!row.subAdmin2} // Disable button if only one sub-admin exists
        >
          Approval Check
        </button>
      ),
    },
  ];

  return (
    <div className="prize-validation-container">
      {selectedMarket ? (
        <div className="approval-view">
          <button
            className="btn btn-secondary mb-3 text-uppercase fw-bold"
            onClick={() => setSelectedMarket(null)}
          >
            Back to Market List
          </button>
          <h3 className="text-uppercase">
            Approval List for {selectedMarket.marketName}
          </h3>
          <ReusableTable
            data={filteredApprovalData}
            columns={approvalColumns}
            itemsPerPage={5}
            showSearch={false}
            paginationVisible={false}
          />
        </div>
      ) : (
        <>
          <h2 className="prize-validation-title text-uppercase">
            Prize Approval Market List
          </h2>
          {loading ? (
            <p className="loading-text">Loading market data...</p>
          ) : (
            <ReusableTable
              data={marketData}
              columns={marketColumns}
              itemsPerPage={10}
              showSearch={false}
              paginationVisible={true}
            />
          )}
        </>
      )}
      <ReusableModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        title="Approval Check"
        body={
          <ComparisonTable
            modalContent={modalContent}
            loadingModal={loadingModal}
          />
        }
        footerButtons={[
          {
            text: "Approve",
            onClick: () => handleApproveReject("approve"),
            className: "btn btn-success",
            disabled: !modalContent?.Matched?.length,  // Disable if no Matched data
          },
          {
            text: "Reject",
            onClick: () => handleApproveReject("reject"),
            className: "btn btn-danger",
            disabled: !modalContent?.Matched?.length,  // Disable if no Matched data
          },
        ]}
      />
    </div>
  );
};

export default PrizeValidation;
