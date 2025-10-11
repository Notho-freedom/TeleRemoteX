import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const commandExecutionTool = createTool({
  id: "command-execution",
  description: "Execute Windows commands and scripts on the computer. Use this when the user wants to run a specific command, script, or system utility. Be careful with destructive commands.",
  
  inputSchema: z.object({
    command: z.string().describe("The Windows command to execute (e.g., 'dir', 'ipconfig', 'tasklist')"),
    timeout: z.number().optional().describe("Command timeout in milliseconds (default: 30000)"),
  }),
  
  outputSchema: z.object({
    success: z.boolean(),
    output: z.string(),
    error: z.string().optional(),
    executionTime: z.number(),
  }),
  
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [CommandExecution] Starting command execution', { command: context.command });
    
    const startTime = Date.now();
    
    try {
      // Execute the command with a timeout
      const { stdout, stderr } = await execAsync(context.command, {
        timeout: context.timeout || 30000,
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        shell: 'cmd.exe', // Use Windows command prompt
      });
      
      const executionTime = Date.now() - startTime;
      
      const result = {
        success: true,
        output: stdout || 'Command executed successfully (no output)',
        error: stderr || undefined,
        executionTime,
      };
      
      logger?.info('✅ [CommandExecution] Command executed successfully', { 
        executionTime,
        outputLength: stdout.length,
      });
      
      return result;
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      logger?.error('❌ [CommandExecution] Command execution failed', { 
        error: error.message,
        executionTime,
      });
      
      return {
        success: false,
        output: error.stdout || '',
        error: error.message || 'Unknown error occurred',
        executionTime,
      };
    }
  },
});
