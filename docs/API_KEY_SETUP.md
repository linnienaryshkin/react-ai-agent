# Anthropic API Key Setup

## Step 1: Create an Account

Go to [console.anthropic.com](https://console.anthropic.com) and sign up.

## Step 2: Get an API Key

1. Navigate to **Settings** > **API Keys**
2. Click **Create Key**
3. Give it a name (e.g. "ai-kata")
4. Copy the key immediately — it will not be shown again

## Step 3: Configure the Project

1. In the project root, copy the example env file:

   ```bash
   cp .env.example .env
   ```

2. Open `.env` and paste your key:

   ```
   ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
   ```

3. Save the file.

## Important Notes

- **Never commit `.env` to git** — it's already in `.gitignore`
- The `VITE_` prefix is required by Vite to expose the variable to the browser
- The free tier has rate limits. If you see 429 errors, wait a minute and retry
- Each Haiku API call costs roughly $0.001 — the entire curriculum costs pennies

## Verify It Works

Run the dev server and send a message in the chat:

```bash
npm run dev
```

If you see a response from Claude, your key is working.
