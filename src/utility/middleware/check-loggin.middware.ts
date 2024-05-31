import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";

@Injectable()
export class checkLoginMiddware implements NestMiddleware {
    private readonly logger = new Logger(checkLoginMiddware.name)
    use(req: Request, res: Response, next: () => void): void {
        this.logger.log(`Login attempt from IP ${req.ip} at ${new Date()}`)
        next()
    
    }
}