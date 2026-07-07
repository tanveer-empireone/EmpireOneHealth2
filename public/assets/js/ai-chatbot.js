(function () {
    const endpoint = "/api/ai-chat";
    const assistantName = "Ava";
    const assistantDisplayName = "Ask Ava";
    const history = [];
    const lead = {};
    let flow = null;
    const avatarMarkup = `
        <span class="eocx-ai-chat__portrait">
            <img src="/assets/images/ask-ava-static.webp" alt="">
        </span>
    `;
    const animatedAvatarMarkup = `
        <span class="eocx-ai-chat__portrait">
            <img src="/assets/images/ask-ava-avatar-animated.webp?v=20260613-3" alt="">
        </span>
    `;

    const flows = {
        cx: {
            label: "Provider services",
            firstQuestion: "Which provider workflow do you need help with?",
            firstField: "provider_workflow",
            firstOptions: ["Benefits verification", "Prior authorization", "Denial management", "Payment posting", "RCM support"],
        },
        ai: {
            label: "Healthcare automation",
            firstQuestion: "What healthcare automation support are you looking for?",
            firstField: "solution",
            firstOptions: ["Eligibility workflows", "Authorization tracking", "RCM reporting", "QA monitoring"],
        },
        compliance: {
            label: "Compliance & Security",
            firstQuestion: "Which healthcare compliance requirement matters most to you?",
            firstField: "compliance",
            firstOptions: ["HIPAA", "SOC 2", "PCI DSS", "ISO 27001", "GDPR"],
        },
        payer: {
            label: "Payer services",
            firstQuestion: "Which payer workflow do you need help with?",
            firstField: "payer_workflow",
            firstOptions: ["Member services", "Enrollment support", "Claims administration", "Provider data support", "Back-office operations"],
        },
    };

    const leadSteps = [
        { field: "full_name", question: "May I please have your full name?" },
        { field: "company_name", question: "What is your company's name?" },
        { field: "company_email", question: "What is your company email address?" },
        { field: "phone", question: "What phone number should our team use to reach you?" },
    ];

    function createWidget() {
        const root = document.createElement("div");
        root.className = "eocx-ai-chat";
        root.innerHTML = `
            <aside class="eocx-ai-chat__welcome" aria-label="Ask Ava welcome message">
                <div class="eocx-ai-chat__welcome-head">
                    <div class="eocx-ai-chat__avatar eocx-ai-chat__welcome-avatar" aria-hidden="true">
                        ${avatarMarkup}
                    </div>
                    <div>
                        <p class="eocx-ai-chat__welcome-title">${assistantDisplayName}</p>
                        <p class="eocx-ai-chat__welcome-status">EmpireOneHealth AI Assistant</p>
                    </div>
                </div>
                <p class="eocx-ai-chat__welcome-copy">Hi, I'm Ava from EmpireOneHealth. I can answer questions about healthcare operations, RCM support, provider services, payer services, compliance, or help connect you with our team.</p>
                <div class="eocx-ai-chat__welcome-row">
                    <input class="eocx-ai-chat__welcome-input" type="text" placeholder="Ask Ava a question" aria-label="Ask Ava a question">
                    <button class="eocx-ai-chat__welcome-send" type="button" aria-label="Send welcome question">Send</button>
                </div>
                <p class="eocx-ai-chat__welcome-note">By using this AI chat, you agree that EmpireOneHealth may process your chat to respond and improve service. <a href="/privacy-policy">Privacy policy</a></p>
            </aside>
            <button class="eocx-ai-chat__button" type="button" aria-label="Open Ask Ava AI chat">
                <span class="eocx-ai-chat__button-face" aria-hidden="true">
                    ${animatedAvatarMarkup}
                </span>
                <span class="eocx-ai-chat__button-label">${assistantDisplayName}</span>
            </button>
            <section class="eocx-ai-chat__panel" aria-label="EmpireOneHealth AI chat">
                <div class="eocx-ai-chat__header">
                    <div class="eocx-ai-chat__avatar" aria-hidden="true">
                        ${avatarMarkup}
                    </div>
                    <div>
                        <p class="eocx-ai-chat__title">${assistantDisplayName}</p>
                        <p class="eocx-ai-chat__status">EmpireOneHealth AI Assistant</p>
                    </div>
                    <button class="eocx-ai-chat__close" type="button" aria-label="Close chat">x</button>
                </div>
                <div class="eocx-ai-chat__messages"></div>
                <div>
                    <div class="eocx-ai-chat__quick"></div>
                    <div class="eocx-ai-chat__composer">
                        <div class="eocx-ai-chat__input-row">
                            <textarea class="eocx-ai-chat__input" rows="1" placeholder="Write a message..."></textarea>
                            <button class="eocx-ai-chat__send" type="button" aria-label="Send message">Send</button>
                        </div>
                    </div>
                </div>
            </section>
        `;
        document.body.appendChild(root);

        return root;
    }

    function openChat(root) {
        root.classList.add("is-open");
    }

    function sendWelcomeQuestion(root) {
        const input = root.querySelector(".eocx-ai-chat__welcome-input");
        const question = input.value.trim();
        if (!question) {
            input.focus();
            return;
        }

        openChat(root);
        input.value = "";
        sendAiMessage(root, question);
    }

    function timestamp() {
        return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    function addMessage(root, role, text, sources, meta) {
        const messages = root.querySelector(".eocx-ai-chat__messages");
        const row = document.createElement("div");
        row.className = "eocx-ai-chat__row eocx-ai-chat__row--" + role;

        if (role === "bot") {
            const avatar = document.createElement("div");
            avatar.className = "eocx-ai-chat__mini-avatar";
            avatar.innerHTML = avatarMarkup;
            row.appendChild(avatar);
        }

        const bubble = document.createElement("div");
        bubble.className = "eocx-ai-chat__message eocx-ai-chat__message--" + role;
        const textNode = document.createElement("span");
        textNode.className = "eocx-ai-chat__message-text";
        textNode.textContent = text;
        bubble.appendChild(textNode);

        const time = document.createElement("span");
        time.className = "eocx-ai-chat__time";
        time.textContent = timestamp();
        bubble.appendChild(time);

        if (sources && sources.length) {
            const sourceWrap = document.createElement("div");
            sourceWrap.className = "eocx-ai-chat__sources";
            sources.slice(0, 3).forEach((source) => {
                const link = document.createElement("a");
                link.className = "eocx-ai-chat__source";
                link.href = source.url;
                link.textContent = source.title;
                sourceWrap.appendChild(link);
            });
            bubble.appendChild(sourceWrap);
        }

        if (role === "bot" && meta && meta.responseId) {
            bubble.appendChild(createFeedbackControls(root, {
                responseId: meta.responseId,
                question: meta.question || "",
                answer: text,
            }));
        }

        row.appendChild(bubble);
        messages.appendChild(row);
        messages.scrollTop = messages.scrollHeight;
        return row;
    }

    function createFeedbackControls(root, feedback) {
        const wrap = document.createElement("div");
        wrap.className = "eocx-ai-chat__feedback";
        wrap.setAttribute("aria-label", "Rate Ask Ava response");

        [
            { rating: "up", label: "Helpful", text: "Good" },
            { rating: "down", label: "Not helpful", text: "Improve" },
        ].forEach(function (item) {
            const button = document.createElement("button");
            button.className = "eocx-ai-chat__feedback-btn";
            button.type = "button";
            button.textContent = item.text;
            button.setAttribute("aria-label", item.label);
            button.addEventListener("click", function () {
                submitFeedback(root, feedback, item.rating, wrap);
            });
            wrap.appendChild(button);
        });

        return wrap;
    }

    async function submitFeedback(root, feedback, rating, wrap) {
        if (wrap.classList.contains("is-submitted")) {
            return;
        }

        wrap.classList.add("is-submitted");
        wrap.innerHTML = '<span class="eocx-ai-chat__feedback-thanks">Thanks for the feedback.</span>';

        try {
            await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "feedback",
                    page: window.location.pathname,
                    responseId: feedback.responseId,
                    rating: rating,
                    question: feedback.question,
                    answer: feedback.answer,
                }),
            });
        } catch (error) {
            // Feedback is optional; keep the visitor experience uninterrupted.
        }
    }

    function renderChips(root, chips) {
        const wrap = root.querySelector(".eocx-ai-chat__quick");
        wrap.innerHTML = "";
        chips.forEach((chip) => {
            const button = document.createElement("button");
            button.className = "eocx-ai-chat__chip";
            button.type = "button";
            button.textContent = chip.label;
            button.addEventListener("click", function () {
                if (chip.flowKey) {
                    startFlow(root, chip.flowKey);
                    return;
                }
                if (chip.value && flow) {
                    handleLeadFlowInput(root, chip.value);
                    return;
                }
                sendAiMessage(root, chip.label);
            });
            wrap.appendChild(button);
        });
    }

    function showInitialOptions(root) {
        renderChips(root, [
            { label: "Provider services", flowKey: "cx" },
            { label: "Payer services", flowKey: "payer" },
            { label: "Healthcare automation", flowKey: "ai" },
            { label: "Compliance & Security", flowKey: "compliance" },
        ]);
    }

    function startFlow(root, key) {
        const selected = flows[key];
        if (!selected) return;

        flow = {
            key,
            field: selected.firstField,
            stepIndex: -1,
        };
        lead.intent = selected.label;
        addMessage(root, "user", selected.label);
        renderChips(root, []);
        delayedBotReply(root, [selected.firstQuestion], function () {
            renderChips(root, selected.firstOptions.map((option) => ({ label: option, value: option })));
        });
    }

    function startContactCapture(root, intent) {
        flow = {
            key: "contact",
            stepIndex: 0,
        };
        lead.intent = intent || "Human contact request";
        renderChips(root, []);
        delayedBotReply(root, [
            "Absolutely. I can collect a few details and send them to the EmpireOneHealth team.",
            leadSteps[0].question,
        ]);
    }

    function handleLeadFlowInput(root, value) {
        const cleanValue = value.trim();
        if (!cleanValue || !flow) return false;

        addMessage(root, "user", cleanValue);

        if (flow.stepIndex === -1) {
            lead[flow.field] = cleanValue;
            flow.stepIndex = 0;
            renderChips(root, []);
            delayedBotReply(root, ["Thank you for sharing.", leadSteps[0].question]);
            return true;
        }

        const currentStep = leadSteps[flow.stepIndex];
        lead[currentStep.field] = cleanValue;

        flow.stepIndex += 1;
        if (flow.stepIndex < leadSteps.length) {
            renderChips(root, []);
            delayedBotReply(root, [leadSteps[flow.stepIndex].question]);
            return true;
        }

        finishLeadFlow(root);
        return true;
    }

    async function finishLeadFlow(root) {
        renderChips(root, []);
        delayedBotReply(root, ["Thank you for sharing the details. Our team will review this and follow up shortly."], function () {
            renderChips(root, [
                { label: "Ask another question" },
                { label: "View provider services" },
                { label: "HIPAA & compliance" },
            ]);
        });

        try {
            await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "lead",
                    page: window.location.pathname,
                    lead,
                    message: "Lead captured from AI chat",
                    history: history.slice(-8),
                }),
            });
        } catch (error) {
            // Lead capture is logged server-side when available; do not interrupt the visitor.
        }

        flow = null;
    }

    function setTyping(root, isTyping) {
        const existing = root.querySelector(".eocx-ai-chat__typing");
        if (existing) {
            existing.remove();
        }
        if (isTyping) {
            const typing = addMessage(root, "bot", "Thinking...");
            typing.classList.add("eocx-ai-chat__typing");
        }
    }

    function wait(ms) {
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    }

    async function delayedBotReply(root, messages, afterReply) {
        setTyping(root, true);
        await wait(650);
        setTyping(root, false);

        for (let index = 0; index < messages.length; index += 1) {
            addMessage(root, "bot", messages[index]);
            if (index < messages.length - 1) {
                setTyping(root, true);
                await wait(520);
                setTyping(root, false);
            }
        }

        if (typeof afterReply === "function") {
            afterReply();
        }
    }

    function shouldStartLeadFlow(text) {
        const lowered = text.toLowerCase();
        return ["quote", "pricing", "proposal", "consultation", "need a team", "outsource"].some((term) => lowered.includes(term));
    }

    function shouldStartContactCapture(text) {
        const lowered = text.toLowerCase();
        return [
            "human",
            "real person",
            "real agent",
            "agent",
            "representative",
            "sales",
            "contact me",
            "call me",
            "email me",
            "connect me",
            "talk to someone",
            "talk to a person",
            "talk to a human",
        ].some((term) => lowered.includes(term));
    }

    async function sendAiMessage(root, text) {
        const cleanText = text.trim();
        if (!cleanText) return;

        if (flow && handleLeadFlowInput(root, cleanText)) {
            root.querySelector(".eocx-ai-chat__input").value = "";
            return;
        }

        if (shouldStartContactCapture(cleanText)) {
            addMessage(root, "user", cleanText);
            history.push({ role: "user", content: cleanText });
            root.querySelector(".eocx-ai-chat__input").value = "";
            startContactCapture(root, "Human contact request");
            return;
        }

        if (shouldStartLeadFlow(cleanText)) {
            root.querySelector(".eocx-ai-chat__input").value = "";
            startFlow(root, "cx");
            return;
        }

        addMessage(root, "user", cleanText);
        history.push({ role: "user", content: cleanText });
        root.querySelector(".eocx-ai-chat__input").value = "";
        setTyping(root, true);

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: cleanText,
                    history: history.slice(-8),
                    page: window.location.pathname,
                }),
            });

            const data = await response.json();
            setTyping(root, false);

            if (!response.ok) {
                throw new Error(data.error || "Chat request failed");
            }

            addMessage(root, "bot", data.answer, data.sources || [], {
                responseId: data.responseId,
                question: cleanText,
            });
            history.push({ role: "assistant", content: data.answer });

            if (data.leadCapture) {
                startContactCapture(root, "Human contact request");
            }
        } catch (error) {
            setTyping(root, false);
            addMessage(root, "bot", "I could not connect to the AI service right now. You can still contact info@empireonehealth.com.");
        }
    }

    function hideTawkWidget() {
        const hide = function () {
            if (window.Tawk_API && typeof window.Tawk_API.hideWidget === "function") {
                window.Tawk_API.hideWidget();
            }
        };

        if (window.Tawk_API) {
            const previousOnLoad = window.Tawk_API.onLoad;
            window.Tawk_API.onLoad = function () {
                if (typeof previousOnLoad === "function") {
                    previousOnLoad();
                }
                hide();
            };
            setTimeout(hide, 1200);
        }
    }

    function initAskAva() {
        if (document.querySelector(".eocx-ai-chat")) {
            return;
        }

        const root = createWidget();
        const input = root.querySelector(".eocx-ai-chat__input");

        root.querySelector(".eocx-ai-chat__button").addEventListener("click", function () {
            if (root.classList.contains("is-open")) {
                root.classList.remove("is-open");
            } else {
                openChat(root);
            }
        });

        root.querySelector(".eocx-ai-chat__close").addEventListener("click", function () {
            root.classList.remove("is-open");
        });

        document.addEventListener("click", function (event) {
            if (!root.classList.contains("is-open")) {
                return;
            }

            if (!root.contains(event.target)) {
                root.classList.remove("is-open");
            }
        });

        root.querySelector(".eocx-ai-chat__welcome-send").addEventListener("click", function () {
            sendWelcomeQuestion(root);
        });

        root.querySelector(".eocx-ai-chat__welcome-input").addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                sendWelcomeQuestion(root);
            }
        });

        root.querySelector(".eocx-ai-chat__send").addEventListener("click", function () {
            sendAiMessage(root, input.value);
        });

        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendAiMessage(root, input.value);
            }
        });

        addMessage(root, "bot", "Hi! I'm Ava. Thank you for visiting EmpireOneHealth.");
        addMessage(root, "bot", "What are you looking for today?");
        showInitialOptions(root);
        hideTawkWidget();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAskAva);
    } else {
        initAskAva();
    }
})();
