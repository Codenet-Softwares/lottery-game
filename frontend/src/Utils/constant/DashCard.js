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
      buttonLink: "/search-lottery",
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
      buttonLink: "/Market-overview" ,
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
      buttonLink: "/get-void-market" ,
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
      buttonLink: "/inactive" ,
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
      buttonLink: "/live-markets" ,
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
      buttonLink: "/trash" ,
      cardstyle: {
        borderRadius: "20px",
        backgroundColor: "rgb(11, 134, 32)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        color: "#fff",
      },
      icon: "fas fa-trash-alt", // icon for Lucky Hour
    },

    {
      name: "ResetPassword",
      description:
       "Admins can reset passwords securely to ensure safety and meet specific needs.",
      buttonName: "Reset Password",
      buttonLink: "/reset-password" ,
      cardstyle: {
        borderRadius: "20px",
        backgroundColor: "rgb(11, 134, 32)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        color: "#fff",
      },
      icon: "fas fa-key", // icon for Lucky Hour
    },
  ];
  export default DashCard;
  