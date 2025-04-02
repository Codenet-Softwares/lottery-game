import { useEffect, useState, useCallback } from "react";
import { LotteryRange, SearchLotteryTicket } from "../../Utils/apiService";
import { getInitialLotteryData } from "../../Utils/getInitialState";
import { generateLotteryOptions } from "../../Utils/helper";
import * as Yup from "yup";

const UseSearchData = () => {
  const [state, setState] = useState({
    lotteryData: getInitialLotteryData(),
    allMarkets: [],
    searchTerm: "",
    debouncedSearchTerm: "",
    selectedMarket: null,
    showSearch: true,
  });

  const validationSchema = Yup.object().shape({
    selectedSem: Yup.string().required("SEM is required"),
    selectedGroup: Yup.string().required("Group is required"),
    selectedSeries: Yup.string().required("Series is required"),
    selectedNumber: Yup.string().required("Number is required"),
  });

  const DROPDOWN_FIELDS = [
    { label: "SEM", stateKey: "semValues", field: "selectedSem" },
    { label: "Group", stateKey: "groups", field: "selectedGroup" },
    { label: "Series", stateKey: "series", field: "selectedSeries" },
    { label: "Number", stateKey: "numbers", field: "selectedNumber" },
  ];

  // FETCHING ALL THE MARKETNAMES INSIDE THE LEFT SIDEBAR OF THE THE SEARCH LOTTERY 
  const fetchAllMarkets = useCallback(async () => {
    const response = await LotteryRange({ search: state.debouncedSearchTerm });
    setState((prev) => ({ ...prev, allMarkets: response?.data || [] }));
  }, [state.debouncedSearchTerm]);

  const updateLotteryData = useCallback((marketData) => {
    if (!marketData) return;

    const { groupOptions, seriesOptions, numberOptions } =
      generateLotteryOptions(
        marketData.group_start,
        marketData.group_end,
        marketData.series_start,
        marketData.series_end,
        marketData.number_start,
        marketData.number_end
      );

    setState((prev) => ({
      ...prev,
      lotteryData: {
        ...prev.lotteryData,
        groups: groupOptions,
        series: seriesOptions,
        numbers: numberOptions,
        semValues: ["5", "10", "25", "50", "100", "200"],
        marketName: marketData.marketName,
        price: marketData.price,
        isSuspend: !marketData.isActive,
        endTimeForShowCountdown: marketData.end_time,
        startTimeForShowCountdown: marketData.start_time,
      },
      selectedMarket: marketData,
    }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setState((prev) => ({ ...prev, debouncedSearchTerm: prev.searchTerm }));
    }, 500);
    return () => clearTimeout(timer);
  }, [state.searchTerm]);

  useEffect(() => {
    fetchAllMarkets();
  }, [fetchAllMarkets]);

  const handleSearchChange = (event) => {
    setState((prev) => ({ ...prev, searchTerm: event.target.value }));
  };

  const handleMarketClick = useCallback(
    (market) => {
      setState((prev) => ({
        ...prev,
        showSearch: true, // Add this line to ensure form is shown
        selectedMarket: market,
      }));
      updateLotteryData(market);
    },
    [updateLotteryData]
  );

 // FETCHING EACH MARKET TICKETS  WITH RESPECT TO THE MARKETID 
  const handleSubmit = useCallback(
    async (values, { setSubmitting, resetForm }) => {
      const requestBody = {
        marketId: state.selectedMarket?.marketId,
        sem: values.selectedSem ? parseInt(values.selectedSem) : null,
        group: values.selectedGroup,
        series: values.selectedSeries,
        number: values.selectedNumber,
      };

      const response = await SearchLotteryTicket(requestBody);

      setState((prev) => ({
        ...prev,
        lotteryData: {
          ...prev.lotteryData,
          searchResult: response?.data || null,
          refreshKey: prev.lotteryData.refreshKey + 1,
        },
        showSearch: false,
      }));

      resetForm();
      setSubmitting(false);
      return response;
    },
    [state.selectedMarket]
  );

  const handleBack = () => {
    setState((prev) => ({
      ...prev,
      showSearch: true,
      lotteryData: {
        ...prev.lotteryData,
        searchResult: null,
      },
    }));
  };

  return {
    lotteryData: state.lotteryData,
    allMarkets: state.allMarkets,
    searchTerm: state.searchTerm,
    selectedMarket: state.selectedMarket,
    showSearch: state.showSearch,
    validationSchema,
    DROPDOWN_FIELDS,
    handleSearchChange,
    handleMarketClick,
    handleSubmit,
    handleBack,
  };
};

export default UseSearchData;
