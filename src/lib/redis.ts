import Redis from "ioredis";

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : null;

export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function setCache(key: string, value: any, ttlSeconds = 300) {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    console.error("Redis set error:", err);
  }
}

export async function deleteCache(key: string) {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch (err) {
    console.error("Redis delete error:", err);
  }
}

export default redis;