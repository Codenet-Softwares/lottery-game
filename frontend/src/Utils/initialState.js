export const initialCreateMarketFormStates = {
   marketName: "",
  groupFrom: "",
  groupTo: "",
  seriesFrom: "",
  seriesTo: "",
  numberFrom: "",
  numberTo: "",
  timerFrom: "",
  timerTo: "",
  priceForEach: "",
  groupOptions: [],
  seriesOptions: [],
  numberOptions: [],
};
export const initialUpdateMarketFormStates = {
  date: "",
  marketName: "",
  groupFrom: "",
  groupTo: "",
  seriesFrom: "",
  seriesTo: "",
  numberFrom: "",
  numberTo: "",
  timerFrom: "",
  timerTo: "",
  priceForEach: "",
  groupOptions: [],
  seriesOptions: [],
  numberOptions: [],
};
export const getAdminResetPasswordInitialState = (body = {}) => {
  return {
    userName: body.userName || "",
    oldPassword: body.oldPassword || "",
    newPassword: body.newPassword || "",
    confirmPassword: body.confirmPassword || "",
  };
};

export const getSubAdminResetPasswordInitialState = (body = {}) => {
  return {
    userName: body.userName || "",  // Required in payload but not shown in UI
    oldPassword: body.oldPassword || "",  // Required in payload but not shown in UI
    newPassword: "",  // Shown in UI
    confirmPassword: "",  // Shown in UI
  };
};


export function getLiveBetMarket(body = {}) {
  return {
    data: [],
    totalPages: 0,
    totalData: 0,
    currentPage: 1,
    itemPerPage: 10,
    searchItem: "",
    selectedMarketId: ""
  };
}
