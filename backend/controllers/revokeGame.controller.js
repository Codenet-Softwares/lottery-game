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
      where: { marketId,isDeleted:false },
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
    await PurchaseLottery.update({ resultAnnouncement: false , hidePurchase: false}, { where: { marketId } })
    await LotteryResult.destroy({  where: { marketId }});

    const existingData = await TicketRange.findOne({ where: { marketId } });
    if (!existingData) {
      return apiResponseSuccess(
        [],
        true,
        statusCode.success,
        "Ticket Range Not Found",
        res
      );
    }

    const formatDateTime = (date) =>
      date.toISOString().slice(0, 19).replace("T", " ");

    // Save data to Firestore
    await db
      .collection("lottery-db")
      .doc(existingData.marketId)
      .set({
        start_time: formatDateTime(existingData.start_time),
        end_time: formatDateTime(existingData.end_time),
        marketName: existingData.marketName,
        date: formatDateTime(existingData.end_time),
        hideMarketUser: existingData.hideMarketUser,
        isActive: existingData.isActive,
        inactiveGame: existingData.inactiveGame,
      });

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
    const { purchaseId } = req.body;

    const token = jwt.sign(
      { role: req.user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const existingData = await PurchaseLottery.findOne({
      where: { purchaseId },
    });

    if (!existingData) {
      return apiResponseSuccess(
        [],
        true,
        statusCode.success,
        "Bet Not Found!",
        res
      );
    }

    await existingData.update({ isDeleted: false });

    const baseURL = process.env.COLOR_GAME_URL;
    const response = await axios.post(
      `${baseURL}/api/external/revoke-liveBet-lottery`,
      {
        marketId: existingData.marketId,
        userId: existingData.userId,
        lotteryPrice: existingData.lotteryPrice,
      },
      { headers }
    );

    return apiResponseSuccess(
      {
        purchaseId: existingData.purchaseId,
        marketId: existingData.marketId,
        userId: existingData.userId,
        lotteryPrice: existingData.lotteryPrice,
      },
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


