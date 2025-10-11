import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import os from "os";

export const systemMonitorTool = createTool({
  id: "system-monitor",
  description: "Monitor Windows system resources including CPU, memory, and disk usage. Use this when the user asks about system performance, resource usage, or wants to check if the computer is running smoothly.",
  
  inputSchema: z.object({
    detailed: z.boolean().optional().describe("Whether to include detailed system information"),
  }),
  
  outputSchema: z.object({
    cpu: z.object({
      model: z.string(),
      cores: z.number(),
      speed: z.number(),
      usage: z.string(),
    }),
    memory: z.object({
      total: z.string(),
      free: z.string(),
      used: z.string(),
      usagePercent: z.number(),
    }),
    system: z.object({
      platform: z.string(),
      hostname: z.string(),
      uptime: z.string(),
    }),
  }),
  
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [SystemMonitor] Starting system monitoring', { detailed: context.detailed });
    
    // CPU Information
    const cpus = os.cpus();
    const cpuModel = cpus[0]?.model || "Unknown";
    const cpuCores = cpus.length;
    const cpuSpeed = cpus[0]?.speed || 0;
    
    // Memory Information
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = Math.round((usedMem / totalMem) * 100);
    
    // System Information
    const platform = os.platform();
    const hostname = os.hostname();
    const uptime = os.uptime();
    
    // Format uptime
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const uptimeFormatted = `${days}d ${hours}h ${minutes}m`;
    
    // Format memory sizes
    const formatBytes = (bytes: number): string => {
      const gb = (bytes / (1024 ** 3)).toFixed(2);
      return `${gb} GB`;
    };
    
    const result = {
      cpu: {
        model: cpuModel,
        cores: cpuCores,
        speed: cpuSpeed,
        usage: `${cpuCores} cores @ ${cpuSpeed} MHz`,
      },
      memory: {
        total: formatBytes(totalMem),
        free: formatBytes(freeMem),
        used: formatBytes(usedMem),
        usagePercent: memUsagePercent,
      },
      system: {
        platform: platform,
        hostname: hostname,
        uptime: uptimeFormatted,
      },
    };
    
    logger?.info('✅ [SystemMonitor] Monitoring complete', { result });
    
    return result;
  },
});
