import nodemailer from "nodemailer";
import { checkRateLimit, rateLimitedJson } from "../../../lib/rate-limit";

export const runtime = "nodejs";

const leadToEmail = process.env.LEAD_TO_EMAIL || "info@empireonehealth.com";
const smtpUser = process.env.SMTP_USER || "info@empireonehealth.com";
const fromName = process.env.MAIL_FROM_NAME || "EmpireOne Health";

function clean(value, maxLength = 500) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function normalizeSecret(value) {
  return String(value || "").trim().replace(/^["']|["']$/g, "");
}

function getSmtpPassword() {
  return normalizeSecret(process.env.SMTP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD);
}

function createTransporter() {
  const smtpPassword = getSmtpPassword();

  if (!smtpPassword) {
    throw new Error("SMTP password is not configured.");
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE !== undefined
    ? process.env.SMTP_SECURE === "true"
    : port === 465;
  const requireTLS = process.env.SMTP_REQUIRE_TLS === "true" || process.env.SMTP_TLS === "true" || port === 587;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port,
    secure,
    requireTLS,
    auth: {
      user: smtpUser,
      pass: smtpPassword
    }
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value) {
  return clean(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request) {
  const requestId = `subscribe-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    const payload = await request.json();

    if (!payload || typeof payload !== "object") {
      return Response.json({ status: "error", message: "Invalid subscribe request." }, { status: 400 });
    }

    const email = clean(payload.email, 254).toLowerCase();
    const pageUrl = clean(payload.page_url, 500);

    const limit = checkRateLimit(request, {
      name: "subscribe",
      windowMs: 15 * 60 * 1000,
      max: Number(process.env.SUBSCRIBE_RATE_LIMIT || 10)
    });

    if (!limit.allowed) {
      return rateLimitedJson(limit);
    }

    if (!isValidEmail(email)) {
      return Response.json({ status: "error", message: "Please enter a valid email address." }, { status: 400 });
    }

    console.info("Footer subscribe submission started", {
      requestId,
      smtpHost: process.env.SMTP_HOST || "smtp.hostinger.com",
      smtpPort: process.env.SMTP_PORT || "465",
      smtpUser,
      leadToEmail,
      hasSmtpPassword: Boolean(getSmtpPassword())
    });

    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"${fromName}" <${smtpUser}>`,
      to: leadToEmail,
      replyTo: email,
      subject: "New Footer Subscriber from EmpireOne Health Website",
      html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;">
        <tr>
          <td style="padding:22px;text-align:center;background:#082A96;color:#ffffff;">
            <h2 style="margin:0;">New Footer Subscriber</h2>
          </td>
        </tr>
        <tr><td style="padding:30px;color:#333;font-size:15px;line-height:1.6;">
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Source Page:</strong> ${escapeHtml(pageUrl || "Not Provided")}</p>
        </td></tr>
        <tr><td style="padding:15px;text-align:center;font-size:12px;color:#777;">This message was sent from the footer subscribe form.</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
    });

    console.info("Footer subscribe email sent", {
      requestId,
      accepted: info.accepted,
      rejected: info.rejected
    });

    return Response.json({ status: "success", message: "Thank you for subscribing.", requestId });
  } catch (error) {
    console.error("Footer subscribe submission failed", { requestId, error });
    return Response.json(
      { status: "error", message: "We could not subscribe you right now. Please try again later." },
      { status: 500 }
    );
  }
}
