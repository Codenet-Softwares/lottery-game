import PurchaseLottery from "../models/purchase.model.js";
import LotteryResult from "../models/resultModel.js";
import TicketRange from "../models/ticketRange.model.js";
import LotteryTrash from "../models/trash.model.js";
import { apiResponseErr, apiResponsePagination, apiResponseSuccess } from "../utils/response.js";
import { statusCode } from "../utils/statusCodes.js";
import axios from "axios";
import jwt from "jsonwebtoken";

export const revokeMarket = async (req, res) => {
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
    const market = await LotteryResult.findOne({ where: { marketId } });
    if (!market) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Market Not Found",
        res
      );
    }
    market.isRevoke = true;
    await market.save();

    const usersByMarket = await PurchaseLottery.findAll({
      where: { marketId },
      attributes: ["marketId", "userId", "userName"],
    });

    const baseURL = process.env.COLOR_GAME_URL;
    const response = await axios.post(
      `${baseURL}/api/external/revoke-market-lottery`,
      {
        marketId,
      },
      { headers }
    );

    await TicketRange.update({ isWin: false , winReference: false }, { where: { marketId } });
    await PurchaseLottery.update({ resultAnnouncement: false }, { where: { marketId } })
    await LotteryResult.destroy({  where: { marketId }});

    return apiResponseSuccess(
      usersByMarket,
      true,
      statusCode.success,
      " Balances updated successfully and market revoked",
      res
    );
  } catch (error) {
    if (error.response) {
      return apiResponseErr(null, false, error.response.status, error.response.data.message || error.response.data.errMessage, res);
    } else {
      return apiResponseErr(null, false, statusCode.internalServerError, error.message, res);
    }
  }
};

export const getRevokeMarkets = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const offset = (parsedPage - 1) * parsedLimit;

    const whereCondition = { isRevoke: true };
    if (search) {
      whereCondition.marketName = { [Op.like]: `%${search}%` };
    }

    const { rows: voidMarkets, count: totalItems } =
      await LotteryResult.findAndCountAll({
        where: whereCondition,
        limit: parsedLimit,
        offset: offset,
        order: [["createdAt", "DESC"]],
      });

    if (voidMarkets.length === 0) {
      const message = search
        ? `No revoke markets found with the name '${search}'.`
        : "No revoke markets found.";
      return apiResponseErr([], true, statusCode.badRequest, message, res);
    }

    const totalPages = Math.ceil(totalItems / parsedLimit);

    return apiResponsePagination(
      voidMarkets,
      true,
      statusCode.success,
      "revoke markets retrieved successfully",
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

export const RevokeLiveMarkets = async (req, res) => {
  try {

    const token = jwt.sign(
          { role: req.user.role },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "1h" }
        );
        const headers = {
          Authorization: `Bearer ${token}`,
        };
    const { trashMarketId } = req.body;
    const revokeData = await LotteryTrash.findOne({ where: { trashMarketId } });
    if (!revokeData) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Live bet Not Found",
        res
      );
    }
    for (const market of revokeData.trashMarkets) {
      const {
        purchaseId,
        generateId,
        userId,
        userName,
        group,
        series,
        number,
        sem,
        marketName,
        marketId,
        lotteryPrice,
        price,
        resultAnnouncement,
        gameName,
        hidePurchase,
        settleTime,
        createdAt,
        updatedAt,
      } = market;

       await PurchaseLottery.create({
        purchaseId,
        generateId,
        userId,
        userName,
        group,
        series,
        number,
        sem,
        marketName,
        marketId,
        lotteryPrice,
        price,
        resultAnnouncement,
        gameName,
        hidePurchase,
        settleTime,
        createdAt,
        updatedAt,
      });
    }
    
    const result = revokeData.trashMarkets.map(({ marketId, userId, lotteryPrice }) => ({
      marketId,
      userId,
      lotteryPrice,
    }));
    const baseURL = process.env.COLOR_GAME_URL;
    const response = await axios.post(
      `${baseURL}/api/external/revoke-liveBet-lottery`,
      {
        marketId: result[0]?.marketId,
        userId: result[0]?.userId,
        lotteryPrice: result[0]?.lotteryPrice,
      },
      { headers }
      
    );
    await LotteryTrash.destroy({
      where: { trashMarketId },
    });
    return apiResponseSuccess(
      revokeData,
      true,
      statusCode.success,
      "Live bet revoked successfully",
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

