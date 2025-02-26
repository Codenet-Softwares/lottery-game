import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const WinLotteryrequest = sequelize.define(
  'winLotteryrequest',
  {
    resultId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    adminId : {
      type: DataTypes.STRING,
      allowNull: false,
    },
    declearBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ticketNumber: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    prizeCategory: {
      type: DataTypes.ENUM('First Prize', 'Second Prize', 'Third Prize', 'Fourth Prize', 'Fifth Prize'),
      allowNull: false,
    },
    prizeAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    complementaryPrize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    marketName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    marketId : {
      type: DataTypes.UUID,
      allowNull: false,
    },
    isRevoke : {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    type: {
      type: DataTypes.ENUM("Matched", "Unmatched"),
      defaultValue: "Unmatched",
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'winLotteryrequest',
    timestamps: true,
    freezeTableName: true,
  },
);

export default WinLotteryrequest;
