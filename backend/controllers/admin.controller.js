import Admin from "../models/adminModel.js";
import {
  apiResponseErr,
  apiResponsePagination,
  apiResponseSuccess,
} from "../utils/response.js";
import { v4 as uuidv4 } from "uuid";
import { statusCode } from "../utils/statusCodes.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { TicketService } from "../constructor/ticketService.js";
import CustomError from "../utils/extendError.js";
import TicketRange from "../models/ticketRange.model.js";
import { Op, Sequelize } from "sequelize";
import UserRange from "../models/user.model.js";
import PurchaseLottery from "../models/purchase.model.js";
import LotteryResult from "../models/resultModel.js";
import bcrypt from "bcrypt";

import WinResultRequest from "../models/winresultRequestModel.js";

import { string } from "../constructor/string.js";
import { db } from "../config/firebase.js";
dotenv.config();

export const createAdmin = async (req, res) => {
  try {
    let { userName, password, role } = req.body;
    userName = userName.toLowerCase();

    const existingAdmin = await Admin.findOne({
      where: { userName: userName },
    });

    if (existingAdmin) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Admin already exist",
        res
      );
    }

    const newAdmin = await Admin.create({
      adminId: uuidv4(),
      userName,
      password,
      role,
    });

    return apiResponseSuccess(
      newAdmin,
      true,
      statusCode.create,
      "created successfully",
      res
    );
  } catch (error) {
    return apiResponseErr(
      null,
      false,
      error.responseCode ?? statusCode.internalServerError,
      error.message,
      res
    );
  }
};

export const login = async (req, res) => {
  const { userName, password } = req.body;
  try {
    const existingUser = await Admin.findOne({ where: { userName } });

    if (!existingUser) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "User does not exist",
        res
      );
    }

    if (existingUser.role !== "admin" && existingUser.role !== "subAdmin") {
      return apiResponseErr(
        null,
        false,
        statusCode.unauthorize,
        "Unauthorized access",
        res
      );
    }

    const isPasswordValid = await existingUser.validPassword(password);

    if (!isPasswordValid) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Invalid username or password",
        res
      );
    }

    if (existingUser.isReset === true && existingUser.role === "subAdmin") {
      return apiResponseSuccess(
        {
          message: "Password reset required. Please reset your password.",
          isReset: existingUser.isReset,
        },
        true,
        statusCode.success,
        "Password reset required",
        res
      );
    }

    const userResponse = {
      adminId: existingUser.adminId,
      userName: existingUser.userName,
      role: existingUser.role,
      permissions: existingUser.permissions,
    };

    const accessToken = jwt.sign(userResponse, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    existingUser.token = accessToken;
    await existingUser.save();

    return apiResponseSuccess(
      { accessToken, ...userResponse },
      true,
      statusCode.success,
      "Login successful",
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

export const subAdminResetPassword = async (req, res) => {
  try {
    const { userName, oldPassword, newPassword } = req.body;

    const existingUser = await Admin.findOne({
      where: { userName, role: "subAdmin" },
    });

    if (!existingUser) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Sub-admin not found",
        res
      );
    }

    const isPasswordMatch = await existingUser.validPassword(oldPassword);
    if (!isPasswordMatch) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Invalid old password",
        res
      );
    }

    await existingUser.update({
      password: newPassword,
      isReset: false,
    });

    return apiResponseSuccess(
      null,
      true,
      statusCode.success,
      "Password reset successfully.",
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

export const subAdminsResetPassword = async (req, res) => {
  try {
    const { userName, oldPassword, newPassword } = req.body;

    const existingUser = await Admin.findOne({ where: { userName } });

    if(!existingUser){
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Admin not Found",
        res
      );
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, existingUser.password);
    if (!isPasswordMatch) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Invalid old password.",
        res
      );
    }
    const passwordIsDuplicate = await bcrypt.compare(newPassword, existingUser.password);
    if (passwordIsDuplicate) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "New Password Cannot Be The Same As Existing Password",
        res
      );
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await existingUser.update({ password: hashedPassword, isReset: true });

    return apiResponseSuccess(
      null,
      true,
      statusCode.success,
      "Password reset successfully.",
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

export const adminSearchTickets = async ({
  group,
  series,
  number,
  sem,
  marketId,
}) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const query = {
      marketId,
      group_start: { [Op.lte]: group },
      group_end: { [Op.gte]: group },
      series_start: { [Op.lte]: series },
      series_end: { [Op.gte]: series },
      number_start: { [Op.lte]: number },
      number_end: { [Op.gte]: number },
      createdAt: { [Op.gte]: today },
    };

    const result = await TicketRange.findOne({
      where: query,
    });

    if (result) {
      const ticketService = new TicketService();

      const tickets = await ticketService.list(
        group,
        series,
        number,
        sem,
        marketId
      );
      const price = await ticketService.calculatePrice(marketId, sem);
      return { tickets, price, sem };
    } else {
      return {
        data: [],
        success: true,
        successCode: 200,
        message: "No tickets available in the given range or market.",
      };
    }
  } catch (error) {
    return new CustomError(error.message, null, statusCode.internalServerError);
  }
};

export const adminPurchaseHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const { marketId } = req.params;
    const offset = (page - 1) * parseInt(limit);
    const whereFilter = { marketId,isDeleted: false };
    if (search) {
      whereFilter[Op.or] = [
        { userName: { [Op.like]: `%${search}%` } },
        { sem: search },
      ];
    }

    const purchaseRecords = await PurchaseLottery.findAndCountAll({
      where: whereFilter,
      limit: parseInt(limit),
      offset,
    });

    if (!purchaseRecords.rows || purchaseRecords.rows.length === 0) {
      return apiResponseSuccess(
        [],
        true,
        statusCode.success,
        "No purchase history found",
        res
      );
    }

    const historyWithTickets = await Promise.all(
      purchaseRecords.rows.map(async (purchase) => {
        const userRangeQuery = {
          where: {
            generateId: purchase.generateId,
          },
        };

        const userRange = await UserRange.findOne(userRangeQuery);

        if (userRange) {
          const { group, series, number, sem: userSem } = userRange;

          const ticketService = new TicketService();

          return {
            tickets: await ticketService.list(
              group,
              series,
              number,
              userSem,
              marketId
            ),
            price: await ticketService.calculatePrice(marketId, userSem),
            userName: purchase.userName,
            sem: userRange.sem,
            marketName: purchase.marketName,
            marketId: purchase.marketId,
          };
        } else {
          return null;
        }
      })
    );

    const filteredHistoryWithTickets = historyWithTickets.filter(
      (record) => record !== null
    );

    if (filteredHistoryWithTickets.length === 0) {
      return apiResponseSuccess(
        [],
        true,
        statusCode.success,
        "No purchase history found for the given sem",
        res
      );
    }

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(purchaseRecords.count / limit),
      totalItems: purchaseRecords.count,
    };

    return apiResponsePagination(
      filteredHistoryWithTickets,
      true,
      statusCode.success,
      "Success",
      pagination,
      res
    );
  } catch (error) {
    apiResponseErr(
      error.data ?? null,
      false,
      error.responseCode ?? statusCode.internalServerError,
      error.errMessage ?? error.message,
      res
    );
  }
};

export const getResult = async (req, res) => {
  try {
    const announce = req.query.announce;

    const whereConditions = {
      prizeCategory: [
        "First Prize",
        "Second Prize",
        "Third Prize",
        "Fourth Prize",
        "Fifth Prize",
      ],
    };

    if (announce) {
      whereConditions.announceTime = announce;
    }

    const results = await LotteryResult.findAll({
      where: whereConditions,
      order: [["prizeCategory", "ASC"]],
      attributes: { include: ["createdAt"] },
    });

    const groupedResults = results.reduce((acc, result) => {
      const {
        prizeCategory,
        ticketNumber,
        prizeAmount,
        announceTime,
        createdAt,
      } = result;

      let formattedTicketNumbers = Array.isArray(ticketNumber)
        ? ticketNumber
        : [ticketNumber];

      if (prizeCategory === "Second Prize") {
        formattedTicketNumbers = formattedTicketNumbers.map((ticket) =>
          ticket.slice(-5)
        );
      } else if (
        prizeCategory === "Third Prize" ||
        prizeCategory === "Fourth Prize" ||
        prizeCategory === "Fifth Prize"
      ) {
        formattedTicketNumbers = formattedTicketNumbers.map((ticket) =>
          ticket.slice(-4)
        );
      }

      if (!acc[prizeCategory]) {
        acc[prizeCategory] = {
          prizeAmount: prizeAmount,
          ticketNumbers: formattedTicketNumbers,
          announceTime,
          date: createdAt,
        };
      } else {
        acc[prizeCategory].ticketNumbers.push(...formattedTicketNumbers);
      }

      return acc;
    }, {});

    const data = Object.entries(groupedResults).map(
      ([prizeCategory, { prizeAmount, ticketNumbers, announceTime, date }]) => {
        let limitedTicketNumbers;

        if (prizeCategory === "First Prize") {
          limitedTicketNumbers = ticketNumbers.slice(0, 1);
        } else if (
          ["Second Prize", "Third Prize", "Fourth Prize"].includes(
            prizeCategory
          )
        ) {
          limitedTicketNumbers = ticketNumbers.slice(0, 10);
        } else if (prizeCategory === "Fifth Prize") {
          limitedTicketNumbers = ticketNumbers.slice(0, 50);
        }

        while (
          limitedTicketNumbers.length < 10 &&
          prizeCategory !== "First Prize"
        ) {
          limitedTicketNumbers.push(
            limitedTicketNumbers[limitedTicketNumbers.length - 1]
          );
        }

        return {
          prizeCategory,
          prizeAmount,
          announceTime,
          date,
          ticketNumbers: [...new Set(limitedTicketNumbers)],
        };
      }
    );

    return apiResponseSuccess(
      data,
      true,
      statusCode.success,
      "Prize results retrieved successfully.",
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

export const getTicketNumbersByMarket = async (req, res) => {
  try {
    const { marketId } = req.params;

    const purchasedTickets = await PurchaseLottery.findAll({
      where: { marketId: marketId,isDeleted:false },
      attributes: [
        "generateId",
        "userId",
        "userName",
        "group",
        "series",
        "number",
        "sem",
        "marketName",
      ],
    });

    if (purchasedTickets.length === 0) {
      return apiResponseSuccess(
        [],
        true,
        statusCode.success,
        "No tickets purchased for this market",
        res
      );
    }

    const ticketsWithFullNumbers = await Promise.all(
      purchasedTickets.map(async (ticket) => {
        const ticketService = new TicketService();
        const ticketList = await ticketService.list(
          ticket.group,
          ticket.series,
          ticket.number,
          ticket.sem,
          marketId
        );

        if (!Array.isArray(ticketList)) {
          throw new Error("Invalid ticket list returned from TicketService");
        }

        const formattedTicketList = ticketList.map((ticketNumber) => {
          const [group, series, number] = ticketNumber.split(" ");
          return `${group} ${series} ${number}`;
        });

        return {
          generateId: ticket.generateId,
          userId: ticket.userId,
          userName: ticket.userName,
          sem: ticket.sem,
          marketName: ticket.marketName,
          ticketList: formattedTicketList,
        };
      })
    );

    return apiResponseSuccess(
      { tickets: ticketsWithFullNumbers },
      true,
      statusCode.success,
      "Ticket details fetched successfully",
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

export const getAllMarkets = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { search = "" } = req.query;
    const whereCondition = {
      date: {
        [Op.gte]: today,
      },
      isWin: false,
      isVoid: false,
    };
    if (search) {
      whereCondition.marketName = {
        [Op.like]: `%${search}%`,
      };
    }
    const ticketData = await TicketRange.findAll({
      attributes: ["marketId", "marketName", "isActive", "isWin", "isVoid"],
      where: whereCondition,
      order: [["createdAt", "DESC"]],
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

export const dateWiseMarkets = async (req, res) => {
  try {
    const { date } = req.query;
    let selectedDate, nextDay;
    if (date) {
      selectedDate = new Date(date);
      if (isNaN(selectedDate)) {
        return apiResponseErr(
          null,
          false,
          statusCode.badRequest,
          "Invalid date format",
          res
        );
      }
    } else {
      selectedDate = new Date();
    }

    selectedDate.setHours(0, 0, 0, 0);
    nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const ticketData = await LotteryResult.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("marketName")), "marketName"],
        "marketId",
      ],
      where: {
        createdAt: {
          [Op.gte]: selectedDate,
          [Op.lt]: nextDay,
        },
      },
      order: [["createdAt", "DESC"]],
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

export const getMarkets = async (req, res) => {
  try {
    const { date } = req.query;
    let selectedDate, nextDay;

    if (date) {
      selectedDate = new Date(date);
      if (isNaN(selectedDate)) {
        return apiResponseErr(
          null,
          false,
          statusCode.badRequest,
          "Invalid date format",
          res
        );
      }
    } else {
      selectedDate = new Date();
    }

    selectedDate.setHours(0, 0, 0, 0);

    nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const ticketData = await PurchaseLottery.findAll({
      attributes: ["marketId", "marketName"],
      where: {
        hidePurchase: false,
        isDeleted : false,
        createdAt: {
          [Op.gte]: selectedDate,
          [Op.lt]: nextDay,
        },
      },
      order: [["createdAt", "DESC"]],
    });

    console.log("ticketData",ticketData)

    if (!ticketData || ticketData.length === 0) {
      return apiResponseSuccess([], true, statusCode.success, "No data", res);
    }

    const uniqueMarkets = Array.from(
      new Map(ticketData.map((item) => [item.marketId, item])).values()
    );

    return apiResponseSuccess(
      uniqueMarkets,
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

export const getTicketRange = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ticketData = await TicketRange.findAll({
      where: {
        date: {
          [Op.gte]: today,
        },
        isVoid: false,
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

export const getInactiveMarket = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * parseInt(limit);

    const whereClause = {
      winReference: true,
    };

    if (search) {
      whereClause.marketName = { [Op.like]: `%${search}%`,};
    }

    const ticketData = await TicketRange.findAll({
      attributes: ["marketId","marketName","gameName"],
      where: whereClause,
      group: ["marketId","marketName","gameName"],
      order: [["createdAt", "DESC"]],
    });

    if (!ticketData || ticketData.length === 0) {
      return apiResponseSuccess([], true, statusCode.success, "No data", res);
    }

    const totalItems = ticketData.length;
    const totalPages = Math.ceil(totalItems / limit);

    const validPage = page > totalPages ? 1 : page;
    const validOffset = (validPage - 1) * limit;
    
    const paginatedData = ticketData.slice(validOffset, validOffset + limit);


    const pagination = {
      Page: parseInt(page),
      limit: parseInt(limit),
      totalItems,
      totalPages,
    };

    return apiResponsePagination(
      paginatedData,
      true,
      statusCode.success,
      "Success",
      pagination,
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

export const updateMarketStatus = async (req, res) => {
  try {
    const { status, marketId } = req.body;

    console.log("status......................", status);
    console.log("marketId......................", marketId);

    // Validate that status is boolean and marketId exists
    if (typeof status !== 'boolean' || !marketId) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Invalid status or marketId",
        res
      );
    }

    // Update in the TicketRange model
    const [updatedCount] = await TicketRange.update(
      {
        isActive: status,
        hideMarketUser: status,
        inactiveGame:true
      },
      { where: { marketId } }
    );

    console.log("...............", updatedCount);
    
    if (updatedCount === 0) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Market not found",
        res
      );
    }

    // Update Firestore document
    const marketRef = db.collection("lottery-db").doc(String(marketId));
    await marketRef.set(
      {
        updatedAt : new Date().toISOString(),
        inactiveGame: true
      },
      { merge: true }
    );

    return apiResponseSuccess(
      status,
      true,
      statusCode.success,
      "Market updated successfully",
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


export const inactiveMarketStatus = async (req, res) => {
  const { marketId } = req.body;

  try {
    const [updatedCount] = await TicketRange.update(
      {
        //isActive: false,
        inactiveGame: false,
      },
      { where: { marketId } }
    );
  // Update Firestore document
  const marketRef = db.collection("lottery-db").doc(String(marketId));
  await marketRef.set(
    {
      updatedAt : new Date().toISOString(),
      inactiveGame:false
    },
    { merge: true }
  );
    if (updatedCount === 0) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Market not found",
        res
      );
    } else {
      return apiResponseSuccess(
        { updatedCount },
        true,
        statusCode.success,
        "Market updated successfully",
        res
      );
    }
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

export const liveMarkets = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);


    const searchCondition = search
      ? { marketName: { [Op.like]: `%${search}%` } }
      : {};

    const activeTicketData = await TicketRange.findAll({
      attributes: ["marketId", "marketName", "gameName"],
      where: { isVoid: false },
    });
    const marketIds = activeTicketData.map((data) => data.marketId);

    const allTicketData = await PurchaseLottery.findAll({
      attributes: ["marketId", "marketName", "gameName"],
      where: {
        createdAt: { [Op.gte]: today },
        resultAnnouncement: false,
        ...searchCondition,
        marketId: marketIds,
        isDeleted : false,
      },
      order: [["createdAt", "DESC"]],
    });

    if (!allTicketData || allTicketData.length === 0) {
      return apiResponseSuccess([], true, statusCode.success, "No data", res);
    }

    const uniqueData = allTicketData.reduce((acc, current) => {
      const exists = acc.find((item) => item.marketName === current.marketName);
      if (!exists) acc.push(current);
      return acc;
    }, []);

    const totalPages = Math.ceil(uniqueData.length / limit);
    const currentPage = page > totalPages ? 1 : parseInt(page); 
    const adjustedOffset = (currentPage - 1) * limit;

    const paginatedData = uniqueData.slice(adjustedOffset, adjustedOffset + parseInt(limit));

    const pagination = {
      page: currentPage,
      limit: parseInt(limit),
      totalPages,
      totalItems: uniqueData.length,
    };

    return apiResponsePagination(
      paginatedData,
      true,
      statusCode.success,
      "Success",
      pagination,
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

export const liveLotteries = async (req, res) => {
  try {
    const { marketId } = req.params;
    const { page = 1, limit = 10, search = "" } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const offset = (page - 1) * limit;

    const whereConditions = {
      marketId,
      createdAt: { [Op.gte]: today },
      isDeleted: false,
      resultAnnouncement: false,
    };

    if (search) {
      whereConditions.userName = { [Op.like]: `%${search}%` };
    }

    const purchaseLotteries = await PurchaseLottery.findAll({
      where: whereConditions,
    });

    if (!purchaseLotteries.length) {
      return apiResponseSuccess(
        [],
        true,
        statusCode.success,
        "No bet history found",
        res
      );
    }

    const userData = {};
    for (const purchase of purchaseLotteries) {
      const {
        userName,
        lotteryPrice,
        group,
        series,
        number,
        sem,
        marketName,
        marketId,
        purchaseId,
      } = purchase;

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
      const tickets = await ticketService.list(
        group,
        series,
        number,
        sem,
        marketId
      );

      userData[userName].details.push({
        sem,
        tickets,
        purchaseId,
        lotteryPrice,
      });
    }

    const userDataArray = Object.values(userData);

    const totalItems = userDataArray.length;
    const totalPages = Math.ceil(totalItems / limit);
    const paginatedData = userDataArray.slice(offset, page * limit);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
      totalItems,
    };

    return apiResponsePagination(
      paginatedData,
      true,
      statusCode.success,
      "success",
      pagination,
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

export const resetPassword = async (req, res) => {
  const { userName, oldPassword, newPassword } = req.body;

  try {
    const admin = await Admin.findOne({ where: { userName } });

    if (!admin) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Admin with this username not found",
        res
      );
    }

    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      admin.password
    );

    if (!isOldPasswordValid) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Old password is incorrect",
        res
      );
    }

    const passwordIsDuplicate = await bcrypt.compare(
      newPassword,
      admin.password
    );
    if (passwordIsDuplicate) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "New Password Cannot Be The Same As Existing Password",
        res
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await Admin.update({ password: hashedPassword }, { where: { userName } });

    return apiResponseSuccess(
      null,
      true,
      statusCode.success,
      "Password reset successfully",
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

export const afteWinMarkets = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    let whereCondition = { isWin: true, isVoid: false };

    if (search) {
      whereCondition.marketName = { [Op.like]: `%${search}%` };
    }

    const { count, rows: marketName } = await TicketRange.findAndCountAll({
      where: whereCondition,
      attributes: ["marketId", "marketName", "gameName"],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const paginatedData = {
      page,
      limit,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
    };
    return apiResponsePagination(
      marketName,
      true,
      statusCode.success,
      "Market name fetch Successfully",
      paginatedData,
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

export const afterWinLotteries = async (req, res) => {
  try {
    const { marketId } = req.params;
    const { page = 1, limit = 10, search = "" } = req.query || {};
    const offset = (page - 1) * limit;

    const whereConditions = {
      marketId,
      resultAnnouncement: true,
      isDeleted:false,
    };

    if (search) {
      whereConditions.userName = { [Op.like]: `%${search}%` };
    }

    const purchaseLotteries = await PurchaseLottery.findAll({
      where: whereConditions,
    });

    const userData = {};

    await Promise.all(
      purchaseLotteries.map(async (lottery) => {
        const {
          userName,
          lotteryPrice,
          group,
          series,
          number,
          sem,
          marketName,
          marketId,
          purchaseId,
        } = lottery;

        const fullTicketNumber = `${group} ${series} ${number}`;
        const lastFiveDigits = number.slice(-5);
        const lastFourDigits = number.slice(-4);

        const lotteryResults = await LotteryResult.findAll({
          where: { marketId },
        });

        const winningTicket = lotteryResults.find((result) => {
          if (!Array.isArray(result.ticketNumber)) return false;

          if (result.prizeCategory === "First Prize") {
            return result.ticketNumber.some(ticket => ticket.includes(fullTicketNumber) || ticket.includes(lastFiveDigits));
          } else if (result.prizeCategory === "Second Prize") {
            return result.ticketNumber.includes(lastFiveDigits);
          } else {
            return result.ticketNumber.includes(lastFourDigits);
          }
        });

        if (winningTicket) {
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
          const tickets = await ticketService.list(
            group,
            series,
            number,
            sem,
            marketId
          );

          userData[userName].details.push({
            sem,
            tickets,
            purchaseId,
            lotteryPrice,
          });
        }
      })
    );

    const userDataArray = Object.values(userData);

    if (userDataArray.length === 0) {
      return apiResponseSuccess(
        [],
        true,
        statusCode.create,
        "No market data found!",
        res
      );
    }

    const totalItems = userDataArray.length;
    const totalPages = Math.ceil(totalItems / limit);
    const paginatedData = userDataArray.slice(offset, page * limit);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages,
      totalItems,
    };

    return apiResponsePagination(
      paginatedData,
      true,
      statusCode.create,
      "Data fetch successfully!",
      pagination,
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

export const createSubAdmin = async (req, res) => {
  try {
    const { userName, password, permissions } = req.body;

    if (!permissions) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Permission is required",
        res
      );
    }

    const existingAdmin = await Admin.findOne({ where: { userName } });
    if (existingAdmin) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Username already exist!",
        res
      );
    }

    const newSubAdmin = await Admin.create({
      adminId: uuidv4(),
      userName,
      password,
      role: string.SubAdmin,
      permissions: permissions,
    });

    return apiResponseSuccess(
      newSubAdmin,
      true,
      statusCode.create,
      "Subadmin create successfully!",
      res
    );
  } catch (error) {
    console.log("err", error);
    return apiResponseErr(
      null,
      false,
      statusCode.internalServerError,
      error.message,
      res
    );
  }
};

export const winResultMarket = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      isApproved: false,
      isReject: false,
    };

    if (search) {
      whereClause.marketName = { [Op.like]: `%${search}%` };
    }

    const { count, rows } = await WinResultRequest.findAndCountAll({
      attributes: ["marketId", "marketName"],
      where: whereClause,
      group: ["marketId", "marketId"],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      raw: true,
    });

    if (!rows || rows.length == 0) {
      return apiResponseSuccess(
        [],
        true,
        statusCode.success,
        "Data Not Found!",
        res
      );
    }

    const totalItems = count.length;
    const totalPages = Math.ceil(totalItems / limit);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      totalItems,
      totalPages,
    };

    return apiResponsePagination(
      rows,
      true,
      statusCode.create,
      "Data fetch successfully!",
      pagination,
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

export const marketWiseSubadmin = async (req, res) => {
  try {
    const { marketId } = req.params;
    const { page = 1, limit = 10, search = "" } = req.query;

    const offset = (page - 1) * limit;

    const whereCondition = {
      marketId,
      isApproved: false,
      isReject: false,
    };

    if (search) {
      whereCondition[Op.or] = [
        { adminId: { [Op.like]: `%${search}%` } },
        { declearBy: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: existingAdmin } =
      await WinResultRequest.findAndCountAll({
        attributes: ["marketId", "marketName", "adminId", "declearBy"],
        where: whereCondition,
        group: ["marketId", "marketName", "adminId", "declearBy"],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

    if (!existingAdmin || existingAdmin.length === 0) {
      return apiResponseSuccess(
        [],
        true,
        statusCode.create,
        "Data not found!",
        res
      );
    }

    const totalItems = count.length;
    const totalPages = Math.ceil(totalItems / limit);

    const marketData = existingAdmin.reduce((acc, item) => {
      let marketIndex = acc.findIndex(
        (market) => market.marketId === item.marketId
      );

      if (marketIndex === -1) {
        acc.push({
          marketId: item.marketId,
          marketName: item.marketName,
          subAdmins: [{ adminId: item.adminId, declearBy: item.declearBy }],
        });
      } else {
        acc[marketIndex].subAdmins.push({
          adminId: item.adminId,
          declearBy: item.declearBy,
        });
      }

      return acc;
    }, []);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      totalItems,
      totalPages,
    };

    return apiResponsePagination(
      marketData,
      true,
      statusCode.success,
      "Data fetch successfully!",
      pagination,
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

export const getMatchData = async (req, res) => {
  try {
    const { marketId } = req.params;
    const { type } = req.query;

    const whereCondition = { marketId, isApproved: false, isReject: false };
    if (type) whereCondition.type = type;

    const existingResults = await WinResultRequest.findAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]],
    });

    if (!existingResults || existingResults.length === 0) {
      return apiResponseErr(
        null,
        false,
        statusCode.notFound,
        "No Data found!",
        res
      );
    }

    const structuredResults = {
      marketName: existingResults[0].marketName,
      marketId: existingResults[0].marketId,
      declarers: [...new Set(existingResults.map((r) => r.declearBy))],
      matchedEnteries: [],
      UnmatchedEntries: [],
    };

    const prizeMap = new Map();

    // Group data by prizeCategory
    existingResults.forEach((result) => {
      if (!prizeMap.has(result.prizeCategory)) {
        prizeMap.set(result.prizeCategory, {
          prizeName: result.prizeCategory,
          ticketsByDeclarer: {},
          DeclaredPrizes: {},
          SubPrizes: [],
        });
      }

      const prize = prizeMap.get(result.prizeCategory);
      prize.DeclaredPrizes[result.declearBy] = result.prizeAmount;
      prize.ticketsByDeclarer[result.declearBy] = result.ticketNumber;

      if (result.complementaryPrize) {
        let subPrize = prize.SubPrizes.find(
          (sp) => sp.prizeName === "Complimentary Prize"
        );
        if (!subPrize) {
          subPrize = { prizeName: "Complimentary Prize", DeclaredPrizes: {} };
          prize.SubPrizes.push(subPrize);
        }
        subPrize.DeclaredPrizes[result.declearBy] = result.complementaryPrize;
      }
    });

    prizeMap.forEach((prize) => {
      const declarers = Object.keys(prize.ticketsByDeclarer);
      const allTickets = declarers.map(
        (declarer) => prize.ticketsByDeclarer[declarer]
      );

      const commonTickets = allTickets.reduce((a, b) =>
        a.filter((ticket) => b.includes(ticket))
      );

      const unmatchedTickets = declarers
        .map((declarer) => {
          const tickets = prize.ticketsByDeclarer[declarer];
          const notMatched = tickets.filter(
            (ticket) => !commonTickets.includes(ticket)
          );
          return { declaredBy: declarer, ticketNumber: notMatched };
        })
        .filter((entry) => entry.ticketNumber.length > 0);

      const declaredPrizeValues = Object.values(prize.DeclaredPrizes);
      const declaredPrizesMatch = declaredPrizeValues.every(
        (val) => val === declaredPrizeValues[0]
      );

      let subPrizesMatch = true;
      for (const subPrize of prize.SubPrizes) {
        const values = Object.values(subPrize.DeclaredPrizes);
        if (!values.every((val) => val === values[0])) {
          subPrizesMatch = false;
          break;
        }
      }

      const isAllMatched =
        commonTickets.length > 0 &&
        declaredPrizesMatch &&
        subPrizesMatch &&
        unmatchedTickets.length === 0;

      if (isAllMatched) {
        const matchEntry = {
          prizeName: prize.prizeName,
          Tickets: commonTickets,
          DeclaredPrizes: prize.DeclaredPrizes,
          SubPrizes: prize.SubPrizes,
        };
        structuredResults.matchedEnteries.push(matchEntry);
      } else {
        const hasUnmatchedTickets = unmatchedTickets.length > 0;
        const hasUnmatchedDeclaredPrizes = !declaredPrizesMatch;
        const hasUnmatchedSubPrizes = !subPrizesMatch;

        const unmatchedSubPrizes = hasUnmatchedSubPrizes
          ? prize.SubPrizes.map((sp) => ({
              prizeName: sp.prizeName,
              DeclaredPrizes: sp.DeclaredPrizes,
            }))
          : [];

        if (
          hasUnmatchedTickets ||
          hasUnmatchedDeclaredPrizes ||
          hasUnmatchedSubPrizes
        ) {
          structuredResults.UnmatchedEntries.push({
            prizeName: prize.prizeName,
            Tickets: hasUnmatchedTickets ? unmatchedTickets : [],
            DeclaredPrizes: hasUnmatchedDeclaredPrizes
              ? prize.DeclaredPrizes
              : null,
            SubPrizes: unmatchedSubPrizes,
          });
        }

        const partialMatchEntry = {
          prizeName: prize.prizeName,
          Tickets: commonTickets.length > 0 ? commonTickets : [],
          DeclaredPrizes: declaredPrizesMatch ? prize.DeclaredPrizes : null,
          SubPrizes: subPrizesMatch ? prize.SubPrizes : [],
        };

        if (
          partialMatchEntry.Tickets.length > 0 ||
          partialMatchEntry.DeclaredPrizes ||
          partialMatchEntry.SubPrizes.length > 0
        ) {
          structuredResults.matchedEnteries.push(partialMatchEntry);
        }
      }
    });

    return res.status(200).json({
      data: structuredResults,
      success: true,
      successCode: 200,
      message: "Data fetched successfully!",
    });
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

export const getAllSubAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const currentPage = search ? 1 : Math.max(1, parseInt(page));
    const offset = (currentPage - 1) * limit;

    const searchCondition = {
      role: string.SubAdmin,
    };

    if (search) {
      searchCondition.userName = { [Op.like]: `%${search}%` };
    }

    const { count, rows: existingAdmin } = await Admin.findAndCountAll({
      attributes: ["adminId", "userName", "role", "permissions"],
      where: searchCondition,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
      raw: true,
    });

    if (!existingAdmin || existingAdmin.length === 0) {
      return apiResponseSuccess(
        [],
        true,
        statusCode.success,
        "No data found!",
        res
      );
    }

    const totalItems = count;
    const totalPages = Math.ceil(totalItems / parseInt(limit));

    const adjustedPage = Math.min(currentPage, totalPages);

    const pagination = {
      page: adjustedPage,
      limit: parseInt(limit),
      totalPages,
      totalItems,
    };

    return apiResponsePagination(
      existingAdmin,
      true,
      statusCode.success,
      "Data fetched successfully!",
      pagination,
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

export const adminApproveReject = async (req, res) => {
  try {
    const { type } = req.body;
    const { marketId } = req.params;

    if (type === "Reject") {
      const existingTicket = await WinResultRequest.findAll({
        attributes: [
          "marketName",
          "prizeCategory",
          "prizeAmount",
          "ticketNumber",
          "complementaryPrize",
          "type",
        ],
        where: {
          marketId,
          isApproved: false,
          isReject: false,
        },
        group: [
          "marketName",
          "prizeCategory",
          "prizeAmount",
          "ticketNumber",
          "complementaryPrize",
          "type",
        ],
        order: [["createdAt", "DESC"]],
      });

      if (existingTicket.length > 0) {
        if (existingTicket[0].type === "Matched") {
          await WinResultRequest.update(
            {
              isReject: true,
              status: "Reject",
              remarks:
                "Your result has been rejected. Kindly reach out to your upline for further guidance.",
            },
            { where: { marketId, status: "Pending" } }
          );
        } else if (existingTicket[0].type === "Unmatched") {
          await WinResultRequest.update(
            {
              isReject: true,
              status: "Reject",
              remarks:
                "Oops! Your submission does not match our records. Please check the data and try again.",
            },
            { where: { marketId, status: "Pending" } }
          );
        }
      } else {
        return apiResponseSuccess(
          [],
          false,
          statusCode.error,
          "No records found for the given marketId!",
          res
        );
      }

      return apiResponseSuccess(
        [],
        false,
        statusCode.success,
        "This result is rejected!",
        res
      );
    } else if (type === "Approve") {
      const existingTicket = await WinResultRequest.findAll({
        attributes: [
          "marketName",
          "prizeCategory",
          "prizeAmount",
          "ticketNumber",
          "complementaryPrize",
        ],
        where: {
          marketId,
          type: "Matched",
          isApproved: false,
          isReject: false,
        },
        group: [
          "marketName",
          "prizeCategory",
          "prizeAmount",
          "ticketNumber",
          "complementaryPrize",
        ],
        order: [["createdAt", "DESC"]],
      });

      if (!existingTicket || existingTicket.length == 0) {
        return apiResponseSuccess(
          [],
          true,
          statusCode.badRequest,
          "Ticket not found!",
          res
        );
      }

      const formattedResults = existingTicket.map((ticket) => {
        const result = {
          prizeCategory: ticket.prizeCategory,
          prizeAmount: ticket.prizeAmount,
          ticketNumber: Array.isArray(ticket.ticketNumber)
            ? ticket.ticketNumber
            : [ticket.ticketNumber],
        };

        if (ticket.complementaryPrize && ticket.complementaryPrize !== 0) {
          result.complementaryPrize = ticket.complementaryPrize;
        }

        return result;
      });

      return apiResponseSuccess(
        formattedResults,
        true,
        statusCode.success,
        "Ticket fetch successfull!",
        res
      );
    } else {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "type should be null!",
        res
      );
    }
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

export const getSubAdminHistory = async (req, res) => {
  try {
    const adminId = req.user?.adminId;
    const { status, page = 1, pageSize = 10, search } = req.query;
    const offset = (page - 1) * pageSize;

    const whereCondition = { adminId };

    if (status) {
      whereCondition.status = status;
    }

    if (search) {
      whereCondition.marketName = { [Op.like]: `%${search}%` };
    }

    const existingResults = await WinResultRequest.findAll({
      attributes: ["marketId", "marketName", "type", "status", "remarks"],
      where: whereCondition,
      group: ["marketId", "marketName", "type", "status", "remarks"],
      order: [["createdAt", "DESC"]],
    });

    if (!existingResults || existingResults.length == 0) {
      return apiResponseSuccess(
        [],
        true,
        statusCode.success,
        "Data not found!",
        res
      );
    }

    const totalItems = existingResults.length;
    const totalPages = Math.ceil(totalItems / parseInt(pageSize));
    const paginatedData = existingResults.slice(
      offset,
      offset + parseInt(pageSize)
    );

    const pagination = {
      page: parseInt(page),
      limit: parseInt(pageSize),
      totalPages,
      totalItems,
    };

    return apiResponsePagination(
      paginatedData,
      true,
      statusCode.success,
      "Data fetch successfull!",
      pagination,
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

export const getSubadminResult = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    const adminId = req.user?.adminId;
    const { marketId } = req.params;

    const results = await WinResultRequest.findAll({
      attributes: [
        "ticketNumber",
        "prizeCategory",
        "prizeAmount",
        "complementaryPrize",
        "marketName",
        "marketId",
        "createdAt",
        "updatedAt",
      ],
      where: { adminId, marketId, status: "Approve" },
      group: [
        "ticketNumber",
        "prizeCategory",
        "prizeAmount",
        "complementaryPrize",
        "marketName",
        "marketId",
        "createdAt",
        "updatedAt",
      ],
      raw: true,
    });

    if (results.length === 0) {
      return apiResponseSuccess(
        [],
        true,
        statusCode.success,
        `No lottery results found.`,
        res
      );
    }

    const totalItems = results.length;
    const totalPages = Math.ceil(totalItems / parseInt(pageSize));
    const paginatedData = results.slice(offset, offset + parseInt(pageSize));

    const pagination = {
      page: parseInt(page),
      limit: parseInt(pageSize),
      totalPages,
      totalItems,
    };

    return apiResponsePagination(
      paginatedData,
      true,
      statusCode.success,
      "Lottery results fetched successfully.",
      pagination,
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

export const subAdmindateWiseMarkets = async (req, res) => {
  try {
    const { date } = req.query;
    const adminId = req.user?.adminId;
    let selectedDate, nextDay;
    if (date) {
      selectedDate = new Date(date);
      if (isNaN(selectedDate)) {
        return apiResponseErr(
          null,
          false,
          statusCode.badRequest,
          "Invalid date format",
          res
        );
      }
    } else {
      selectedDate = new Date();
    }

    selectedDate.setHours(0, 0, 0, 0);
    nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const ticketData = await WinResultRequest.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("marketName")), "marketName"],
        "marketId",
      ],
      where: {
        adminId,
        status: "Approve",
        createdAt: {
          [Op.gte]: selectedDate,
          [Op.lt]: nextDay,
        },
      },
      order: [["createdAt", "DESC"]],
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

export const subAdminResultStatus = async (req, res) => {
  try {
    const { marketId } = req.params;
    const adminId = req.user?.adminId;
    const status = req.query.status;

    if (!marketId || !adminId) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Market ID and Admin ID are required.",
        res
      );
    }

    const existingData = await WinResultRequest.findAll({
      where: { marketId, adminId },
    });

    if (!existingData || existingData.length == 0) {
      return apiResponseSuccess(
        [],
        true,
        statusCode.success,
        "No Data found!",
        res
      );
    }

    if (status === "Pending" || status === "Approve") {
      const existingResults = await WinResultRequest.findAll({
        where: { marketId, status },
        order: [["createdAt", "DESC"]],
      });

      if (!existingResults || existingResults.length === 0) {
        return apiResponseSuccess(
          [],
          true,
          statusCode.success,
          "No Data found!",
          res
        );
      }

      const structuredResults = {
        marketName: existingResults[0].marketName,
        marketId: existingResults[0].marketId,
        adminId: [...new Set(existingResults.map((r) => r.adminId))],
        declearBy: [...new Set(existingResults.map((r) => r.declearBy))],
        matchedEnteries: [],
        UnmatchedEntries: [],
      };

      const prizeMap = new Map();

      // Group data by prizeCategory
      existingResults.forEach((result) => {
        if (!prizeMap.has(result.prizeCategory)) {
          prizeMap.set(result.prizeCategory, {
            prizeName: result.prizeCategory,
            ticketsByDeclarer: {},
            DeclaredPrizes: {},
            SubPrizes: [],
          });
        }

        const prize = prizeMap.get(result.prizeCategory);
        prize.DeclaredPrizes[result.declearBy] = result.prizeAmount;

        // Ensure ticketNumber is an array
        const ticketArray = Array.isArray(result.ticketNumber)
          ? result.ticketNumber
          : [result.ticketNumber];

        if (!prize.ticketsByDeclarer[result.declearBy]) {
          prize.ticketsByDeclarer[result.declearBy] = [];
        }
        prize.ticketsByDeclarer[result.declearBy].push(...ticketArray);

        if (result.complementaryPrize) {
          let subPrize = prize.SubPrizes.find(
            (sp) => sp.prizeName === "Complimentary Prize"
          );
          if (!subPrize) {
            subPrize = { prizeName: "Complimentary Prize", DeclaredPrizes: {} };
            prize.SubPrizes.push(subPrize);
          }
          subPrize.DeclaredPrizes[result.declearBy] = result.complementaryPrize;
        }
      });

      // Compare and structure matched and unmatched entries
      prizeMap.forEach((prize) => {
        const declarers = Object.keys(prize.ticketsByDeclarer);
        const allTicketsArrays = declarers.map(
          (declarer) => prize.ticketsByDeclarer[declarer]
        );

        const commonTickets = allTicketsArrays.reduce((a, b) =>
          a.filter((ticket) => b.includes(ticket))
        );

        const unmatchedTickets = declarers
          .map((declarer) => {
            const tickets = prize.ticketsByDeclarer[declarer];
            const notMatched = tickets.filter(
              (ticket) => !commonTickets.includes(ticket)
            );
            return { declaredBy: declarer, ticketNumber: notMatched };
          })
          .filter((entry) => entry.ticketNumber.length > 0);

        const declaredPrizeValues = Object.values(prize.DeclaredPrizes);
        const declaredPrizesMatch = declaredPrizeValues.every(
          (val) => val === declaredPrizeValues[0]
        );

        let subPrizesMatch = true;
        for (const subPrize of prize.SubPrizes) {
          const values = Object.values(subPrize.DeclaredPrizes);
          if (!values.every((val) => val === values[0])) {
            subPrizesMatch = false;
            break;
          }
        }

        const isAllMatched =
          commonTickets.length > 0 &&
          declaredPrizesMatch &&
          subPrizesMatch &&
          unmatchedTickets.length === 0;

        if (isAllMatched) {
          const matchEntry = {
            prizeName: prize.prizeName,
            Tickets: commonTickets,
            DeclaredPrizes: prize.DeclaredPrizes,
            SubPrizes: prize.SubPrizes,
          };
          structuredResults.matchedEnteries.push(matchEntry);
        } else {
          const hasUnmatchedTickets = unmatchedTickets.length > 0;
          const hasUnmatchedDeclaredPrizes = !declaredPrizesMatch;
          const hasUnmatchedSubPrizes = !subPrizesMatch;

          const unmatchedSubPrizes = hasUnmatchedSubPrizes
            ? prize.SubPrizes.map((sp) => ({
                prizeName: sp.prizeName,
                DeclaredPrizes: sp.DeclaredPrizes,
              }))
            : [];

          if (
            hasUnmatchedTickets ||
            hasUnmatchedDeclaredPrizes ||
            hasUnmatchedSubPrizes
          ) {
            structuredResults.UnmatchedEntries.push({
              prizeName: prize.prizeName,
              Tickets: hasUnmatchedTickets ? unmatchedTickets : [],
              DeclaredPrizes: hasUnmatchedDeclaredPrizes
                ? prize.DeclaredPrizes
                : null,
              SubPrizes: unmatchedSubPrizes,
            });
          }

          const partialMatchEntry = {
            prizeName: prize.prizeName,
            Tickets: commonTickets.length > 0 ? commonTickets : [],
            DeclaredPrizes: declaredPrizesMatch ? prize.DeclaredPrizes : null,
            SubPrizes: subPrizesMatch ? prize.SubPrizes : [],
          };

          if (
            partialMatchEntry.Tickets.length > 0 ||
            partialMatchEntry.DeclaredPrizes ||
            partialMatchEntry.SubPrizes.length > 0
          ) {
            structuredResults.matchedEnteries.push(partialMatchEntry);
          }
        }
      });

      // FILTER RESULTS FOR SPECIFIC ADMIN
      const targetAdminId = adminId;

      // Get the related declarers for the target admin
      const declarersForTargetAdmin = [
        ...new Set(
          existingResults
            .filter((r) => r.adminId === targetAdminId)
            .map((r) => r.declearBy)
        ),
      ];

      const filteredStructuredResults = {
        ...structuredResults,
        adminId: [targetAdminId],
        declearBy: declarersForTargetAdmin,
        matchedEnteries: [],
        UnmatchedEntries: [],
      };

      // Filter matchedEnteries
      structuredResults.matchedEnteries.forEach((entry) => {
        const filteredDeclaredPrizes = entry.DeclaredPrizes
          ? Object.fromEntries(
              Object.entries(entry.DeclaredPrizes).filter(([key]) =>
                declarersForTargetAdmin.includes(key)
              )
            )
          : null;

        const filteredSubPrizes = entry.SubPrizes
          ? entry.SubPrizes.map((sp) => ({
              prizeName: sp.prizeName,
              DeclaredPrizes: Object.fromEntries(
                Object.entries(sp.DeclaredPrizes).filter(([key]) =>
                  declarersForTargetAdmin.includes(key)
                )
              ),
            })).filter((sp) => Object.keys(sp.DeclaredPrizes).length > 0)
          : [];

        if (
          (filteredDeclaredPrizes &&
            Object.keys(filteredDeclaredPrizes).length > 0) ||
          (filteredSubPrizes && filteredSubPrizes.length > 0)
        ) {
          filteredStructuredResults.matchedEnteries.push({
            prizeName: entry.prizeName,
            Tickets: entry.Tickets,
            DeclaredPrizes: filteredDeclaredPrizes,
            SubPrizes: filteredSubPrizes,
          });
        }
      });

      // Filter UnmatchedEntries
      structuredResults.UnmatchedEntries.forEach((entry) => {
        const filteredDeclaredPrizes = entry.DeclaredPrizes
          ? Object.fromEntries(
              Object.entries(entry.DeclaredPrizes).filter(([key]) =>
                declarersForTargetAdmin.includes(key)
              )
            )
          : null;

        const filteredTickets = entry.Tickets
          ? entry.Tickets.filter((t) =>
              declarersForTargetAdmin.includes(t.declaredBy)
            )
          : [];

        const filteredSubPrizes = entry.SubPrizes
          ? entry.SubPrizes.map((sp) => ({
              prizeName: sp.prizeName,
              DeclaredPrizes: Object.fromEntries(
                Object.entries(sp.DeclaredPrizes).filter(([key]) =>
                  declarersForTargetAdmin.includes(key)
                )
              ),
            })).filter((sp) => Object.keys(sp.DeclaredPrizes).length > 0)
          : [];

        if (
          (filteredTickets && filteredTickets.length > 0) ||
          (filteredDeclaredPrizes &&
            Object.keys(filteredDeclaredPrizes).length > 0) ||
          (filteredSubPrizes && filteredSubPrizes.length > 0)
        ) {
          filteredStructuredResults.UnmatchedEntries.push({
            prizeName: entry.prizeName,
            Tickets: filteredTickets,
            DeclaredPrizes: filteredDeclaredPrizes,
            SubPrizes: filteredSubPrizes,
          });
        }
      });

      return apiResponseSuccess(
        filteredStructuredResults,
        true,
        statusCode.success,
        "Comparison completed successfully.",
        res
      );
    } else if (status === "Reject") {
      const existingResults = await WinResultRequest.findAll({
        where: { marketId, status },
        order: [["createdAt", "DESC"]],
      });

      if (!existingResults || existingResults.length === 0) {
        return apiResponseSuccess(
          [],
          true,
          statusCode.success,
          "No Data found!",
          res
        );
      }

      const structuredResults = {
        marketName: existingResults[0].marketName,
        marketId: existingResults[0].marketId,
        adminId: [...new Set(existingResults.map((r) => r.adminId))],
        declearBy: [...new Set(existingResults.map((r) => r.declearBy))],
        matchedEnteries: [],
        UnmatchedEntries: [],
      };

      const prizeMap = new Map();

      // Group data by prizeCategory
      existingResults.forEach((result) => {
        if (!prizeMap.has(result.prizeCategory)) {
          prizeMap.set(result.prizeCategory, {
            prizeName: result.prizeCategory,
            ticketsByDeclarer: {},
            DeclaredPrizes: {},
            SubPrizes: [],
          });
        }

        const prize = prizeMap.get(result.prizeCategory);
        prize.DeclaredPrizes[result.declearBy] = result.prizeAmount;

        // Ensure ticketNumber is an array
        const ticketArray = Array.isArray(result.ticketNumber)
          ? result.ticketNumber
          : [result.ticketNumber];

        if (!prize.ticketsByDeclarer[result.declearBy]) {
          prize.ticketsByDeclarer[result.declearBy] = [];
        }
        prize.ticketsByDeclarer[result.declearBy].push(...ticketArray);

        if (result.complementaryPrize) {
          let subPrize = prize.SubPrizes.find(
            (sp) => sp.prizeName === "Complimentary Prize"
          );
          if (!subPrize) {
            subPrize = { prizeName: "Complimentary Prize", DeclaredPrizes: {} };
            prize.SubPrizes.push(subPrize);
          }
          subPrize.DeclaredPrizes[result.declearBy] = result.complementaryPrize;
        }
      });

      // Compare and structure matched and unmatched entries
      prizeMap.forEach((prize) => {
        const declarers = Object.keys(prize.ticketsByDeclarer);
        const allTicketsArrays = declarers.map(
          (declarer) => prize.ticketsByDeclarer[declarer]
        );

        const commonTickets = allTicketsArrays.reduce((a, b) =>
          a.filter((ticket) => b.includes(ticket))
        );

        const unmatchedTickets = declarers
          .map((declarer) => {
            const tickets = prize.ticketsByDeclarer[declarer];
            const notMatched = tickets.filter(
              (ticket) => !commonTickets.includes(ticket)
            );
            return { declaredBy: declarer, ticketNumber: notMatched };
          })
          .filter((entry) => entry.ticketNumber.length > 0);

        const declaredPrizeValues = Object.values(prize.DeclaredPrizes);
        const declaredPrizesMatch = declaredPrizeValues.every(
          (val) => val === declaredPrizeValues[0]
        );

        let subPrizesMatch = true;
        for (const subPrize of prize.SubPrizes) {
          const values = Object.values(subPrize.DeclaredPrizes);
          if (!values.every((val) => val === values[0])) {
            subPrizesMatch = false;
            break;
          }
        }

        const isAllMatched =
          commonTickets.length > 0 &&
          declaredPrizesMatch &&
          subPrizesMatch &&
          unmatchedTickets.length === 0;

        if (isAllMatched) {
          const matchEntry = {
            prizeName: prize.prizeName,
            Tickets: commonTickets,
            DeclaredPrizes: prize.DeclaredPrizes,
            SubPrizes: prize.SubPrizes,
          };
          structuredResults.matchedEnteries.push(matchEntry);
        } else {
          const hasUnmatchedTickets = unmatchedTickets.length > 0;
          const hasUnmatchedDeclaredPrizes = !declaredPrizesMatch;
          const hasUnmatchedSubPrizes = !subPrizesMatch;

          const unmatchedSubPrizes = hasUnmatchedSubPrizes
            ? prize.SubPrizes.map((sp) => ({
                prizeName: sp.prizeName,
                DeclaredPrizes: sp.DeclaredPrizes,
              }))
            : [];

          if (
            hasUnmatchedTickets ||
            hasUnmatchedDeclaredPrizes ||
            hasUnmatchedSubPrizes
          ) {
            structuredResults.UnmatchedEntries.push({
              prizeName: prize.prizeName,
              Tickets: hasUnmatchedTickets ? unmatchedTickets : [],
              DeclaredPrizes: hasUnmatchedDeclaredPrizes
                ? prize.DeclaredPrizes
                : null,
              SubPrizes: unmatchedSubPrizes,
            });
          }

          const partialMatchEntry = {
            prizeName: prize.prizeName,
            Tickets: commonTickets.length > 0 ? commonTickets : [],
            DeclaredPrizes: declaredPrizesMatch ? prize.DeclaredPrizes : null,
            SubPrizes: subPrizesMatch ? prize.SubPrizes : [],
          };

          if (
            partialMatchEntry.Tickets.length > 0 ||
            partialMatchEntry.DeclaredPrizes ||
            partialMatchEntry.SubPrizes.length > 0
          ) {
            structuredResults.matchedEnteries.push(partialMatchEntry);
          }
        }
      });

      // FILTER RESULTS FOR SPECIFIC ADMIN
      const targetAdminId = adminId;

      // Get the related declarers for the target admin
      const declarersForTargetAdmin = [
        ...new Set(
          existingResults
            .filter((r) => r.adminId === targetAdminId)
            .map((r) => r.declearBy)
        ),
      ];

      const filteredStructuredResults = {
        ...structuredResults,
        adminId: [targetAdminId],
        declearBy: declarersForTargetAdmin,
        matchedEnteries: [],
        UnmatchedEntries: [],
      };

      // Filter matchedEnteries
      structuredResults.matchedEnteries.forEach((entry) => {
        const filteredDeclaredPrizes = entry.DeclaredPrizes
          ? Object.fromEntries(
              Object.entries(entry.DeclaredPrizes).filter(([key]) =>
                declarersForTargetAdmin.includes(key)
              )
            )
          : null;

        const filteredSubPrizes = entry.SubPrizes
          ? entry.SubPrizes.map((sp) => ({
              prizeName: sp.prizeName,
              DeclaredPrizes: Object.fromEntries(
                Object.entries(sp.DeclaredPrizes).filter(([key]) =>
                  declarersForTargetAdmin.includes(key)
                )
              ),
            })).filter((sp) => Object.keys(sp.DeclaredPrizes).length > 0)
          : [];

        if (
          (filteredDeclaredPrizes &&
            Object.keys(filteredDeclaredPrizes).length > 0) ||
          (filteredSubPrizes && filteredSubPrizes.length > 0)
        ) {
          filteredStructuredResults.matchedEnteries.push({
            prizeName: entry.prizeName,
            Tickets: entry.Tickets,
            DeclaredPrizes: filteredDeclaredPrizes,
            SubPrizes: filteredSubPrizes,
          });
        }
      });

      // Filter UnmatchedEntries
      structuredResults.UnmatchedEntries.forEach((entry) => {
        const filteredDeclaredPrizes = entry.DeclaredPrizes
          ? Object.fromEntries(
              Object.entries(entry.DeclaredPrizes).filter(([key]) =>
                declarersForTargetAdmin.includes(key)
              )
            )
          : null;

        const filteredTickets = entry.Tickets
          ? entry.Tickets.filter((t) =>
              declarersForTargetAdmin.includes(t.declaredBy)
            )
          : [];

        const filteredSubPrizes = entry.SubPrizes
          ? entry.SubPrizes.map((sp) => ({
              prizeName: sp.prizeName,
              DeclaredPrizes: Object.fromEntries(
                Object.entries(sp.DeclaredPrizes).filter(([key]) =>
                  declarersForTargetAdmin.includes(key)
                )
              ),
            })).filter((sp) => Object.keys(sp.DeclaredPrizes).length > 0)
          : [];

        if (
          (filteredTickets && filteredTickets.length > 0) ||
          (filteredDeclaredPrizes &&
            Object.keys(filteredDeclaredPrizes).length > 0) ||
          (filteredSubPrizes && filteredSubPrizes.length > 0)
        ) {
          filteredStructuredResults.UnmatchedEntries.push({
            prizeName: entry.prizeName,
            Tickets: filteredTickets,
            DeclaredPrizes: filteredDeclaredPrizes,
            SubPrizes: filteredSubPrizes,
          });
        }
      });

      return apiResponseSuccess(
        filteredStructuredResults,
        true,
        statusCode.success,
        "Comparison completed successfully.",
        res
      );
    }
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
