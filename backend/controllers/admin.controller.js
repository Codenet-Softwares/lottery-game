import Admin from '../models/adminModel.js';
import { apiResponseErr, apiResponsePagination, apiResponseSuccess } from '../utils/response.js';
import { v4 as uuidv4 } from 'uuid';
import { statusCode } from '../utils/statusCodes.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { TicketService } from '../constructor/ticketService.js';
import CustomError from '../utils/extendError.js';
import TicketRange from '../models/ticketRange.model.js';
import { Op, Sequelize } from 'sequelize';
import UserRange from '../models/user.model.js';
import PurchaseLottery from '../models/purchase.model.js';
import LotteryResult from '../models/resultModel.js';
import bcrypt from 'bcrypt';
dotenv.config();

export const createAdmin = async (req, res) => {
  try {
    let { userName, password, role } = req.body;
    userName = userName.toLowerCase();

    const existingAdmin = await Admin.findOne({
      where: { userName: userName },
    });

    if (existingAdmin) {
      return apiResponseErr(null, false, statusCode.badRequest, 'Admin already exist', res);
    }

    const newAdmin = await Admin.create({
      adminId: uuidv4(),
      userName,
      password,
      role,
    });

    return apiResponseSuccess(newAdmin, true, statusCode.create, 'created successfully', res);
  } catch (error) {
    return apiResponseErr(null, false, error.responseCode ?? statusCode.internalServerError, error.message, res);
  }
};

export const login = async (req, res) => {
  const { userName, password } = req.body;
  try {
    const existingUser = await Admin.findOne({ where: { userName } });

    if (!existingUser) {
      return apiResponseErr(null, false, statusCode.badRequest, 'User does not exist', res);
    }

    const isPasswordValid = await existingUser.validPassword(password);

    if (!isPasswordValid) {
      return apiResponseErr(null, false, statusCode.badRequest, 'Invalid username or password', res);
    }

    const userResponse = {
      adminId: existingUser.adminId,
      userName: existingUser.userName,
      role: existingUser.role,
    };
    const accessToken = jwt.sign(userResponse, process.env.JWT_SECRET_KEY, {
      expiresIn: '1d',
    });

    return apiResponseSuccess(
      {
        accessToken,
        ...userResponse,
      },
      true,
      statusCode.success,
      'login successfully',
      res,
    );
  } catch (error) {
    apiResponseErr(null, false, statusCode.internalServerError, error.errMessage ?? error.message, res);
  }
};

export const adminSearchTickets = async ({ group, series, number, sem, marketId }) => {
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

      const tickets = await ticketService.list(group, series, number, sem, marketId);
      const price = await ticketService.calculatePrice(marketId, sem);
      return { tickets, price, sem };
    } else {
      return {
        data: [],
        success: true,
        successCode: 200,
        message: 'No tickets available in the given range or market.',
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
    const whereFilter = { marketId };
    if (search) {
      whereFilter[Op.or] = [
        { userName: { [Op.like]: `%${search}%` } },
        { sem: search }, 
      ];
    }
    

    const purchaseRecords = await PurchaseLottery.findAndCountAll({
      where: whereFilter ,
      limit: parseInt(limit),
      offset,
    });

    if (!purchaseRecords.rows || purchaseRecords.rows.length === 0) {
      return apiResponseSuccess([], true, statusCode.success, 'No purchase history found', res);
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
            marketId: purchase.marketId
          };
        } else {
          return null;
        }
      }),
    );

    const filteredHistoryWithTickets = historyWithTickets.filter((record) => record !== null);

    if (filteredHistoryWithTickets.length === 0) {
      return apiResponseSuccess([], true, statusCode.success, 'No purchase history found for the given sem', res);
    }

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(purchaseRecords.count / limit),
      totalItems: purchaseRecords.count,
    };

    return apiResponsePagination(filteredHistoryWithTickets, true, statusCode.success, 'Success', pagination, res);
  } catch (error) {
    apiResponseErr(
      error.data ?? null,
      false,
      error.responseCode ?? statusCode.internalServerError,
      error.errMessage ?? error.message,
      res
    )
  }
};


export const getResult = async (req, res) => {
  try {
    const announce = req.query.announce;

    const whereConditions = {
      prizeCategory: ['First Prize', 'Second Prize', 'Third Prize', 'Fourth Prize', 'Fifth Prize'],
    };

    if (announce) {
      whereConditions.announceTime = announce;
    }

    const results = await LotteryResult.findAll({
      where: whereConditions,
      order: [['prizeCategory', 'ASC']],
      attributes: { include: ['createdAt'] },
    });

    const groupedResults = results.reduce((acc, result) => {
      const { prizeCategory, ticketNumber, prizeAmount, announceTime, createdAt } = result;

      let formattedTicketNumbers = Array.isArray(ticketNumber) ? ticketNumber : [ticketNumber];

      if (prizeCategory === 'Second Prize') {
        formattedTicketNumbers = formattedTicketNumbers.map((ticket) => ticket.slice(-5));
      } else if (
        prizeCategory === 'Third Prize' ||
        prizeCategory === 'Fourth Prize' ||
        prizeCategory === 'Fifth Prize'
      ) {
        formattedTicketNumbers = formattedTicketNumbers.map((ticket) => ticket.slice(-4));
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

        if (prizeCategory === 'First Prize') {
          limitedTicketNumbers = ticketNumbers.slice(0, 1);
        } else if (['Second Prize', 'Third Prize', 'Fourth Prize'].includes(prizeCategory)) {
          limitedTicketNumbers = ticketNumbers.slice(0, 10);
        } else if (prizeCategory === 'Fifth Prize') {
          limitedTicketNumbers = ticketNumbers.slice(0, 50);
        }

        while (limitedTicketNumbers.length < 10 && prizeCategory !== 'First Prize') {
          limitedTicketNumbers.push(limitedTicketNumbers[limitedTicketNumbers.length - 1]);
        }

        return {
          prizeCategory,
          prizeAmount,
          announceTime,
          date,
          ticketNumbers: [...new Set(limitedTicketNumbers)],
        };
      },
    );

    return apiResponseSuccess(data, true, statusCode.success, 'Prize results retrieved successfully.', res);
  } catch (error) {
    return apiResponseErr(null, false, statusCode.internalServerError, error.message, res);
  }
};

export const getTicketNumbersByMarket = async (req, res) => {
  try {
    const { marketId } = req.params;

    const purchasedTickets = await PurchaseLottery.findAll({
      where: { marketId: marketId },
      attributes: ["generateId", "userId", "userName", "group", "series", "number", "sem", "marketName"],
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

        const formattedTicketList = ticketList.map(ticketNumber => {
          const [group, series, number] = ticketNumber.split(' ');
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
      where : whereCondition, order : [["createdAt", "DESC"]],
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
    let selectedDate, nextDay
    if(date){
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
    }
    else{
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
        createdAt: {
          [Op.gte]: selectedDate,
          [Op.lt]: nextDay,
        },
      },
    });

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
      return apiResponseSuccess([], true, statusCode.success, 'No data', res);
    }

    return apiResponseSuccess(ticketData, true, statusCode.success, 'Success', res);
  } catch (error) {
    return apiResponseErr(null, false, statusCode.internalServerError, error.message, res);
  }
}

export const getInactiveMarket = async (req, res) => {
  try {
    const { page = 1, limit = 10,search = "" } = req.query;
    const offset = (page - 1) * parseInt(limit);

    const whereClause = {
      winReference: true,
    };

    if (search) {
      whereClause.marketName = {
        [Sequelize.Op.like]: `%${search}%`, 
      };
    }

    const totalItems = await TicketRange.count({
      where: whereClause,
    });

    const ticketData = await TicketRange.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("marketId")), "marketId"],
        "marketName",
        "gameName"
      ],
      where:whereClause
      ,
      limit: parseInt(limit),
      offset
    });

    if (!ticketData || ticketData.length === 0) {
      return apiResponseSuccess([], true, statusCode.success, "No data", res);
    }

    const totalPages = Math.ceil(totalItems / parseInt(limit));

    const paginatedData = {
      currentPage: parseInt(page),
      limit: parseInt(limit),
      totalItems,
      totalPages
    };

    return apiResponsePagination(
      ticketData,
      true,
      statusCode.success,
      "Success",
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

export const updateMarketStatus = async (req, res) => {
  const { status, marketId } = req.body;

  try {
    const [updatedCount] = await TicketRange.update(
      { isActive: status, hideMarketUser: status ? true : Sequelize.col('hideMarketUser') },
      { where: { marketId } }
    );

    if (updatedCount === 0) {
      return apiResponseErr(
        updatedCount,
        false,
        statusCode.badRequest,
        "Market not found",
        res
      );
    } else {
      return apiResponseErr(
        updatedCount,
        true,
        statusCode.success,
        "Market updated Successfully",
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

    const offset = (page - 1) * limit;

    const searchCondition = search ? { marketName: { [Op.like]: `%${search}%` } } : {};

    const activeTicketData = await TicketRange.findAll({
      attributes: ["marketId", "marketName", "gameName"],
      where: {
        isVoid: false,    
      },
    })
    const marketIds = activeTicketData.map((data) => data.marketId);
    const { count, rows: ticketData } = await PurchaseLottery.findAndCountAll({
      attributes: ["marketId", "marketName", "gameName"],
      where: {
        createdAt: {
          [Op.gte]: today,
        },
        resultAnnouncement: false,
        ...searchCondition,
        marketId:marketIds
      },
    });

    if (!ticketData || ticketData.length === 0) {
      return apiResponseSuccess([], true, statusCode.success, "No data", res);
    }

    const uniqueData = ticketData.reduce((acc, current) => {
      const exists = acc.find((item) => item.marketName === current.marketName);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    const paginatedData = uniqueData.slice(offset, offset + parseInt(limit));

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(uniqueData.length / limit),
      totalItems: uniqueData.length,
    };

    return apiResponsePagination(paginatedData, true, statusCode.success, "Success", pagination, res);
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
    const { page = 1, limit = 10, search= "" } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const offset = (page - 1) * limit;

    const whereConditions = {
      marketId,
      createdAt: { [Op.gte]: today },
      resultAnnouncement: false,
    };

    if (search) {
      whereConditions.userName = { [Op.like]: `%${search}%` };
    }

    const  purchaseLotteries  = await PurchaseLottery.findAll({
      where: whereConditions,
    });
    
    if (!purchaseLotteries.length) {
      return apiResponseSuccess([], true, statusCode.success, "No bet history found", res);
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
      const tickets = await ticketService.list(group, series, number, sem, marketId);

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
    return apiResponseErr(null, false, statusCode.internalServerError, error.message, res);
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
        'Admin with this username not found',
        res
      );
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, admin.password);

    if (!isOldPasswordValid) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        'Old password is incorrect',
        res
      );
    }

    const passwordIsDuplicate = await bcrypt.compare(newPassword, admin.password);
    if (passwordIsDuplicate) {
        return apiResponseErr(null, false, statusCode.badRequest, 'New Password Cannot Be The Same As Existing Password', res);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await Admin.update(
      { password: hashedPassword },
      { where: { userName } }
    );

    return apiResponseSuccess(
      null,
      true,
      statusCode.success,
      'Password reset successfully',
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


