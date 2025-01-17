import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminLayout from "../Layout/AdminLayout";
import Login from "../Pages/Login/Login";
import { AppProvider } from "../../contextApi/context";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import DashBoard from "../Pages/Dashboard/dashBoard";
import NotFound from "../Common/NotFound";
import Result from "../Result/Result";
import Win from "../Win/Win";
import PurchasedTickets from "../Pages/PurchasedTickets/PurchasedTickets";
import MarketInsight from "../MarketOverview/MarketInsight";
import SearchLottery from "../Pages/SearchLotteryPage/SearchLottery";
import PrivateRoute from "../Common/privateRouting";
import CreateMarkets from "../CreateLottery/CreateMarkets";
import Void from "../Void/Void";
import Inactive from "../Pages/Inactive";
import LiveMarkets from "../LiveMarkets/LiveMarkets";
import Trash from "../Trash/Trash";
import ResetPassword from "../ResetPassword/ResetPassword";

const AppRoutes = () => {
  return (
    <AppProvider>
      <ToastContainer
        position="top-center"
        autoClose={500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<DashBoard />} />
            <Route path="/lottery-markets" element={<CreateMarkets />} />

            <Route
              path="/purchase-history/:marketId"
              element={<PurchasedTickets />}
            />

            <Route path="/purchase-history" element={<PurchasedTickets />} />
            <Route path="/results/:marketId" element={<Result />} />
            <Route path="/results" element={<Result />} />

            <Route path="/win" element={<Win />} />
            <Route path="/search-lottery" element={<SearchLottery />} />
            <Route path="/get-void-market" element={<Void />} />

            <Route path="/inactive" element={<Inactive />} />

            <Route path="/Market-overview" element={<MarketInsight />} />
            <Route path="/Live-markets" element={<LiveMarkets />} />
            <Route path="/trash" element={<Trash />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
          {/* not found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};
export default AppRoutes;
