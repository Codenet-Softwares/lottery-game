import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const WinResultRequest = sequelize.define(
  'winResultRequest',
  {
    resultId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    adminId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    declearBy: {
      type: DataTypes.STRING,
      allowNull: false,
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
    type : {
      type: DataTypes.ENUM("Matched", "Unmatched"),
      defaultValue: "Unmatched",
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isReject : {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  },
  {
    tableName: 'winResultRequest',
    timestamps: true,
    freezeTableName: true,
  },
);

export default WinResultRequest;
