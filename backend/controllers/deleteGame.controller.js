import axios from "axios";
import PurchaseLottery from "../models/purchase.model.js";
import {
  apiResponseErr,
  apiResponsePagination,
  apiResponseSuccess,
} from "../utils/response.js";
import { statusCode } from "../utils/statusCodes.js";
import {sequelize} from "../config/db.js";
import jwt from "jsonwebtoken";
import LotteryTrash from "../models/trash.model.js";
import { Op, Sequelize } from "sequelize";
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


   await PurchaseLottery.update(
      { isDeleted: true },
      { where: { purchaseId }, transaction }
    );

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
    const search = req.query.search || "";

    const whereClause = {
      isDeleted: true,
    };

    if (search) {
      whereClause.marketName = { [Op.like]: `%${search}%` };
    }

    const deletedPurchases = await PurchaseLottery.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    return apiResponseSuccess(
      deletedPurchases,
      true,
      statusCode.success,
      deletedPurchases.length
        ? "Deleted purchases fetched successfully"
        : "No deleted purchases found",
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
    const { marketId } = req.params;

    page = parseInt(page);
    pageSize = parseInt(pageSize);

    const ticketService = new TicketService();

    const whereClause = {
  marketId,
  isDeleted: true,
};

if (search) {
  whereClause.userName = {
    [Op.like]: `%${search}%`,
  };
}

const deletedPurchases = await PurchaseLottery.findAll({
  where: whereClause,
  order: [['createdAt', 'DESC']],
});


    const getData = await Promise.all(
      deletedPurchases.map(async (data) => {
        const tickets = await ticketService.list(
          data.group,
          data.series,
          data.number,
          data.sem,
          data.marketId
        );

        return {
          purchaseId: data.purchaseId, 
          marketName: data.marketName,
          marketId: data.marketId,
          sem: data.sem,
          price: data.price,
          userId: data.userId,
          userName: data.userName,
          lotteryPrice: data.lotteryPrice,
          Tickets: tickets,
        };
      })
    );

    if (getData.length === 0) {
      return apiResponseSuccess(
        [],
        true,
        statusCode.success,
        "No matching trash bets found",
        res
      );
    }

    // Pagination
    const offset = (page - 1) * pageSize;
    const totalItems = getData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const paginatedData = getData.slice(offset, offset + pageSize);

    const paginationData = {
      page,
      limit: pageSize,
      totalPages,
      totalItems,
    };

    return apiResponsePagination(
      paginatedData,
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
    const {purchaseId} = req.params
    const trashData = await PurchaseLottery.findOne({where: {purchaseId,isDeleted:true} });

    if (!trashData) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        'Trash data not found',
        res
      );
    }
    await PurchaseLottery.update(
      { isParmanentDeleted: true },
      { where: { purchaseId } }
    );
    await PurchaseLottery.destroy({ where: { purchaseId } });
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
      where: { purchaseId ,isDeleted:false},
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
        price:ticketPurchaseId.lotteryPrice
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




