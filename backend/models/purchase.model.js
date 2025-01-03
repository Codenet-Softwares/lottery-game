import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const PurchaseLottery = sequelize.define(
  'PurchaseLottery',
  {
    purchaseId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    generateId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    group: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    series: {
      type: DataTypes.CHAR(1),
      allowNull: false,
    },
    number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sem: {
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
    lotteryPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    resultAnnouncement : {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    gameName :
    {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Lottery',
    },
    hidePurchase : {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    settleTime : {
      type: DataTypes.DATE,
      allowNull: true,
    }
  },
  {
    tableName: "PurchaseLottery",
    timestamps: true,
  }
);

export default PurchaseLottery;