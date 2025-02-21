export const initialCreateMarketFormStates = {
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