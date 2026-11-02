# EasyBuy Helpdesk — Architecture & Flow

> AI-powered customer support built with **Spring Boot 4** · **Spring AI 2** · **OpenAI GPT-4o-mini** · **MariaDB**

---

## 1. High-Level System Overview

```mermaid
graph TD
    User(("👤 User"))

    subgraph App["🖥️ EasyBuy Helpdesk App"]
        AC["AiController\n/ai/chat\n/ai/audio-input"]
        TC["TicketController\n/ticket/..."]
        AI["AiServiceImpl\n(Orchestrator)"]
        IC["IntentClassifierService"]
        TS["TicketServiceImpl"]
        ETL["ETLPipeLineImpl\n(one-time setup)"]
        TT["TicketTools\n@Tool"]
        DT["DateAndTimeTool\n@Tool"]
    end

    subgraph External["☁️ External Systems"]
        OAI["OpenAI\nGPT-4o-mini"]
        WSP["OpenAI\nWhisper-1"]
        DB[("MariaDB\nhelpdesk-ai")]
    end

    User -->|"GET /ai/chat"| AC
    User -->|"POST /ai/audio-input"| AC
    User -->|"POST/GET /ticket"| TC
    AC --> AI
    AI -->|"audio resource"| WSP
    WSP -->|"transcribed text"| AI
    AI --> IC
    AI --> TT
    AI --> DT
    IC -->|"classify intent"| OAI
    AI -->|"chat + stream"| OAI
    TC --> TS
    TT --> TS
    TS -->|"ticket table"| DB
    AI -->|"vector_store table"| DB
    AI -->|"chat_memory table"| DB
    ETL -->|"embed & store docs"| DB
    ETL -->|"generate embeddings"| OAI
```

---

## 2. Full Request Flow (Sequence Diagram)

```mermaid
sequenceDiagram
    actor User
    participant AC as AiController
    participant AI as AiServiceImpl
    participant IC as IntentClassifier
    participant MEM as ChatMemory (DB)
    participant VS as VectorStore (DB)
    participant OAI as OpenAI

    User->>AC: GET /ai/chat?conversationId=X&query=...
    AC->>AI: chat(conversationId, query)

    rect rgb(240, 248, 255)
        Note over AI,IC: Step 1 — Classify Intent
        AI->>MEM: get last 6 messages (direct read for classifier)
        MEM-->>AI: history snippet
        AI->>OAI: intent-classifier.st + history + query
        OAI-->>AI: "ACTION" or "KNOWLEDGE"
    end

    alt ACTION intent
        rect rgb(240, 255, 240)
            Note over AI,OAI: Step 2a — ACTION Path (no RAG)
            Note over MEM: MessageChatMemoryAdvisor.before()
            AI->>MEM: load last 15 messages
            MEM-->>AI: full conversation history
            AI->>OAI: system prompt + history + query + tools
            OAI-->>AI: streaming tokens (may call tools mid-stream)
            Note over MEM: MessageChatMemoryAdvisor.after()
            AI->>MEM: save new user + assistant messages
        end

    else KNOWLEDGE intent
        rect rgb(255, 248, 240)
            Note over AI,OAI: Step 2b — KNOWLEDGE Path (RAG)

            Note over MEM: MessageChatMemoryAdvisor.before() runs FIRST
            AI->>MEM: load last 15 messages
            MEM-->>AI: full conversation history (now in prompt)

            Note over AI,OAI: ragAdvisor runs AFTER history is already in prompt
            AI->>OAI: CompressionQueryTransformer (LLM call 1)<br/>history already in prompt — no extra DB read
            OAI-->>AI: standalone query

            AI->>OAI: RewriteQueryTransformer (LLM call 2)
            OAI-->>AI: optimised query

            AI->>OAI: MultiQueryExpander — 3 variants (LLM call 3)
            OAI-->>AI: 3 query variants

            AI->>VS: 4 parallel cosine similarity searches
            VS-->>AI: top relevant knowledge chunks

            AI->>OAI: system prompt + history + query + docs + tools
            OAI-->>AI: streaming tokens

            Note over MEM: MessageChatMemoryAdvisor.after() runs LAST
            AI->>MEM: save new user + assistant messages
        end
    end

    AI-->>AC: Flux<String> stream
    AC-->>User: streaming response
```

> **Key insight — advisor execution order:**
> `MessageChatMemoryAdvisor` is registered before `ragAdvisor`, so it always runs first on the request side. This means when `CompressionQueryTransformer` executes inside `ragAdvisor`, the conversation history is **already loaded into the prompt** — no second database read happens. The DB is only touched **once for reading** and **once for writing** per request.

---

## 3. Intent Routing

```mermaid
flowchart TD
    Q["💬 User Message"] --> IC["IntentClassifierService\n1 LLM call · ~300 tokens"]

    IC --> D{ACTION\nor\nKNOWLEDGE?}

    D -->|ACTION| A["⚡ ACTION Path"]
    D -->|KNOWLEDGE| K["🧠 KNOWLEDGE Path"]

    subgraph ActionExamples["ACTION Examples"]
        A1["✅  yes / no / go ahead"]
        A2["🎫  create / update / check ticket"]
        A3["🕐  what time is it?"]
        A4["👋  hi / hello / thanks"]
        A5["📋  providing email, phone, priority..."]
    end

    subgraph KnowledgeExamples["KNOWLEDGE Examples"]
        K1["📦  What is the return policy?"]
        K2["💳  How long does a refund take?"]
        K3["🚚  How does delivery work?"]
        K4["🏷️  Can I use two coupons?"]
        K5["❌  How do I cancel my order?"]
    end

    A --> ActionExamples
    K --> KnowledgeExamples
```

---

## 4. ACTION Path — Detail

```mermaid
flowchart LR
    Q["💬 User Query\n(ACTION)"]

    subgraph ChatClient["chatClient"]
        SP["System Prompt\nCanzova persona"]
        MEM["Chat Memory\nlast 15 messages"]
        TOOLS["Tools\nTicketTools · DateAndTimeTool"]
    end

    subgraph OpenAI["OpenAI GPT-4o-mini"]
        LLM["Generate Response\nmaxTokens = 2000"]
        TC["Tool Call\n(if needed)"]
    end

    subgraph ToolExec["Tool Execution"]
        TT["TicketTools\ncreateTicket\ngetTicketById\ngetTicketByEmail\nupdateTicket"]
        DT["DateAndTimeTool\ngetCurrentDateAndTime\ngetLocalDate\ngetLocalTime"]
        DB[("MariaDB\nticket table")]
    end

    Q --> ChatClient
    ChatClient --> LLM
    LLM -->|"tool_call"| TC
    TC --> TT
    TC --> DT
    TT --> DB
    DB --> TT
    TT -->|"tool result"| LLM
    DT -->|"tool result"| LLM
    LLM -->|"Flux&lt;String&gt;"| OUT["📤 Streaming\nResponse"]
```

---

## 5. KNOWLEDGE Path — RAG Pipeline Detail

```mermaid
flowchart TD
    Q["💬 User Query\n(KNOWLEDGE)"]

    subgraph PRE["Pre-Retrieval  ·  3 LLM calls via ragChatClient"]
        C["1️⃣  CompressionQueryTransformer\nMerge chat history + question\ninto one standalone query"]
        R["2️⃣  RewriteQueryTransformer\nRewrite for better\nvector-store retrieval"]
        E["3️⃣  MultiQueryExpander\nGenerate 3 different phrasings\nfor broader recall"]
    end

    subgraph RET["Retrieval  ·  MariaDB Vector Store"]
        V["VectorStoreDocumentRetriever\n4 parallel cosine-similarity searches\nthreshold = 0.73 · topK = 4 per query"]
        DOCS["📄 Relevant knowledge chunks\n(deduplicated)"]
    end

    subgraph GEN["Generation  ·  Main chatClient"]
        AUG["ContextualQueryAugmenter\nInject docs into prompt"]
        MEM["Chat Memory\nlast 15 messages"]
        LLM["OpenAI GPT-4o-mini\nmaxTokens = 2000"]
    end

    Q --> C --> R --> E
    E -->|"original + 3 variants"| V
    V --> DOCS
    DOCS --> AUG
    Q --> AUG
    MEM --> GEN
    AUG --> LLM
    LLM -->|"Flux&lt;String&gt;"| OUT["📤 Streaming\nResponse"]
```

---

## 6. Ticket Lifecycle

```mermaid
stateDiagram-v2
    [*] --> OPEN : createTicket()

    OPEN --> PENDING : updateTicket(status=PENDING)
    OPEN --> CLOSED : updateTicket(status=CLOSED)
    PENDING --> OPEN : updateTicket(status=OPEN)
    PENDING --> CLOSED : updateTicket(status=CLOSED)
    CLOSED --> [*]

    note right of OPEN
        Priority: LOW / MEDIUM / HIGH
        Category: Billing · Technical · Account
                  Shipping · Returns · Network
                  Hardware · Software · Other
    end note
```

---

## 7. ETL Pipeline — One-Time Knowledge Base Setup

```mermaid
flowchart LR
    subgraph DOCS["📁 /templates/*.md  (12 knowledge documents)"]
        D1["00 EasyBuy Overview"]
        D2["01 Shipping & Delivery"]
        D3["02 Returns & Replacements"]
        D4["03 Payments & Refunds"]
        D5["04 Customer FAQ"]
        D6["... 7 more docs"]
    end

    subgraph EXTRACT["Step 1 · EXTRACT"]
        MR["MarkdownDocumentReader\nhorizontal rules → document splits"]
    end

    subgraph TRANSFORM["Step 2 · TRANSFORM"]
        SP["TokenTextSplitter\nchunkSize = 800 tokens\nminChunkChars = 400"]
    end

    subgraph LOAD["Step 3 · LOAD"]
        OAI["OpenAI Embeddings API\n1536-dimension vectors"]
        VS[("MariaDB\nvector_store table")]
    end

    DOCS --> MR --> SP --> OAI --> VS

    VS -.->|"queried at runtime\nby RAG pipeline"| RAG["🧠 KNOWLEDGE Path"]
```

---

## 8. Chat Memory Architecture

```mermaid
flowchart TD
    subgraph Config["AiConfig.java"]
        CM["MessageWindowChatMemory\nmaxMessages = 15"]
        JDBC["JdbcChatMemoryRepository\nMariaDB · auto-schema"]
        CM --> JDBC
    end

    subgraph MainClient["chatClient  (main)"]
        MA["MessageChatMemoryAdvisor\nauto read + write per request"]
    end

    subgraph RagClient["ragChatClient  (clean)"]
        NO["No memory advisor\npurposely stateless"]
    end

    subgraph Uses["Used by"]
        IC["IntentClassifierService\nreads last 6 messages\nfor classifier context"]
        AI["AiServiceImpl\npasses conversationId\nto chatClient advisors"]
    end

    CM --> MA
    MA --> MainClient
    NO --> RagClient
    CM --> IC
    CM --> AI
```

---

## 9. LLM Call Budget Per Request

```mermaid
xychart-beta
    title "LLM Calls Per Request"
    x-axis ["ACTION path", "KNOWLEDGE path"]
    y-axis "Number of LLM calls" 0 --> 6
    bar [2, 5]
```

| Path | LLM Calls | Breakdown |
|---|---|---|
| **ACTION** | **2** | 1 intent classifier + 1 main chat |
| **ACTION + tool** | **3** | 1 intent classifier + 1 main chat + 1 tool-call round-trip |
| **KNOWLEDGE** | **5** | 1 intent classifier + 1 compress + 1 rewrite + 1 expand + 1 main chat |
| **KNOWLEDGE + tool** | **6** | All of above + 1 tool-call round-trip |

> The `ragAdvisor` is built **once at startup** (`@PostConstruct`) and reused — no object construction cost per request.

---

## 10. Key Files Reference

| File | Role |
|---|---|
| `AiController.java` | HTTP entry points — `GET /ai/chat` (text) and `POST /ai/audio-input` (voice SSE) |
| `TicketController.java` | REST CRUD — bypasses AI entirely |
| `AiServiceImpl.java` | Core orchestrator — transcription, routing, RAG advisor, ChatClient streaming |
| `IntentClassifierService.java` | Classifies every message into ACTION or KNOWLEDGE |
| `AiConfig.java` | Spring beans: `chatClient`, `ragChatClient`, `ChatMemory` |
| `TicketTools.java` | 4 `@Tool` methods the AI invokes for ticket CRUD |
| `DateAndTimeTool.java` | 3 `@Tool` methods for date/time (IST) |
| `TicketServiceImpl.java` | Pure ticket CRUD logic, shared by tools + REST controller |
| `ETLPipeLineImpl.java` | One-time knowledge base loader |
| `canzova-system-prompt.st` | AI agent persona + all behaviour rules |
| `intent-classifier.st` | Prompt template for ACTION vs KNOWLEDGE classification |
| `multiQueryExpander.st` | Prompt template for generating 3 RAG query variants |
| `templates/*.md` | 12 EasyBuy knowledge base documents |
| `AudioResponseServiceImpl.java` | Text-to-Speech service using `TextToSpeechModel` |
| `../frontend/src/api.js` | API client with `streamChat`, `streamAudioChat` & `sendVoiceToVoiceAudio` |
| `../frontend/src/components/ChatPanel.jsx` | Chat UI with Voice-to-Text & Voice-to-Voice capture and interactive AudioPlayer |

---

## 11. Audio / Voice Input Flow

The voice input pipeline allows users to speak into their microphone in the browser, transcribes the voice using **OpenAI Whisper-1**, immediately presents the transcribed text in the user bubble, and routes the text through the standard AI pipeline (`ACTION` or `KNOWLEDGE`) while streaming the response back via SSE.

### 11.1 Component Flow Diagram

```mermaid
flowchart LR
    MIC["🎙️ User Audio\n(Browser Mic)"] --> REC["MediaRecorder\nBlob (.webm/.mp4/.ogg)"]
    REC --> FETCH["fetch(POST /ai/audio-input)\nmultipart/form-data"]
    FETCH --> CTRL["AiController\n/ai/audio-input"]
    CTRL --> SERV["AiServiceImpl\nchatWithAudio()"]
    SERV --> WSP["OpenAI Whisper-1\nTranscriptionModel.transcribe()"]
    WSP --> TXT["Transcribed String\n(textInput)"]
    TXT --> HDR["Set X-Transcript Header\n(URL-encoded)"]
    HDR --> CHAT["chat(convId, textInput)\nSmart Routing (Action/RAG)"]
    CHAT --> SSE["Flux&lt;String&gt;\nSSE data: tokens"]
```

### 11.2 End-to-End Execution Sequence Diagram

```mermaid
sequenceDiagram
    actor User as 👤 User (Browser)
    participant UI as ChatPanel.jsx
    participant API as api.js (streamAudioChat)
    participant AC as AiController
    participant AI as AiServiceImpl
    participant WSP as OpenAI Whisper-1
    participant LLM as OpenAI GPT-4o-mini

    User->>UI: Clicks Mic, speaks, clicks Send
    UI->>UI: Shows user bubble: "🎙️ Voice note (0:04)"<br/>Status: "⏳ Transcribing…"
    UI->>API: streamAudioChat(conversationId, audioBlob)
    API->>AC: POST /ai/audio-input (FormData: audioFile, conversationId)

    Note over AC,AI: Backend Synchronous Transcription Step
    AC->>AI: chatWithAudio(conversationId, file.getResource())
    AI->>WSP: transcriptionModel.transcribe(audioResource)
    WSP-->>AI: textInput = "Where is my order #1002?"

    Note over AI,AC: Set Header & Start Reactive Pipeline
    AI->>AI: RequestContextHolder -> setHeader("X-Transcript", "Where%20is%20my%20order%20%231002%3F")
    AI->>AI: chat(conversationId, textInput) -> returns Flux<String> immediately (2ms)
    AI-->>AC: Flux<String>
    AC-->>API: HTTP 200 OK (Headers: X-Transcript)

    Note over API,UI: Browser Receives Headers First!
    API->>API: rawTranscript = res.headers.get("X-Transcript")
    API->>UI: onTranscript("Where is my order #1002?")
    UI->>UI: Replaces "⏳ Transcribing…" with:<br/>"Where is my order #1002?"

    Note over API,LLM: Stream AI Response Tokens Over Body
    LLM-->>AI: Token 1 ("Your")
    AI-->>API: data: Your
    API->>UI: onChunk("Your")
    UI->>UI: Bot bubble: "Your"

    LLM-->>AI: Token 2 (" order")
    AI-->>API: data:  order
    API->>UI: onChunk(" order")
    UI->>UI: Bot bubble: "Your order"

    LLM-->>AI: Remaining tokens...
    AI-->>API: data: [DONE]
    API->>UI: onDone()
    UI->>UI: Done streaming
```

### 11.3 Key Technical Highlights

1. **Why the transcribed text appears before the bot's response**:
   * `chat()` returns a reactive publisher (`Flux<String>`), not a blocking `String`. It finishes in a few milliseconds.
   * In HTTP, headers are sent across the wire **before** the body stream begins.
   * Spring MVC immediately flushes the `X-Transcript` response header to the browser when starting the SSE connection.
   * `fetch()` resolves the moment response headers arrive. The frontend decodes `X-Transcript` and displays the query in the user bubble, while OpenAI is still computing the first token in the background.

2. **Cross-Browser Audio Capture**:
   * `ChatPanel.jsx` probes `MediaRecorder.isTypeSupported()` to pick the optimal audio container (`audio/webm;codecs=opus`, `audio/mp4`, `audio/ogg`).
   * Sends the matching filename extension so OpenAI Whisper correctly decodes the audio.
   * 2-minute safety timeout and auto-release of microphone tracks on completion or cancel.

3. **URL Percent-Encoding (`%20` vs `+`)**:
   * `URLEncoder.encode` in Java defaults to `application/x-www-form-urlencoded` format (which converts spaces to `+`).
   * Backend replaces `+` with `%20`, and frontend decodes with `decodeURIComponent(raw.replace(/\+/g, ' '))`, preserving all whitespace, commas, and special characters.

---

## 12. Voice-to-Voice Chat Flow (`outputType="audio"`)

When the user clicks the dedicated **Voice-to-Voice** button (`Headphones` icon), the full conversational loop operates in voice:

```mermaid
sequenceDiagram
    actor User as 👤 User (Browser)
    participant UI as ChatPanel.jsx
    participant API as api.js (sendVoiceToVoiceAudio)
    participant AC as AiController
    participant AI as AiServiceImpl
    participant WSP as OpenAI Whisper-1
    participant LLM as OpenAI GPT-4o-mini
    participant TTS as Spring AI TTS (TextToSpeechModel)

    User->>UI: Clicks Voice-to-Voice (Headphones), speaks, clicks Send
    UI->>UI: User bubble: "🎙️ Voice Call (0:05)" (Transcribing…)<br/>Bot bubble: Typing dots
    UI->>API: sendVoiceToVoiceAudio(conversationId, audioBlob)
    API->>AC: POST /ai/audio-input (audioFile, conversationId, outputType="audio")
    AC->>AI: chatWithAudio(conversationId, "audio", file.getResource())
    AI->>WSP: transcribe(resource)
    WSP-->>AI: textInput ("How do I return a damaged item?")
    AI->>LLM: chatClient.call().content() (RAG or Action)
    LLM-->>AI: responseText ("You can return it within 10 days...")
    AI->>TTS: audioResponseService.generateAudio(responseText)
    TTS-->>AI: audioBytes (byte[])
    AI-->>AC: ResponseEntity (Content-Type: audio/mpeg, Headers: X-Transcript, X-Response-Text, Body: audioBytes)
    AC-->>API: HTTP 200 OK
    API->>UI: { userTranscript, botResponseText, audioUrl }
    UI->>UI: Updates user bubble with transcribed speech<br/>Renders bot message & AudioPlayer<br/>Auto-plays AI audio response in browser
```

---

## 13. Voice Headers & RequestContextHolder Architecture

### 13.1 Why Use HTTP Headers for Voice Payloads?

In standard REST APIs, text is normally returned in the JSON/text body. In this voice pipeline, however, the response body is already strictly claimed:
* **In Voice-to-Voice (`outputType="audio"`)**: The body is a continuous stream of raw binary MP3 audio bytes (`audio/mpeg`). Injecting JSON or plain text directly into the body would corrupt the audio stream.
* **In Voice-to-Text (`outputType="text"`)**: The body is a streaming Server-Sent Events (SSE) pipe emitting LLM tokens chunk by chunk (`data: token\n\n`).

To transmit metadata without corrupting the body, the system uses custom HTTP response headers as a metadata envelope:

```mermaid
flowchart TD
    subgraph RES["📦 HTTP 200 Response Packet"]
        subgraph HDR["🏷️ HTTP Headers (Metadata Envelope)"]
            CT["Content-Type: audio/mpeg (or text/event-stream)"]
            XT["X-Transcript: 'Where is my order #1002?' (User Speech)"]
            XR["X-Response-Text: 'Your order is on the way...' (Bot Text)"]
        end
        subgraph BODY["📦 HTTP Body (Payload)"]
            AUD["Audio Mode: Raw Binary MP3 Bytes\n-- OR --\nText Mode: SSE Token Stream"]
        end
    end
    RES --> CLIENT["🌐 Browser Frontend (ChatPanel.jsx)"]
    CLIENT --> UI_USER["User Bubble: Extracts X-Transcript"]
    CLIENT --> UI_BOT["Bot Bubble: Extracts X-Response-Text + Plays Body Audio"]
```

### 13.2 Frontend UI Impact & State Progression

By returning user transcription and bot text in headers, the frontend can transition smoothly between recording, transcribing, and streaming states:

```mermaid
stateDiagram-v2
    [*] --> Recording: User clicks Mic / Headphones
    Recording --> Transcribing: User clicks Stop & Send
    state Transcribing {
        [*] --> UserBubblePending: Shows '🎙️ Voice note' & '⏳ Transcribing...'
        UserBubblePending --> BotBubbleThinking: Shows Bot Typing Dots
    }
    Transcribing --> HeadersReceived: HTTP 200 Headers Arrive First
    state HeadersReceived {
        [*] --> ResolveUserBubble: Replaces '⏳ Transcribing...' with X-Transcript
        ResolveUserBubble --> PrepareBotBubble: Extracts X-Response-Text for display
    }
    HeadersReceived --> BodyProcessed: HTTP Body Stream Arrives
    state BodyProcessed {
        [*] --> PlayAudio: Auto-plays MP3 Blob & mounts AudioPlayer
        PlayAudio --> DisplayMarkdown: Renders Markdown response text
    }
    BodyProcessed --> [*]: Complete
```

### 13.3 Deep Dive: `RequestContextHolder` Bridge in `AiServiceImpl`

```java
try {
    ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
    if (attrs != null && attrs.getResponse() != null) {
        attrs.getResponse().setHeader("X-Transcript", encodedTranscript);
    }
} catch (Exception e) {
    log.debug("Could not set X-Transcript header: {}", e.getMessage());
}
```

```mermaid
flowchart LR
    THREAD["🧵 HTTP Request Thread"] --> HOLDER["RequestContextHolder\n(ThreadLocal Storage)"]
    HOLDER --> ATTRS["ServletRequestAttributes"]
    ATTRS --> RAW_RES["HttpServletResponse\n(Raw Socket)"]
    RAW_RES -->|"setHeader('X-Transcript', ...)"| CLIENT["Browser Client"]
```

#### Key Technical Principles:
1. **Layer Decoupling**: `AiServiceImpl` is a business service class and does not inject `HttpServletResponse` in its method signatures, keeping business logic cleanly decoupled from the servlet layer.
2. **Immediate Header Emission**: Spring's `RequestContextHolder.getRequestAttributes()` accesses the thread-local HTTP context of the current request. This stamps the `X-Transcript` header directly onto the raw servlet response before reactive or binary data is written to the output stream.
3. **Resilience**: The `try-catch` block guarantees safety: if `AiServiceImpl` is called from a test harness, asynchronous worker, or scheduled background task where no HTTP thread context exists, it logs debug info and completes gracefully without throwing a `NullPointerException`.

