import { Redis } from "@upstash/redis";

const redis = new Redis({
  url:
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    process.env.KV_URL ||
    process.env.REDIS_URL ||
    "",
  token:
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    process.env.KV_REST_API_READ_ONLY_TOKEN ||
    "",
});

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!redis || !redis["rest"]?.url) {
    console.error("Upstash/Redis environment variables are missing");
    return res.status(500).json({ error: "Storage is not configured on the server." });
  }

  try {
    const { email, name } = req.body ?? {};

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return res.status(400).json({ error: "Invalid email" });
    }

    await redis.sadd("subscribers", normalizedEmail);
    await redis.hset(`subscriber:${normalizedEmail}`, {
      name: typeof name === "string" ? name.trim() : "",
      createdAt: Date.now(),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}


