import nodemailer from "nodemailer";

const leadToEmail = process.env.LEAD_TO_EMAIL || "info@empireonehealth.com";
const smtpUser = process.env.SMTP_USER || "info@empireonehealth.com";
const fromName = process.env.MAIL_FROM_NAME || "EmpireOne Health";

function createRequestId() {
  return `lead-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function clean(value) {
  return String(value ?? "").trim();
}

function escapeHtml(value) {
  return clean(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function splitLeadName(fullName) {
  const normalized = clean(fullName).replace(/\s+/g, " ");

  if (!normalized) {
    return { firstName: "", lastName: "Website Lead" };
  }

  const [firstName, ...rest] = normalized.split(" ");

  return {
    firstName: rest.length ? firstName : "",
    lastName: rest.length ? rest.join(" ") : firstName
  };
}

function formatLabel(value) {
  return clean(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getSmtpPassword() {
  return process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD || "";
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

async function submitSalesforceLead({ fullName, companyName, email, contactNumber, workflow, source, message, pageUrl }) {
  const oid = process.env.SALESFORCE_WEB_TO_LEAD_OID;

  if (!oid) {
    return;
  }

  const { firstName, lastName } = splitLeadName(fullName);
  const body = new URLSearchParams({
    oid,
    retURL: process.env.SALESFORCE_RET_URL || "https://empireonehealth.com/contact",
    first_name: firstName,
    last_name: lastName,
    email,
    company: companyName || "Not Provided",
    phone: contactNumber,
    lead_source: source ? `Web - ${formatLabel(source)}` : "Web",
    description: [
      `Workflow: ${formatLabel(workflow)}`,
      `Source: ${formatLabel(source)}`,
      `Message: ${message || "Not Provided"}`,
      `Source Page: ${pageUrl || "Not Provided"}`
    ].join("\n")
  });

  const response = await fetch("https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    throw new Error("Salesforce Web-to-Lead submission failed.");
  }
}

function buildAdminEmail(data) {
  const rows = [
    ["Full Name", data.fullName],
    ["Company", data.companyName || "Not Provided"],
    ["Email", data.email],
    ["Phone", data.contactNumber || "Not Provided"],
    ["Workflow", formatLabel(data.workflow)],
    ["Source", formatLabel(data.source) || "Not Provided"],
    ["Message", data.message || "Not Provided"],
    ["Source Page", data.pageUrl || "Not Provided"]
  ];

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;">
        <tr>
          <td style="padding:22px;text-align:center;background:#082A96;color:#ffffff;">
            <h2 style="margin:0;">New EmpireOne Health Form Submission</h2>
          </td>
        </tr>
        <tr><td style="padding:30px;">
          <table width="100%" cellpadding="8" cellspacing="0">
            ${rows.map(([label, value]) => `<tr><td style="font-weight:bold;width:170px;vertical-align:top;">${escapeHtml(label)}:</td><td>${escapeHtml(value)}</td></tr>`).join("")}
          </table>
        </td></tr>
        <tr><td style="padding:15px;text-align:center;font-size:12px;color:#777;">This message was sent from your website form.</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildUserEmail(fullName) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;">
        <tr>
          <td style="padding:22px;text-align:center;background:#082A96;color:#ffffff;">
            <h2 style="margin:0;">Thank You for Reaching Out</h2>
          </td>
        </tr>
        <tr><td style="padding:30px;color:#333;font-size:15px;line-height:1.6;">
          <p>Hello ${escapeHtml(fullName)},</p>
          <p>Thank you for your interest in EmpireOne Health. This email confirms that we've received your inquiry. Our team is reviewing your request and will be in touch shortly.</p>
          <p>We appreciate the opportunity to assist you.</p>
          <br>
          <p>Best regards,<br><strong>EmpireOne Health</strong></p>
        </td></tr>
        <tr><td style="padding:15px;text-align:center;font-size:12px;color:#777;">&copy; ${new Date().getFullYear()} EmpireOne Health. All rights reserved.</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function handleContactPost(request, options = {}) {
  const requestId = createRequestId();

  try {
    const payload = await request.json();
    const fullName = clean(payload.full_name);
    const companyName = clean(payload.company_name);
    const email = clean(payload.email).toLowerCase();
    const verifyEmail = clean(payload.verify_email).toLowerCase();
    const contactNumber = clean(payload.contact_number);
    const source = clean(payload.source || options.defaultSource || "Web");
    const workflow = clean(payload.workflow || options.defaultWorkflow || "Website Lead");
    const message = clean(payload.message);
    const pageUrl = clean(payload.page_url);
    const privacyConsent = Boolean(payload.privacy_consent);
    const honeypotValue = clean(payload.website || payload.hp_website);

    if (honeypotValue) {
      return Response.json({ status: "success", message: "Thank you! We will contact you soon.", requestId });
    }

    if (!fullName || !email || !verifyEmail || !contactNumber) {
      return Response.json({ status: "error", message: "Please complete the required name, email, and contact number fields." }, { status: 400 });
    }

    if (email !== verifyEmail) {
      return Response.json({ status: "error", message: "Email and verify email must match." }, { status: 400 });
    }

    if (!privacyConsent) {
      return Response.json({ status: "error", message: "Please confirm the privacy policy checkbox." }, { status: 400 });
    }

    console.info("Lead form submission started", {
      requestId,
      smtpHost: process.env.SMTP_HOST || "smtp.hostinger.com",
      smtpPort: process.env.SMTP_PORT || "465",
      smtpUser,
      leadToEmail,
      hasSmtpPassword: Boolean(getSmtpPassword()),
      hasSalesforceOid: Boolean(process.env.SALESFORCE_WEB_TO_LEAD_OID)
    });

    const transporter = createTransporter();
    const data = { fullName, companyName, email, contactNumber, source, workflow, message, pageUrl };

    const adminEmailInfo = await transporter.sendMail({
      from: `"${fromName}" <${smtpUser}>`,
      to: leadToEmail,
      replyTo: `"${fullName}" <${email}>`,
      subject: "New Inquiry from EmpireOne Health Website",
      html: buildAdminEmail(data)
    });

    console.info("Lead admin email sent", {
      requestId,
      accepted: adminEmailInfo.accepted,
      rejected: adminEmailInfo.rejected
    });

    const userEmailInfo = await transporter.sendMail({
      from: `"${fromName}" <${smtpUser}>`,
      to: email,
      replyTo: leadToEmail,
      subject: "Thank You for Contacting EmpireOne Health",
      html: buildUserEmail(fullName)
    });

    console.info("Lead confirmation email sent", {
      requestId,
      accepted: userEmailInfo.accepted,
      rejected: userEmailInfo.rejected
    });

    try {
      await submitSalesforceLead(data);
      console.info("Lead Salesforce submission completed", { requestId });
    } catch (salesforceError) {
      console.error("Lead Salesforce submission failed", { requestId, error: salesforceError });
    }

    return Response.json({ status: "success", message: "Thank you! We will contact you soon.", requestId });
  } catch (error) {
    console.error("Lead form submission failed", { requestId, error });
    return Response.json(
      { status: "error", message: "We could not send your request right now. Please try again later." },
      { status: 500 }
    );
  }
}
