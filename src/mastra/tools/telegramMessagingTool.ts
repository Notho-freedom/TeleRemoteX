import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const telegramMessagingTool = createTool({
  id: "telegram-messaging",
  description: "Send messages to Telegram users. Use this to reply to user commands and send information back through Telegram.",
  
  inputSchema: z.object({
    chatId: z.number().describe("The Telegram chat ID to send the message to"),
    message: z.string().describe("The message text to send"),
    parseMode: z.enum(['Markdown', 'HTML']).optional().describe("Message formatting mode"),
  }),
  
  outputSchema: z.object({
    success: z.boolean(),
    messageId: z.number().optional(),
    error: z.string().optional(),
  }),
  
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [TelegramMessaging] Sending message to Telegram', { chatId: context.chatId });
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      logger?.error('❌ [TelegramMessaging] TELEGRAM_BOT_TOKEN not found');
      return {
        success: false,
        error: 'Telegram bot token not configured',
      };
    }
    
    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: context.chatId,
          text: context.message,
          parse_mode: context.parseMode,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.ok) {
        logger?.error('❌ [TelegramMessaging] Failed to send message', { error: data });
        return {
          success: false,
          error: data.description || 'Failed to send message',
        };
      }
      
      logger?.info('✅ [TelegramMessaging] Message sent successfully', { messageId: data.result.message_id });
      
      return {
        success: true,
        messageId: data.result.message_id,
      };
    } catch (error: any) {
      logger?.error('❌ [TelegramMessaging] Error sending message', { error: error.message });
      
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
      };
    }
  },
});
