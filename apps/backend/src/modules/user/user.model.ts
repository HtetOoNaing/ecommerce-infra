import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@/config/db";

interface UserAttributes {
  id: number;
  email: string;
  password: string;
  name?: string;
  role: "user" | "admin";
  isVerified: boolean;
  verificationToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  totpSecret?: string | null;
  isMfaEnabled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public email!: string;
  public password!: string;
  public name?: string;
  public role!: "user" | "admin";
  public isVerified!: boolean;
  public verificationToken?: string | null;
  public resetPasswordToken?: string | null;
  public resetPasswordExpires?: Date | null;
  public totpSecret?: string | null;
  public isMfaEnabled!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      allowNull: false,
      defaultValue: "user",
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    totpSecret: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    isMfaEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
  }
);

User.prototype.toJSON = function () {
  const values = this.get();

  const { password, totpSecret, ...rest } = values;

  return rest;
};