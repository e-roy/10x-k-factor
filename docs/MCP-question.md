I'll help clarify what MCP (Model Context Protocol) actually is and how it differs from simple HTTP endpoints. Let me search the codebase first to see what's currently implemented, then explain the real MCP architecture.

[4 tools called]

Great question! You're absolutely right to call this out. The guide is mixing up different concepts. Let me clarify what **true MCP** actually is versus what you currently have.

## What MCP Actually Is

**Model Context Protocol (MCP)** is an open standard created by Anthropic for enabling LLMs to interact with external tools, data sources, and other agents through a standardized protocol. It's **not** just HTTP endpoints—it's a bidirectional communication protocol with specific primitives:

### MCP Core Concepts

1. **Resources**: Contextual data that agents can read (like files, database records)
2. **Prompts**: Reusable prompt templates agents can invoke
3. **Tools**: Functions agents can call (like APIs, database queries)
4. **Sampling**: Ability for servers to request LLM completions through the client

### How Real MCP Works

```typescript
// Real MCP uses JSON-RPC 2.0 over stdio, SSE, or WebSocket
// NOT just HTTP POST requests

// MCP Server exposes capabilities
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "result": {
    "tools": [
      {
        "name": "choose_viral_loop",
        "description": "Selects optimal viral loop based on context",
        "inputSchema": { /* JSON Schema */ }
      }
    ]
  }
}

// MCP Client calls tool
{
  "jsonrpc": "2.0", 
  "method": "tools/call",
  "params": {
    "name": "choose_viral_loop",
    "arguments": {
      "event": "session_complete",
      "persona": "student"
    }
  }
}
```

## What You Actually Have Now

Looking at your codebase:

```typescript
// packages/agents/src/orchestrator.agent.ts
export function chooseLoop(input: OrchestratorInput): OrchestratorOutput {
  // Pure TypeScript function, no MCP involved
  return { loop: "buddy_challenge", ... };
}
```

This is **not MCP**—it's just a synchronous TypeScript function. There's no protocol, no agent-to-agent communication, no LLM involvement.

## How Agents Should Talk to Each Other via MCP

In a real MCP architecture, agents would:

### 1. **Agent Discovery**
```typescript
// Each agent exposes MCP server
const orchestratorServer = new MCPServer({
  name: "orchestrator-agent",
  version: "1.0.0",
  capabilities: ["tools"]
});

// Other agents can discover and call it
orchestratorServer.setRequestHandler(ToolListRequestSchema, async () => ({
  tools: [
    {
      name: "choose_loop",
      description: "Select viral loop based on event context",
      inputSchema: orchestratorInputSchema
    }
  ]
}));
```

### 2. **Agent-to-Agent Calls (The Key Part)**
```typescript
// Personalization agent needs orchestrator's decision
// In real MCP, it would:

// 1. Connect to orchestrator's MCP server
const orchClient = new Client({
  name: "personalize-agent",
  version: "1.0.0"
}, {
  capabilities: {}
});

await orchClient.connect(
  new StdioClientTransport({
    command: "orchestrator-agent",
    args: ["--mcp"]
  })
);

// 2. List available tools
const { tools } = await orchClient.listTools();

// 3. Call the tool
const result = await orchClient.callTool({
  name: "choose_loop",
  arguments: {
    event: "session_complete",
    persona: "student",
    subject: "Algebra",
    cooldowns: {}
  }
});

// 4. Use result in personalization logic
const loop = result.content[0].text; // "buddy_challenge"
```

### 3. **LLM-Assisted Decision Making** (The Real Power)

This is where MCP shines—agents can use LLMs **with context**:

```typescript
// Agent can ask Claude to make decision using MCP resources
orchestratorServer.setRequestHandler(ToolCallRequestSchema, async (request) => {
  if (request.params.name === "choose_loop") {
    // Agent uses sampling to ask Claude for decision
    const llmDecision = await client.createMessage({
      model: "claude-3-5-sonnet",
      messages: [{
        role: "user",
        content: `Given event="${request.params.arguments.event}" 
                  and persona="${request.params.arguments.persona}",
                  which viral loop should we trigger?
                  
                  Available loops: ${AVAILABLE_LOOPS.join(", ")}
                  Cooldowns: ${JSON.stringify(request.params.arguments.cooldowns)}
                  
                  Consider:
                  - User engagement history
                  - Time since last loop
                  - Subject matter relevance
                  
                  Respond with loop name and rationale.`
      }],
      // MCP provides context automatically
      tools: await getAvailableTools()
    });
    
    return {
      content: [{
        type: "text",
        text: llmDecision.content[0].text
      }]
    };
  }
});
```

## How to Set Up Real MCP

### Step 1: Install MCP SDK

```bash
cd packages/agents
pnpm add @modelcontextprotocol/sdk
```

### Step 2: Convert Agents to MCP Servers

```typescript
// packages/agents/src/orchestrator.mcp.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { chooseLoop } from "./orchestrator.agent.js";

const server = new Server(
  {
    name: "orchestrator-agent",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Expose chooseLoop as MCP tool
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "choose_loop",
      description: "Select optimal viral loop based on event context",
      inputSchema: {
        type: "object",
        properties: {
          event: { type: "string" },
          persona: { type: "string", enum: ["student", "parent", "tutor"] },
          subject: { type: "string" },
          cooldowns: { type: "object" }
        },
        required: ["event", "persona"]
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "choose_loop") {
    const result = chooseLoop(request.params.arguments);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result),
        },
      ],
    };
  }
  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Start MCP server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Step 3: Create MCP Client for Inter-Agent Communication

```typescript
// packages/agents/src/client.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export async function createAgentClient(agentName: string) {
  const client = new Client(
    {
      name: `${agentName}-caller`,
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  const transport = new StdioClientTransport({
    command: "node",
    args: [`./dist/${agentName}.mcp.js`],
  });

  await client.connect(transport);
  return client;
}

// Usage: Personalization agent calls Orchestrator
export async function personalizeWithOrchestration(input: PersonalizeInput) {
  const orchClient = await createAgentClient("orchestrator");
  
  // Call orchestrator to get loop decision
  const loopResult = await orchClient.callTool({
    name: "choose_loop",
    arguments: {
      event: input.event,
      persona: input.persona,
      subject: input.subject,
      cooldowns: input.cooldowns
    }
  });
  
  const { loop } = JSON.parse(loopResult.content[0].text);
  
  // Now personalize based on that loop
  return compose({ ...input, loop });
}
```

### Step 4: Run Agents as MCP Servers

```json
// package.json
{
  "scripts": {
    "agent:orchestrator": "node dist/orchestrator.mcp.js",
    "agent:personalize": "node dist/personalize.mcp.js"
  }
}
```

## Why Bother with MCP?

1. **Standardization**: Other tools/agents can discover and use your agents
2. **LLM Integration**: Agents can delegate complex decisions to Claude with proper context
3. **Composability**: Chain agents together without tight coupling
4. **Context Sharing**: MCP automatically provides resources/prompts to LLMs
5. **Future-Proof**: As more tools adopt MCP, your agents become more powerful

## Recommendation for Your Project

**For MVP (now):** Keep your current TypeScript functions. They work fine for simple rule-based logic.

**For Scale (later):** Migrate to MCP when you need:
- LLM-assisted decision making (not just rules)
- Dynamic agent composition
- External tool integration
- Multi-agent workflows where agents need to coordinate

The current guide conflates "HTTP API" with "MCP"—they're different. MCP is a richer protocol for agent-LLM-tool interaction, not just HTTP endpoints.

Would you like me to create a proper MCP implementation example for one of your agents?
