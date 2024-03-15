import { Injectable } from "@nestjs/common";
import { Redis } from "ioredis";

@Injectable()
export class RateLimitService {
    private readonly redisClient:Redis

    constructor(){
        this.redisClient = new Redis()
    }
    async incrementAndCheckLimit(ipAddress: string, limit: number, ttl: number): Promise<boolean> {
        const key = `rate-limiter:${ipAddress}`;
        const count = await this.redisClient.incr(key);
    
        // Nếu số lượt yêu cầu vượt quá giới hạn, trả về false
        if (count > limit) {
          return false;
        }
    
        // Đặt thời gian tồn tại (TTL) cho khóa
        if (count === 1) {
          await this.redisClient.expire(key, ttl);
        }
    
        return true;
      }


}