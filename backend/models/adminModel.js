import { DataTypes } from 'sequelize';
import {sequelize} from '../config/db.js';
import bcrypt from 'bcrypt';

const Admin = sequelize.define(
  'Admin',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    adminId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'subAdmin', 'user'),
      allowNull: false,
    },
    permissions :{
      type: DataTypes.STRING,
      allowNull: true,
    },
    isReset: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    token: {
      type: DataTypes.TEXT,
    },
  },
  {
    indexes: [], 
  },
);

Admin.beforeCreate(async (admin) => {
  admin.password = await bcrypt.hash(admin.password, 10);
});

Admin.beforeUpdate(async (admin) => {
  if (admin.changed('password')) {
    const isHashed = admin.password.startsWith('$2b$'); 
    if (!isHashed) {
      admin.password = await bcrypt.hash(admin.password, 10);
    }
  }
});
Admin.prototype.validPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default Admin;
