const DashCard = [
  {
    name: "Create Lottery",
    description: "Easily create new lotteries with different timings.",
    buttonName: "Go to Create",
    buttonLink: "/lottery-markets",
    cardstyle: {
      borderRadius: "20px",
      backgroundColor: "rgb(221 125 119)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    },
    icon: "fas fa-ticket-alt", // icon for Create Lottery
  },
  {
    name: "Purchased History",
    description: "View the purchase history of all users.",
    buttonName: "View History",
    buttonLink: "/purchase-history",
    cardstyle: {
      borderRadius: "20px",
      backgroundColor: "#FF677D",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    },
    icon: "fas fa-history", // icon for Purchase History
  },
  {
    name: "Search Lottery",
    description: "Search for created lotteries quickly.",
    buttonName: "Search",
    buttonLink: "/search-lotto",
    cardstyle: {
      borderRadius: "20px",
      backgroundColor: "rgb(209 99 107)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    },
    icon: "fas fa-search", // icon for Search Lottery
  },
  {
    name: "View Results",
    description: "Check results for today and the past 3 months.",
    buttonName: "View Results",
    buttonLink: "/results",
    cardstyle: {
      borderRadius: "20px",
      backgroundColor: "#00BCD4",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    },
    icon: "fas fa-trophy", // icon for View Results
  },
  {
    name: "Authorize Win",
    description: "Authorize winning options for lotteries.",
    buttonName: "Authorize",
    buttonLink: "/win",
    cardstyle: {
      borderRadius: "20px",
      backgroundColor: "rgb(94 187 104)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    },
    icon: "fas fa-money-bill-wave", // icon for Authorize Win
  },

  {
    name: "Market Overview",
    description:
      "Create and manage multiple draw times for lotteries each day for a more dynamic experience!",
    buttonName: "Market Over View",
    buttonLink: "/Market-overview",
    cardstyle: {
      borderRadius: "20px",
      backgroundColor: "#4B9CD3",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      color: "#fff",
    },
    icon: "fas fa-chart-line nav-icon", // icon for Lucky Hour
  },
  {
    name: "Void",
    description:
      "By clicking on void, the market will be canceled and all the bets at stake would be returned to main balance!",
    buttonName: "Void",
    buttonLink: "/get-void-market",
    cardstyle: {
      borderRadius: "20px",
      backgroundColor: "rgb(207, 63, 82)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      color: "#fff",
    },
    icon: "fas fa-file-excel nav-icon", // icon for Lucky Hour
  },
  {
    name: "Revoke",
    description:
      "Revoke a market to restore its initial state with the original price when the ticket was created.",
    buttonName: "Active",
    buttonLink: "/inactive",
    cardstyle: {
      borderRadius: "20px",
      backgroundColor: "rgb(11, 134, 32)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      color: "#fff",
    },
    icon: "fas fa-ban nav-icon", // icon for Lucky Hour
  },
  {
    name: "Live Markets",
    description:
      "View user bets with detailed stats, including amounts and ticket counts, and delete individual tickets.",
    buttonName: "Live Markets",
    buttonLink: "/live-markets",
    cardstyle: {
      borderRadius: "20px",
      backgroundColor: "rgb(11, 134, 32)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      color: "#fff",
    },
    icon: "fas fa-broadcast-tower", // icon for Lucky Hour
  },
  {
    name: "Trash",
    description:
      "Access deleted tickets by market, with options to revoke or permanently delete them.",
    buttonName: "Trash",
    buttonLink: "/trash",
    cardstyle: {
      borderRadius: "20px",
      backgroundColor: "rgb(11, 134, 32)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      color: "#fff",
    },
    icon: "fas fa-trash-alt", // icon for Lucky Hour
  },

  {
    name: "Create-Subadmin",
    description:
      "create unlimited sub-Admins as possible with required permissions",
    buttonName: "Create-Subadmin",
    buttonLink: "/create-subadmin",
    cardstyle: {
      borderRadius: "20px",
      backgroundColor: "rgb(11, 134, 32)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      color: "#fff",
    },
    icon: "fas fa-user-shield", // icon for Lucky Hour
  },


  {
    name: "Prize-Approval",
    description:
      "Approve and Reject the users win data by providing permissions with details visible for each ticket",
    buttonName: "Prize-Approval",
    buttonLink: "/prize-validation",
    cardstyle: {
      borderRadius: "20px",
      backgroundColor: "rgb(11, 134, 32)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      color: "#fff",
    },
    icon: "fas fa-clipboard-check", // icon for Lucky Hour
  },
  
  {
    name: "Settled Bets",
    description:
      "Get to see each users bets marketwise even after you win the users",
    buttonName: "Settled Bets",
    buttonLink: "/bet-tracker",
    cardstyle: {
      borderRadius: "20px",
      backgroundColor: "rgb(11, 134, 32)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      color: "#fff",
    },
    icon: "fas fa-balance-scale", // icon for Lucky Hour
  },
  {
    name: "View All SubAdmin",
    description:
      "View all your created sub-Admins with a feature of resetting the password",
    buttonName: "View-All Sub-Admin",
    buttonLink: "/view-all-subadmin",
    cardstyle: {
      borderRadius: "20px",
      backgroundColor: "rgb(11, 134, 32)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      color: "#fff",
    },
    icon: "fas fa-users-cog", // icon for Lucky Hour
  },

  {
    name: "Sub-Admin Data",
    description: "Get to see the status each Approve & Reject with pending with the ticket details",
    buttonName: "unleash status",
    buttonLink: "/subAdminData",
    cardstyle: {
      borderRadius: "20px",
      backgroundColor: "rgb(11, 134, 32)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      color: "#fff",
    },
    icon: "fas fa-database", // icon for Lucky Hour
  },

  {
    name: "Sub-Admin Result",
    description: "Get to see the results in detail of each approved status markets",
    buttonName: "unleash status",
    buttonLink: "/subAdmin-win-result",
    cardstyle: {
      borderRadius: "20px",
      backgroundColor: "rgb(11, 134, 32)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      color: "#fff",
    },
    icon: "fas fa-trophy", // icon for Lucky Hour
  },
];
export default DashCard;
