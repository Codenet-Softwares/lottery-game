import { Op } from 'sequelize';
import PurchaseLottery from '../models/purchase.model.js';
import LotteryResult from '../models/resultModel.js';
import { apiResponseErr, apiResponseSuccess } from '../utils/response.js';
import { statusCode } from '../utils/statusCodes.js';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import TicketRange from '../models/ticketRange.model.js';
import { TicketService } from '../constructor/ticketService.js';
import sequelize from '../config/db.js';

export const ResultDeclare = async (req, res) => {
  try {
    const prizes = req.body;
    const { marketId } = req.params;

    // Fetch the market details
    const market = await TicketRange.findOne({ where: { marketId } });

    if (!market) {
      return apiResponseErr(null, false, statusCode.badRequest, 'Market not found', res);
    }

    const marketName = market.marketName;

    // Define today's start and end time
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Define prize limits for each category
    const prizeLimits = {
      'First Prize': 1,
      'Second Prize': 10,
      'Third Prize': 10,
      'Fourth Prize': 10,
      'Fifth Prize': 50,
    };

    // Define all required prize categories
    const allPrizeCategories = [
      'First Prize',
      'Second Prize',
      'Third Prize',
      'Fourth Prize',
      'Fifth Prize',
    ];

    // Check if all required prize categories are provided
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

    // Loop through each prize and declare results
    for (let prize of prizes) {
      const { ticketNumber, prizeCategory, prizeAmount, complementaryPrize } = prize;

      // Validate prize category
      if (!prizeLimits[prizeCategory]) {
        return apiResponseErr(null, false, statusCode.badRequest, 'Invalid prize category.', res);
      }

      // Ensure the correct number of tickets for each prize category
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

      // Check for duplicate ticket numbers across prize categories
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

      // Check if the prize category limit has been reached
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

      // Handle different prize categories
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

    // Save the generated tickets
    let savedResults;
    if (generatedTickets.length > 0) {
      savedResults = await LotteryResult.bulkCreate(generatedTickets);
    } else {
      return apiResponseErr(null, false, statusCode.badRequest, 'No valid tickets to save.', res);
    }
// Normalize ticket numbers by removing spaces and converting to uppercase
const normalizeTicketNumber = (ticket) => {
  return ticket.replace(/\s+/g, '').toUpperCase();
};

// Fetch winning and losing tickets
const declaredResults = await LotteryResult.findAll({
  where: { marketId },
  attributes: ['ticketNumber', 'prizeCategory', 'prizeAmount', 'complementaryPrize'], // Ensure complementaryPrize is included
  raw: true,
});

const purchasedTickets = await PurchaseLottery.findAll({
  where: { marketId },
  attributes: ['userId', 'group', 'series', 'number','sem','lotteryPrice'],
  raw: true,
});

// Create a map of winning tickets
const winningTicketsMap = new Map();

declaredResults.forEach(result => {
  const ticketNumbers = Array.isArray(result.ticketNumber) ? result.ticketNumber : [result.ticketNumber];
  ticketNumbers.forEach(ticket => {
    const normalizedTicket = normalizeTicketNumber(ticket);
    winningTicketsMap.set(normalizedTicket, {
      prizeCategory: result.prizeCategory,
      prizeAmount: result.prizeAmount,
      complementaryPrize: result.complementaryPrize, // Ensure complementaryPrize is included
    });
  });
});

const winningTickets = [];
const losingTickets = [];

purchasedTickets.forEach(ticket => {
  // Construct the full ticket number and normalize it
  const ticketNumber = `${ticket.group}${ticket.series}${ticket.number}`;
  const normalizedTicket = normalizeTicketNumber(ticketNumber);

  // Check if the ticket is a winner based on prize category rules
  let isWinner = false;
  let winningTicketDetails = null;
  let matchType = null; // To track if it's an exact match or complementary match

  for (const result of declaredResults) {
    const ticketNumbers = Array.isArray(result.ticketNumber) ? result.ticketNumber : [result.ticketNumber];
    for (const declaredTicket of ticketNumbers) {
      const normalizedDeclaredTicket = normalizeTicketNumber(declaredTicket);

      if (result.prizeCategory === 'First Prize') {
        // First Prize: Exact match
        if (normalizedDeclaredTicket === normalizedTicket) {
          isWinner = true;
          winningTicketDetails = {
            prizeCategory: result.prizeCategory,
            prizeAmount: result.prizeAmount, // Use the original First Prize amount
          };
          matchType = 'Exact Match'; // Flag for exact match
          break;
        }
        // First Prize: Complementary match (last 5 digits)
        else if (normalizedDeclaredTicket.slice(-5) === normalizedTicket.slice(-5)) {
          isWinner = true;
          winningTicketDetails = {
            prizeCategory: result.prizeCategory,
            prizeAmount: result.complementaryPrize, // Use the complementary prize amount
          };
          matchType = 'Complementary Match'; // Flag for complementary match
          break;
        }
      } else if (result.prizeCategory === 'Second Prize' && normalizedDeclaredTicket.slice(-5) === normalizedTicket.slice(-5)) {
        // Second Prize: Last 5 digits match
        isWinner = true;
        winningTicketDetails = {
          prizeCategory: result.prizeCategory,
          sem: result.sem,
          prizeAmount: result.prizeAmount // Use the original Second Prize amount
        };
        matchType = 'Exact Match'; // Second Prize only has one type of match
        break;
      } else if (
        (result.prizeCategory === 'Third Prize' || result.prizeCategory === 'Fourth Prize' || result.prizeCategory === 'Fifth Prize') &&
        normalizedDeclaredTicket.slice(-4) === normalizedTicket.slice(-4)
      ) {
        // Third, Fourth, Fifth Prize: Last 4 digits match
        isWinner = true;
        winningTicketDetails = {
          prizeCategory: result.prizeCategory,
          sem: result.sem,
          prizeAmount: result.prizeAmount// Use the original prize amount
        };
        matchType = 'Exact Match'; // Other prizes only have one type of match
        break;
      }
    }
    if (isWinner) break; // Exit the loop if a match is found
  }

  if (isWinner && winningTicketDetails) {
    winningTickets.push({
      userId: ticket.userId,
      ticketNumber: normalizedTicket,
      prizeCategory: winningTicketDetails.prizeCategory,
      prizeAmount: winningTicketDetails.prizeAmount,
      lotteryPrice: ticket.lotteryPrice,
      sem: ticket.sem,
      matchType: matchType, // Add match type to the winning ticket
    });
  } else {
    losingTickets.push({
      userId: ticket.userId,
      ticketNumber: normalizedTicket,
      lotteryPrice: ticket.lotteryPrice,
    });
  }
});

const userTotalPrize = {};
const userLotteryPrice = {};

// Calculate total prize amount and lottery price per user
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
// Send data to external API
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

// Calculate total lottery price per user
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
          lotteryPrice: userTotalLoss[userId]  // Total loss per user
      });
      console.log(`Response for user ${userId}:`, response.data);
  } catch (error) {
      console.error(`Error updating balance for user ${userId}:`, error.response?.data || error.message);
  }
}
    // Update market status
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
      { resultAnnouncement: true, settleTime: new Date() },
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
    const { marketId } = req.parms;

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





