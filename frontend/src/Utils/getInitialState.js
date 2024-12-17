import { formatISO } from 'date-fns'; // Import date-fns to format dates

export const getAdminInitialState = (body = {}) => {
  return {
    accessToken: body.accessToken ?? '',
    isLogin: !!body.accessToken, // Determine login status based on accessToken
    userName: body.userName ?? '',
    adminId: body.adminId ?? '',
    roles: body.role ?? [],
  };
};

export const getLotteryMarketsInitialState = (body = {}) => {
  const formatDateToFixedMilliseconds = (date) => {
    // Format the date to ISO string and ensure .000 for milliseconds
    return date.toISOString().replace(/\.\d{3}Z$/, '.000Z');
  };
  const now = new Date(); // Get current date
  const drawDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 30, 0, 0); // Set to 12:30 PM today
  const formattedDrawDate = formatDateToFixedMilliseconds(drawDate); // Format to the correct ISO string
  return {
    randomToken: body.randomToken ?? '',
    lotteryCards: body.lotteryCards ?? [],
    lotteryId: body.lotteryId ?? '',
    isModalOpen: body.isModalOpen ?? false,
    search: body.search ?? '',
    inputs: body.inputs ?? {
      name: '',
      DateTime: '',
      drawDate: formattedDrawDate, // Set the formatted drawDate
      drawTime: '', // Added drawTime
      firstPrize: '',
      sem: '',
      tickets: [],
      price: '',
    },
    showModal: body.showModal ?? false,
    showTicketModal: body.showTicketModal ?? false,
    showEditTicketModal: body.showEditTicketModal ?? false,

    // Additional fields integrated
    pagination: {
      page: body.pagination?.page ?? 1,
      limit: body.pagination?.limit ?? 10,
      totalPages: body.pagination?.totalPages ?? 0,
      totalItems: body.pagination?.totalItems ?? 0,
    },
    showDeleteModal: body.showDeleteModal ?? false,
    selectedTicketCount: body.selectedTicketCount ?? 5,
  };
};


export const getInitialValues = (body = {}) => {
  return {
    userName: "",
    password: "",
  };
};


export const getInitialLotteryValues = () => {
  return {
    sem: '',
    group: '',
    series: '',
    number: '',
  }
}

export const getInitialCreateLotteryValues = (body = {}) => {
  return {
    groupFrom: "",
    groupTo: "",
    isGroupFromPickerVisible: false,
    isGroupToPickerVisible: false,
    seriesFrom: "",
    seriesTo: "",
    isSeriesFromPickerVisible: false,
    isSeriesToPickerVisible: false,
    numberFrom: "",
    numberTo: "",
    isNumberFromPickerVisible: false,
    isNumberToPickerVisible: false,
    isSubmitted: false,
  };
};

export function getLotteryRange(body = {}) {
  return {
    group_start: null,
    group_end: null,
    series_start: "",
    series_end: "",
    number_start: "",
    number_end: "",
  };
}