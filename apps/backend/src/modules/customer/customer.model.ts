import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@/config/db";

interface CustomerAttributes {
  id: number;
  email: string;
  password: string;
  name?: string;
  phone?: string;
  emailVerified: boolean;
  shippingAddresses?: Array<{
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    isDefault: boolean;
  }>;
  verificationToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CustomerCreationAttributes extends Optional<CustomerAttributes, "id" | "emailVerified"> {}

export class Customer
  extends Model<CustomerAttributes, CustomerCreationAttributes>
  implements CustomerAttributes
{
  public id!: number;
  public email!: string;
  public password!: string;
  public name?: string;
  public phone?: string;
  public emailVerified!: boolean;
  public shippingAddresses?: CustomerAttributes["shippingAddresses"];
  public verificationToken?: string | null;
  public resetPasswordToken?: string | null;
  public resetPasswordExpires?: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Customer.init(
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
    phone: {
      type: DataTypes.STRING,
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    shippingAddresses: {
      type: DataTypes.JSONB,
      defaultValue: [],
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
  },
  {
    sequelize,
    modelName: "Customer",
    tableName: "customers",
    timestamps: true,
  }
);

Customer.prototype.toJSON = function () {
  const values = this.get();
  const { password, verificationToken, resetPasswordToken, resetPasswordExpires, ...rest } = values;
  return rest;
};
