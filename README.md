# TeleRemoteX

A powerful remote management system for Windows using Telegram as the interface, built with Mastra AI framework.

## Features

- 🤖 **AI-Powered Agent**: Intelligent Windows management agent using Groq/OpenAI
- 💬 **Telegram Integration**: Control your Windows system through Telegram messages
- 🔧 **System Monitoring**: Real-time system information and monitoring
- 📁 **File Operations**: Remote file management capabilities
- 🎮 **Application Control**: Start, stop, and manage applications
- ⚡ **Workflow Automation**: Powered by Inngest for reliable workflow execution

## Quick Start

### Prerequisites

- Node.js 20.9.0 or higher
- PostgreSQL database
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- AI Provider API Key (Groq or OpenAI)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Notho-freedom/TeleRemoteX.git
   cd TeleRemoteX
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Required variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
   - `GROQ_API_KEY` or `OPENAI_API_KEY`: AI provider API key

4. **Start development server**
   ```bash
   npm run dev
   ```

   This will start:
   - Mastra development server on port 5000
   - Inngest server on port 3000

### Production Deployment on Replit

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick steps:
1. Configure environment variables in Replit Secrets
2. Attach PostgreSQL database
3. Deploy using the built-in deployment feature
4. Set up Telegram webhook

## Project Structure

```
TeleRemoteX/
├── src/
│   ├── mastra/
│   │   ├── agents/          # AI agents
│   │   ├── workflows/       # Workflow definitions
│   │   ├── tools/          # Tool implementations
│   │   ├── inngest/        # Inngest configuration
│   │   └── storage/        # Database configuration
│   └── triggers/           # External trigger handlers
├── scripts/                # Build and utility scripts
├── .replit                # Replit configuration
├── DEPLOYMENT.md          # Deployment guide
└── package.json
```

## Configuration

### Environment Variables

All configuration is done through environment variables for security and flexibility:

#### Required
- `DATABASE_URL`: PostgreSQL connection string
- `TELEGRAM_BOT_TOKEN`: Telegram bot authentication token
- `GROQ_API_KEY` or `OPENAI_API_KEY`: AI provider credentials

#### Optional
- `NODE_ENV`: Set to `production` for production deployments
- `INNGEST_APP_ID`: Custom Inngest application ID
- `INNGEST_APP_NAME`: Custom Inngest application name
- `INNGEST_EVENT_KEY`: Inngest event key for secure event sending
- `INNGEST_SIGNING_KEY`: Inngest signing key for webhook verification
- `INNGEST_SERVE_HOST`: Override Inngest serve host (auto-detected on Replit)

See `.env.example` for a complete list with descriptions.

## Available Commands

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build for production
- `npm run check`: Run TypeScript type checking
- `npm run format`: Format code with Prettier
- `npm run check:format`: Check code formatting

## Tools

The system includes several tools for Windows management:

- **System Monitor**: Get CPU, memory, disk, and network information
- **Command Execution**: Execute system commands remotely
- **File Operations**: Read, write, list, and manage files
- **Application Control**: Launch and manage applications
- **Telegram Messaging**: Send messages back to Telegram

## Workflows

The main workflow is `windowsManagementWorkflow` which:
1. Receives messages from Telegram
2. Processes them with the AI agent
3. Executes appropriate tools
4. Returns results to the user

## Security Considerations

- Store all sensitive credentials in environment variables
- Never commit `.env` files to version control
- Use Inngest signing keys in production for webhook verification
- Validate all inputs before executing system commands
- Limit file operations to safe directories

## Technologies Used

- [Mastra](https://mastra.ai): AI framework for building agents and workflows
- [Inngest](https://inngest.com): Reliable workflow orchestration
- [Telegram Bot API](https://core.telegram.org/bots/api): Messaging interface
- [Groq](https://groq.com) / [OpenAI](https://openai.com): AI providers
- PostgreSQL: Data persistence
- TypeScript: Type-safe development

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Support

For issues and questions:
- Open an issue on GitHub
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide for deployment help
