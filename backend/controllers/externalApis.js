import { Op } from "sequelize";
import { TicketService } from "../constructor/ticketService.js";
import PurchaseLottery from "../models/purchase.model.js";
import {
  apiResponseErr,
  apiResponsePagination,
  apiResponseSuccess,
} from "../utils/response.js";
import { statusCode } from "../utils/statusCodes.js";

export const getLotteryBetHistory = async (req, res) => {
  try {
    const { userId, userName } = req.body;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * pageSize;
    const { dataType } = req.query;

    let startDate, endDate;

    if (dataType === "live") {
      const today = new Date();
      startDate = new Date(today).setHours(0, 0, 0, 0);
      endDate = new Date(today).setHours(23, 59, 59, 999);
    } else if (dataType === "olddata") {
      if (req.query.startDate && req.query.endDate) {
        startDate = new Date(req.query.startDate).setHours(0, 0, 0, 0);
        endDate = new Date(req.query.endDate).setHours(23, 59, 59, 999);
      } else {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        startDate = new Date(oneYearAgo).setHours(0, 0, 0, 0);
        endDate = new Date().setHours(23, 59, 59, 999);
      }
    } else if (dataType === "backup") {
      if (req.query.startDate && req.query.endDate) {
        startDate = new Date(req.query.startDate).setHours(0, 0, 0, 0);
        endDate = new Date(req.query.endDate).setHours(23, 59, 59, 999);
        const maxAllowedDate = new Date(startDate);
        maxAllowedDate.setMonth(maxAllowedDate.getMonth() + 3);
        if (endDate > maxAllowedDate) {
          return apiResponseErr(
            [],
            false,
            statusCode.badRequest,
            "The date range for backup data should not exceed 3 months.",
            res
          );
        }
      } else {
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 2);
        startDate = new Date(threeMonthsAgo.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
      }
    } else {
      return apiResponseSuccess(
        [],
        true,
        statusCode.success,
        "Data not found.",
        res
      );
    }

    const queryConditions = {
      createdAt: {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      },
    };
    if (userId) queryConditions.userId = userId;
    if (userName) queryConditions.userName = userName;

    const { rows: purchaseLotteries, count: totalRecords } =
      await PurchaseLottery.findAndCountAll({
        where: queryConditions,
        limit: pageSize,
        offset,
      });

    if (purchaseLotteries.length === 0) {
      return apiResponseSuccess(
        [],
        true,
        statusCode.success,
        "No bet history found",
        res
      );
    }
    const totalPages = Math.ceil(totalRecords / pageSize);
    const betHistory = await Promise.all(
      purchaseLotteries.map(async (purchase) => {
        const { group, series, number, sem, marketId } = purchase;
        const ticketService = new TicketService();

        const tickets = await ticketService.list(
          group,
          series,
          number,
          sem,
          marketId
        );

        return {
          userName: userName,
          gameName: "Lottery",
          marketName: purchase.marketName,
          marketId: purchase.marketId,
          amount: purchase.lotteryPrice,
          ticketPrice: purchase.price,
          tickets,
          sem,
        };
      })
    );

    const response = {
      page,
      limit: pageSize,
      totalPages,
      totalItems: totalRecords,
    };

    return apiResponsePagination(
      betHistory,
      true,
      statusCode.success,
      "success",
      response,
      res
    );
  } catch (error) {
    return apiResponseErr(
      null,
      false,
      statusCode.internalServerError,
      error.message,
      res
    );
  }
};

export const lotteryMarketAnalysis = async (req, res) => {
    try {
      const { marketId } = req.params;
      const { page = 1, limit = 10 } = req.query;
  
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const offset = (page - 1) * limit;
  
      const { count, rows: purchaseLotteries } = await PurchaseLottery.findAndCountAll({
        where: {
          marketId,
          createdAt: { [Op.gte]: today },
          resultAnnouncement: false,
        },
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
  
      if (!purchaseLotteries.length) {
        return apiResponseSuccess([], true, statusCode.success, "No bet history found", res);
      }
  
      const userData = {};
      for (const purchase of purchaseLotteries) {
        const { userName, lotteryPrice, group, series, number, sem, marketName, marketId } = purchase;
  
        if (!userData[userName]) {
          userData[userName] = {
            userName,
            marketName,
            marketId,
            amount: 0,
            details: [],
          };
        }
  
        userData[userName].amount += lotteryPrice;
  
        const ticketService = new TicketService();
        const tickets = await ticketService.list(group, series, number, sem, marketId);
  
        userData[userName].details.push({ sem, tickets });
      }
  
      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
      };
  
      return apiResponsePagination(
        Object.values(userData),
        true,
        statusCode.success,
        "success",
        pagination,
        res
      );
    } catch (error) {
      return apiResponseErr(null, false, statusCode.internalServerError, error.message, res);
    }
  };
  

export const getBetHistoryP_L = async (req, res) => {
  try {
    const { userId, userName, marketId } = req.body
    const queryConditions = { resultAnnouncement: true, marketId };
    if (userId) queryConditions.userId = userId;
    if (userName) queryConditions.userName = userName;

    const purchaseLotteries = await PurchaseLottery.findAll({
      where: queryConditions,
    });

    if (purchaseLotteries.length === 0) {
      return apiResponseSuccess([], true, statusCode.success, "No bet history found", res);
    }

    const betHistory = await Promise.all(
      purchaseLotteries.map(async (purchase) => {
        const { group, series, number, sem, marketId, settleTime, createdAt } = purchase;
        const ticketService = new TicketService();

        const tickets = await ticketService.list(
          group,
          series,
          number,
          sem,
          marketId
        );

        return {
          userName: purchase.userName,
          gameName: "Lottery",
          marketName: purchase.marketName,
          marketId: purchase.marketId,
          amount: purchase.lotteryPrice,
          ticketPrice: purchase.price,
          tickets,
          sem,
          placeTime: createdAt,
          settleTime: settleTime
        };
      })
    );

    return apiResponseSuccess(betHistory, true, statusCode.success, 'success', res);
  } catch (error) {
    return apiResponseErr(null, false, statusCode.internalServerError, error.message, res);
  }
};

export const getLiveMarkets = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ticketData = await PurchaseLottery.findAll({
      attributes: ["marketId", "marketName", "gameName"],
      where: {
        createdAt: {
          [Op.gte]: today,
        },
        resultAnnouncement: false,
      },
    });

    if (!ticketData || ticketData.length === 0) {
      return apiResponseSuccess([], true, statusCode.success, "No data", res);
    }

    return apiResponseSuccess(
      ticketData,
      true,
      statusCode.success,
      "Success",
      res
    );
  } catch (error) {
    return apiResponseErr(
      null,
      false,
      statusCode.internalServerError,
      error.message,
      res
    );
  }
};