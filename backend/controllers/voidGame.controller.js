import PurchaseLottery from "../models/purchase.model.js";
import TicketRange from "../models/ticketRange.model.js";
import {
  apiResponseErr,
  apiResponsePagination,
  apiResponseSuccess,
} from "../utils/response.js";
import { statusCode } from "../utils/statusCodes.js";
import { Op } from "sequelize";
import jwt from "jsonwebtoken";
import axios from "axios";
import LotteryResult from "../models/resultModel.js";
import { deleteLotteryFromFirebase } from "../utils/firebase.delete.js";

export const voidMarket = async (req, res) => {
  try {
    const token = jwt.sign(
      { role: req.user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const { marketId } = req.body;
    const market = await TicketRange.findOne({ where: { marketId } });
    if (!market) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Market Not Found",
        res
      );
    }

    await PurchaseLottery.update(
      { isVoid: true },
      { where: { marketId } }
    );

    market.isVoid = true;
    await market.save();

    const usersByMarket = await PurchaseLottery.findAll({
      where: { marketId },
      attributes: ["marketId", "userId", "userName", "hidePurchase"],
    });

    const userIds = usersByMarket.map((user) => user.userId);

    if (userIds.length > 0) {
      const baseURL = process.env.COLOR_GAME_URL;

      const response = await axios.post(
        `${baseURL}/api/external/void-market-lottery`,
        { marketId, userId: userIds },
        { headers }
      );
    }

    await PurchaseLottery.update(
      { hidePurchase: true },
      { where: { marketId } }
    );

    await TicketRange.update({ isActive: false }, { where: { marketId } });

    await deleteLotteryFromFirebase(marketId);
    
    return apiResponseSuccess(
      usersByMarket,
      true,
      statusCode.success,
      " Balances updated successfully and market voided",
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

export const getVoidMarkets = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const offset = (parsedPage - 1) * parsedLimit;

    const whereCondition = { isVoid: true };
    if (search) {
      whereCondition.marketName = { [Op.like]: `%${search}%` };
    }

    const { rows: voidMarkets, count: totalItems } =
      await TicketRange.findAndCountAll({
        where: whereCondition,
        limit: parsedLimit,
        offset: offset,
        order: [["createdAt", "DESC"]],
      });

    if (voidMarkets.length === 0) {
      const message = search
        ? `No void markets found with the name '${search}'.`
        : "No void markets found.";
      return apiResponseSuccess([], true, statusCode.success, message, res);
    }

    const totalPages = Math.ceil(totalItems / parsedLimit);

    return apiResponsePagination(
      voidMarkets,
      true,
      statusCode.success,
      "Void markets retrieved successfully",
      {
        page: parsedPage,
        limit: parsedLimit,
        totalPages: totalPages,
        totalItems: totalItems,
      },
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

export const voidAfterWinMarket = async (req, res) => {
  try {
    const token = jwt.sign(
      { role: req.user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const { marketId } = req.body;
    const market = await TicketRange.findOne({ where: { marketId } });
    if (!market) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Market Not Found",
        res
      );
    }

    await PurchaseLottery.update(
      { isVoid: true },
      { where: { marketId } }
    );

    market.isVoid = true;
    await market.save();

    const usersByMarket = await PurchaseLottery.findAll({
      where: { marketId },
      attributes: ["marketId", "userId", "userName"],
    });

    const uniqueUserIds = [...new Set(usersByMarket.map((user) => user.userId))];

    console.log("userIds...............................",uniqueUserIds)

    if (uniqueUserIds.length > 0) {
      const baseURL = process.env.COLOR_GAME_URL;

      const response = await axios.post(
        `${baseURL}/api/external/void-afterWin-market-lottery`,
        { marketId, userId: uniqueUserIds },
       { headers }
      );
    }

    await PurchaseLottery.update(
      { hidePurchase: true },
      { where: { marketId } }
    );

    await TicketRange.update({ isActive: false }, { where: { marketId } });

    await LotteryResult.destroy({
      where: { marketId },
    });

    return apiResponseSuccess(
      usersByMarket,
      true,
      statusCode.success,
      " Balances updated successfully and market voided",
      res
    );
  } catch (error) {
    if (error.response) {
      return apiResponseErr(
        null,
        false,
        error.response.status,
        error.response.data.message || error.response.data.errMessage,
        res
      );
    } else {
      return apiResponseErr(
        null,
        false,
        statusCode.internalServerError,
        error.message,
        res
      );
    }
  }
};
