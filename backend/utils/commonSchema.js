import { body,query,param } from 'express-validator';
import { string } from '../constructor/string.js';

export const validateCreateAdmin = [
  body('userName').notEmpty().withMessage('Username is required').isString().withMessage('Username must be a string'),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').notEmpty().withMessage('Role is required').isIn([string.Admin, string.SubAdmin, string.User]).withMessage('Role must be admin, subAdmin, or user'),
];
   
export const validateAdminLogin = [
  body('userName').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const resetPasswordSchema = [
  body("userName")
    .trim()
    .notEmpty()
    .withMessage("Username is required"),
  body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("New Password is required")
    .isAlphanumeric()
    .withMessage("New Password must be alphanumeric"),
];



export const validateTicketRange = [
  body('group.min').notEmpty().withMessage('Group min is required')
    .isInt({ min: 1, max: 99 })
    .withMessage('Group min must be an integer between 1 and 99')
    ,
  
  body('group.max').notEmpty().withMessage('Group max is required')
    .isInt({ min: 10, max: 99 })
    .withMessage('Group max must be an integer between 10 and 99')
    ,
    body()
    .custom(({ group }) => {
      if (!group || group.min === undefined || group.max === undefined) {
        throw new Error('Group min and max are required.');
      }
      if (group.min >= group.max) {
        throw new Error('Group min must be less than Group max.');
      }
      if (group.max - group.min < 20) {
        throw new Error('Group range must include at least 20 numbers. Please select a valid range.');
      }
      return true;
    }),
    body('series')
    .notEmpty()
    .withMessage('Series is required')
    .custom((series) => {
      const invalidLetters = ['I', 'F', 'O'];
      const seriesStartCode = series.start.charCodeAt(0);
      const seriesEndCode = series.end.charCodeAt(0);

      if (
        series.start < 'A' || 
        series.start > 'Z' || 
        series.end < 'A' || 
        series.end > 'Z'
      ) {
        throw new Error('Series must include uppercase letters only (A-Z) excluding I,F,O.');
      }

      if (invalidLetters.includes(series.start) || invalidLetters.includes(series.end)) {
        throw new Error(`Series cannot include the letters ${invalidLetters.join(', ')}.`);
      }

      const seriesRange = seriesEndCode - seriesStartCode + 1;
      if (seriesRange < 10) {
        throw new Error('Series must have a minimum range of 10 letters.');
      }

      return true;
    }),


  
  body('number.min').notEmpty().withMessage('Number min is required')
    .isLength({ min: 5, max: 5 })
    .isNumeric()
    .withMessage('Number min must be a 5-digit numeric string')
    ,
  
  body('number.max').notEmpty().withMessage('Number max is required')
    .isLength({ min: 5, max: 5 })
    .isNumeric()
    .withMessage('Number max must be a 5-digit numeric string')
    ,
    body()
    .custom(({ number }) => {
      if (number.min >= number.max) {
        throw new Error('Number min must be less than Number max');
      }
      return true;
    }),
  body('start_time').notEmpty().withMessage('Start time is required')
    .isISO8601()
    .withMessage('Start time must be a valid ISO8601 date')
    ,
  
  body('end_time').notEmpty().withMessage('End time is required')
    .isISO8601()
    .withMessage('End time must be a valid ISO8601 date')
    ,
    body()
    .custom((fields) => {
      const { start_time, end_time } = fields;
      const startTime = new Date(start_time);
      const endTime = new Date(end_time);

      if (startTime >= endTime) {
        throw new Error('Start time must be before End time');
      }

      const startHours = startTime.getHours();
      const startMinutes = startTime.getMinutes();
      const startAMPM = startHours < 12 ? 'AM' : 'PM';

      const endHours = endTime.getHours();
      const endMinutes = endTime.getMinutes();
      const endAMPM = endHours < 12 ? 'AM' : 'PM';

      if (startAMPM === endAMPM && startHours === endHours && startMinutes === endMinutes) {
        throw new Error('Start time and End time cannot be identical');
      }

      return true;
    }),


  
  body('marketName')
    .notEmpty()
    .withMessage('Market name is required'),
  
  body('date').notEmpty().withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid ISO8601 date')
    ,
  
    body('price')
    .exists()
    .withMessage('Price is required')
    .isInt({ min: 1 })
    .withMessage('Price must be greater than 0'),
];

export const updateMarketValidation = [
  body('group')
    .optional()
    .custom((value) => {
      if (typeof value !== 'object') throw new Error('Group must be an object with min and/or max values.');
      const { min, max } = value || {};
      if (min !== undefined && max !== undefined && min >= max) {
        throw new Error('Group min must be less than max.');
      }
      if (min !== undefined && max !== undefined && max - min < 20) {
        throw new Error('Group range must include at least 20 numbers.');
      }
      return true;
    }),

  body('series')
    .optional()
    .custom((value) => {
      if (typeof value !== 'object') throw new Error('Series must be an object with start and/or end values.');
      const { start, end } = value || {};
      const invalidLetters = ['I', 'F', 'O'];

      if (start !== undefined && (start < 'A' || start > 'Z' || invalidLetters.includes(start))) {
        throw new Error('Series start must be an uppercase letter (A-Z), excluding I, F, O.');
      }

      if (end !== undefined && (end < 'A' || end > 'Z' || invalidLetters.includes(end))) {
        throw new Error('Series end must be an uppercase letter (A-Z), excluding I, F, O.');
      }

      if (start !== undefined && end !== undefined && start >= end) {
        throw new Error('Series start must be less than series end.');
      }

      if (start !== undefined && end !== undefined && end.charCodeAt(0) - start.charCodeAt(0) + 1 < 10) {
        throw new Error('Series range must be at least 10 letters.');
      }

      return true;
    }),

    body('number')
    .optional()
    .custom((value) => {
      if (typeof value !== 'object') throw new Error('Number must be an object with min and/or max values.');
      const { min, max } = value || {};

      if (min !== undefined && (!/^\d{5}$/.test(min))) {
        throw new Error('Number min must be a 5-digit number.');
      }
      if (max !== undefined && (!/^\d{5}$/.test(max))) {
        throw new Error('Number max must be a 5-digit number.');
      }

      if (min !== undefined && max !== undefined && min >= max) {
        throw new Error('Number min must be less than max.');
      }
      return true;
    }),

  body('start_time')
    .optional()
    .isString()
    .withMessage('Start time must be a string.')
    .custom((startTime, { req }) => {
      const endTime = req.body.end_time;
      if (endTime && startTime >= endTime) {
        throw new Error('Start time must be less than end time.');
      }
      return true;
    }),

  body('end_time')
    .optional()
    .isString()
    .withMessage('End time must be a string.'),

  body('marketName').optional().isString().withMessage('Market Name must be a string.'),
  body('price').optional().isNumeric().withMessage('Price must be a number.')
];





export const validateSearchTickets = [
  body('group').notEmpty().withMessage('Group is required').isInt({ min: 0 }).withMessage('Group must be a positive integer'),
  body('series').notEmpty().withMessage('Series is required').isLength({ min: 1, max: 1 }).withMessage('Series must be a single character'),
  body('number').notEmpty().withMessage('Number is required').isString().isLength({ min: 1 }).withMessage('Number must be a non-empty string'),
  body('sem')
  .notEmpty()
  .withMessage('Sem is required')
  .bail() 
  .isNumeric()
  .withMessage('Sem must be a numeric value')
  .bail() 
  .isIn([5, 10, 25, 50, 100, 200])
  .withMessage('Sem must be one of the following values: 5, 10, 25, 50, 100, 200'),
  body('marketId').notEmpty().withMessage('marketId is required').isUUID().withMessage('MarketId must be a valid UUID'),

];

export const validateAdminPurchaseHistory = [
  query('sem').optional().isNumeric().withMessage('Sem must be a numeric value'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
  param("marketId").isUUID().withMessage("Invalid marketId. It should be a valid UUID."),
];

export const validateMarketId = [
  param("marketId").notEmpty().withMessage('marketId is required')
    .isUUID()
    .withMessage("Invalid marketId. It should be a valid UUID."),
];

export const validateDateQuery = [
  query("date")
    .exists()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Invalid date format. Use ISO8601 (YYYY-MM-DD)."),
];

export const validateGetResult = [
  query('announce').notEmpty()
  .withMessage('announce is required')
    .optional()
    .isISO8601()
    .withMessage('Announce time must be a valid ISO8601 date.'),
];



export const validateGetTicketNumbersByMarket = [
  param('marketId')
    .notEmpty()
    .withMessage('Market ID is required')
    .isUUID()
    .withMessage('Market ID must be a valid UUID'),
];


export const purchaseTicketValidation = [
  body('generateId').notEmpty().withMessage('Generate ID is required'),
  body('userId').notEmpty().withMessage('User  ID is required'),
  body('userName').notEmpty().withMessage('User name is required').isString().withMessage('User name must be a string'),
];

// export const createTicketValidation = [
//   body('group.min').isInt({ min: 38 }).withMessage('Group must be a positive integer'),
//   body('group.max').isInt({ max: 99 }).withMessage('Group must be a positive integer'),
//   body('group').custom(({ min, max }) => {
//     if (min > max) {
//       throw new Error('Group minimum cannot be greater than Group maximum');
//     }
//     return true;
//   }),

//   body('series.start')
//     .isIn(['A', 'B', 'C', 'D', 'E', 'G', 'H', 'I', 'J', 'K', 'L'])
//     .withMessage('Series must be between A and L'),
//   body('series.end')
//     .isIn(['A', 'B', 'C', 'D', 'E', 'G', 'H', 'I', 'J', 'K', 'L'])
//     .withMessage('Series must be between A and L'),

//   body('number.min')
//     .isLength({ min: 5, max: 5 })
//     .withMessage('number.min must be exactly 5 digits')
//     .isString({ min: '00000' })
//     .withMessage('Number minimum start with 00000'),
//   body('number.max')
//     .isLength({ min: 5, max: 5 })
//     .withMessage('number.max must be exactly 5 digits')
//     .isString({ max: '99999' })
//     .withMessage('Maximum number 99999'),
//   body('number').custom(({ min, max }) => {
//     if (min > max) {
//       throw new Error('Number min cannot be greater than Number max');
//     }
//     return true;
//   }),
// ];

// export const searchTicketValidation = [
//   body('group').notEmpty().withMessage('Group is required'),
//   body('series').notEmpty().withMessage('Series is required').isString().withMessage('Series must be a string'),
//   body('number').notEmpty().withMessage('Number is required').isString().withMessage('Series must be a string'),
//   body('sem').notEmpty().withMessage('Sem is required'),
// ];

export const validatePurchaseHistory = [body('userId').isUUID().withMessage('User ID must be a valid UUID.')];

export const validateCreateResult = [
  body('ticketNumber')
    .notEmpty()
    .withMessage('Ticket number is required.')
    .isArray()
    .withMessage('Ticket number must be an array.'),
  body('prizeCategory')
    .notEmpty()
    .withMessage('Prize category is required.')
    .isIn(['First Prize', 'Second Prize', 'Third Prize', 'Fourth Prize', 'Fifth Prize'])
    .withMessage('Invalid prize category.'),
  body('prizeAmount')
    .notEmpty()
    .withMessage('Prize amount is required.')
    .isInt({ min: 1 })
    .withMessage('Prize amount must be a positive integer.')
];

// export const validateMarketIds =[ body('marketIds')
// .notEmpty().withMessage('marketIds is required')   
// .isArray().withMessage('marketIds must be an array')  
// .custom((value) => value.length > 0).withMessage('marketIds must contain at least one market ID')  
// ];

// const checkTicketNumberFormat = (prizeCategory) => {
//   return (value) => {
//     const ticketNumber = value.trim();

//     // Validate ticket number based on the prize category
//     if (prizeCategory === 'Second Prize') {
//       // Second prize should contain only the last 5 digits (e.g., 00001)
//       const ticketRegex = /^\d{5}$/;
//       return ticketRegex.test(ticketNumber);
//     } else if (prizeCategory === 'Third Prize' || prizeCategory === 'Fourth Prize' || prizeCategory === 'Fifth Prize') {
//       // Third prize should contain only the last 4 digits (e.g., 0001)
//       const ticketRegex = /^\d{4}$/;
//       return ticketRegex.test(ticketNumber);
//     } else if (prizeCategory === 'First Prize') {
//       // First prize can contain the whole ticket number (e.g., 38 A 00001)
//       const ticketRegex = /^\d{1,2} [A-Z] \d{5}$/;
//       return ticketRegex.test(ticketNumber);
//     }
//     return false;
//   };
// };

export const validationRules = [
  body('*.ticketNumber')
    .isArray({ min: 1 })
    .withMessage('Ticket number must be a non-empty array.')
    .bail()
    .custom((ticketNumbers, { req }) => {
      const prizeCategory = req.body.find((entry) => entry.ticketNumber === ticketNumbers)?.prizeCategory;

      if (!prizeCategory) {
        throw new Error('Prize category is required for ticket validation.');
      }

      const prizeLimits = {
        'First Prize': 1,
        'Second Prize': 10,
        'Third Prize': 10,
        'Fourth Prize': 10,
        'Fifth Prize': 50,
      };

      if (ticketNumbers.length !== prizeLimits[prizeCategory]) {
        throw new Error(
          `The ${prizeCategory} requires exactly ${prizeLimits[prizeCategory]} ticket number(s).`
        );
      }

      ticketNumbers.forEach((ticketNumber) => {
        if (!validateTicketNumber(ticketNumber, prizeCategory)) {
          throw new Error(
            `Invalid ticket number format for ${prizeCategory}: ${ticketNumber}`
          );
        }
      });

      const ticketSet = new Set(ticketNumbers);
      if (ticketSet.size !== ticketNumbers.length) {
        throw new Error('Ticket numbers must be unique within each prize category.');
      }

      return true;
    }),

  body('*.prizeCategory')
    .isIn([
      'First Prize',
      'Second Prize',
      'Third Prize',
      'Fourth Prize',
      'Fifth Prize',
    ])
    .withMessage('Invalid prize category.')
    .bail()
    .notEmpty()
    .withMessage('Prize category is required.'),


  body('*.prizeAmount')
    .notEmpty()
    .withMessage('Prize amount is required.')
    .bail()
    .isFloat({ min: 0 })
    .withMessage('Prize amount must be a valid number greater than 0.'),

  body('*.complementaryPrize')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Complementary prize must be a valid number greater than 0.')

];

// Helper function to validate ticket number based on prize category
function validateTicketNumber(ticketNumber, prizeCategory) {
  const trimmedNumber = ticketNumber.trim();

  if (prizeCategory === 'Second Prize') {
    // Second prize: last 5 digits (e.g., 00001)
    const ticketRegex = /^\d{5}$/;
    return ticketRegex.test(trimmedNumber);
  } else if (
    ['Third Prize', 'Fourth Prize', 'Fifth Prize'].includes(prizeCategory)
  ) {
    // Third, Fourth, Fifth prize: last 4 digits (e.g., 0001)
    const ticketRegex = /^\d{4}$/;
    return ticketRegex.test(trimmedNumber);
  } else if (prizeCategory === 'First Prize') {
  


      // First prize: allows both 38A00001 and 38 A 00001
      const ticketRegex = /^\d{2} ?[A-Z] ?\d{5}$/;
      return ticketRegex.test(trimmedNumber);

  }
  return false;
}

export const validateVoidMarket = [
  body('marketId')
    .notEmpty().withMessage('Market ID is required')
    .isUUID().withMessage('Market ID must be a valid UUID'),
];

export const validateLiveLottery = [
  param('marketId')
    .isUUID()
    .withMessage('Market ID is not valid'),
  query("page")
    .optional()
    .toInt()
    .isInt({ min: 1 })
    .withMessage("Page number must be a positive integer."),
  query("limit")
    .optional()
    .toInt()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer."),
];

export const validateLiveMarkets = [
  query("page")
    .optional()
    .toInt()
    .isInt({ min: 1 })
    .withMessage("Page number must be a positive integer."),
  query("limit")
    .optional()
    .toInt()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer."),
];

export const validateDeleteLiveBet = [
  body('purchaseId')
    .notEmpty().withMessage('Purchase ID is required')
    .isUUID().withMessage('Purchase ID must be a valid UUID'),
];

export const validateTrashMarketId = [
  param("marketId")
    .isUUID()
    .withMessage("Invalid marketId. It should be a valid UUID."),
];

export const validateTrashMarket = [
  param("purchaseId")
    .isUUID()
    .withMessage("Invalid purchase Id. It should be a valid UUID."),
];

export const validateRevokeLiveBet = [
  body('purchaseId')
    .notEmpty().withMessage('PurchaseId ID is required')
];

export const validateResetPassword = [
  body('userName')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  
  body('oldPassword')
    .notEmpty()
    .withMessage('Old password is required'),
  
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
];


export const validateDeleteBetAterWin = [
  body('purchaseId')
    .notEmpty().withMessage('Purchase ID is required')
    .isUUID().withMessage('Purchase ID must be a valid UUID'),
];

export const validateAfterWinMarkets = [
  query("page")
    .optional()
    .toInt()
    .isInt({ min: 1 })
    .withMessage("Page number must be a positive integer."),
  query("limit")
    .optional()
    .toInt()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer."),
];

export const validateAfterWinLottery = [
  param('marketId')
    .isUUID()
    .withMessage('Market ID is not valid'),
  query("page")
    .optional()
    .toInt()
    .isInt({ min: 1 })
    .withMessage("Page number must be a positive integer."),
  query("limit")
    .optional()
    .toInt()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer."),
];

export const validateVoidAfyerWin = [
  body('marketId')
    .notEmpty().withMessage('Market ID is required')
    .isUUID().withMessage('Market ID must be a valid UUID'),
];

export const createSubAdminSchema = [
  body('userName').trim().notEmpty().withMessage('User Name is required'),
  body('password').trim().notEmpty().withMessage('Password is required'),
];


export const validateMarketWiseSubadmin = [
  param("marketId")
    .isUUID()
    .withMessage("Invalid marketId. It should be a valid UUID."),
];

export const validateDeleteSubAdmin = [
  param('adminId')
    .notEmpty().withMessage('adminId is required')
    .isUUID().withMessage('adminId must be a valid UUID'),
];


export const validateAdminApproveReject = [
  param("marketId")
    .isUUID()
    .withMessage("Invalid marketId. It should be a valid UUID."),
    body('type').trim().notEmpty().withMessage('Type is required'),
];

export const validateTitleText = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .withMessage('Title must be a string'),

  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isString()
    .withMessage('Message must be a string'),
];

export const validateHotGame = [
  body('marketId')
    .notEmpty()
    .withMessage('Market ID is required')
    .isUUID()
    .withMessage('Market ID must be a valid UUID'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isBoolean()
    .withMessage('Status must be a boolean'),
];