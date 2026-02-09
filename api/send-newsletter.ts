import { createClient } from "@sanity/client";
import { Resend } from "resend";

// Sanity client with write permissions
const sanityClient = createClient({
    projectId: process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET || "production",
    apiVersion: "2024-01-01",
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
});

// Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Convert Sanity block content to HTML
function blocksToHtml(blocks: any[]): string {
    if (!blocks || !Array.isArray(blocks)) return "";

    return blocks.map((block) => {
        if (block._type === "block") {
            const children = block.children?.map((child: any) => {
                let text = child.text || "";
                if (child.marks?.includes("strong")) text = `<strong>${text}</strong>`;
                if (child.marks?.includes("em")) text = `<em>${text}</em>`;
                if (child.marks?.includes("underline")) text = `<u>${text}</u>`;
                return text;
            }).join("") || "";

            switch (block.style) {
                case "h1": return `<h1 style="font-size: 28px; margin: 20px 0 10px;">${children}</h1>`;
                case "h2": return `<h2 style="font-size: 24px; margin: 18px 0 8px;">${children}</h2>`;
                case "h3": return `<h3 style="font-size: 20px; margin: 16px 0 6px;">${children}</h3>`;
                default: return `<p style="font-size: 16px; line-height: 1.6; margin: 10px 0;">${children}</p>`;
            }
        }

        if (block._type === "image" && block.asset) {
            // Basic image handling - you may want to use urlFor from @sanity/image-url
            return `<img src="${block.asset.url || ""}" alt="" style="max-width: 100%; height: auto; margin: 20px 0;" />`;
        }

        return "";
    }).join("\n");
}

// Create email HTML template
function createEmailHtml(subject: string, body: string, preheader?: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>` : ""}
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px; background: linear-gradient(135deg, #f59e0b, #ea580c); border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">LKKINS Elegance</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #1e293b; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 10px; color: #94a3b8; font-size: 14px;">LKKINS Elegance - Premium Custom Apparel</p>
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                You received this email because you subscribed on our website.<br>
                <a href="https://lkkinselegance.com" style="color: #f59e0b; text-decoration: none;">Visit our website</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export default async function handler(req: any, res: any) {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Method not allowed" });
    }

    // Check configuration
    if (!process.env.SANITY_API_TOKEN) {
        return res.status(500).json({ error: "SANITY_API_TOKEN not configured" });
    }
    if (!process.env.RESEND_API_KEY) {
        return res.status(500).json({ error: "RESEND_API_KEY not configured" });
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || "LKKINS Elegance <onboarding@resend.dev>";

    try {
        const { newsletterId } = req.body ?? {};

        if (!newsletterId) {
            return res.status(400).json({ error: "newsletterId is required" });
        }

        // Fetch the newsletter
        const newsletter = await sanityClient.fetch(
            `*[_type == "newsletter" && _id == $id][0] {
        _id,
        subject,
        preheaderText,
        body,
        status
      }`,
            { id: newsletterId }
        );

        if (!newsletter) {
            return res.status(404).json({ error: "Newsletter not found" });
        }

        if (newsletter.status === "sent") {
            return res.status(400).json({ error: "Newsletter has already been sent" });
        }

        // Fetch all active subscribers
        const subscribers: { email: string; name?: string }[] = await sanityClient.fetch(
            `*[_type == "subscriber" && isActive == true] { email, name }`
        );

        if (!subscribers.length) {
            return res.status(400).json({ error: "No active subscribers to send to" });
        }

        // Convert body to HTML
        const bodyHtml = blocksToHtml(newsletter.body);
        const emailHtml = createEmailHtml(newsletter.subject, bodyHtml, newsletter.preheaderText);

        // Send emails in batches (Resend supports batch sending)
        const batchSize = 50;
        let sentCount = 0;
        let failedCount = 0;

        for (let i = 0; i < subscribers.length; i += batchSize) {
            const batch = subscribers.slice(i, i + batchSize);

            const results = await Promise.allSettled(
                batch.map((subscriber) =>
                    resend.emails.send({
                        from: fromEmail,
                        to: subscriber.email,
                        subject: newsletter.subject,
                        html: emailHtml,
                    })
                )
            );

            sentCount += results.filter((r) => r.status === "fulfilled").length;
            failedCount += results.filter((r) => r.status === "rejected").length;
        }

        // Update newsletter status in Sanity
        await sanityClient
            .patch(newsletterId)
            .set({
                status: "sent",
                sentAt: new Date().toISOString(),
                recipientCount: sentCount,
            })
            .commit();

        return res.status(200).json({
            ok: true,
            sent: sentCount,
            failed: failedCount,
            total: subscribers.length,
        });
    } catch (err) {
        console.error("Send newsletter error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
