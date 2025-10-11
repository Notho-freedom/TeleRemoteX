import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { windowsManagementAgent } from "../agents/windowsManagementAgent";

// Step 1: Use the Windows management agent to process the user's command
const useAgentStep = createStep({
  id: "use-windows-agent",
  description: "Process user command with Windows management agent",
  
  inputSchema: z.object({
    message: z.string().describe("The user's message/command"),
    threadId: z.string().describe("Thread ID for conversation memory"),
  }),
  
  outputSchema: z.object({
    response: z.string().describe("The agent's response"),
    chatId: z.number().describe("Telegram chat ID to reply to"),
  }),
  
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🤖 [Workflow Step 1] Using Windows management agent', { 
      messageLength: inputData.message.length,
      threadId: inputData.threadId,
    });
    
    // Parse the Telegram payload to get chat ID
    let telegramPayload;
    let chatId;
    try {
      telegramPayload = JSON.parse(inputData.message);
      chatId = telegramPayload.message?.chat?.id;
    } catch (e) {
      logger?.warn('⚠️ [Workflow Step 1] Could not parse Telegram payload', { error: e });
      chatId = 0;
    }
    
    // Extract the actual message text
    const userMessage = telegramPayload?.message?.text || inputData.message;
    
    // Call the agent to process the command
    const { text } = await windowsManagementAgent.generate(
      [{ role: "user", content: userMessage }],
      {
        resourceId: "windows-bot",
        threadId: inputData.threadId,
        maxSteps: 5, // Allow the agent to use multiple tools
      }
    );
    
    logger?.info('✅ [Workflow Step 1] Agent response generated', { 
      responseLength: text.length,
    });
    
    return {
      response: text,
      chatId: chatId || 0,
    };
  },
});

// Step 2: Send the response back to Telegram
const sendReplyStep = createStep({
  id: "send-telegram-reply",
  description: "Send the agent's response to Telegram",
  
  inputSchema: z.object({
    response: z.string().describe("The message to send"),
    chatId: z.number().describe("Telegram chat ID"),
  }),
  
  outputSchema: z.object({
    sent: z.boolean().describe("Whether the message was sent successfully"),
  }),
  
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('📤 [Workflow Step 2] Sending reply to Telegram', { 
      chatId: inputData.chatId,
      responseLength: inputData.response.length,
    });
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      logger?.error('❌ [Workflow Step 2] TELEGRAM_BOT_TOKEN not found');
      return { sent: false };
    }
    
    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: inputData.chatId,
          text: inputData.response,
          parse_mode: 'Markdown',
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.ok) {
        logger?.error('❌ [Workflow Step 2] Failed to send message', { error: data });
        return { sent: false };
      }
      
      logger?.info('✅ [Workflow Step 2] Message sent successfully', { 
        messageId: data.result.message_id,
      });
      
      return { sent: true };
    } catch (error: any) {
      logger?.error('❌ [Workflow Step 2] Error sending message', { error: error.message });
      return { sent: false };
    }
  },
});

// Create the workflow
export const windowsManagementWorkflow = createWorkflow({
  id: "windows-management-workflow",
  description: "Windows computer management workflow via Telegram",
  
  inputSchema: z.object({
    message: z.string().describe("The Telegram message payload"),
    threadId: z.string().describe("Thread ID for conversation"),
  }),
  
  outputSchema: z.object({
    sent: z.boolean(),
  }),
})
  .then(useAgentStep)
  .then(sendReplyStep)
  .commit();
