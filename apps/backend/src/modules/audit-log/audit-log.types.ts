export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export interface AuditLogEntity {
  id: number;
  adminId: number | null;
  action: AuditAction;
  resource: string;
  resourceId: string | null;
  ip: string | null;
  userAgent: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  createdAt: Date;
}

export interface CreateAuditLogDto {
  adminId: number | null;
  action: AuditAction;
  resource: string;
  resourceId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}
