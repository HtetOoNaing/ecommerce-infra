import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@/config/db";
import { AuditAction } from "./audit-log.types";

interface AuditLogAttributes {
  id: number;
  adminId: number | null;
  action: AuditAction;
  resource: string;
  resourceId: string | null;
  ip: string | null;
  userAgent: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  createdAt?: Date;
}

interface AuditLogCreationAttributes
  extends Optional<
    AuditLogAttributes,
    "id" | "adminId" | "resourceId" | "ip" | "userAgent" | "before" | "after"
  > {}

export class AuditLog
  extends Model<AuditLogAttributes, AuditLogCreationAttributes>
  implements AuditLogAttributes
{
  public id!: number;
  public adminId!: number | null;
  public action!: AuditAction;
  public resource!: string;
  public resourceId!: string | null;
  public ip!: string | null;
  public userAgent!: string | null;
  public before!: Record<string, unknown> | null;
  public after!: Record<string, unknown> | null;
  public readonly createdAt!: Date;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    action: {
      type: DataTypes.ENUM("CREATE", "UPDATE", "DELETE"),
      allowNull: false,
    },
    resource: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    resourceId: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    ip: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    before: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    after: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "audit_logs",
    timestamps: true,
    updatedAt: false,
  }
);
