import { Op, Sequelize } from 'sequelize';
import PurchaseLottery from '../models/purchase.model.js';
import LotteryResult from '../models/resultModel.js';
import { apiResponseErr, apiResponseSuccess } from '../utils/response.js';
import { statusCode } from '../utils/statusCodes.js';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import TicketRange from '../models/ticketRange.model.js';
import { TicketService } from '../constructor/ticketService.js';
import sequelize from '../config/db.js';
import WinResultRequest from '../models/winResultRequestModel.js';

export const ResultDeclare = async (req, res) => {
  try {
    const prizes = req.body;
    const { marketId } = req.params;
    const {type} = req.query;
    if(type === 'isReject'){
      await WinResultRequest.update({isReject: true},{where:{ marketId }})

      return apiResponseErr(null, false, statusCode.badRequest, 'Result is Rejected', res);
    }
    const market = await TicketRange.findOne({ where: { marketId } });

    if (!market) {
      return apiResponseErr(null, false, statusCode.badRequest, 'Market not found', res);
    }

    const marketName = market.marketName;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const prizeLimits = {
      'First Prize': 1,
      'Second Prize': 10,
      'Third Prize': 10,
      'Fourth Prize': 10,
      'Fifth Prize': 50,
    };

    const allPrizeCategories = [
      'First Prize',
      'Second Prize',
      'Third Prize',
      'Fourth Prize',
      'Fifth Prize',
    ];

    const providedCategories = prizes.map(prize => prize.prizeCategory);
    const missingCategories = allPrizeCategories.filter(
      category => !providedCategories.includes(category)
    );

    if (missingCategories.length > 0) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
       `The following prize categories are missing: ${missingCategories.join(', ')}`,
        res
      );
    }

    let generatedTickets = [];
    let lastFiveForFirstPrize = null;
    let lastFourForFirstPrize = null;
    let lastFourForSecondPrize = null;
    let lastFourForThirdPrize = null;
    let lastFourForFourthPrize = null;

    for (let prize of prizes) {
      const { ticketNumber, prizeCategory, prizeAmount, complementaryPrize } = prize;

      if (!prizeLimits[prizeCategory]) {
        return apiResponseErr(null, false, statusCode.badRequest, 'Invalid prize category.', res);
      }

      const ticketNumbers = Array.isArray(ticketNumber) ? ticketNumber : [ticketNumber];
      if (ticketNumbers.length !== prizeLimits[prizeCategory]) {
        return apiResponseErr(
          null,
          false,
          statusCode.badRequest,
          `The ${prizeCategory} requires exactly ${prizeLimits[prizeCategory]} ticket number(s).`,
          res,
        );
      }

      const allResults = await LotteryResult.findAll({
        where: {
          createdAt: {
            [Op.between]: [todayStart, todayEnd],
          },
          marketId,
        },
      });

      const isDuplicate = ticketNumbers.some(ticket =>
        allResults.some(result => result.ticketNumber.includes(ticket))
      );

      if (isDuplicate) {
        return apiResponseErr(
          null,
          false,
          statusCode.badRequest,
          'One or more ticket numbers have already been assigned a prize in another category.',
          res,
        );
      }

      const existingResults = await LotteryResult.findAll({
        where: { prizeCategory, marketId },
      });

      if (existingResults.length >= prizeLimits[prizeCategory]) {
        return apiResponseErr(
          null,
          false,
          statusCode.badRequest,
          `Cannot add more ticket numbers. ${prizeCategory} already has the required tickets.`,
          res,
        );
      }

      if (prizeCategory === 'First Prize') {
        const firstTicket = ticketNumbers[0];
        const lastFive = firstTicket.slice(-5);
        const lastFour = firstTicket.slice(-4);
        lastFiveForFirstPrize = lastFive;
        lastFourForFirstPrize = lastFour;
        generatedTickets.push({
          resultId: uuidv4(),
          marketId,
          ticketNumber: ticketNumbers,
          marketName,
          prizeCategory,
          prizeAmount,
          complementaryPrize,
        });
      }

      if (prizeCategory === 'Second Prize') {
        const secondTicket = ticketNumbers[0];
        const lastFive = secondTicket.slice(-5);
        if (lastFive !== lastFiveForFirstPrize) {
          lastFourForSecondPrize = lastFive;
          generatedTickets.push({
            resultId: uuidv4(),
            marketId,
            marketName,
            ticketNumber: ticketNumbers,
            prizeCategory,
            prizeAmount,
          });
        } else {
          return apiResponseErr(
            null,
            false,
            statusCode.badRequest,
            'Ticket number must be unique',
            res,
          );
        }
      }

      if (prizeCategory === 'Third Prize') {
        const thirdTicket = ticketNumbers[0];
        const lastFour = thirdTicket.slice(-4);
        if (lastFour !== lastFiveForFirstPrize && lastFour !== lastFourForSecondPrize && lastFour !== lastFourForFirstPrize) {
          lastFourForThirdPrize = lastFour;
          generatedTickets.push({
            resultId: uuidv4(),
            marketId,
            marketName,
            ticketNumber: ticketNumbers,
            prizeCategory,
            prizeAmount,
          });
        } else {
          return apiResponseErr(
            null,
            false,
            statusCode.badRequest,
            'Ticket number must be unique',
            res,
          );
        }
      }

      if (prizeCategory === 'Fourth Prize') {
        const fourthTicket = ticketNumbers[0];
        const lastFour = fourthTicket.slice(-4);
        if (
          lastFour !== lastFiveForFirstPrize &&
          lastFour !== lastFourForSecondPrize &&
          lastFour !== lastFourForThirdPrize &&
          lastFour !== lastFourForFirstPrize
        ) {
          lastFourForFourthPrize = lastFour;
          generatedTickets.push({
            resultId: uuidv4(),
            marketId,
            marketName,
            ticketNumber: ticketNumbers,
            prizeCategory,
            prizeAmount,
          });
        } else {
          return apiResponseErr(
            null,
            false,
            statusCode.badRequest,
            'Ticket number must be unique',
            res,
          );
        }
      }

      if (prizeCategory === 'Fifth Prize') {
        const fifthTicket = ticketNumbers[0];
        const lastFour = fifthTicket.slice(-4);
        if (
          lastFour !== lastFiveForFirstPrize &&
          lastFour !== lastFourForSecondPrize &&
          lastFour !== lastFourForThirdPrize &&
          lastFour !== lastFourForFourthPrize &&
          lastFour !== lastFourForFirstPrize
        ) {
          generatedTickets.push({
            resultId: uuidv4(),
            marketId,
            marketName,
            ticketNumber: ticketNumbers,
            prizeCategory,
            prizeAmount,
          });
        } else {
          return apiResponseErr(
            null,
            false,
            statusCode.badRequest,
            'Ticket number must be unique',
            res,
          );
        }
      }
    }

    let savedResults;
    if (generatedTickets.length > 0) {
      savedResults = await LotteryResult.bulkCreate(generatedTickets);
    } else {
      return apiResponseErr(null, false, statusCode.badRequest, 'No valid tickets to save.', res);
    }
    await WinResultRequest.update({isApproved: true},{where:{marketId}})
const normalizeTicketNumber = (ticket) => {
  return ticket.replace(/\s+/g, '').toUpperCase();
};

const declaredResults = await LotteryResult.findAll({
  where: { marketId },
  attributes: ['ticketNumber', 'prizeCategory', 'prizeAmount', 'complementaryPrize','marketName'], // Ensure complementaryPrize is included
  raw: true,
});

const purchasedTickets = await PurchaseLottery.findAll({
  where: { marketId },
  attributes: ['userId', 'group', 'series', 'number','sem','lotteryPrice', 'marketName'],
  raw: true,
});

const winningTicketsMap = new Map();

declaredResults.forEach(result => {
  const ticketNumbers = Array.isArray(result.ticketNumber) ? result.ticketNumber : [result.ticketNumber];
  ticketNumbers.forEach(ticket => {
    const normalizedTicket = normalizeTicketNumber(ticket);
    winningTicketsMap.set(normalizedTicket, {
      prizeCategory: result.prizeCategory,
      prizeAmount: result.prizeAmount,
      complementaryPrize: result.complementaryPrize, 
    });
  });
});

const winningTickets = [];
const losingTickets = [];

purchasedTickets.forEach(ticket => {
  const ticketNumber = `${ticket.group.toString().padStart(2, '0')}${ticket.series}${ticket.number}`;
  const normalizedTicket = normalizeTicketNumber(ticketNumber);

  console.log("normalizedTicket.............................................",normalizedTicket)

  let isWinner = false;
  let winningTicketDetails = null;
  let matchType = null; 

  for (const result of declaredResults) {
    const ticketNumbers = Array.isArray(result.ticketNumber) ? result.ticketNumber : [result.ticketNumber];
    for (const declaredTicket of ticketNumbers) {
      const normalizedDeclaredTicket = normalizeTicketNumber(declaredTicket);

  console.log("normalizedDeclaredTicket.............................................",normalizedDeclaredTicket)


      if (result.prizeCategory === 'First Prize') {
        if (normalizedDeclaredTicket === normalizedTicket) {
          isWinner = true;
          winningTicketDetails = {
            prizeCategory: result.prizeCategory,
            prizeAmount: result.prizeAmount, 
          };
          matchType = 'Exact Match'; 
          break;
        }
        else if (normalizedDeclaredTicket.slice(-5) === normalizedTicket.slice(-5)) {
          isWinner = true;
          winningTicketDetails = {
            prizeCategory: result.prizeCategory,
            prizeAmount: result.complementaryPrize, 
          };
          matchType = 'Complementary Match'; 
          break;
        }
      } else if (result.prizeCategory === 'Second Prize' && normalizedDeclaredTicket.slice(-5) === normalizedTicket.slice(-5)) {
        isWinner = true;
        winningTicketDetails = {
          prizeCategory: result.prizeCategory,
          sem: result.sem,
          prizeAmount: result.prizeAmount 
        };
        matchType = 'Exact Match'; 
        break;
      } else if (
        (result.prizeCategory === 'Third Prize' || result.prizeCategory === 'Fourth Prize' || result.prizeCategory === 'Fifth Prize') &&
        normalizedDeclaredTicket.slice(-4) === normalizedTicket.slice(-4)
      ) {
        isWinner = true;
        winningTicketDetails = {
          prizeCategory: result.prizeCategory,
          sem: result.sem,
          prizeAmount: result.prizeAmount
        };
        matchType = 'Exact Match'; 
        break;
      }
    }
    if (isWinner) break; 
  }

  if (isWinner && winningTicketDetails) {
    winningTickets.push({
      userId: ticket.userId,
      ticketNumber: normalizedTicket,
      prizeCategory: winningTicketDetails.prizeCategory,
      prizeAmount: winningTicketDetails.prizeAmount,
      lotteryPrice: ticket.lotteryPrice,
      sem: ticket.sem,
      matchType: matchType,
      marketName: ticket.marketName 
    });
  } else {
    losingTickets.push({
      userId: ticket.userId,
      ticketNumber: normalizedTicket,
      lotteryPrice: ticket.lotteryPrice,
      marketName: ticket.marketName ,
      sem:  ticket.sem
    });
  }
});

const userTotalPrize = {};
const userLotteryPrice = {};

  winningTickets.forEach(ticket => {
    let calculatedPrize = ticket.prizeCategory === "First Prize" 
        ? ticket.prizeAmount 
        : ticket.prizeAmount * ticket.sem;

    if (userTotalPrize[ticket.userId]) {
        userTotalPrize[ticket.userId] += calculatedPrize;
        userLotteryPrice[ticket.userId] += ticket.lotteryPrice;
    } else {
        userTotalPrize[ticket.userId] = calculatedPrize;
        userLotteryPrice[ticket.userId] = ticket.lotteryPrice;
    }
});
    const baseURL = process.env.COLOR_GAME_URL;
  for (const userId in userTotalPrize) {
    try {
        const response = await axios.post(`${baseURL}/api/users/update-balance`, {
            userId,
            prizeAmount: userTotalPrize[userId],
            marketId,
            lotteryPrice: userLotteryPrice[userId]
        });
        console.log(`Response for user ${userId}:`, response.data);
    } catch (error) {
        console.error(`Error updating balance for user ${userId}:`, error.response?.data || error.message);
    }
}


const userTotalLoss = {};
  losingTickets.forEach(ticket => {
    if (userTotalLoss[ticket.userId]) {
        userTotalLoss[ticket.userId] += ticket.lotteryPrice;
    } else {
        userTotalLoss[ticket.userId] = ticket.lotteryPrice;
    }
});

for (const userId in userTotalLoss) {
  try {
      const response = await axios.post(`${baseURL}/api/users/remove-exposer`, {
          userId,
          marketId,
          lotteryPrice: userTotalLoss[userId]  
      });
      console.log(`Response for user ${userId}:`, response.data);
  } catch (error) {
      console.error(`Error updating balance for user ${userId}:`, error.response?.data || error.message);
  }
}

// for (const userId of Object.keys(userTotalLoss)) {
//   try {
//     await axios.post(`${baseURL}/api/lottery-profit-loss`, {
//       userId,
//       marketId,
//       marketName,
//     });

//     console.log(`Profit/Loss updated for user ${userId}`);
//   } catch (error) {
//     console.error(`Error updating Profit/Loss for user ${userId}:`, error.response?.data || error.message);
//   }
// }

const profitLossData = [];

// Collect winning ticket data
winningTickets.forEach((ticket) => {
  profitLossData.push({
    userId: ticket.userId,
    marketId: marketId,
    marketName: marketName,
    lotteryPrice: ticket.lotteryPrice,
  });
});

// Collect losing ticket data
losingTickets.forEach((ticket) => {
  profitLossData.push({
    userId: ticket.userId,
    marketId: marketId,
    marketName: marketName,
    lotteryPrice: ticket.lotteryPrice,
  });
});

// Send data to API
for (const data of profitLossData) {
  try {
    await axios.post(`${baseURL}/api/lottery-profit-loss`, data);
    console.log(`Data updated for user ${data.userId}`);
  } catch (error) {
    console.error(`Error updating data for user ${data.userId}:`, error.response?.data || error.message);
  }
}

    const declaredPrizeCategories = declaredResults.map((prize) => prize.prizeCategory);
    const isAllPrizesDeclared = allPrizeCategories.every((category) =>
      declaredPrizeCategories.includes(category)
    );

    if (isAllPrizesDeclared) {
      await TicketRange.update(
        { isActive: false, isWin: true },
        { where: { marketId } }
      );
    }

    await TicketRange.update(
      { winReference: true },
      { where: { marketId } }
    );

    await PurchaseLottery.update(
      { resultAnnouncement: true, settleTime: new Date(), hidePurchase: true },
      { where: { marketId } }
    );

    const combineResult = { 
        savedResults, 
        winningTickets, 
        losingTickets 
      }
    // Return the response with saved results and ticket details
    return apiResponseSuccess(
      combineResult,
      true,
      statusCode.create,
      'Lottery results saved successfully.',
      res
    );
  } catch (error) {
    console.log("error", error);
    return apiResponseErr(null, false, statusCode.internalServerError, error.message, res);
  }
};


export const getLotteryResults = async (req, res) => {
  try {
    const { marketId } = req.params;

    const results = await LotteryResult.findAll({
      where: { marketId },
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

    return apiResponseSuccess(results, true, statusCode.success, 'Lottery results fetched successfully.', res);
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

export const getMultipleLotteryResults = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const results = await LotteryResult.findAll({
      attributes: ["marketId", "marketName", "ticketNumber", "prizeCategory", "prizeAmount", "complementaryPrize", "createdAt"],
      where: {
        createdAt: {
          [Op.gte]: today,
        },
      },
    });

    if (results.length === 0) {
      return apiResponseSuccess(
        {},
        false,
        statusCode.success,
        `No lottery results found for today.`,
        res
      );
    }

    const structuredResults = {};

    results.forEach((result) => {
      const marketName = result.marketName;
      if (!structuredResults[marketName]) {
        structuredResults[marketName] = [];
      }

      structuredResults[marketName].push({
        ticketNumber: Array.isArray(result.ticketNumber) ? result.ticketNumber : [result.ticketNumber],
        prizeCategory: result.prizeCategory,
        prizeAmount: result.prizeAmount,
        complementaryPrize: result.complementaryPrize || 0,
        marketName: marketName,
        marketId: result.marketId,
      });
    });

    return apiResponseSuccess(
      structuredResults,
      true,
      statusCode.success,
      "Lottery results fetched successfully.",
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


export const subadminResultRequest = async (req, res) => {
  try {
    const prizes = req.body;
    const { marketId } = req.params;
    const role = req.user?.role;
    const userName = req.user?.userName;
    const adminId = req.user?.adminId;
    const market = await TicketRange.findOne({ where: { marketId } });


    const existingMarket = await WinResultRequest.findAll({
      attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("adminId")), "adminId"]],
      where: { 
        marketId, 
        isApproved: false, 
        isReject: false 
      },
      raw: true,
    });

    if (existingMarket.length >= 2) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "Maximum of two subadmin entries allowed for this market!",
        res
      );
    }

    const marketName = market.marketName;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const prizeLimits = {
      "First Prize": 1,
      "Second Prize": 10,
      "Third Prize": 10,
      "Fourth Prize": 10,
      "Fifth Prize": 50,
    };

    const allPrizeCategories = [
      "First Prize",
      "Second Prize",
      "Third Prize",
      "Fourth Prize",
      "Fifth Prize",
    ];

    const providedCategories = prizes.map((prize) => prize.prizeCategory);
    const missingCategories = allPrizeCategories.filter(
      (category) => !providedCategories.includes(category)
    );

    if (missingCategories.length > 0) {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        `The following prize categories are missing: ${missingCategories.join(
          ", "
        )}`,
        res
      );
    }

    let generatedTickets = [];
    let lastFiveForFirstPrize = null;
    let lastFourForFirstPrize = null;
    let lastFourForSecondPrize = null;
    let lastFourForThirdPrize = null;
    let lastFourForFourthPrize = null;

    for (let prize of prizes) {
      const { ticketNumber, prizeCategory, prizeAmount, complementaryPrize } =
        prize;

      if (!prizeLimits[prizeCategory]) {
        return apiResponseErr(
          null,
          false,
          statusCode.badRequest,
          "Invalid prize category.",
          res
        );
      }

      const ticketNumbers = Array.isArray(ticketNumber)
        ? ticketNumber
        : [ticketNumber];
      if (ticketNumbers.length !== prizeLimits[prizeCategory]) {
        return apiResponseErr(
          null,
          false,
          statusCode.badRequest,
          `The ${prizeCategory} requires exactly ${prizeLimits[prizeCategory]} ticket number(s).`,
          res
        );
      }

      const allResults = await WinResultRequest.findAll({
        where: {
          createdAt: {
            [Op.between]: [todayStart, todayEnd],
          },
          marketId,
          adminId,
        },
      });

      const isDuplicate = ticketNumbers.some((ticket) =>
        allResults.some((result) => result.ticketNumber.includes(ticket))
      );

      if (isDuplicate) {
        return apiResponseErr(
          null,
          false,
          statusCode.badRequest,
          "One or more ticket numbers have already been assigned a prize in another category.",
          res
        );
      }

      const existingResults = await WinResultRequest.findAll({
        where: { prizeCategory, marketId, adminId },
      });

      if (existingResults.length >= prizeLimits[prizeCategory]) {
        return apiResponseErr(
          null,
          false,
          statusCode.badRequest,
          `Cannot add more ticket numbers. ${prizeCategory} already has the required tickets.`,
          res
        );
      }

      if (prizeCategory === "First Prize") {
        const firstTicket = ticketNumbers[0];
        const lastFive = firstTicket.slice(-5);
        const lastFour = firstTicket.slice(-4);
        lastFiveForFirstPrize = lastFive;
        lastFourForFirstPrize = lastFour;
        generatedTickets.push({
          resultId: uuidv4(),
          marketId,
          adminId,
          ticketNumber: ticketNumbers,
          marketName,
          prizeCategory,
          prizeAmount,
          complementaryPrize,
          declearBy: userName,
        });
      }

      if (prizeCategory === "Second Prize") {
        const secondTicket = ticketNumbers[0];
        const lastFive = secondTicket.slice(-5);
        if (lastFive !== lastFiveForFirstPrize) {
          lastFourForSecondPrize = lastFive;
          generatedTickets.push({
            resultId: uuidv4(),
            marketId,
            marketName,
            adminId,
            ticketNumber: ticketNumbers,
            prizeCategory,
            prizeAmount,
            declearBy: userName,
          });
        } else {
          return apiResponseErr(
            null,
            false,
            statusCode.badRequest,
            "Ticket number must be unique",
            res
          );
        }
      }

      if (prizeCategory === "Third Prize") {
        const thirdTicket = ticketNumbers[0];
        const lastFour = thirdTicket.slice(-4);
        if (
          lastFour !== lastFiveForFirstPrize &&
          lastFour !== lastFourForSecondPrize &&
          lastFour !== lastFourForFirstPrize
        ) {
          lastFourForThirdPrize = lastFour;
          generatedTickets.push({
            resultId: uuidv4(),
            marketId,
            marketName,
            adminId,
            ticketNumber: ticketNumbers,
            prizeCategory,
            prizeAmount,
            declearBy: userName,
          });
        } else {
          return apiResponseErr(
            null,
            false,
            statusCode.badRequest,
            "Ticket number must be unique",
            res
          );
        }
      }

      if (prizeCategory === "Fourth Prize") {
        const fourthTicket = ticketNumbers[0];
        const lastFour = fourthTicket.slice(-4);
        if (
          lastFour !== lastFiveForFirstPrize &&
          lastFour !== lastFourForSecondPrize &&
          lastFour !== lastFourForThirdPrize &&
          lastFour !== lastFourForFirstPrize
        ) {
          lastFourForFourthPrize = lastFour;
          generatedTickets.push({
            resultId: uuidv4(),
            marketId,
            marketName,
            adminId,
            ticketNumber: ticketNumbers,
            prizeCategory,
            prizeAmount,
            declearBy: userName,
          });
        } else {
          return apiResponseErr(
            null,
            false,
            statusCode.badRequest,
            "Ticket number must be unique",
            res
          );
        }
      }

      if (prizeCategory === "Fifth Prize") {
        const fifthTicket = ticketNumbers[0];
        const lastFour = fifthTicket.slice(-4);
        if (
          lastFour !== lastFiveForFirstPrize &&
          lastFour !== lastFourForSecondPrize &&
          lastFour !== lastFourForThirdPrize &&
          lastFour !== lastFourForFourthPrize &&
          lastFour !== lastFourForFirstPrize
        ) {
          generatedTickets.push({
            resultId: uuidv4(),
            marketId,
            marketName,
            adminId,
            ticketNumber: ticketNumbers,
            prizeCategory,
            prizeAmount,
            declearBy: userName,
          });
        } else {
          return apiResponseErr(
            null,
            false,
            statusCode.badRequest,
            "Ticket number must be unique",
            res
          );
        }
      }
    }

    let savedResults;
    if (generatedTickets.length > 0) {
      savedResults = await WinResultRequest.bulkCreate(generatedTickets);

      const existingAdminIds = await WinResultRequest.findAll({
        where: { marketId },
        attributes: [
          "adminId",
          "marketId",
          "ticketNumber",
          "prizeCategory",
          "prizeAmount",
          "complementaryPrize",
        ],
        raw: true,
      });

      const groupedByAdmin = {};
      existingAdminIds.forEach((entry) => {
        const {
          adminId,
          marketId,
          ticketNumber,
          prizeCategory,
          prizeAmount,
          complementaryPrize,
        } = entry;
        const key = `${prizeCategory}-${prizeAmount}-${complementaryPrize}-${marketId}`;

        if (!groupedByAdmin[adminId]) groupedByAdmin[adminId] = {};

        if (!groupedByAdmin[adminId][key])
          groupedByAdmin[adminId][key] = new Set();
        ticketNumber.forEach((ticket) =>
          groupedByAdmin[adminId][key].add(ticket)
        );
      });

      const adminIds = Object.keys(groupedByAdmin);

      const matchedAdminIds = new Set();
      for (let i = 0; i < adminIds.length; i++) {
        for (let j = i + 1; j < adminIds.length; j++) {
          const admin1 = adminIds[i];
          const admin2 = adminIds[j];

          let isMatched = true;

          const keys1 = Object.keys(groupedByAdmin[admin1]);
          const keys2 = Object.keys(groupedByAdmin[admin2]);

          if (keys1.length !== keys2.length) {
            isMatched = false;
          } else {
            for (const key of keys1) {
              if (!groupedByAdmin[admin2][key]) {
                isMatched = false;
                break;
              }
              const tickets1 = groupedByAdmin[admin1][key];
              const tickets2 = groupedByAdmin[admin2][key];

              if (
                tickets1.size !== tickets2.size ||
                [...tickets1].some((ticket) => !tickets2.has(ticket))
              ) {
                isMatched = false;
                break;
              }
            }
          }

          if (isMatched) {
            matchedAdminIds.add(admin1);
            matchedAdminIds.add(admin2);
          }
        }
      }

      if (matchedAdminIds.size > 0) {
        await WinResultRequest.update(
          { type: "Matched" },
          { where: { adminId: Array.from(matchedAdminIds) } }
        );
      }

      return apiResponseSuccess(
        savedResults,
        true,
        statusCode.create,
        "Lottery results saved successfully.",
        res
      );
    } else {
      return apiResponseErr(
        null,
        false,
        statusCode.badRequest,
        "No valid tickets to save.",
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
