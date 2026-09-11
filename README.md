# TeleRemoteX

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Mastra](https://img.shields.io/badge/Mastra-agent_runtime-111827)
![AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-4-000000)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)

TeleRemoteX is a TypeScript agent stack built around **Mastra**, with model providers, tools, memory, workflows, scheduled/event-driven triggers and persistent storage organized as a backend-oriented workspace.

The repository currently behaves more like an agent/runtime project than a conventional frontend application.

## What is in the repository

The source is organized around Mastra concepts:

- **Agents** for model-driven behavior
- **Tools** for external actions/capabilities
- **Workflows** for multi-step orchestration
- **Inngest** integrations for event-driven/background execution
- **Memory and storage** for persistent agent state
- **Triggers** for automation entry points
- **MCP** support through Mastra integrations
- **Slack** integration support
- Model access through OpenAI, Groq and OpenRouter-compatible providers
- Exa integration for web-oriented retrieval

## Architecture

```text
Triggers / external events
          │
          ▼
   Mastra workflows
          │
          ├── Agents
          │     ├── Models
          │     ├── Memory
          │     └── Tools / MCP
          │
          ├── Inngest
          └── Persistent storage
```

## Tech stack

- TypeScript 5.9
- Node.js 20.9+
- Mastra
- Vercel AI SDK
- OpenAI / Groq / OpenRouter providers
- Inngest + Inngest Realtime
- Mastra memory/storage integrations
- PostgreSQL / LibSQL integrations
- MCP
- Slack Web API
- Exa
- Zod
- Pino

## Local development

### Requirements

- Node.js `>=20.9.0`
- npm

### Install

```bash
npm install
```

### Start Mastra development mode

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Type-check

```bash
npm run check
```

### Formatting

```bash
npm run format
npm run check:format
```

The repository currently does not define a real automated test suite; `npm test` is only the default placeholder command from the package configuration.

## Environment variables

The integrations require provider-specific credentials and configuration. Keep them in local environment configuration and never commit real API keys or tokens.

Typical integrations represented by the dependency graph include model providers, Inngest, Slack, Exa and database/storage services. The exact variable names should be taken from the current source/configuration rather than guessed from the dependency list.

## Project structure

```text
src/
├── mastra/
│   ├── agents/
│   ├── tools/
│   ├── workflows/
│   ├── inngest/
│   ├── storage/
│   └── index.ts
├── triggers/
└── global.d.ts
```

## Status

The repository is an evolving agent/backend workspace. The implementation contains a substantial Mastra-oriented architecture, but the project should not be presented as a finished end-user product without validating the current agents, workflows and deployment configuration.

## License

The package metadata currently declares **ISC**.