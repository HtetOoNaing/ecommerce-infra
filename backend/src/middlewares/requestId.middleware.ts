import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

export interface RequestWithId extends Request {
  requestId?: string;
}

export const requestIdMiddleware = (
  req: RequestWithId,
  _res: Response,
  next: NextFunction
) => {
  req.requestId = uuidv4();
  next();
};