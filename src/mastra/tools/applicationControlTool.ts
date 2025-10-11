import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const applicationControlTool = createTool({
  id: "application-control",
  description: "Start or stop Windows applications and processes. Use this when the user wants to launch an application, close a program, or manage running processes.",
  
  inputSchema: z.object({
    action: z.enum(['start', 'stop', 'list']).describe("Action to perform: 'start' to launch an app, 'stop' to close it, 'list' to show running processes"),
    target: z.string().optional().describe("Application name or path to start, or process name to stop (e.g., 'notepad.exe', 'chrome.exe')"),
  }),
  
  outputSchema: z.object({
    success: z.boolean(),
    action: z.string(),
    message: z.string(),
    processes: z.array(z.string()).optional(),
  }),
  
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [ApplicationControl] Starting application control', { action: context.action, target: context.target });
    
    try {
      if (context.action === 'list') {
        // List running processes
        const { stdout } = await execAsync('tasklist /FO CSV /NH', {
          timeout: 10000,
          shell: 'cmd.exe',
        });
        
        // Parse CSV output and extract process names
        const processes = stdout
          .split('\n')
          .filter(line => line.trim())
          .map(line => {
            const match = line.match(/"([^"]+)"/);
            return match ? match[1] : '';
          })
          .filter(name => name)
          .slice(0, 50); // Limit to first 50 processes
        
        logger?.info('✅ [ApplicationControl] Process list retrieved', { count: processes.length });
        
        return {
          success: true,
          action: 'list',
          message: `Found ${processes.length} running processes`,
          processes,
        };
      }
      
      if (context.action === 'start') {
        if (!context.target) {
          return {
            success: false,
            action: 'start',
            message: 'Application name/path is required to start an application',
          };
        }
        
        // Start application
        const { stdout, stderr } = await execAsync(`start "" "${context.target}"`, {
          timeout: 5000,
          shell: 'cmd.exe',
        });
        
        logger?.info('✅ [ApplicationControl] Application started', { target: context.target });
        
        return {
          success: true,
          action: 'start',
          message: `Started application: ${context.target}`,
        };
      }
      
      if (context.action === 'stop') {
        if (!context.target) {
          return {
            success: false,
            action: 'stop',
            message: 'Process name is required to stop an application',
          };
        }
        
        // Stop application using taskkill
        try {
          const { stdout } = await execAsync(`taskkill /IM "${context.target}" /F`, {
            timeout: 5000,
            shell: 'cmd.exe',
          });
          
          logger?.info('✅ [ApplicationControl] Application stopped', { target: context.target });
          
          return {
            success: true,
            action: 'stop',
            message: `Stopped application: ${context.target}`,
          };
        } catch (error: any) {
          // Check if the error is because the process wasn't found
          if (error.message.includes('not found')) {
            return {
              success: false,
              action: 'stop',
              message: `Process not found: ${context.target}`,
            };
          }
          throw error;
        }
      }
      
      return {
        success: false,
        action: context.action,
        message: 'Invalid action',
      };
    } catch (error: any) {
      logger?.error('❌ [ApplicationControl] Operation failed', { 
        action: context.action,
        target: context.target,
        error: error.message,
      });
      
      return {
        success: false,
        action: context.action,
        message: `Operation failed: ${error.message}`,
      };
    }
  },
});
