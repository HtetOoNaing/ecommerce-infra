import { Op } from "sequelize";
import { AuditLog } from "./audit-log.model";
import { CreateAuditLogDto, AuditAction } from "./audit-log.types";

export class AuditLogRepository {
  async create(data: CreateAuditLogDto): Promise<AuditLog> {
    return AuditLog.create({
      adminId: data.adminId ?? null,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId ?? null,
      ip: data.ip ?? null,
      userAgent: data.userAgent ?? null,
      before: data.before ?? null,
      after: data.after ?? null,
    });
  }

  async findByAdmin(adminId: number, limit = 50, offset = 0): Promise<AuditLog[]> {
    return AuditLog.findAll({
      where: { adminId },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
  }

  async findByResource(resource: string, resourceId?: string): Promise<AuditLog[]> {
    const where: Record<string, unknown> = { resource };
    if (resourceId) where.resourceId = resourceId;
    return AuditLog.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });
  }

  async findAll(limit = 100, offset = 0): Promise<AuditLog[]> {
    return AuditLog.findAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
  }

  async findByAction(action: AuditAction, limit = 100): Promise<AuditLog[]> {
    return AuditLog.findAll({
      where: { action },
      order: [["createdAt", "DESC"]],
      limit,
    });
  }

  async findByDateRange(from: Date, to: Date): Promise<AuditLog[]> {
    return AuditLog.findAll({
      where: {
        createdAt: { [Op.between]: [from, to] },
      },
      order: [["createdAt", "DESC"]],
    });
  }
}
