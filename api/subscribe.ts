import { createClient } from "@sanity/client";

const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // Requires write permissions
});

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.SANITY_API_TOKEN) {
    console.error("SANITY_API_TOKEN is not configured");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const { email, name, source = "contact_form" } = req.body ?? {};

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return res.status(400).json({ error: "Invalid email" });
    }

    // Check if subscriber already exists
    const existingSubscriber = await sanityClient.fetch(
      `*[_type == "subscriber" && email == $email][0]`,
      { email: normalizedEmail }
    );

    if (existingSubscriber) {
      // If exists but inactive, reactivate them
      if (!existingSubscriber.isActive) {
        await sanityClient
          .patch(existingSubscriber._id)
          .set({ isActive: true })
          .commit();
        return res.status(200).json({ ok: true, reactivated: true });
      }
      // Already subscribed and active
      return res.status(200).json({ ok: true, existing: true });
    }

    // Create new subscriber
    await sanityClient.create({
      _type: "subscriber",
      email: normalizedEmail,
      name: typeof name === "string" ? name.trim() : "",
      source,
      isActive: true,
      subscribedAt: new Date().toISOString(),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
