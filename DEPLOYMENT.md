# Deployment Guide for Replit (Cloud Run)

This guide explains how to deploy TeleRemoteX on Replit with dynamic production configuration.

## Environment Variables

The application is configured to use environment variables for all production settings. This makes it easy to deploy without code changes.

### Required Environment Variables

1. **DATABASE_URL** (Required in production)
   - PostgreSQL connection string
   - Example: `postgresql://user:password@host:port/database`
   - This is typically provided automatically by Replit if you attach a PostgreSQL database

2. **TELEGRAM_BOT_TOKEN** (Required for Telegram integration)
   - Your Telegram bot token from BotFather
   - Get it from [@BotFather](https://t.me/botfather) on Telegram

### Optional Environment Variables

3. **INNGEST_APP_ID**
   - Default: `replit-agent-workflow`
   - Only change if you need a custom Inngest app identifier

4. **INNGEST_APP_NAME**
   - Default: `Replit Agent Workflow System`
   - Only change if you want a custom display name

5. **INNGEST_EVENT_KEY**
   - For secure event sending to Inngest Cloud
   - Get from [Inngest Dashboard](https://app.inngest.com)

6. **INNGEST_SIGNING_KEY**
   - For webhook signature verification
   - Get from [Inngest Dashboard](https://app.inngest.com)

7. **INNGEST_SERVE_HOST**
   - Override for the serve host URL
   - Usually auto-detected from `REPLIT_DOMAINS` - no need to set manually

8. **AI Provider API Keys**
   - `OPENAI_API_KEY` or `GROQ_API_KEY` depending on your configuration
   - Required for the AI agent functionality

## Deployment Steps

### 1. Configure Environment Variables in Replit

Go to your Repl settings (Tools → Secrets) and add:

```
DATABASE_URL=<your-postgres-connection-string>
TELEGRAM_BOT_TOKEN=<your-telegram-bot-token>
GROQ_API_KEY=<your-groq-api-key>
NODE_ENV=production
```

### 2. Attach a PostgreSQL Database (if not already done)

In Replit:
1. Click on "Storage" in the left sidebar
2. Add PostgreSQL database
3. The `DATABASE_URL` will be automatically set

### 3. Configure Telegram Webhook

Once deployed, set your Telegram webhook to:
```
https://<your-repl-domain>/webhooks/telegram/action
```

You can do this with:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=https://<your-repl-domain>/webhooks/telegram/action"
```

### 4. Deploy

The deployment is configured in `.replit` file:
- Build command: `bash scripts/build.sh`
- Run command: `cd .mastra/output && NODE_ENV=production node index.mjs`
- Deployment target: Cloud Run

Click "Deploy" in Replit to start the deployment process.

## Dynamic Configuration Features

The application now supports:

✅ **Dynamic Inngest Configuration**: App ID, name, event key, and signing key from environment variables
✅ **Automatic Host Detection**: Uses `REPLIT_DOMAINS` for Replit deployments
✅ **Fallback Configuration**: Sensible defaults for all optional settings
✅ **Database URL Validation**: Warns if DATABASE_URL is missing in production
✅ **Environment-based Logging**: Production logger with structured JSON output

## Verifying Deployment

After deployment:

1. Check the logs for any configuration warnings
2. Test the Telegram webhook by sending a message to your bot
3. Verify the Inngest functions are registered at `/api/inngest`

## Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` is correctly set
- Check database is accessible from your Repl

### Telegram Webhook Not Working
- Verify `TELEGRAM_BOT_TOKEN` is correct
- Ensure webhook URL is set correctly
- Check logs for incoming webhook requests

### Inngest Functions Not Registering
- Verify the deployment is successful
- Check that `/api/inngest` endpoint is accessible
- Review logs for any Inngest-related errors
