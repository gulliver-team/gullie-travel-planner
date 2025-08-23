#!/usr/bin/env bun

const VAPI_API_KEY = process.env.VAPI_API_KEY;

interface VapiTool {
  id: string;
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: any;
  };
  server?: {
    url: string;
  };
  createdAt: string;
  updatedAt: string;
  orgId: string;
}

async function listTools(): Promise<VapiTool[]> {
  try {
    const response = await fetch('https://api.vapi.ai/tool?limit=1000', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to list tools:', error);
      return [];
    }

    const tools = await response.json();
    return tools;
  } catch (error) {
    console.error('Error listing tools:', error);
    return [];
  }
}

async function deleteTool(toolId: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.vapi.ai/tool/${toolId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Failed to delete tool ${toolId}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error deleting tool ${toolId}:`, error);
    return false;
  }
}

async function findDuplicateTools(tools: VapiTool[]): Map<string, VapiTool[]> {
  const toolsByName = new Map<string, VapiTool[]>();
  
  for (const tool of tools) {
    if (tool.type === 'function' && tool.function?.name) {
      const name = tool.function.name;
      if (!toolsByName.has(name)) {
        toolsByName.set(name, []);
      }
      toolsByName.get(name)!.push(tool);
    }
  }
  
  // Filter to only show duplicates
  const duplicates = new Map<string, VapiTool[]>();
  for (const [name, toolList] of toolsByName) {
    if (toolList.length > 1) {
      duplicates.set(name, toolList);
    }
  }
  
  return duplicates;
}

async function cleanupDuplicates(keepLatest: boolean = true) {
  console.log('🔍 Fetching all tools...');
  const tools = await listTools();
  console.log(`📊 Found ${tools.length} total tools\n`);

  const duplicates = await findDuplicateTools(tools);
  
  if (duplicates.size === 0) {
    console.log('✅ No duplicate tools found!');
    return;
  }

  console.log(`⚠️  Found ${duplicates.size} tools with duplicates:\n`);
  
  for (const [name, toolList] of duplicates) {
    console.log(`\n📦 ${name}: ${toolList.length} instances`);
    
    // Sort by creation date
    toolList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    for (let i = 0; i < toolList.length; i++) {
      const tool = toolList[i];
      const createdDate = new Date(tool.createdAt).toLocaleString();
      const isLatest = i === 0;
      
      console.log(`   ${isLatest ? '🟢' : '🔴'} ID: ${tool.id}`);
      console.log(`      Created: ${createdDate}`);
      console.log(`      URL: ${tool.server?.url || 'N/A'}`);
      
      if (!keepLatest || !isLatest) {
        if (process.argv.includes('--dry-run')) {
          console.log(`      [DRY RUN] Would delete this tool`);
        } else if (process.argv.includes('--confirm')) {
          const success = await deleteTool(tool.id);
          if (success) {
            console.log(`      ✅ Deleted`);
          } else {
            console.log(`      ❌ Failed to delete`);
          }
        }
      }
    }
  }

  if (!process.argv.includes('--confirm') && !process.argv.includes('--dry-run')) {
    console.log('\n⚠️  To actually delete duplicates, run with --confirm flag');
    console.log('   Or use --dry-run to see what would be deleted');
  }
}

async function listAllTools() {
  console.log('🔍 Fetching all tools...');
  const tools = await listTools();
  
  if (tools.length === 0) {
    console.log('No tools found');
    return;
  }
  
  console.log(`\n📊 Found ${tools.length} tools:\n`);
  
  // Group by function name
  const toolsByName = new Map<string, VapiTool[]>();
  const otherTools: VapiTool[] = [];
  
  for (const tool of tools) {
    if (tool.type === 'function' && tool.function?.name) {
      const name = tool.function.name;
      if (!toolsByName.has(name)) {
        toolsByName.set(name, []);
      }
      toolsByName.get(name)!.push(tool);
    } else {
      otherTools.push(tool);
    }
  }
  
  // Display function tools
  for (const [name, toolList] of toolsByName) {
    console.log(`📦 ${name}:`);
    for (const tool of toolList) {
      const createdDate = new Date(tool.createdAt).toLocaleString();
      console.log(`   - ID: ${tool.id}`);
      console.log(`     Created: ${createdDate}`);
      console.log(`     URL: ${tool.server?.url || 'N/A'}`);
      if (toolList.length > 1) {
        console.log(`     ⚠️  DUPLICATE (${toolList.length} instances)`);
      }
    }
    console.log();
  }
  
  // Display other tools
  if (otherTools.length > 0) {
    console.log('📦 Other tools:');
    for (const tool of otherTools) {
      console.log(`   - ID: ${tool.id}`);
      console.log(`     Type: ${tool.type}`);
      console.log(`     Created: ${new Date(tool.createdAt).toLocaleString()}`);
    }
  }
}

async function deleteAllTools() {
  if (!process.argv.includes('--confirm')) {
    console.log('⚠️  This will delete ALL tools!');
    console.log('   Run with --confirm to proceed');
    return;
  }

  console.log('🔍 Fetching all tools...');
  const tools = await listTools();
  
  if (tools.length === 0) {
    console.log('No tools to delete');
    return;
  }
  
  console.log(`⚠️  Deleting ${tools.length} tools...`);
  
  let deleted = 0;
  let failed = 0;
  
  for (const tool of tools) {
    const success = await deleteTool(tool.id);
    if (success) {
      deleted++;
      console.log(`✅ Deleted: ${tool.function?.name || tool.id}`);
    } else {
      failed++;
      console.log(`❌ Failed: ${tool.function?.name || tool.id}`);
    }
  }
  
  console.log(`\n📊 Results: ${deleted} deleted, ${failed} failed`);
}

async function main() {
  const command = process.argv[2];
  
  console.log('🚀 Vapi Tool Manager\n');
  
  switch (command) {
    case 'list':
      await listAllTools();
      break;
    case 'cleanup':
      await cleanupDuplicates();
      break;
    case 'delete-all':
      await deleteAllTools();
      break;
    default:
      console.log('Usage: bun run scripts/manage-vapi-tools.ts <command> [options]');
      console.log('\nCommands:');
      console.log('  list                  - List all tools');
      console.log('  cleanup [--confirm]   - Remove duplicate tools (keeps latest)');
      console.log('  delete-all [--confirm] - Delete ALL tools');
      console.log('\nOptions:');
      console.log('  --confirm  - Actually perform deletions');
      console.log('  --dry-run  - Show what would be deleted without doing it');
  }
}

main().catch(console.error);