<?php

header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["status"])) {
    echo json_encode(getAiChatStatus(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$rawBody = file_get_contents("php://input");
$payload = json_decode($rawBody, true);

if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid JSON payload"]);
    exit;
}

$message = trim((string)($payload["message"] ?? ""));
$history = is_array($payload["history"] ?? null) ? array_slice($payload["history"], -8) : [];
$page = trim((string)($payload["page"] ?? ""));
$action = trim((string)($payload["action"] ?? ""));

if ($action === "lead") {
    $lead = is_array($payload["lead"] ?? null) ? $payload["lead"] : [];
    saveLeadCapture($lead, $page);
    echo json_encode(["status" => "success"], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === "feedback") {
    saveChatFeedback($payload, $page);
    echo json_encode(["status" => "success"], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

if ($message === "" || strlen($message) > 2000) {
    http_response_code(400);
    echo json_encode(["error" => "Please send a message between 1 and 2000 characters."]);
    exit;
}

if (isGreeting($message)) {
    $responsePayload = [
        "answer" => "Hi! I can help with EmpireOneCX services, CX outsourcing, BPO support, compliance, locations, and careers. What would you like to know?",
        "handoff" => false,
        "leadCapture" => false,
        "sources" => [],
        "usedAi" => false,
    ];
    logChatEvent($message, $page, $responsePayload);
    echo json_encode($responsePayload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

$knowledgeBase = require __DIR__ . "/data/ai-knowledge-base.php";
$matches = findKnowledgeMatches($message, $knowledgeBase, 5);
$handoffIntent = hasHandoffIntent($message);
$leadIntent = hasLeadIntent($message);
$greetingIntent = isGreeting($message);
$lowConfidence = empty($matches) || ($matches[0]["score"] < 2);
$sources = array_map(function ($match) {
    return [
        "title" => $match["entry"]["title"],
        "url" => $match["entry"]["url"],
    ];
}, $matches);

$fallbackAnswer = buildFallbackAnswer($message, $matches, $handoffIntent || $leadIntent || $lowConfidence, $greetingIntent);
$answer = $fallbackAnswer["answer"];
$usedAi = false;

$config = loadAiChatConfig();
$apiKey = getAiApiKey($config);
if ($apiKey && !($handoffIntent && $lowConfidence)) {
    $aiAnswer = askGroq($apiKey, $message, $history, $matches, $page, $config["model"] ?? null);
    if ($aiAnswer !== null) {
        $answer = $aiAnswer;
        $usedAi = true;
    }
}

$responsePayload = [
    "responseId" => createResponseId(),
    "answer" => $answer,
    "handoff" => $handoffIntent || $leadIntent || $lowConfidence,
    "leadCapture" => $handoffIntent || $leadIntent,
    "sources" => $sources,
    "usedAi" => $usedAi,
    "lowConfidence" => $lowConfidence,
];

logChatEvent($message, $page, $responsePayload);
if ($lowConfidence) {
    logUnansweredQuestion($message, $page, $matches, $responsePayload);
}

echo json_encode([
    "responseId" => $responsePayload["responseId"],
    "answer" => $responsePayload["answer"],
    "handoff" => $responsePayload["handoff"],
    "leadCapture" => $responsePayload["leadCapture"],
    "sources" => $responsePayload["sources"],
    "usedAi" => $responsePayload["usedAi"],
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

function findKnowledgeMatches(string $query, array $knowledgeBase, int $limit): array
{
    $tokens = tokenize($query);
    $matches = [];

    foreach ($knowledgeBase as $entry) {
        $haystack = strtolower($entry["title"] . " " . implode(" ", $entry["keywords"]) . " " . $entry["content"]);
        $score = 0;

        foreach ($tokens as $token) {
            if (strlen($token) < 3) {
                continue;
            }
            $score += substr_count($haystack, $token);
        }

        foreach ($entry["keywords"] as $keyword) {
            if (stripos($query, $keyword) !== false) {
                $score += 3;
            }
        }

        if ($score > 0) {
            $matches[] = ["entry" => $entry, "score" => $score];
        }
    }

    usort($matches, function ($a, $b) {
        return $b["score"] <=> $a["score"];
    });

    return array_slice($matches, 0, $limit);
}

function getAiChatStatus(): array
{
    $config = loadAiChatConfig();
    $apiKey = getAiApiKey($config);
    $logDir = __DIR__ . "/data/ai-chat-logs";

    return [
        "status" => "ok",
        "provider" => "groq",
        "config_file_exists" => is_file(__DIR__ . "/data/ai-chat-config.php"),
        "api_key_present" => !empty($apiKey),
        "model" => getGroqModel($config["model"] ?? getenv("AI_CHAT_MODEL") ?: null),
        "curl_available" => function_exists("curl_init"),
        "openssl_available" => extension_loaded("openssl"),
        "allow_url_fopen" => filter_var(ini_get("allow_url_fopen"), FILTER_VALIDATE_BOOLEAN),
        "logs_writable" => is_dir($logDir) ? is_writable($logDir) : is_writable(__DIR__ . "/data"),
        "last_ai_error" => getLastAiError(),
    ];
}

function getLastAiError(): ?array
{
    $files = glob(__DIR__ . "/data/ai-chat-logs/ai-errors-*.jsonl") ?: [];
    if (!$files) {
        return null;
    }

    usort($files, function ($a, $b) {
        return filemtime($b) <=> filemtime($a);
    });

    $lines = @file($files[0], FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if (!$lines) {
        return null;
    }

    $last = json_decode(end($lines), true);
    if (!is_array($last)) {
        return null;
    }

    return [
        "time" => $last["time"] ?? null,
        "status" => $last["status"] ?? null,
        "error" => $last["error"] ?? null,
        "response" => $last["response"] ?? null,
    ];
}

function getGroqModel(?string $configuredModel): string
{
    $model = trim((string)$configuredModel);
    if ($model === "" || stripos($model, "gpt-") === 0) {
        return "llama-3.3-70b-versatile";
    }

    return $model;
}

function loadAiChatConfig(): array
{
    $configPath = __DIR__ . "/data/ai-chat-config.php";
    if (!is_file($configPath)) {
        return [];
    }

    $config = require $configPath;
    return is_array($config) ? $config : [];
}

function getAiApiKey(array $config): string
{
    $candidates = [
        $config["groq_api_key"] ?? null,
        getenv("GROQ_API_KEY") ?: null,
        getenv("AI_CHAT_GROQ_API_KEY") ?: null,
        $config["api_key"] ?? null,
    ];

    foreach ($candidates as $candidate) {
        $apiKey = normalizeApiKey($candidate);
        if ($apiKey !== "") {
            return $apiKey;
        }
    }

    return "";
}

function normalizeApiKey(?string $apiKey): string
{
    $apiKey = trim((string)$apiKey);
    if ($apiKey === "" || stripos($apiKey, "paste-your-") !== false) {
        return "";
    }

    return $apiKey;
}

function createResponseId(): string
{
    try {
        return bin2hex(random_bytes(8));
    } catch (Exception $e) {
        return uniqid("ava_", true);
    }
}

function logChatEvent(string $message, string $page, array $responsePayload): void
{
    $dir = __DIR__ . "/data/ai-chat-logs";
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }

    if (!is_dir($dir) || !is_writable($dir)) {
        return;
    }

    $entry = [
        "time" => gmdate("c"),
        "page" => $page,
        "response_id" => $responsePayload["responseId"] ?? null,
        "message" => substr($message, 0, 2000),
        "answer" => substr((string)($responsePayload["answer"] ?? ""), 0, 3000),
        "handoff" => $responsePayload["handoff"],
        "leadCapture" => $responsePayload["leadCapture"] ?? false,
        "usedAi" => $responsePayload["usedAi"],
        "lowConfidence" => $responsePayload["lowConfidence"] ?? false,
        "sources" => array_map(function ($source) {
            return $source["title"] ?? "";
        }, $responsePayload["sources"] ?? []),
    ];

    @file_put_contents(
        $dir . "/" . gmdate("Y-m-d") . ".jsonl",
        json_encode($entry, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );
}

function logUnansweredQuestion(string $message, string $page, array $matches, array $responsePayload): void
{
    $dir = __DIR__ . "/data/ai-unanswered-questions";
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }

    if (!is_dir($dir) || !is_writable($dir)) {
        return;
    }

    $entry = [
        "time" => gmdate("c"),
        "page" => $page,
        "response_id" => $responsePayload["responseId"] ?? null,
        "question" => substr($message, 0, 2000),
        "answer" => substr((string)($responsePayload["answer"] ?? ""), 0, 3000),
        "usedAi" => $responsePayload["usedAi"] ?? false,
        "top_match_score" => $matches[0]["score"] ?? 0,
        "matched_sources" => array_map(function ($match) {
            return $match["entry"]["title"] ?? "";
        }, array_slice($matches, 0, 3)),
        "review_status" => "needs_review",
    ];

    @file_put_contents(
        $dir . "/" . gmdate("Y-m-d") . ".jsonl",
        json_encode($entry, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );
}

function saveChatFeedback(array $payload, string $page): void
{
    $dir = __DIR__ . "/data/ai-feedback";
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }

    if (!is_dir($dir) || !is_writable($dir)) {
        return;
    }

    $rating = strtolower(trim((string)($payload["rating"] ?? "")));
    if (!in_array($rating, ["up", "down"], true)) {
        return;
    }

    $entry = [
        "time" => gmdate("c"),
        "page" => $page,
        "response_id" => substr(trim((string)($payload["responseId"] ?? "")), 0, 80),
        "rating" => $rating,
        "question" => substr(trim((string)($payload["question"] ?? "")), 0, 2000),
        "answer" => substr(trim((string)($payload["answer"] ?? "")), 0, 3000),
    ];

    @file_put_contents(
        $dir . "/" . gmdate("Y-m-d") . ".jsonl",
        json_encode($entry, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );
}

function saveLeadCapture(array $lead, string $page): void
{
    $dir = __DIR__ . "/data/ai-chat-leads";
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }

    if (!is_dir($dir) || !is_writable($dir)) {
        return;
    }

    $allowedFields = ["intent", "agents", "solution", "compliance", "career_area", "full_name", "company_name", "company_email", "phone"];
    $cleanLead = [];
    foreach ($allowedFields as $field) {
        if (!empty($lead[$field])) {
            $cleanLead[$field] = substr(trim((string)$lead[$field]), 0, 300);
        }
    }

    $entry = [
        "time" => gmdate("c"),
        "page" => $page,
        "lead" => $cleanLead,
    ];

    @file_put_contents(
        $dir . "/" . gmdate("Y-m-d") . ".jsonl",
        json_encode($entry, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );
}

function tokenize(string $text): array
{
    $text = strtolower($text);
    $text = preg_replace("/[^a-z0-9\s]/", " ", $text);
    $tokens = preg_split("/\s+/", $text, -1, PREG_SPLIT_NO_EMPTY);
    $stopWords = ["the", "and", "for", "with", "can", "you", "your", "are", "what", "how", "does", "this", "that", "from", "have", "about"];

    return array_values(array_diff($tokens, $stopWords));
}

function hasHandoffIntent(string $message): bool
{
    $patterns = ["human", "agent", "person", "representative", "sales", "quote", "pricing", "price", "proposal", "call me", "contact me", "talk to", "book", "demo"];
    foreach ($patterns as $pattern) {
        if (stripos($message, $pattern) !== false) {
            return true;
        }
    }
    return false;
}

function hasLeadIntent(string $message): bool
{
    $patterns = ["need support", "need a team", "outsource", "hire", "build team", "start", "launch", "consultation", "security consultation", "bpo support", "cx support"];
    foreach ($patterns as $pattern) {
        if (stripos($message, $pattern) !== false) {
            return true;
        }
    }
    return false;
}

function isGreeting(string $message): bool
{
    $normalized = strtolower(trim($message));
    $normalized = trim($normalized, " \t\n\r\0\x0B.!?,");

    if (in_array($normalized, ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"], true)) {
        return true;
    }

    return (bool)preg_match('/^(hi|hello|hey)\b/i', $message);
}

function buildFallbackAnswer(string $message, array $matches, bool $handoff, bool $greetingIntent = false): array
{
    if ($greetingIntent) {
        return [
            "answer" => "Hi! I can help with EmpireOneCX services, CX outsourcing, BPO support, compliance, locations, and careers. What would you like to know?",
        ];
    }

    if (empty($matches)) {
        return [
            "answer" => "I do not have enough approved EmpireOneCX knowledge to answer that confidently. I can connect you with a team member, or you can contact EmpireOneCX at 800-233-0843 or info@empireonecx.com.",
        ];
    }

    $top = $matches[0]["entry"];
    $answer = $top["content"];

    if (count($matches) > 1) {
        $answer .= "\n\nRelated pages: " . implode(", ", array_map(function ($match) {
            return $match["entry"]["title"];
        }, array_slice($matches, 1, 3))) . ".";
    }

    if ($handoff) {
        $answer .= "\n\nFor pricing, custom requirements, security reviews, or a proposal, I can connect you with a real EmpireOneCX team member.";
    }

    return ["answer" => $answer];
}

function askGroq(string $apiKey, string $message, array $history, array $matches, string $page, ?string $configuredModel = null): ?string
{
    $model = getGroqModel($configuredModel ?: getenv("AI_CHAT_MODEL") ?: null);
    $context = implode("\n\n", array_map(function ($match) {
        $entry = $match["entry"];
        return "Title: {$entry["title"]}\nURL: {$entry["url"]}\nContent: {$entry["content"]}";
    }, $matches));

    $historyText = "";
    foreach ($history as $item) {
        $role = (($item["role"] ?? "") === "user") ? "Visitor" : "Assistant";
        $content = trim((string)($item["content"] ?? ""));
        if ($content !== "") {
            $historyText .= $role . ": " . substr($content, 0, 700) . "\n";
        }
    }

    $system = "You are the EmpireOneCX AI assistant. Answer website visitor questions using only the provided EmpireOneCX knowledge. Be concise, warm, and sales-helpful. Do not invent pricing, certifications, locations, timelines, or guarantees. If the visitor asks for a quote, pricing, a custom proposal, a security audit, legal/security details, or asks for a person, say you can connect them with a real team member. Keep answers under 140 words unless the visitor asks for detail.";

    $user = "Current page: {$page}\n\nKnowledge:\n{$context}\n\nRecent chat:\n{$historyText}\nVisitor question: {$message}";

    $body = json_encode([
        "model" => $model,
        "messages" => [
            ["role" => "system", "content" => $system],
            ["role" => "user", "content" => $user],
        ],
        "temperature" => 0.35,
        "max_tokens" => 450,
    ]);

    $result = httpPostJson("https://api.groq.com/openai/v1/chat/completions", $body, [
        "Authorization: Bearer " . $apiKey,
        "Content-Type: application/json",
    ]);

    if (!$result["ok"]) {
        logAiError("groq", $result["status"], $result["error"], $result["response"]);
        return null;
    }

    $decoded = json_decode($result["response"], true);
    if (!is_array($decoded)) {
        logAiError("groq", 0, "Invalid JSON response from Groq.", $result["response"]);
        return null;
    }

    $text = trim((string)($decoded["choices"][0]["message"]["content"] ?? ""));
    if ($text !== "") {
        return $text;
    }

    logAiError("groq", 0, "Groq response did not contain message content.", $result["response"]);
    return null;
}

function httpPostJson(string $url, string $body, array $headers): array
{
    if (function_exists("curl_init")) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 20,
        ]);
        $response = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        return [
            "ok" => $response !== false && $status >= 200 && $status < 300,
            "status" => $status ?: 0,
            "error" => $error ?: null,
            "response" => $response !== false ? $response : "",
        ];
    }

    $context = stream_context_create([
        "http" => [
            "method" => "POST",
            "header" => implode("\n", $headers),
            "content" => $body,
            "timeout" => 20,
        ],
    ]);

    $response = @file_get_contents($url, false, $context);
    $status = 0;
    $responseHeaders = function_exists("http_get_last_response_headers") ? http_get_last_response_headers() : [];
    if (!empty($responseHeaders[0]) && preg_match('/\s(\d{3})\s/', $responseHeaders[0], $matches)) {
        $status = (int)$matches[1];
    }

    return [
        "ok" => $response !== false && $status >= 200 && $status < 300,
        "status" => $status,
        "error" => $response === false ? "file_get_contents request failed. Check allow_url_fopen/OpenSSL/network access." : null,
        "response" => $response !== false ? $response : "",
    ];
}

function logAiError(string $provider, int $status, ?string $error, string $response): void
{
    $dir = __DIR__ . "/data/ai-chat-logs";
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }

    if (!is_dir($dir) || !is_writable($dir)) {
        return;
    }

    $safeResponse = $response;
    $decoded = json_decode($response, true);
    if (is_array($decoded)) {
        $safeResponse = json_encode([
            "error" => $decoded["error"] ?? null,
            "status" => $decoded["status"] ?? null,
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    $entry = [
        "time" => gmdate("c"),
        "type" => "ai_error",
        "provider" => $provider,
        "status" => $status,
        "error" => $error,
        "response" => substr($safeResponse, 0, 2000),
    ];

    @file_put_contents(
        $dir . "/ai-errors-" . gmdate("Y-m-d") . ".jsonl",
        json_encode($entry, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );
}
