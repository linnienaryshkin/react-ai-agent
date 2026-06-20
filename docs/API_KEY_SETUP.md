# API Key Setup

## EPAMers

Request Anthropic Console access via [epa.ms/GetClaude](http://epa.ms/GetClaude).

## 1. Get a key

Go to [console.anthropic.com](https://console.anthropic.com), sign up, then navigate to **Settings → API Keys → Create Key**. Copy it immediately — it won't be shown again.

## 2. Add it to the project

```bash
cp .env.example .env
```

Open `.env` and paste your key:

```sh
ANTHROPIC_API_KEY=sk-ant-...
```

## Notes

- **Never commit `.env`** — it's already in `.gitignore`
- Rate limits apply on the free tier — if you see `429` errors, wait a moment and retry
- Each call uses `claude-haiku-4-5`, the cheapest model — the full curriculum costs pennies
