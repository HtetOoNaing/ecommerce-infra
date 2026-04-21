import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { AuditLogService } from "@/modules/audit-log/audit-log.service";
import { AuditAction } from "@/modules/audit-log/audit-log.types";

const auditService = new AuditLogService();

const METHOD_TO_ACTION: Record<string, AuditAction> = {
  POST: "CREATE",
  PUT: "UPDATE",
  PATCH: "UPDATE",
  DELETE: "DELETE",
};

function extractResource(path: string): { resource: string; resourceId: string | null } {
  const segments = path.replace(/^\/api\/v1\//, "").split("/").filter(Boolean);
  const resource = segments[0] ?? "unknown";
  const rawId = segments[1];
  const resourceId =
    rawId && /^\d+$/.test(rawId) ? rawId : null;
  return { resource, resourceId };
}

export function auditLog(req: AuthRequest, _res: Response, next: NextFunction): void {
  const action = METHOD_TO_ACTION[req.method];
  if (!action) {
    next();
    return;
  }

  const { resource, resourceId } = extractResource(req.path);

  _res.on("finish", () => {
    if (_res.statusCode >= 200 && _res.statusCode < 300) {
      auditService.log({
        adminId: req.user?.id ?? null,
        action,
        resource,
        resourceId,
        ip: req.ip ?? null,
        userAgent: req.headers["user-agent"] ?? null,
      });
    }
  });

  next();
}
