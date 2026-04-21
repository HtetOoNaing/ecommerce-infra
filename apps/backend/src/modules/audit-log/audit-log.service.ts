import { logger } from "@/config/logger";
import { AuditLogRepository } from "./audit-log.repository";
import { CreateAuditLogDto, AuditLogEntity, AuditAction } from "./audit-log.types";

const repo = new AuditLogRepository();

export class AuditLogService {
  async log(data: CreateAuditLogDto): Promise<void> {
    try {
      await repo.create(data);
    } catch (err) {
      logger.error("Failed to write audit log", { err, data });
    }
  }

  async getByAdmin(adminId: number, limit?: number, offset?: number): Promise<AuditLogEntity[]> {
    return repo.findByAdmin(adminId, limit, offset);
  }

  async getByResource(resource: string, resourceId?: string): Promise<AuditLogEntity[]> {
    return repo.findByResource(resource, resourceId);
  }

  async getAll(limit?: number, offset?: number): Promise<AuditLogEntity[]> {
    return repo.findAll(limit, offset);
  }

  async getByAction(action: AuditAction): Promise<AuditLogEntity[]> {
    return repo.findByAction(action);
  }
}
