import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";

const redisClient = new Redis();

export const globalRateLimiter = new RateLimiterRedis({
	storeClient: redisClient,
	keyPrefix: "global_limit",
	points: 5,
	duration: 60,
	blockDuration: 60 * 5,
	inMemoryBlockOnConsumed: 10,
	inMemoryBlockDuration: 10,
});
