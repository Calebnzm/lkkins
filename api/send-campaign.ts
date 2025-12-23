import { Redis } from "@upstash/redis";

const redisUrl =
  process.env.KV_REST_API_URL ||
  process.env.KV_URL ||
  process.env.REDIS_URL ||
  "";

const redisToken =
  process.env.KV_REST_API_TOKEN ||
  process.env.KV_REST_API_READ_ONLY_TOKEN ||
  "";

const redis =
  redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
      })
    : null;

const EMAILJS_API_URL = "https://api.emailjs.com/api/v1.0/email/send";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!redis) {
    console.error("Redis environment variables are missing (URL/token)");
    return res.status(500).json({ error: "Storage is not configured on the server." });
  }

  const serviceId = process.env.EMAILJS_SERVICE_ID || process.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_CAMPAIGN_TEMPLATE_ID || process.env.VITE_EMAILJS_TEMPLATE_ID;
  // EmailJS requires the private key on server-to-server calls (public key is browser-only)
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !privateKey) {
    console.error("Missing EmailJS environment variables (serviceId/templateId/privateKey)");
    return res.status(500).json({ error: "EmailJS is not configured on the server." });
  }

  try {
    const subscribers: string[] = (await redis.smembers("subscribers")) ?? [];

    if (!subscribers.length) {
      return res.status(200).json({ ok: true, sent: 0 });
    }

    const results = await Promise.allSettled(
      subscribers.map(async (email) => {
        const profile = (await redis.hgetall(`subscriber:${email}`)) as
          | { name?: string; createdAt?: number }
          | null;

        const templateParams = {
          to_email: email,
          to_name: profile?.name || "",
        };

        const resp = await fetch(EMAILJS_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            service_id: serviceId,
            template_id: templateId,
            accessToken: privateKey,
            template_params: templateParams,
          }),
        });

        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`EmailJS error for ${email}: ${resp.status} ${text}`);
        }
      })
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected");

    if (failed.length) {
      console.error("Some campaign emails failed:", failed);
    }

    return res.status(200).json({ ok: true, sent, failed: failed.length });
  } catch (err) {
    console.error("Campaign error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}


