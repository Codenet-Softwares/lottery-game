import { useEffect, useState, useCallback } from "react";

import {
  GetPurchaseHistoryMarketTimings,
  PurchasedTicketsHistory,
} from "../Utils/apiService";
import debounce from "lodash.debounce";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";

import { useAppContext } from "../contextApi/context";
import { initialPurchasedTicketsState } from "./getInitialState";

const usePurchasedTickets = () => {
  const [purchasedTicketState, setPurchasedTicketState] = useState(
    initialPurchasedTicketsState()
  );
  const today = format(new Date(), "yyyy-MM-dd");
  const { dispatch, showLoader, hideLoader } = useAppContext();
  const { marketId: paramMarketId } = useParams();
  const navigate = useNavigate();

  const visibleCount = 5;

  // THIS IS THE FUNCTION WHERE WHEN MODAL OPENS TO DISPLAY ALL TICKET NUMBERS WITHIN THE MODAL
  const openModalWithTickets = (ticketNumbers) => {
    setPurchasedTicketState((prev) => ({
      ...prev,
      selectedTickets: ticketNumbers,
      modalOpen: true,
    }));
  };

  // GET PURCHASED HISTORY MARKETS NAME ONLY
  useEffect(() => {
    const fetchMarkets = async () => {
      const response = await GetPurchaseHistoryMarketTimings({
        date: purchasedTicketState.selectedDate,
      });

      if (response?.success && response.data?.length) {
        const markets = response.data;
        setPurchasedTicketState((prev) => ({
          ...prev,
          markets: markets,
          selectedMarketId: markets[0].marketId, //Set new marketId based on date
        }));

        navigate(`/purchase-history/${markets[0].marketId}`, { replace: true });
      } else {
        setPurchasedTicketState((prev) => ({
          ...prev,
          markets: [],
          selectedMarketId: null,
        }));
      }
    };

    if (purchasedTicketState.selectedDate) {
      fetchMarkets();
    }
  }, [purchasedTicketState.selectedDate]);
  
  //RENDER TICKETS WITH THE MARKETNAMES SHOWN ON A PARTICULAR DATE
  useEffect(() => {
    if (purchasedTicketState.selectedMarketId) {
      fetchData();
    }
  }, [purchasedTicketState.selectedMarketId]);

  // THIS IS THE FUNCTION FOR DATE HANDLECHANGE
  const handleDateChange = (event) => {
    const newDate = event.target.value;
    const formattedDate = format(new Date(newDate), "yyyy-MM-dd");
    setPurchasedTicketState((prev) => ({
      ...prev,
      selectedDate: formattedDate,
    }));
  };

  // THIS IS THE API FROM WHERE WE GET THE DETAILS DATA FOR EACH MARKET DATA WITH PURCHASED TICKET DETAILS
  const fetchPurchasedLotteryTickets = useCallback(
    debounce(async (searchTerm) => {
      if (!purchasedTicketState.selectedMarketId) return;
      setPurchasedTicketState((prev) => ({ ...prev, loader: true }));

      const response = await PurchasedTicketsHistory({
        marketId: purchasedTicketState.selectedMarketId,
        page: purchasedTicketState.pagination.page,
        limit: purchasedTicketState.pagination.limit,
        searchBySem: searchTerm,
      });

      if (response?.success) {
        setPurchasedTicketState((prev) => ({
          ...prev,
          purchasedTickets: response.data || [],
          pagination: {
            ...prev.pagination,
            page: response?.pagination?.page || 1,
            limit: response?.pagination?.limit || 10,
            totalPages: response?.pagination?.totalPages,
            totalItems: response?.pagination?.totalItems,
          },
        }));
        dispatch({
          type: "PURCHASED_LOTTERY_TICKETS",
          payload: response.data,
        });
      } else {
        console.error("Failed to fetch purchased tickets");
      }

      setPurchasedTicketState((prev) => ({ ...prev, loader: false }));
    }, 500),
    [
      purchasedTicketState.selectedMarketId,
      purchasedTicketState.pagination.page,
      purchasedTicketState.pagination.limit,
      dispatch,
    ]
  );

  const fetchData = async () => {
    setPurchasedTicketState((prev) => ({ ...prev, loader: true }));
    showLoader();
    try {
      await fetchPurchasedLotteryTickets(purchasedTicketState.searchTerm);
    } catch (error) {
      console.error("Error fetching lottery markets:", error);
    } finally {
      hideLoader();
      setPurchasedTicketState((prev) => ({ ...prev, loader: false }));
    }
  };

  useEffect(() => {
    if (!purchasedTicketState.selectedMarketId) return;
    fetchData();
    return () => {
      fetchPurchasedLotteryTickets.cancel();
    };
  }, [
    purchasedTicketState.selectedMarketId,
    purchasedTicketState.pagination.page,
    purchasedTicketState.pagination.limit,
    purchasedTicketState.searchTerm,
    fetchPurchasedLotteryTickets,
  ]);

  const handleSearchChange = (event) => {
    setPurchasedTicketState((prev) => ({
      ...prev,
      searchTerm: event.target.value,
      pagination: { ...prev.pagination, page: 1 },
    }));
  };

  const handlePageChange = (newPage) => {
    setPurchasedTicketState((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, page: newPage },
    }));
  };

  const handleMarketClick = (marketId) => {
    setPurchasedTicketState((prev) => ({
      ...prev,
      selectedMarketId: marketId,
      pagination: { ...prev.pagination, page: 1 },
    }));
    navigate(`/purchase-history/${marketId}`);
  };

  const handleLeftClick = () => {
    setPurchasedTicketState((prev) => ({
      ...prev,
      visibleStartIndex: Math.max(0, prev.visibleStartIndex - 1),
    }));
  };

  const handleRightClick = () => {
    setPurchasedTicketState((prev) => ({
      ...prev,
      visibleStartIndex: Math.min(
        prev.visibleStartIndex + 1,
        Math.max(0, purchasedTicketState.markets.length - visibleCount)
      ),
    }));
  };

  return {
    purchasedTicketState,
    setPurchasedTicketState,
    today,
    visibleCount,
    openModalWithTickets,
    handleDateChange,
    handleSearchChange,
    handlePageChange,
    handleMarketClick,
    handleLeftClick,
    handleRightClick,
  };
};

export default usePurchasedTickets;
