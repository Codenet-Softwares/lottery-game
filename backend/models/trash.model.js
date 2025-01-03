import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";

class LotteryTrash extends Model { }

LotteryTrash.init(
    {
        trashMarketId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        trashMarkets : {
            type: DataTypes.JSON,
            allowNull: false,
        }
    },
    {
        sequelize,
        modelName: 'LotteryTrash',
        tableName: 'LotteryTrash',
        timestamps: true,
      },
);

export default LotteryTrash;
