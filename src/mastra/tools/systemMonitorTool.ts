import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import os from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

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
    disk: z.object({
      path: z.string(),
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
    
    // Disk Information
    let diskInfo = {
      path: 'C:\\',
      total: '0 GB',
      free: '0 GB',
      used: '0 GB',
      usagePercent: 0,
    };
    
    try {
      // Use wmic on Windows to get disk space
      if (platform === 'win32') {
        const { stdout } = await execAsync('wmic logicaldisk where "DeviceID=\'C:\'" get Size,FreeSpace /format:csv');
        const lines = stdout.trim().split('\n').filter(line => line.trim() && !line.includes('Node'));
        if (lines.length > 0) {
          // CSV format: Node,DeviceID,FreeSpace,Size
          const parts = lines[0].split(',');
          if (parts.length >= 4) {
            const freeBytes = parseInt(parts[2]) || 0;  // FreeSpace is at index 2
            const totalBytes = parseInt(parts[3]) || 0; // Size is at index 3
            const usedBytes = totalBytes - freeBytes;
            diskInfo = {
              path: 'C:\\',
              total: formatBytes(totalBytes),
              free: formatBytes(freeBytes),
              used: formatBytes(usedBytes),
              usagePercent: totalBytes > 0 ? Math.round((usedBytes / totalBytes) * 100) : 0,
            };
          }
        }
      } else {
        // For Linux/Mac, use df command
        const { stdout } = await execAsync('df -k / | tail -1');
        const parts = stdout.trim().split(/\s+/);
        if (parts.length >= 6) {
          const totalBytes = parseInt(parts[1]) * 1024;
          const usedBytes = parseInt(parts[2]) * 1024;
          const freeBytes = parseInt(parts[3]) * 1024;
          diskInfo = {
            path: parts[5] || '/',
            total: formatBytes(totalBytes),
            free: formatBytes(freeBytes),
            used: formatBytes(usedBytes),
            usagePercent: totalBytes > 0 ? Math.round((usedBytes / totalBytes) * 100) : 0,
          };
        }
      }
    } catch (error: any) {
      logger?.warn('⚠️ [SystemMonitor] Could not get disk info', { error: error.message });
    }
    
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
      disk: diskInfo,
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
