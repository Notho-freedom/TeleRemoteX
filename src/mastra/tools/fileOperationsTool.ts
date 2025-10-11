import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { readdir, stat } from "fs/promises";
import { join } from "path";

export const fileOperationsTool = createTool({
  id: "file-operations",
  description: "Browse and list files and directories on the Windows computer. Use this when the user wants to see files in a directory, check file information, or explore the file system.",
  
  inputSchema: z.object({
    path: z.string().describe("The directory path to browse (e.g., 'C:\\\\Users', 'C:\\\\Program Files')"),
    showHidden: z.boolean().optional().describe("Whether to show hidden files (default: false)"),
  }),
  
  outputSchema: z.object({
    path: z.string(),
    files: z.array(z.object({
      name: z.string(),
      type: z.enum(['file', 'directory']),
      size: z.string().optional(),
      modified: z.string(),
    })),
    totalItems: z.number(),
    error: z.string().optional(),
  }),
  
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [FileOperations] Starting file browsing', { path: context.path });
    
    try {
      // Read directory contents
      const items = await readdir(context.path);
      
      // Get detailed info for each item
      const fileList = await Promise.all(
        items.map(async (item) => {
          try {
            const itemPath = join(context.path, item);
            const stats = await stat(itemPath);
            
            // Skip hidden files if not requested
            if (!context.showHidden && item.startsWith('.')) {
              return null;
            }
            
            // Format file size
            const formatBytes = (bytes: number): string => {
              if (bytes === 0) return '0 B';
              const k = 1024;
              const sizes = ['B', 'KB', 'MB', 'GB'];
              const i = Math.floor(Math.log(bytes) / Math.log(k));
              return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
            };
            
            return {
              name: item,
              type: stats.isDirectory() ? 'directory' as const : 'file' as const,
              size: stats.isFile() ? formatBytes(stats.size) : undefined,
              modified: stats.mtime.toISOString(),
            };
          } catch (err) {
            logger?.warn('⚠️ [FileOperations] Could not get stats for item', { item, error: err });
            return null;
          }
        })
      );
      
      // Filter out null entries and sort (directories first, then files)
      const validFiles = fileList.filter(f => f !== null) as any[];
      validFiles.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'directory' ? -1 : 1;
      });
      
      const result = {
        path: context.path,
        files: validFiles,
        totalItems: validFiles.length,
      };
      
      logger?.info('✅ [FileOperations] File browsing complete', { totalItems: validFiles.length });
      
      return result;
    } catch (error: any) {
      logger?.error('❌ [FileOperations] File browsing failed', { error: error.message });
      
      return {
        path: context.path,
        files: [],
        totalItems: 0,
        error: `Failed to browse directory: ${error.message}`,
      };
    }
  },
});
