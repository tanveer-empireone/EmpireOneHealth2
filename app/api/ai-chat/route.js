import { mkdir, readFile, appendFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

const DATA_ROOT = path.join(process.cwd(), "data");
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

const knowledgeBase = [
  {
    id: "company-overview",
    title: "EmpireOneHealth overview",
    url: "/about",
    keywords: ["EmpireOneHealth", "healthcare", "RCM", "BPO", "operations", "about"],
    content:
      "EmpireOneHealth provides healthcare operations, revenue cycle management support, and dedicated workforce solutions for providers and health plans. Services are designed to support reliable execution, cleaner workflows, and accountable outcomes."
  },
  {
    id: "provider-services",
    title: "Provider services",
    url: "/provider-services",
    keywords: ["provider", "provider services", "patient access", "RCM", "eligibility", "authorization", "denials"],
    content:
      "Provider services include benefits verification and eligibility, prior authorization support, denial management, payment posting, revenue cycle support, patient access workflows, and healthcare administrative operations."
  },
  {
    id: "benefits-verification",
    title: "Benefits verification and eligibility",
    url: "/provider-services/benefits-verification-eligibility",
    keywords: ["benefits verification", "eligibility", "insurance", "coverage", "copay", "deductible", "patient access"],
    content:
      "Benefits verification and eligibility checking confirms active insurance coverage and patient benefit details before care. This can include coverage status, co-pay, deductible, co-insurance, covered services, payer rules, and documentation needed for clean downstream billing."
  },
  {
    id: "prior-authorization",
    title: "Prior authorization management",
    url: "/provider-services/prior-authorization-management",
    keywords: ["prior authorization", "authorization", "payer", "clinical documentation", "approval", "tracking"],
    content:
      "Prior authorization support helps providers prepare, submit, track, and follow up on authorization requests according to payer requirements. Workflows can include documentation checks, status tracking, escalation, and reporting."
  },
  {
    id: "denial-management",
    title: "Denial management",
    url: "/provider-services/denial-management",
    keywords: ["denial", "denials", "appeal", "underpayment", "claims", "rework"],
    content:
      "Denial management support helps healthcare teams review payer denials, organize appeal documentation, identify root causes, and track recovery activity so revenue cycle teams can reduce preventable rework."
  },
  {
    id: "payer-services",
    title: "Payer services",
    url: "/payer-services",
    keywords: ["payer", "health plan", "member services", "enrollment", "claims", "payer operations"],
    content:
      "Payer services support health plans with operational workflows such as member services, enrollment support, claims-related administration, provider data support, and back-office healthcare operations."
  },
  {
    id: "member-services",
    title: "Member services",
    url: "/payer-services/member-services",
    keywords: ["member services", "member support", "health plan", "payer", "benefits questions"],
    content:
      "Member services support helps health plans respond to member questions, route benefit inquiries, document interactions, and support a consistent member experience across operational queues."
  },
  {
    id: "enrollment-support",
    title: "Enrollment support",
    url: "/payer-services/enrollment-support",
    keywords: ["enrollment", "eligibility", "payer enrollment", "member enrollment", "plan enrollment"],
    content:
      "Enrollment support helps payer teams process member enrollment workflows, validate required data, manage documentation, and support timely updates across plan systems."
  },
  {
    id: "provider-data-management",
    title: "Provider data management",
    url: "/payer-services/provider-data-management",
    keywords: ["provider data", "directory", "credentialing", "payer data", "provider records"],
    content:
      "Provider data management support helps payer organizations maintain cleaner provider records, support directory accuracy, process updates, and improve downstream operational reliability."
  },
  {
    id: "compliance-security",
    title: "Trust and compliance",
    url: "/about",
    keywords: ["HIPAA", "SOC 2", "PCI DSS", "GDPR", "ISO", "compliance", "security"],
    content:
      "EmpireOneHealth positions its healthcare operations around secure, compliant workflows. The website highlights HIPAA-conscious operations and trust-focused delivery practices for healthcare teams."
  },
  {
    id: "automation-qa",
    title: "Healthcare automation and QA",
    url: "/provider-services",
    keywords: ["automation", "QA", "reporting", "workflow", "scorecard", "monitoring"],
    content:
      "EmpireOneHealth combines trained healthcare operations talent with practical automation, QA scorecards, transparent reporting, and workflow monitoring so healthcare teams can reduce friction and scale with confidence."
  },
  {
    id: "contact",
    title: "Contact EmpireOneHealth",
    url: "/contact",
    keywords: ["contact", "quote", "pricing", "consultation", "call", "email"],
    content:
      "Visitors can contact EmpireOneHealth through the website contact page or request a 30 minute call. For custom requirements, pricing, staffing levels, workflow scope, or compliance questions, the team should collect details and follow up directly."
  }
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  if (!searchParams.has("status")) {
    return json({ error: "Method not allowed" }, 405);
  }

  return json({
    status: "ok",
    provider: "groq",
    api_key_present: Boolean(getAiApiKey()),
    model: getGroqModel(process.env.AI_CHAT_MODEL),
    logs_writable: await canWriteLogs(),
    last_ai_error: await getLastAiError()
  });
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "Invalid JSON payload" }, 400);
  }

  if (!payload || typeof payload !== "object") {
    return json({ error: "Invalid JSON payload" }, 400);
  }

  const page = cleanString(payload.page, 300);
  const action = cleanString(payload.action, 40);

  if (action === "lead") {
    await saveLeadCapture(payload.lead || {}, page);
    return json({ status: "success" });
  }

  if (action === "feedback") {
    await saveChatFeedback(payload, page);
    return json({ status: "success" });
  }

  const message = cleanString(payload.message, 2000);
  const history = Array.isArray(payload.history) ? payload.history.slice(-8) : [];

  if (!message) {
    return json({ error: "Please send a message between 1 and 2000 characters." }, 400);
  }

  if (isGreeting(message)) {
    const responsePayload = {
      responseId: createResponseId(),
      answer:
        "Hi! I can help with EmpireOneHealth services, healthcare operations, RCM support, provider services, payer services, and compliance questions. What would you like to know?",
      handoff: false,
      leadCapture: false,
      sources: [],
      usedAi: false,
      lowConfidence: false
    };
    await logChatEvent(message, page, responsePayload);
    return json(publicResponse(responsePayload));
  }

  const matches = findKnowledgeMatches(message, knowledgeBase, 5);
  const handoffIntent = hasHandoffIntent(message);
  const leadIntent = hasLeadIntent(message);
  const lowConfidence = matches.length === 0 || matches[0].score < 2;
  const sources = matches.map((match) => ({ title: match.entry.title, url: match.entry.url }));
  const fallback = buildFallbackAnswer(matches, handoffIntent || leadIntent || lowConfidence);

  let answer = fallback.answer;
  let usedAi = false;

  const apiKey = getAiApiKey();
  if (apiKey && !(handoffIntent && lowConfidence)) {
    const aiAnswer = await askGroq(apiKey, message, history, matches, page);
    if (aiAnswer) {
      answer = aiAnswer;
      usedAi = true;
    }
  }

  const responsePayload = {
    responseId: createResponseId(),
    answer,
    handoff: handoffIntent || leadIntent || lowConfidence,
    leadCapture: handoffIntent || leadIntent,
    sources,
    usedAi,
    lowConfidence
  };

  await logChatEvent(message, page, responsePayload);
  if (lowConfidence) {
    await logUnansweredQuestion(message, page, matches, responsePayload);
  }

  return json(publicResponse(responsePayload));
}

function json(payload, status = 200) {
  return Response.json(payload, { status });
}

function cleanString(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function tokenize(text) {
  const stopWords = new Set(["the", "and", "for", "with", "can", "you", "your", "are", "what", "how", "does", "this", "that", "from", "have", "about"]);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token && token.length >= 3 && !stopWords.has(token));
}

function findKnowledgeMatches(query, entries, limit) {
  const tokens = tokenize(query);
  const loweredQuery = query.toLowerCase();
  const matches = [];

  for (const entry of entries) {
    const haystack = `${entry.title} ${entry.keywords.join(" ")} ${entry.content}`.toLowerCase();
    let score = 0;

    for (const token of tokens) {
      score += haystack.split(token).length - 1;
    }

    for (const keyword of entry.keywords) {
      if (loweredQuery.includes(keyword.toLowerCase())) {
        score += 3;
      }
    }

    if (score > 0) {
      matches.push({ entry, score });
    }
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, limit);
}

function isGreeting(message) {
  const normalized = message.toLowerCase().trim().replace(/[.!?,]+$/g, "");
  return ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"].includes(normalized) || /^(hi|hello|hey)\b/i.test(message);
}

function hasHandoffIntent(message) {
  return includesAny(message, ["human", "agent", "person", "representative", "sales", "quote", "pricing", "price", "proposal", "call me", "contact me", "talk to", "book", "demo"]);
}

function hasLeadIntent(message) {
  return includesAny(message, ["need support", "need a team", "outsource", "hire", "build team", "start", "launch", "consultation", "security consultation", "bpo support", "rcm support"]);
}

function includesAny(message, patterns) {
  const lowered = message.toLowerCase();
  return patterns.some((pattern) => lowered.includes(pattern));
}

function buildFallbackAnswer(matches, handoff) {
  if (!matches.length) {
    return {
      answer:
        "I do not have enough approved EmpireOneHealth knowledge to answer that confidently. I can connect you with a team member, or you can contact EmpireOneHealth at info@empireonehealth.com."
    };
  }

  const [top, ...related] = matches;
  let answer = top.entry.content;

  if (related.length) {
    answer += `\n\nRelated pages: ${related.slice(0, 3).map((match) => match.entry.title).join(", ")}.`;
  }

  if (handoff) {
    answer += "\n\nFor pricing, custom requirements, security reviews, or a proposal, I can connect you with a real EmpireOneHealth team member.";
  }

  return { answer };
}

function publicResponse(payload) {
  return {
    responseId: payload.responseId,
    answer: payload.answer,
    handoff: payload.handoff,
    leadCapture: payload.leadCapture,
    sources: payload.sources,
    usedAi: payload.usedAi
  };
}

function getGroqModel(configuredModel) {
  const model = String(configuredModel || "").trim();
  if (!model || model.toLowerCase().startsWith("gpt-")) {
    return DEFAULT_MODEL;
  }
  return model;
}

function getAiApiKey() {
  return [process.env.GROQ_API_KEY, process.env.AI_CHAT_GROQ_API_KEY]
    .map((candidate) => String(candidate || "").trim())
    .find((candidate) => candidate && !candidate.toLowerCase().includes("paste-your-")) || "";
}

function createResponseId() {
  return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(8).toString("hex");
}

async function askGroq(apiKey, message, history, matches, page) {
  const context = matches
    .map(({ entry }) => `Title: ${entry.title}\nURL: ${entry.url}\nContent: ${entry.content}`)
    .join("\n\n");
  const historyText = history
    .map((item) => {
      const role = item && item.role === "user" ? "Visitor" : "Assistant";
      const content = cleanString(item && item.content, 700);
      return content ? `${role}: ${content}` : "";
    })
    .filter(Boolean)
    .join("\n");

  const body = {
    model: getGroqModel(process.env.AI_CHAT_MODEL),
    messages: [
      {
        role: "system",
        content:
          "You are the EmpireOneHealth AI assistant. Answer website visitor questions using only the provided EmpireOneHealth knowledge. Be concise, warm, and sales-helpful. Do not invent pricing, certifications, locations, timelines, or guarantees. If the visitor asks for a quote, pricing, a custom proposal, a security audit, legal/security details, or asks for a person, say you can connect them with a real team member. Keep answers under 140 words unless the visitor asks for detail."
      },
      {
        role: "user",
        content: `Current page: ${page}\n\nKnowledge:\n${context}\n\nRecent chat:\n${historyText}\nVisitor question: ${message}`
      }
    ],
    temperature: 0.35,
    max_tokens: 450
  };

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const text = await response.text();
    if (!response.ok) {
      await logAiError("groq", response.status, response.statusText, text);
      return null;
    }

    const data = JSON.parse(text);
    return cleanString(data?.choices?.[0]?.message?.content, 3000) || null;
  } catch (error) {
    await logAiError("groq", 0, error instanceof Error ? error.message : "Unknown AI request error", "");
    return null;
  }
}

async function appendLog(folder, filePrefix, entry) {
  try {
    const dir = path.join(DATA_ROOT, folder);
    await mkdir(dir, { recursive: true });
    const file = path.join(dir, `${filePrefix}${new Date().toISOString().slice(0, 10)}.jsonl`);
    await appendFile(file, `${JSON.stringify(entry)}\n`, "utf8");
  } catch {
    // Logging should never interrupt the visitor experience.
  }
}

async function logChatEvent(message, page, responsePayload) {
  await appendLog("ai-chat-logs", "", {
    time: new Date().toISOString(),
    page,
    response_id: responsePayload.responseId,
    message: cleanString(message, 2000),
    answer: cleanString(responsePayload.answer, 3000),
    handoff: responsePayload.handoff,
    leadCapture: responsePayload.leadCapture,
    usedAi: responsePayload.usedAi,
    lowConfidence: responsePayload.lowConfidence,
    sources: (responsePayload.sources || []).map((source) => source.title || "")
  });
}

async function logUnansweredQuestion(message, page, matches, responsePayload) {
  await appendLog("ai-unanswered-questions", "", {
    time: new Date().toISOString(),
    page,
    response_id: responsePayload.responseId,
    question: cleanString(message, 2000),
    answer: cleanString(responsePayload.answer, 3000),
    usedAi: responsePayload.usedAi,
    top_match_score: matches[0]?.score || 0,
    matched_sources: matches.slice(0, 3).map((match) => match.entry.title),
    review_status: "needs_review"
  });
}

async function saveChatFeedback(payload, page) {
  const rating = cleanString(payload.rating, 20).toLowerCase();
  if (!["up", "down"].includes(rating)) return;

  await appendLog("ai-feedback", "", {
    time: new Date().toISOString(),
    page,
    response_id: cleanString(payload.responseId, 80),
    rating,
    question: cleanString(payload.question, 2000),
    answer: cleanString(payload.answer, 3000)
  });
}

async function saveLeadCapture(lead, page) {
  const allowedFields = ["intent", "agents", "solution", "compliance", "career_area", "provider_workflow", "payer_workflow", "full_name", "company_name", "company_email", "phone"];
  const cleanLead = {};
  for (const field of allowedFields) {
    if (lead && lead[field]) {
      cleanLead[field] = cleanString(lead[field], 300);
    }
  }

  await appendLog("ai-chat-leads", "", {
    time: new Date().toISOString(),
    page,
    lead: cleanLead
  });
}

async function logAiError(provider, status, error, response) {
  await appendLog("ai-chat-logs", "ai-errors-", {
    time: new Date().toISOString(),
    type: "ai_error",
    provider,
    status,
    error,
    response: cleanString(response, 2000)
  });
}

async function getLastAiError() {
  try {
    const file = path.join(DATA_ROOT, "ai-chat-logs", `ai-errors-${new Date().toISOString().slice(0, 10)}.jsonl`);
    const text = await readFile(file, "utf8");
    const lines = text.trim().split("\n").filter(Boolean);
    return lines.length ? JSON.parse(lines[lines.length - 1]) : null;
  } catch {
    return null;
  }
}

async function canWriteLogs() {
  try {
    await mkdir(path.join(DATA_ROOT, "ai-chat-logs"), { recursive: true });
    return true;
  } catch {
    return false;
  }
}
