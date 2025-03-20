import axios from "axios";
import PurchaseLottery from "../models/purchase.model.js";
import {
  apiResponseErr,
  apiResponsePagination,
  apiResponseSuccess,
} from "../utils/response.js";
import { statusCode } from "../utils/statusCodes.js";
import sequelize from "../config/db.js";
import { v4 as UUIDV4 } from "uuid";
import jwt from "jsonwebtoken";
import LotteryTrash from "../models/trash.model.js";
import { Sequelize } from "sequelize";
import { TicketService } from "../constructor/ticketService.js";
import LotteryResult from "../models/resultModel.js";

export const deleteliveBet = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const token = jwt.sign(
      { role: req.user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );          
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const { purchaseId } = req.body;
    const livePurchaseId = await PurchaseLottery.findOne({
      where: { purchaseId }
    });
    if (!livePurchaseId) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "PurchaseId Not Found",
        res
      );
    }
    const baseURL = process.env.COLOR_GAME_URL;

    const response = await axios.post(
      `${baseURL}/api/external/delete-liveMarket-lottery`,
      {
        marketId: livePurchaseId.marketId,
        userId: livePurchaseId.userId,
        price: livePurchaseId.lotteryPrice,
      },
      { headers }
    );

    if (!response.data.success) {
      return res.status(statusCode.badRequest).json(response.data);
    }

    await LotteryTrash.create(
      {
        trashMarkets: [livePurchaseId.dataValues],
        trashMarketId: UUIDV4(),
      },
      { transaction }
    );

    await PurchaseLottery.destroy({
      where: { purchaseId },
    });

    await transaction.commit();

    return apiResponseSuccess(
      livePurchaseId,
      true,
      statusCode.success,
      "Balances updated successfully and market Deleted",
      res
    );
  } catch (error) {
    await transaction.rollback();
    return apiResponseErr(
      null,
      false,
      statusCode.internalServerError,
      error.message,
      res
    );
  }
};

export const getTrashMarket = async (req, res) => {
  try {
    const  search  = req.query.search || "";
    const existingMarket = await LotteryTrash.findAll({
      attributes: ["trashMarkets"],
      order: [["createdAt", "DESC"]],
    });

    const allMarkets = [];
    existingMarket.forEach((record) => {
      const markets = record.trashMarkets;
      if (Array.isArray(markets)) {
        allMarkets.push(...markets);
      }
    });

    if (allMarkets.length === 0) {
      return apiResponseSuccess(
        [],
        true,
        statusCode.success,
        "No markets found",
        res
      );
    }

    const uniqueMarkets = [
      ...new Map(
        allMarkets.map((m) => [
          m.marketId,
          { marketId: m.marketId, marketName: m.marketName },
        ])
      ).values(),
    ];

    const filteredMarkets = search ? uniqueMarkets.filter((market) =>
        market.marketName.toLowerCase().includes(search.toLowerCase())
      ) : uniqueMarkets;

      if (filteredMarkets.length === 0) {
        return apiResponseSuccess(
          [],
          true,
          statusCode.success,
          "No matching markets found",
          res
        );
      }

    return apiResponseSuccess(
      filteredMarkets,
      true,
      statusCode.success,
      "Markets fetch successfully",
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

export const getTrashBetDetails = async (req, res) => {
  try {
    let { page = 1, pageSize = 10, search = '' } = req.query;

    page = parseInt(page);
    pageSize = parseInt(pageSize);

    const { marketId } = req.params;
    const marketData = await LotteryTrash.findAll({
      attributes: ["trashMarkets", "trashMarketId"],
      where: Sequelize.where(
        Sequelize.fn(
          "JSON_CONTAINS",
          Sequelize.col("trashMarkets"),
          JSON.stringify([{ marketId }])
        ),
        true
      ),
    });

    const ticketService = new TicketService();

    const getData = await Promise.all(
      marketData
        .map((item) => {
          const trashMarkets = item.trashMarkets;

          const parsedMarkets = Array.isArray(trashMarkets)
            ? trashMarkets
            : JSON.parse(trashMarkets);

          return parsedMarkets
            .filter((data) => data.marketId === marketId)
            .map(async (data) => {
              const tickets = await ticketService.list(
                data.group,
                data.series,
                data.number,
                data.sem,
                marketId
              );

              return {
                trashMarketId: item.trashMarketId,
                marketName: data.marketName,
                marketId: data.marketId,
                sem: data.sem,
                price: data.price,
                userId: data.userId,
                userName: data.userName,
                lotteryPrice: data.lotteryPrice,
                Tickets: tickets,
              };
            });
        })
        .flat()
    );

    const resolvedData = await Promise.all(getData);
    const filteredData = resolvedData.filter((data) =>
      data.userName.toLowerCase().includes(search.toLowerCase())
    );

    if (filteredData.length === 0) {
      return apiResponseSuccess(
        [],
        true,
        statusCode.success,
        "No matching markets found",
        res
      );
    }

    const offset = (page - 1) * pageSize;
    const totalItems = resolvedData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const getAllMarkets = filteredData.slice(offset, offset + pageSize);

    const paginationData = {
      page,
      limit: pageSize,
      totalPages,
      totalItems,
    };

    return apiResponsePagination(
      getAllMarkets,
      true,
      statusCode.success,
      "Trash bet details fetched successfully!",
      paginationData,
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


export const deleteTrash = async (req, res) => {
  try {
    const {trashMarketId} = req.params
    const trashData = await LotteryTrash.findOne({where: {trashMarketId} });

    if (!trashData) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        'Trash data not found',
        res
      );
    }
    await LotteryTrash.destroy({ where: { trashMarketId } });
    return apiResponseSuccess(null, true, statusCode.success, 'Trash data deleted successfully', res)

  } catch (error) {
    return apiResponseErr(
      null,
      false,
      statusCode.internalServerError,
      error.message,
      res
    );
  }
}

export const deleteBetAfterWin = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    // Generate JWT token
    const token = jwt.sign(
      { role: req.user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const { purchaseId } = req.body;

    const ticketPurchaseId = await PurchaseLottery.findOne({
      where: { purchaseId },
    });

    if (!ticketPurchaseId) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "PurchaseId Not Found",
        res
      );
    }

    const fullTicketNumber = `${ticketPurchaseId.group.toString().padStart(2, '0')} ${ticketPurchaseId.series} ${ticketPurchaseId.number}`;
    const lastFiveDigits = ticketPurchaseId.number?.slice(-5) || '';
    const lastFourDigits = ticketPurchaseId.number?.slice(-4) || '';

    //  Fetch lottery results
    const lotteryResults = await LotteryResult.findAll({
      where: { marketId: ticketPurchaseId.marketId },
    });

    if (!lotteryResults || lotteryResults.length === 0) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "No lottery results found for the provided marketId",
        res
      );
    }

    let comPrize = null;
    const winningTicket = lotteryResults.find((result) => {
      if (!Array.isArray(result.ticketNumber)) return false;

      if (result.prizeCategory === "First Prize") {
        if (result.ticketNumber.includes(fullTicketNumber)) {
          console.log("First Prize matched");
          return res;
        }

        else if (result.ticketNumber.some(ticket => ticket.slice(-5) === lastFiveDigits) ) {
          console.log(" Last 5 digits matched for complementary prize");
          comPrize = result.complementaryPrize;
        }
      }
      if (result.prizeCategory === "Second Prize") {
        return result.ticketNumber.includes(lastFiveDigits);
      } else {
        return result.ticketNumber.includes(lastFourDigits);
      }
    });

    if (!winningTicket && !comPrize) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "No winning ticket found",
        res
      );
    }

    const baseURL = process.env.COLOR_GAME_URL;

    const response = await axios.post(
      `${baseURL}/api/external/delete-bet-afterWin-lottery`,
      {
        marketId: ticketPurchaseId.marketId,
        userId: ticketPurchaseId.userId,
        sem: ticketPurchaseId.sem,
        prizeAmount: winningTicket?.prizeAmount || 0, 
        prizeCategory: winningTicket?.prizeCategory || '',
        complementaryPrize: comPrize || 0,
      },
      { headers }
    );

    await PurchaseLottery.destroy({
      where: { purchaseId },
    });

    await transaction.commit();

    return apiResponseSuccess(
      ticketPurchaseId,
      true,
      statusCode.success,
      "Bet deleted successfully and balances updated",
      res
    );
  } catch (error) {
    await transaction.rollback();

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




