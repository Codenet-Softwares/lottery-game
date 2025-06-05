import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    UserId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    MarketId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    }
},
    {
        timestamps: true,
    }
)

Notification.afterCreate(async (notification, options) => {
    console.log("Notification saved:", notification);
});

export default Notification