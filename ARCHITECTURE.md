# EasyBuy Helpdesk — Architecture & Flow

> AI-powered customer support built with **Spring Boot 4** · **Spring AI 2** · **OpenAI GPT-4o-mini** · **MariaDB**

---

## 1. High-Level System Overview

```mermaid
graph TD
    User(("👤 User"))

    subgraph App["🖥️ EasyBuy Helpdesk App"]
        AC["AiController\n/ai/chat"]
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
        DB[("MariaDB\nhelpdesk-ai")]
    end

    User -->|"GET /ai/chat"| AC
    User -->|"POST/GET /ticket"| TC
    AC --> AI
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
| `AiController.java` | HTTP entry point — `GET /ai/chat` |
| `TicketController.java` | REST CRUD — bypasses AI entirely |
| `AiServiceImpl.java` | Core orchestrator — routing, RAG advisor, all ChatClient calls |
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
