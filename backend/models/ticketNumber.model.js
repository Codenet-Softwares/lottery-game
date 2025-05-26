import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const TicketNumber = sequelize.define(
    'TicketNumbers',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        ResultId: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        MarketId: {
            type: DataTypes.UUID,
            allowNull: false,   
        },
         marketName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
        TicketNumber: {
            type: DataTypes.STRING,
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
   
    },
    {
        timestamps: true
    },
);

export default TicketNumber;
