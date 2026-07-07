# Anthropic API Request Flow

- [Anthropic API Request Flow](#anthropic-api-request-flow)
  - [API Request](#api-request)
  - [Tokenization](#tokenization)
  - [Embedding](#embedding)
  - [Contextualization](#contextualization)
  - [Generation](#generation)
  - [API Response](#api-response)
  - [References](#references)

## API Request

The client sends a request to the Anthropic API. Requests can be made via the SDK or a plain HTTP call. Input text is placed inside a `"user"` message within the `messages` array.

```mermaid
flowchart LR
    subgraph note["Request shape"]
        direction TB
        n1["Requests can be made through\nan SDK or plain HTTP request"]
        n2["Input text is placed inside a\n'user' message, which is then\nplaced in a list of messages"]
    end

    subgraph fields["Request fields"]
        direction TB
        f1["API Key — Identifies your request to Anthropic"]
        f2["Model — Name of the model to use"]
        f3["Messages — List of messages containing the user's input text"]
        f4["Max Tokens — Limit to how many tokens the model can generate"]
    end

    api["Anthropic\nAPI"]

    note --> fields --> api

    style note fill:#f5f0eb,stroke:#c9b99a,color:#000
    style api fill:#e8d5c4,stroke:#c9b99a,color:#000
    style n1 fill:#fff,stroke:#c9b99a,color:#000
    style n2 fill:#fff,stroke:#c9b99a,color:#000
    style f1 fill:#fff,stroke:#c9b99a,color:#000
    style f2 fill:#fff,stroke:#c9b99a,color:#000
    style f3 fill:#fff,stroke:#c9b99a,color:#000
    style f4 fill:#fff,stroke:#c9b99a,color:#000
```

**Pipeline:** `Request to Server` → **`Request to Anthropic API`** → `Model Processing` → `Response to Server` → `Response to Client`

## Tokenization

The model first breaks the input text into tokens — sub-word units it can process numerically. Each token can carry multiple possible meanings, which are resolved in the embedding step.

```mermaid
flowchart LR
    subgraph pipeline["Anthropic API — Model Processing"]
        direction TB
        t1["Tokenization"]
        t2["Embedding"]
        t3["Contextualization"]
        t4["Generation"]
        t1 --> t2 --> t3 --> t4
    end

    subgraph tokenize["User Input → Tokens"]
        direction TB
        input["What is quantum computing?"]
        input --> tok1["What"]
        input --> tok2["is"]
        input --> tok3["quantum"]
        input --> tok4["computing"]
        input --> tok5["?"]
        tok3 --> q1["physics unit"]
        tok3 --> q2["quantum mechanics"]
        tok3 --> q3["quantum computing"]
    end

    pipeline --> tokenize

    style t1 fill:#c9b99a,color:#000,stroke:#a08060,font-weight:bold
    style t2 fill:#fff,color:#000,stroke:#c9b99a
    style t3 fill:#fff,color:#000,stroke:#c9b99a
    style t4 fill:#fff,color:#000,stroke:#c9b99a
    style pipeline fill:#f5f0eb,stroke:#c9b99a,color:#000
    style input fill:#fff,stroke:#c9b99a,color:#000
    style tok1 fill:#fff,stroke:#c9b99a,color:#000
    style tok2 fill:#fff,stroke:#c9b99a,color:#000
    style tok3 fill:#c9b99a,stroke:#a08060,color:#000
    style tok4 fill:#fff,stroke:#c9b99a,color:#000
    style tok5 fill:#fff,stroke:#c9b99a,color:#000
    style q1 fill:#fff,stroke:#c9b99a,color:#000
    style q2 fill:#fff,stroke:#c9b99a,color:#000
    style q3 fill:#fff,stroke:#c9b99a,color:#000
```

**Pipeline:** `Request to Server` → `Request to Anthropic API` → **`Model Processing`** → `Response to Server` → `Response to Client`

## Embedding

Each token is converted into a high-dimensional numeric vector. The full sentence becomes a matrix of vectors — one per token — that the model can compute over.

```mermaid
flowchart LR
    subgraph pipeline["Anthropic API — Model Processing"]
        direction TB
        t1["Tokenization"]
        t2["Embedding"]
        t3["Contextualization"]
        t4["Generation"]
        t1 --> t2 --> t3 --> t4
    end

    subgraph embeddings["Tokens → Embedding Vectors"]
        direction LR
        tok1["What"] --> e1["−0.34\n0.87\n0.15\n0.59\n−0.61"]
        tok2["is"] --> e2["−0.11\n0.83\n0.37\n0.64\n−0.48"]
        tok3["quantum"] --> e3["0.27\n−0.94\n−0.16\n0.88\n0.09"]
        tok4["computing"] --> e4["−0.02\n0.77\n0.29\n0.54\n−0.98"]
        tok5["?"] --> e5["0.35\n−0.86\n−0.21\n0.97\n0.04"]
    end

    pipeline --> embeddings

    style t2 fill:#c9b99a,color:#000,stroke:#a08060,font-weight:bold
    style t1 fill:#fff,color:#000,stroke:#c9b99a
    style t3 fill:#fff,color:#000,stroke:#c9b99a
    style t4 fill:#fff,color:#000,stroke:#c9b99a
    style pipeline fill:#f5f0eb,stroke:#c9b99a,color:#000
    style tok1 fill:#fff,stroke:#c9b99a,color:#000
    style tok2 fill:#fff,stroke:#c9b99a,color:#000
    style tok3 fill:#fff,stroke:#c9b99a,color:#000
    style tok4 fill:#fff,stroke:#c9b99a,color:#000
    style tok5 fill:#fff,stroke:#c9b99a,color:#000
    style e1 fill:#f5f0eb,stroke:#c9b99a,color:#000
    style e2 fill:#f5f0eb,stroke:#c9b99a,color:#000
    style e3 fill:#f5f0eb,stroke:#c9b99a,color:#000
    style e4 fill:#f5f0eb,stroke:#c9b99a,color:#000
    style e5 fill:#f5f0eb,stroke:#c9b99a,color:#000
```

**Pipeline:** `Request to Server` → `Request to Anthropic API` → **`Model Processing`** → `Response to Server` → `Response to Client`

## Contextualization

The model uses attention to let every token look at every other token's embedding. This resolves ambiguity — the meaning of "quantum" shifts depending on surrounding words like "computing" or "mechanics."

```mermaid
flowchart LR
    subgraph pipeline["Anthropic API — Model Processing"]
        direction TB
        t1["Tokenization"]
        t2["Embedding"]
        t3["Contextualization"]
        t4["Generation"]
        t1 --> t2 --> t3 --> t4
    end

    subgraph ctx["Embeddings"]
        direction LR
        e1["−0.34\n0.87\n−0.02\n0.15\n0.59\n−0.61\n−0.08"]
        e2["−0.11\n0.83\n−0.99\n0.37\n0.64\n−0.48\n0.75"]
        e3["0.27\n−0.94\n0.42\n−0.16\n0.88\n0.09\n0.55"]
        e4["−0.02\n0.77\n−0.63\n0.29\n0.54\n−0.98\n0.85"]
        e5["0.35\n−0.86\n0.50\n−0.21\n0.97\n0.04\n0.62"]
        e1 <--> e2
        e1 <--> e3
        e1 <--> e4
        e1 <--> e5
        e2 <--> e3
        e2 <--> e4
        e2 <--> e5
        e3 <--> e4
        e3 <--> e5
        e4 <--> e5
    end

    pipeline --> ctx

    style t3 fill:#c9b99a,color:#000,stroke:#a08060,font-weight:bold
    style t1 fill:#fff,color:#000,stroke:#c9b99a
    style t2 fill:#fff,color:#000,stroke:#c9b99a
    style t4 fill:#fff,color:#000,stroke:#c9b99a
    style pipeline fill:#f5f0eb,stroke:#c9b99a,color:#000
    style e1 fill:#f5f0eb,stroke:#c9b99a,color:#000
    style e2 fill:#f5f0eb,stroke:#c9b99a,color:#000
    style e3 fill:#f5f0eb,stroke:#c9b99a,color:#000
    style e4 fill:#f5f0eb,stroke:#c9b99a,color:#000
    style e5 fill:#f5f0eb,stroke:#c9b99a,color:#000
```

**Pipeline:** `Request to Server` → `Request to Anthropic API` → **`Model Processing`** → `Response to Server` → `Response to Client`

## Generation

The model generates output tokens one at a time. After each token, it checks whether it should stop.

```mermaid
flowchart LR
    subgraph pipeline["Anthropic API — Model Processing"]
        direction TB
        t1["Tokenization"]
        t2["Embedding"]
        t3["Contextualization"]
        t4["Generation"]
        t1 --> t2 --> t3 --> t4
    end

    subgraph gen["Output token stream"]
        direction TB
        stream["Quantum → mechanics → is → a → form → of → computing. → EOS"]
        stream --> check{"Next token\ngenerated"}
        check --> q1{"Exceeded\nmax_tokens?"}
        check --> q2{"Stop sequence\ntoken?"}
        check --> q3{"End of Sequence\ntoken?"}
        q1 -->|Yes| stop["Stop — return response"]
        q2 -->|Yes| stop
        q3 -->|Yes| stop
        q1 -->|No| check
        q2 -->|No| check
        q3 -->|No| check
    end

    pipeline --> gen

    style t4 fill:#c9b99a,color:#000,stroke:#a08060,font-weight:bold
    style t1 fill:#fff,color:#000,stroke:#c9b99a
    style t2 fill:#fff,color:#000,stroke:#c9b99a
    style t3 fill:#fff,color:#000,stroke:#c9b99a
    style pipeline fill:#f5f0eb,stroke:#c9b99a,color:#000
    style stream fill:#fff,stroke:#c9b99a,color:#000
    style check fill:#fff,stroke:#c9b99a,color:#000
    style q1 fill:#fff,stroke:#c9b99a,color:#000
    style q2 fill:#fff,stroke:#c9b99a,color:#000
    style q3 fill:#fff,stroke:#c9b99a,color:#000
    style stop fill:#e8d5c4,stroke:#c9b99a,color:#000
```

**Pipeline:** `Request to Server` → `Request to Anthropic API` → **`Model Processing`** → `Response to Server` → `Response to Client`

## API Response

The API returns a response. The output text is placed into an `"assistant"` message.

```mermaid
flowchart LR
    api["Anthropic API"]

    subgraph fields["Response fields"]
        direction TB
        f1["Message — Single message containing the generated text"]
        f2["Usage — Number of input + output tokens"]
        f3["Stop Reason — Why the model stopped generation"]
    end

    note["Output text placed into an 'assistant' message"]

    api --> fields --> note

    style api fill:#e8d5c4,stroke:#c9b99a,color:#000
    style note fill:#f5f0eb,stroke:#c9b99a,color:#000
    style f1 fill:#fff,stroke:#c9b99a,color:#000
    style f2 fill:#fff,stroke:#c9b99a,color:#000
    style f3 fill:#fff,stroke:#c9b99a,color:#000
```

**Pipeline:** `Request to Server` → `Request to Anthropic API` → `Model Processing` → **`Response to Server`** → `Response to Client`

## References

- [Accessing the API](https://anthropic.skilljar.com/claude-with-the-anthropic-api/287726)
