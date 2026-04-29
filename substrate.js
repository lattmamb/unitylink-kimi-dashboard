/**
 * AGENT-ZERO SUBSTRATE
 * Core Architecture Implementation
 * 
 * Every element maps to an executable primitive in the Agent-Zero framework.
 * Nothing is decorative. Everything serves a functional purpose.
 */

// ============================================
// PRIMITIVE: Configuration System
// Maps to: agent-zero/config.py
// ============================================
const Config = {
    // Agent behavior configuration
    agent: {
        name: 'Agent-Zero',
        version: '1.0.0',
        max_iterations: 10,
        temperature: 0.7,
        context_window: 128000,
    },
    
    // Tool configuration
    tools: {
        enabled: [
            'read_file',
            'write_file', 
            'list_files',
            'search_files',
            'execute_code',
            'web_search',
            'knowledge_query',
            'memory_recall',
            'memory_store'
        ],
        timeout: 30000,
        max_output: 10000
    },
    
    // Memory configuration
    memory: {
        persistence: true,
        embedding_model: 'text-embedding-3-large',
        similarity_threshold: 0.75,
        max_context_memories: 10
    },
    
    // UI configuration
    ui: {
        theme: 'dark',
        font_size: 13,
        line_height: 1.5,
        animations: true
    }
};

// ============================================
// PRIMITIVE: Event Bus
// Maps to: agent-zero/bus.py
// Decoupled communication between all components
// ============================================
class EventBus {
    constructor() {
        this.subscribers = new Map();
        this.history = [];
    }
    
    subscribe(event, callback) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, new Set());
        }
        this.subscribers.get(event).add(callback);
        
        // Return unsubscribe function
        return () => this.subscribers.get(event).delete(callback);
    }
    
    emit(event, data = {}) {
        const timestamp = Date.now();
        const eventData = { event, data, timestamp };
        
        // Store in history
        this.history.push(eventData);
        if (this.history.length > 1000) {
            this.history.shift();
        }
        
        // Notify subscribers
        const callbacks = this.subscribers.get(event);
        if (callbacks) {
            callbacks.forEach(cb => {
                try {
                    cb(data);
                } catch (err) {
                    console.error(`Event handler error for ${event}:`, err);
                }
            });
        }
        
        // Also emit to wildcard subscribers
        const wildcards = this.subscribers.get('*');
        if (wildcards) {
            wildcards.forEach(cb => cb(eventData));
        }
    }
    
    getHistory(event = null) {
        if (event) {
            return this.history.filter(h => h.event === event);
        }
        return [...this.history];
    }
}

// Global event bus instance
const bus = new EventBus();

// ============================================
// PRIMITIVE: Logger
// Maps to: agent-zero/logger.py
// Structured logging with levels and formatting
// ============================================
class Logger {
    constructor() {
        this.levels = {
            DEBUG: 0,
            INFO: 1,
            SUCCESS: 2,
            WARN: 3,
            ERROR: 4
        };
        this.minLevel = this.levels.DEBUG;
        this.logs = [];
    }
    
    format(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        return {
            timestamp,
            level: Object.keys(this.levels)[level],
            message,
            meta,
            toString() {
                return `[${timestamp}] ${this.level}: ${message}`;
            }
        };
    }
    
    log(level, message, meta = {}) {
        if (level < this.minLevel) return;
        
        const entry = this.format(level, message, meta);
        this.logs.push(entry);
        
        // Emit to UI
        bus.emit('log', entry);
        
        // Console output
        const colors = {
            DEBUG: '\x1b[36m',
            INFO: '\x1b[34m',
            SUCCESS: '\x1b[32m',
            WARN: '\x1b[33m',
            ERROR: '\x1b[31m'
        };
        
        console.log(`${colors[entry.level] || ''}${entry.toString()}\x1b[0m`);
        
        return entry;
    }
    
    debug(message, meta) { return this.log(this.levels.DEBUG, message, meta); }
    info(message, meta) { return this.log(this.levels.INFO, message, meta); }
    success(message, meta) { return this.log(this.levels.SUCCESS, message, meta); }
    warn(message, meta) { return this.log(this.levels.WARN, message, meta); }
    error(message, meta) { return this.log(this.levels.ERROR, message, meta); }
    
    getLogs(level = null) {
        if (level !== null) {
            return this.logs.filter(l => this.levels[l.level] >= level);
        }
        return [...this.logs];
    }
    
    clear() {
        this.logs = [];
        bus.emit('logs:cleared');
    }
}

const logger = new Logger();

// ============================================
// PRIMITIVE: Memory System
// Maps to: agent-zero/memory/*
// Vector-based memory with semantic search
// ============================================
class MemorySystem {
    constructor() {
        this.memories = new Map();
        this.embeddings = new Map();
        this.categories = new Map();
        this.idCounter = 0;
    }
    
    generateId() {
        return `mem_${++this.idCounter}_${Date.now().toString(36)}`;
    }
    
    // Store a memory with optional categorization
    store(content, metadata = {}, category = 'general') {
        const id = this.generateId();
        const timestamp = Date.now();
        
        const memory = {
            id,
            content,
            metadata: {
                ...metadata,
                timestamp,
                accessCount: 0,
                lastAccessed: timestamp
            },
            category
        };
        
        this.memories.set(id, memory);
        
        // Generate simple embedding (in production, use actual embedding model)
        this.embeddings.set(id, this.simpleEmbed(content));
        
        // Add to category
        if (!this.categories.has(category)) {
            this.categories.set(category, new Set());
        }
        this.categories.get(category).add(id);
        
        logger.success(`Memory stored: ${id}`, { category, contentLength: content.length });
        bus.emit('memory:stored', memory);
        
        return memory;
    }
    
    // Simple embedding for demo (in production: use text-embedding-3-large)
    simpleEmbed(text) {
        // Create a frequency-based vector
        const words = text.toLowerCase().split(/\s+/);
        const freq = {};
        words.forEach(w => freq[w] = (freq[w] || 0) + 1);
        return Object.entries(freq).sort().map(([k, v]) => v);
    }
    
    // Calculate cosine similarity
    cosineSimilarity(a, b) {
        const maxLen = Math.max(a.length, b.length);
        const aPadded = [...a, ...Array(maxLen - a.length).fill(0)];
        const bPadded = [...b, ...Array(maxLen - b.length).fill(0)];
        
        let dot = 0, normA = 0, normB = 0;
        for (let i = 0; i < maxLen; i++) {
            dot += aPadded[i] * bPadded[i];
            normA += aPadded[i] * aPadded[i];
            normB += bPadded[i] * bPadded[i];
        }
        
        return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
    }
    
    // Recall memories based on query
    recall(query, options = {}) {
        const { limit = 5, threshold = 0.5, category = null } = options;
        
        const queryEmbedding = this.simpleEmbed(query);
        const results = [];
        
        const memoryIds = category 
            ? Array.from(this.categories.get(category) || [])
            : Array.from(this.memories.keys());
        
        for (const id of memoryIds) {
            const embedding = this.embeddings.get(id);
            if (!embedding) continue;
            
            const similarity = this.cosineSimilarity(queryEmbedding, embedding);
            if (similarity >= threshold) {
                const memory = this.memories.get(id);
                memory.metadata.accessCount++;
                memory.metadata.lastAccessed = Date.now();
                results.push({ memory, similarity });
            }
        }
        
        // Sort by similarity
        results.sort((a, b) => b.similarity - a.similarity);
        
        logger.info(`Memory recall: "${query}"`, { results: results.length });
        bus.emit('memory:recalled', { query, results: results.slice(0, limit) });
        
        return results.slice(0, limit);
    }
    
    // Get memory by ID
    get(id) {
        return this.memories.get(id);
    }
    
    // Get all memories in a category
    getByCategory(category) {
        const ids = this.categories.get(category) || new Set();
        return Array.from(ids).map(id => this.memories.get(id)).filter(Boolean);
    }
    
    // Get all categories
    getCategories() {
        return Array.from(this.categories.keys());
    }
    
    // Delete memory
    delete(id) {
        const memory = this.memories.get(id);
        if (!memory) return false;
        
        this.memories.delete(id);
        this.embeddings.delete(id);
        this.categories.get(memory.category)?.delete(id);
        
        bus.emit('memory:deleted', { id });
        return true;
    }
    
    // Export all memories
    export() {
        return {
            memories: Array.from(this.memories.values()),
            categories: Array.from(this.categories.entries()).map(([k, v]) => [k, Array.from(v)])
        };
    }
    
    // Import memories
    import(data) {
        if (data.memories) {
            for (const mem of data.memories) {
                this.memories.set(mem.id, mem);
                this.embeddings.set(mem.id, this.simpleEmbed(mem.content));
            }
        }
        if (data.categories) {
            for (const [cat, ids] of data.categories) {
                this.categories.set(cat, new Set(ids));
            }
        }
        bus.emit('memory:imported', { count: data.memories?.length || 0 });
    }
}

const memory = new MemorySystem();

// ============================================
// PRIMITIVE: Tool System
// Maps to: agent-zero/tools/*
// Executable capabilities the agent can invoke
// ============================================
class ToolRegistry {
    constructor() {
        this.tools = new Map();
        this.executions = [];
    }
    
    // Register a tool
    register(name, config) {
        this.tools.set(name, {
            name,
            description: config.description,
            parameters: config.parameters || {},
            execute: config.execute,
            timeout: config.timeout || 30000
        });
        logger.debug(`Tool registered: ${name}`);
    }
    
    // Execute a tool
    async execute(name, params = {}) {
        const tool = this.tools.get(name);
        if (!tool) {
            throw new Error(`Tool not found: ${name}`);
        }
        
        const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startTime = Date.now();
        
        const execution = {
            id: executionId,
            tool: name,
            params,
            status: 'pending',
            startTime,
            endTime: null,
            result: null,
            error: null
        };
        
        this.executions.push(execution);
        bus.emit('tool:started', execution);
        
        try {
            // Execute with timeout
            const result = await Promise.race([
                tool.execute(params),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), tool.timeout)
                )
            ]);
            
            execution.status = 'success';
            execution.result = result;
            execution.endTime = Date.now();
            
            logger.success(`Tool executed: ${name}`, { duration: execution.endTime - startTime });
            bus.emit('tool:completed', execution);
            
            return result;
        } catch (error) {
            execution.status = 'error';
            execution.error = error.message;
            execution.endTime = Date.now();
            
            logger.error(`Tool failed: ${name}`, { error: error.message });
            bus.emit('tool:failed', execution);
            
            throw error;
        }
    }
    
    // Get tool definition
    get(name) {
        return this.tools.get(name);
    }
    
    // Get all tool definitions (for agent context)
    getAllDefinitions() {
        return Array.from(this.tools.values()).map(t => ({
            name: t.name,
            description: t.description,
            parameters: t.parameters
        }));
    }
    
    // Get execution history
    getExecutions(status = null) {
        if (status) {
            return this.executions.filter(e => e.status === status);
        }
        return [...this.executions];
    }
}

const tools = new ToolRegistry();

// ============================================
// PRIMITIVE: Knowledge Graph
// Maps to: agent-zero/knowledge_graph.py
// Relationship visualization and traversal
// ============================================
class KnowledgeGraph {
    constructor() {
        this.nodes = new Map();
        this.edges = [];
        this.network = null;
    }
    
    // Add a node (document, entity, concept)
    addNode(id, type, data = {}) {
        const node = {
            id,
            type,
            label: data.label || id,
            group: type,
            title: data.title || data.label || id,
            value: data.value || 1,
            data
        };
        
        this.nodes.set(id, node);
        bus.emit('graph:nodeAdded', node);
        return node;
    }
    
    // Add an edge (relationship)
    addEdge(from, to, type = 'related', data = {}) {
        const edge = {
            from,
            to,
            type,
            label: data.label || type,
            arrows: data.directed ? 'to' : '',
            data
        };
        
        this.edges.push(edge);
        bus.emit('graph:edgeAdded', edge);
        return edge;
    }
    
    // Get node by ID
    getNode(id) {
        return this.nodes.get(id);
    }
    
    // Get neighbors of a node
    getNeighbors(id) {
        const neighbors = new Set();
        for (const edge of this.edges) {
            if (edge.from === id) neighbors.add(edge.to);
            if (edge.to === id) neighbors.add(edge.from);
        }
        return Array.from(neighbors).map(nid => this.nodes.get(nid)).filter(Boolean);
    }
    
    // Find paths between nodes
    findPaths(start, end, maxDepth = 5) {
        const paths = [];
        const visited = new Set();
        
        const dfs = (current, path, depth) => {
            if (depth > maxDepth) return;
            if (current === end) {
                paths.push([...path]);
                return;
            }
            
            visited.add(current);
            
            for (const edge of this.edges) {
                if (edge.from === current && !visited.has(edge.to)) {
                    path.push(edge);
                    dfs(edge.to, path, depth + 1);
                    path.pop();
                }
            }
            
            visited.delete(current);
        };
        
        dfs(start, [], 0);
        return paths;
    }
    
    // Render to vis.js
    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const nodes = new vis.DataSet(Array.from(this.nodes.values()));
        const edges = new vis.DataSet(this.edges);
        
        const options = {
            nodes: {
                shape: 'dot',
                font: {
                    face: 'JetBrains Mono',
                    color: '#fafafa',
                    size: 12
                },
                borderWidth: 2,
                shadow: true
            },
            edges: {
                font: {
                    face: 'JetBrains Mono',
                    color: '#737373',
                    size: 10
                },
                color: {
                    color: '#333333',
                    highlight: '#00d4aa'
                },
                smooth: {
                    type: 'continuous'
                }
            },
            groups: {
                document: { color: { background: '#00d4aa', border: '#00a884' } },
                entity: { color: { background: '#3b82f6', border: '#2563eb' } },
                concept: { color: { background: '#a855f7', border: '#9333ea' } },
                operation: { color: { background: '#f59e0b', border: '#d97706' } }
            },
            physics: {
                forceAtlas2Based: {
                    gravitationalConstant: -50,
                    centralGravity: 0.005,
                    springLength: 230,
                    springConstant: 0.18
                },
                maxVelocity: 146,
                solver: 'forceAtlas2Based',
                timestep: 0.35,
                stabilization: { iterations: 150 }
            },
            interaction: {
                hover: true,
                tooltipDelay: 200,
                hideEdgesOnDrag: true
            }
        };
        
        this.network = new vis.Network(container, { nodes, edges }, options);
        
        // Event handlers
        this.network.on('click', (params) => {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const node = this.nodes.get(nodeId);
                bus.emit('graph:nodeClicked', node);
            }
        });
        
        bus.emit('graph:rendered', { nodeCount: nodes.length, edgeCount: edges.length });
    }
    
    // Export graph data
    export() {
        return {
            nodes: Array.from(this.nodes.values()),
            edges: this.edges
        };
    }
    
    // Clear graph
    clear() {
        this.nodes.clear();
        this.edges = [];
        bus.emit('graph:cleared');
    }
}

const knowledgeGraph = new KnowledgeGraph();

// ============================================
// PRIMITIVE: Agent Core
// Maps to: agent-zero/agent.py
// The orchestrating intelligence
// ============================================
class Agent {
    constructor(config = {}) {
        this.config = { ...Config.agent, ...config };
        this.state = {
            status: 'idle',
            iteration: 0,
            context: [],
            currentTask: null
        };
        this.messageHistory = [];
    }
    
    // Process a user message
    async process(message, context = {}) {
        logger.info(`Agent processing: "${message.substring(0, 50)}..."`);
        
        this.state.status = 'processing';
        this.state.currentTask = message;
        bus.emit('agent:processing', { message });
        
        // Add to history
        this.messageHistory.push({
            role: 'user',
            content: message,
            timestamp: Date.now()
        });
        
        // Parse intent
        const intent = this.parseIntent(message);
        logger.debug('Intent parsed', intent);
        
        // Execute based on intent
        let response;
        try {
            switch (intent.type) {
                case 'TOOL_CALL':
                    response = await this.executeTool(intent.tool, intent.params);
                    break;
                case 'MEMORY_QUERY':
                    response = await this.queryMemory(intent.query);
                    break;
                case 'GRAPH_QUERY':
                    response = await this.queryGraph(intent.query);
                    break;
                case 'FILE_OPERATION':
                    response = await this.fileOperation(intent.operation, intent.params);
                    break;
                default:
                    response = await this.generateResponse(message, context);
            }
        } catch (error) {
            response = {
                content: `Error: ${error.message}`,
                error: true
            };
            logger.error('Agent execution error', { error: error.message });
        }
        
        // Add response to history
        this.messageHistory.push({
            role: 'assistant',
            content: response.content || response,
            timestamp: Date.now()
        });
        
        this.state.status = 'idle';
        this.state.currentTask = null;
        bus.emit('agent:responded', { message, response });
        
        return response;
    }
    
    // Parse user intent
    parseIntent(message) {
        const lower = message.toLowerCase();
        
        // Tool call patterns
        const toolPatterns = [
            { pattern: /^\/read\s+(.+)/, tool: 'read_file' },
            { pattern: /^\/write\s+(.+)/, tool: 'write_file' },
            { pattern: /^\/list\s*(.*)/, tool: 'list_files' },
            { pattern: /^\/search\s+(.+)/, tool: 'search_files' },
            { pattern: /^\/exec\s+(.+)/, tool: 'execute_code' },
            { pattern: /^\/web\s+(.+)/, tool: 'web_search' }
        ];
        
        for (const { pattern, tool } of toolPatterns) {
            const match = message.match(pattern);
            if (match) {
                return {
                    type: 'TOOL_CALL',
                    tool,
                    params: { input: match[1] }
                };
            }
        }
        
        // Memory query patterns
        if (/remember|recall|what.*know|find.*memory/i.test(lower)) {
            return {
                type: 'MEMORY_QUERY',
                query: message.replace(/remember|recall|what do you know about|find in memory/gi, '').trim()
            };
        }
        
        // Graph query patterns
        if (/graph|relationship|connection|link|network/i.test(lower)) {
            return {
                type: 'GRAPH_QUERY',
                query: message
            };
        }
        
        // File operation patterns
        if (/create|make|new file|delete|remove|rename|move/i.test(lower)) {
            return {
                type: 'FILE_OPERATION',
                operation: lower.includes('delete') || lower.includes('remove') ? 'delete' :
                          lower.includes('rename') ? 'rename' :
                          lower.includes('move') ? 'move' : 'create',
                params: { description: message }
            };
        }
        
        return { type: 'GENERAL' };
    }
    
    // Execute a tool
    async executeTool(toolName, params) {
        const result = await tools.execute(toolName, params);
        return {
            content: `Executed ${toolName}`,
            result,
            toolCall: { name: toolName, params }
        };
    }
    
    // Query memory
    async queryMemory(query) {
        const results = memory.recall(query, { limit: 5 });
        
        if (results.length === 0) {
            return { content: 'No relevant memories found.' };
        }
        
        const content = results.map(r => 
            `• ${r.memory.content.substring(0, 100)}... (similarity: ${(r.similarity * 100).toFixed(1)}%)`
        ).join('\n');
        
        return {
            content: `Found ${results.length} relevant memories:\n\n${content}`,
            memories: results
        };
    }
    
    // Query knowledge graph
    async queryGraph(query) {
        const nodes = Array.from(knowledgeGraph.nodes.values()).slice(0, 10);
        
        return {
            content: `Knowledge graph contains ${knowledgeGraph.nodes.size} nodes and ${knowledgeGraph.edges.length} edges.`,
            nodes
        };
    }
    
    // File operations
    async fileOperation(operation, params) {
        // Implementation depends on file system
        return {
            content: `File operation '${operation}' queued with params: ${JSON.stringify(params)}`
        };
    }
    
    // Generate general response
    async generateResponse(message, context) {
        // In production: call LLM API
        // For demo: generate contextual response
        
        const responses = [
            "I understand. Let me analyze this for you.",
            "I can help with that. What specific information do you need?",
            "Let me search through the knowledge base for relevant information.",
            "I can execute that operation. Proceeding now.",
            "Interesting query. Let me process this and get back to you with insights."
        ];
        
        return {
            content: responses[Math.floor(Math.random() * responses.length)],
            context: {
                availableTools: tools.getAllDefinitions(),
                memoryCategories: memory.getCategories()
            }
        };
    }
    
    // Get conversation history
    getHistory() {
        return [...this.messageHistory];
    }
    
    // Clear history
    clearHistory() {
        this.messageHistory = [];
        bus.emit('agent:historyCleared');
    }
}

const agent = new Agent();

// ============================================
// PRIMITIVE: File System
// Maps to: agent-zero/tools/read_file.py, write_file.py, etc.
// Document storage and operations
// ============================================
class FileSystem {
    constructor() {
        this.files = new Map();
        this.directories = new Map();
        this.root = { id: 'root', name: 'root', type: 'directory', children: [] };
    }
    
    // Create a file
    create(path, content = '', type = 'txt') {
        const id = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const file = {
            id,
            path,
            name: path.split('/').pop(),
            content,
            type,
            size: content.length,
            created: Date.now(),
            modified: Date.now(),
            version: 1
        };
        
        this.files.set(id, file);
        
        // Add to knowledge graph
        knowledgeGraph.addNode(id, 'document', {
            label: file.name,
            title: `${file.name}\n${file.size} bytes`,
            value: Math.max(1, Math.log(file.size + 1))
        });
        
        // Store in memory
        memory.store(content, { fileId: id, path }, 'files');
        
        logger.success(`File created: ${path}`);
        bus.emit('file:created', file);
        
        return file;
    }
    
    // Read a file
    read(id) {
        const file = this.files.get(id);
        if (file) {
            logger.debug(`File read: ${file.path}`);
        }
        return file;
    }
    
    // Update a file
    update(id, updates) {
        const file = this.files.get(id);
        if (!file) throw new Error(`File not found: ${id}`);
        
        if (updates.content !== undefined) {
            file.content = updates.content;
            file.size = updates.content.length;
        }
        if (updates.path !== undefined) {
            file.path = updates.path;
            file.name = updates.path.split('/').pop();
        }
        
        file.modified = Date.now();
        file.version++;
        
        logger.success(`File updated: ${file.path} (v${file.version})`);
        bus.emit('file:updated', file);
        
        return file;
    }
    
    // Delete a file
    delete(id) {
        const file = this.files.get(id);
        if (!file) return false;
        
        this.files.delete(id);
        logger.success(`File deleted: ${file.path}`);
        bus.emit('file:deleted', { id });
        
        return true;
    }
    
    // Search files
    search(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();
        
        for (const file of this.files.values()) {
            if (file.name.toLowerCase().includes(lowerQuery) ||
                file.content.toLowerCase().includes(lowerQuery)) {
                results.push(file);
            }
        }
        
        return results;
    }
    
    // List all files
    list() {
        return Array.from(this.files.values());
    }
    
    // Get file count
    count() {
        return this.files.size;
    }
}

const fileSystem = new FileSystem();

// ============================================
// PRIMITIVE: UI Controller
// Maps to: React/Vue components in agent-zero UI
// Binds substrate to interface
// ============================================
class UIController {
    constructor() {
        this.elements = {};
        this.cacheElements();
        this.setupEventListeners();
        this.renderInitialState();
    }
    
    cacheElements() {
        this.elements = {
            memorySection: document.getElementById('memorySection'),
            canvasTabs: document.getElementById('canvasTabs'),
            canvasContent: document.getElementById('canvasContent'),
            agentMessages: document.getElementById('agentMessages'),
            agentInput: document.getElementById('agentInput'),
            terminalContent: document.getElementById('terminalContent'),
            toastContainer: document.getElementById('toastContainer'),
            uploadModal: document.getElementById('uploadModal'),
            graphOverlay: document.getElementById('graphOverlay'),
            contextPanel: document.getElementById('contextPanel'),
            agentPanel: document.getElementById('agentPanel'),
            dropzone: document.getElementById('dropzone'),
            fileInput: document.getElementById('fileInput')
        };
    }
    
    setupEventListeners() {
        // Bus events
        bus.subscribe('log', (entry) => this.renderLog(entry));
        bus.subscribe('memory:stored', (mem) => this.renderMemory(mem));
        bus.subscribe('file:created', (file) => this.onFileCreated(file));
        bus.subscribe('agent:responded', ({ response }) => this.renderAgentResponse(response));
        bus.subscribe('tool:started', (exec) => this.renderToolCall(exec));
        bus.subscribe('tool:completed', (exec) => this.updateToolCall(exec));
        bus.subscribe('graph:rendered', () => this.showToast('Knowledge graph rendered', 'success'));
        
        // DOM events
        this.elements.agentInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendAgentMessage();
            }
        });
        
        this.elements.agentInput.addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
        });
        
        // Upload
        this.elements.dropzone.addEventListener('click', () => {
            this.elements.fileInput.click();
        });
        
        this.elements.fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });
        
        this.elements.dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.elements.dropzone.classList.add('dragover');
        });
        
        this.elements.dropzone.addEventListener('dragleave', () => {
            this.elements.dropzone.classList.remove('dragover');
        });
        
        this.elements.dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.elements.dropzone.classList.remove('dragover');
            this.handleFileUpload(e.dataTransfer.files);
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeUpload();
                if (this.elements.graphOverlay.classList.contains('active')) {
                    toggleGraph();
                }
            }
            
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('omnibox').focus();
            }
        });
    }
    
    renderInitialState() {
        // Render memory categories
        this.renderMemoryCategories();
        
        // Initial agent message
        this.renderAgentMessage({
            role: 'assistant',
            content: `Agent-Zero Substrate initialized.\n\nI am an AI-native knowledge operating system. Every component maps to an executable primitive.\n\n**Available operations:**\n• /read <file> - Read file contents\n• /write <file> <content> - Write to file\n• /list [path] - List directory contents\n• /search <query> - Search across files\n• /exec <code> - Execute code\n\nOr ask me anything about your documents.`,
            timestamp: Date.now()
        });
        
        // Initial logs
        logger.success('Agent-Zero Substrate initialized');
        logger.info(`Memory system ready: ${memory.getCategories().length} categories`);
        logger.info(`Tool registry ready: ${tools.getAllDefinitions().length} tools`);
        logger.info(`Knowledge graph ready: ${knowledgeGraph.nodes.size} nodes`);
    }
    
    renderMemoryCategories() {
        const categories = [
            { id: 'files', name: 'Files', icon: '📄', count: 0 },
            { id: 'entities', name: 'Entities', icon: '◈', count: 0 },
            { id: 'concepts', name: 'Concepts', icon: '◇', count: 0 },
            { id: 'operations', name: 'Operations', icon: '⚡', count: 0 }
        ];
        
        this.elements.memorySection.innerHTML = categories.map(cat => `
            <div class="memory-category">
                <div class="memory-category-header" onclick="toggleCategory('${cat.id}')">
                    <span class="category-chevron">▼</span>
                    <span class="category-icon">${cat.icon}</span>
                    <span class="category-name">${cat.name}</span>
                    <span class="category-count" id="count-${cat.id}">${cat.count}</span>
                </div>
                <div class="memory-items" id="items-${cat.id}"></div>
            </div>
        `).join('');
    }
    
    renderMemory(memory) {
        const container = document.getElementById(`items-${memory.category}`);
        if (!container) return;
        
        const item = document.createElement('div');
        item.className = 'memory-item';
        item.dataset.id = memory.id;
        item.innerHTML = `
            <span class="item-icon">•</span>
            <span class="item-name">${memory.content.substring(0, 30)}...</span>
            <span class="item-meta">${new Date(memory.metadata.timestamp).toLocaleTimeString()}</span>
        `;
        
        container.appendChild(item);
        
        // Update count
        const countEl = document.getElementById(`count-${memory.category}`);
        if (countEl) {
            countEl.textContent = container.children.length;
        }
    }
    
    renderAgentMessage(msg) {
        const div = document.createElement('div');
        div.className = 'agent-message';
        
        const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isUser = msg.role === 'user';
        
        div.innerHTML = `
            <div class="agent-message-header">
                <div class="agent-avatar ${isUser ? 'user' : ''}">${isUser ? 'U' : 'AI'}</div>
                <span class="agent-name">${isUser ? 'You' : 'Agent-Zero'}</span>
                <span class="agent-time">${time}</span>
            </div>
            <div class="agent-content">${this.formatMessage(msg.content)}</div>
        `;
        
        this.elements.agentMessages.appendChild(div);
        this.elements.agentMessages.scrollTop = this.elements.agentMessages.scrollHeight;
    }
    
    renderAgentResponse(response) {
        this.renderAgentMessage({
            role: 'assistant',
            content: response.content || response,
            timestamp: Date.now()
        });
    }
    
    renderToolCall(execution) {
        const div = document.createElement('div');
        div.className = 'tool-call';
        div.dataset.id = execution.id;
        div.innerHTML = `
            <div class="tool-call-header">
                <span class="tool-status pending"></span>
                <span class="tool-name">${execution.tool}</span>
                <span class="tool-duration">...</span>
            </div>
            <div class="tool-call-body">
                <div class="tool-section">
                    <div class="tool-section-label">Parameters</div>
                    <div class="tool-code">${JSON.stringify(execution.params, null, 2)}</div>
                </div>
            </div>
        `;
        
        // Insert after last agent message
        const lastMsg = this.elements.agentMessages.lastElementChild;
        if (lastMsg) {
            lastMsg.querySelector('.agent-content').appendChild(div);
        }
    }
    
    updateToolCall(execution) {
        const div = document.querySelector(`.tool-call[data-id="${execution.id}"]`);
        if (!div) return;
        
        const statusEl = div.querySelector('.tool-status');
        const durationEl = div.querySelector('.tool-duration');
        
        statusEl.className = `tool-status ${execution.status}`;
        durationEl.textContent = `${execution.endTime - execution.startTime}ms`;
        
        if (execution.result) {
            const body = div.querySelector('.tool-call-body');
            body.innerHTML += `
                <div class="tool-section">
                    <div class="tool-section-label">Result</div>
                    <div class="tool-code">${JSON.stringify(execution.result, null, 2).substring(0, 500)}...</div>
                </div>
            `;
        }
    }
    
    renderLog(entry) {
        const div = document.createElement('div');
        div.className = 'log-entry';
        div.innerHTML = `
            <span class="log-timestamp">${new Date(entry.timestamp).toLocaleTimeString()}</span>
            <span class="log-level ${entry.level.toLowerCase()}">${entry.level}</span>
            <span class="log-message">${entry.message}</span>
        `;
        
        this.elements.terminalContent.appendChild(div);
        this.elements.terminalContent.scrollTop = this.elements.terminalContent.scrollHeight;
        
        // Limit log entries
        while (this.elements.terminalContent.children.length > 100) {
            this.elements.terminalContent.removeChild(this.elements.terminalContent.firstChild);
        }
    }
    
    onFileCreated(file) {
        // Add to file list in memory panel
        const container = document.getElementById('items-files');
        if (container) {
            const item = document.createElement('div');
            item.className = 'memory-item';
            item.dataset.id = file.id;
            item.onclick = () => openFile(file.id);
            item.innerHTML = `
                <span class="item-icon">📄</span>
                <span class="item-name">${file.name}</span>
                <span class="item-meta">${this.formatBytes(file.size)}</span>
            `;
            container.appendChild(item);
            
            // Update count
            const countEl = document.getElementById('count-files');
            if (countEl) {
                countEl.textContent = container.children.length;
            }
        }
        
        // Open the file
        this.openFile(file);
    }
    
    openFile(file) {
        // Create tab
        const tab = document.createElement('button');
        tab.className = 'canvas-tab active';
        tab.dataset.fileId = file.id;
        tab.innerHTML = `
            <span>${file.name}</span>
            <button class="canvas-tab-close" onclick="closeTab('${file.id}', event)">×</button>
        `;
        tab.onclick = () => this.switchToFile(file.id);
        
        // Remove active from other tabs
        this.elements.canvasTabs.querySelectorAll('.canvas-tab').forEach(t => t.classList.remove('active'));
        this.elements.canvasTabs.appendChild(tab);
        
        // Render content
        this.renderFileContent(file);
    }
    
    renderFileContent(file) {
        const isMarkdown = file.type === 'md' || file.name.endsWith('.md');
        const isCode = ['js', 'py', 'ts', 'html', 'css', 'json'].includes(file.type);
        
        let contentHtml;
        if (isMarkdown) {
            contentHtml = this.renderMarkdown(file.content);
        } else if (isCode) {
            contentHtml = `<pre><code>${this.escapeHtml(file.content)}</code></pre>`;
        } else {
            contentHtml = `<pre>${this.escapeHtml(file.content)}</pre>`;
        }
        
        this.elements.canvasContent.innerHTML = `
            <div class="document-viewer">
                <div class="document-header">
                    <span class="document-title">${file.name}</span>
                    <div class="document-actions">
                        <button class="doc-action" onclick="analyzeFile('${file.id}')">Analyze</button>
                        <button class="doc-action" onclick="summarizeFile('${file.id}')">Summarize</button>
                        <button class="doc-action" onclick="editFile('${file.id}')">Edit</button>
                    </div>
                </div>
                <div class="document-content">${contentHtml}</div>
            </div>
        `;
    }
    
    renderMarkdown(content) {
        // Simple markdown renderer
        return content
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/```[\s\S]*?```/g, (match) => `<pre><code>${match.slice(3, -3)}</code></pre>`)
            .replace(/\n/g, '<br>');
    }
    
    formatMessage(content) {
        return content
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    async handleFileUpload(files) {
        this.showToast(`Processing ${files.length} file(s)...`, 'info');
        
        for (const file of files) {
            try {
                const content = await this.readFile(file);
                const newFile = fileSystem.create(file.name, content, file.name.split('.').pop());
                
                // Store in memory
                memory.store(content, { fileId: newFile.id, name: file.name }, 'files');
                
                logger.success(`File ingested: ${file.name}`);
            } catch (err) {
                logger.error(`Failed to ingest ${file.name}: ${err.message}`);
                this.showToast(`Failed: ${file.name}`, 'error');
            }
        }
        
        closeUpload();
        this.showToast(`${files.length} file(s) ingested`, 'success');
    }
    
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ',
            warn: '⚠'
        };
        
        toast.innerHTML = `
            <span class="toast-icon ${type}">${icons[type]}</span>
            <div class="toast-content">
                <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                <div class="toast-message">${message}</div>
            </div>
        `;
        
        this.elements.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    switchToFile(fileId) {
        const file = fileSystem.read(fileId);
        if (file) {
            this.elements.canvasTabs.querySelectorAll('.canvas-tab').forEach(t => t.classList.remove('active'));
            this.elements.canvasTabs.querySelector(`[data-file-id="${fileId}"]`)?.classList.add('active');
            this.renderFileContent(file);
        }
    }
}

// ============================================
// PRIMITIVE: Global Functions
// Interface bindings exposed to HTML
// ============================================

let ui;

function init() {
    // Register tools
    tools.register('read_file', {
        description: 'Read contents of a file',
        parameters: { file_id: 'string' },
        execute: ({ file_id }) => fileSystem.read(file_id)
    });
    
    tools.register('write_file', {
        description: 'Write content to a file',
        parameters: { path: 'string', content: 'string' },
        execute: ({ path, content }) => fileSystem.create(path, content)
    });
    
    tools.register('list_files', {
        description: 'List all files in the system',
        parameters: {},
        execute: () => fileSystem.list()
    });
    
    tools.register('search_files', {
        description: 'Search for files by content',
        parameters: { query: 'string' },
        execute: ({ query }) => fileSystem.search(query)
    });
    
    tools.register('knowledge_query', {
        description: 'Query the knowledge graph',
        parameters: { query: 'string' },
        execute: ({ query }) => knowledgeGraph.findPaths(query, query)
    });
    
    tools.register('memory_recall', {
        description: 'Recall relevant memories',
        parameters: { query: 'string', limit: 'number' },
        execute: ({ query, limit }) => memory.recall(query, { limit })
    });
    
    // Initialize UI
    ui = new UIController();
    
    // Create demo files
    createDemoFiles();
    
    logger.success('Agent-Zero Substrate fully initialized');
}

function createDemoFiles() {
    const proposal = `# Project Proposal: AI Knowledge Operating System

## Executive Summary

This document outlines the development of an AI-native knowledge operating system that transforms how organizations manage, understand, and leverage their information assets.

## Key Objectives

1. **Unified Knowledge Graph** - Create a connected network of all organizational knowledge
2. **AI-Driven Insights** - Automatically surface connections, contradictions, and opportunities
3. **Natural Language Operations** - Enable file manipulation through conversational interfaces
4. **Version Control & Provenance** - Track every change and maintain complete history

## Technical Architecture

The system will be built on the Agent-Zero framework, extended with:
- Vector database for semantic search
- Knowledge graph for relationship mapping
- LLM integration for natural language processing
- Real-time collaboration engine

## Timeline & Budget

- Phase 1 (Months 1-3): Core infrastructure - $800K
- Phase 2 (Months 4-6): AI capabilities - $1M
- Phase 3 (Months 7-9): Advanced features - $600K
- **Total Budget: $2.4M**

## Expected Outcomes

- 50% reduction in information retrieval time
- 90% accuracy in cross-document relationship detection
- Full audit trail of all knowledge operations`;

    const financial = JSON.stringify({
        quarter: 'Q3 2024',
        revenue: 2450000,
        expenses: 1890000,
        profit: 560000,
        departments: {
            engineering: { budget: 800000, spent: 750000 },
            sales: { budget: 600000, spent: 580000 },
            marketing: { budget: 400000, spent: 420000 },
            operations: { budget: 500000, spent: 460000 }
        },
        metrics: {
            customerAcquisitionCost: 125,
            lifetimeValue: 2400,
            churnRate: 0.05,
            npsScore: 72
        }
    }, null, 2);

    const api = `# API Documentation

## Authentication

All API requests require an API key passed in the Authorization header:
\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Endpoints

### POST /api/v1/documents/upload

Upload a new document to the knowledge base.

**Request Body:**
- \`file\`: The document file (required)
- \`tags\`: Array of tags (optional)
- \`collection\`: Target collection (optional)

**Response:**
\`\`\`json
{
  "id": "doc_12345",
  "status": "processing",
  "estimatedTime": "30s"
}
\`\`\`

### GET /api/v1/documents/{id}

Retrieve a document by ID.

### POST /api/v1/query

Query the knowledge base using natural language.

## Rate Limits

- Free tier: 100 requests/hour
- Pro tier: 10,000 requests/hour
- Enterprise: Unlimited`;

    fileSystem.create('Project_Proposal.md', proposal, 'md');
    fileSystem.create('Financial_Q3_2024.json', financial, 'json');
    fileSystem.create('API_Documentation.md', api, 'md');
}

// Global UI functions
function toggleGraph() {
    const overlay = document.getElementById('graphOverlay');
    overlay.classList.toggle('active');
    
    if (overlay.classList.contains('active')) {
        knowledgeGraph.render('knowledgeGraph');
    }
}

function openUpload() {
    document.getElementById('uploadModal').classList.add('active');
}

function closeUpload() {
    document.getElementById('uploadModal').classList.remove('active');
}

function toggleAgentPanel() {
    const panel = document.getElementById('agentPanel');
    panel.classList.toggle('open');
}

function toggleCategory(id) {
    const header = document.querySelector(`#items-${id}`).previousElementSibling;
    header.classList.toggle('collapsed');
    document.getElementById(`items-${id}`).style.display = 
        header.classList.contains('collapsed') ? 'none' : 'block';
}

function refreshMemory() {
    logger.info('Refreshing memory...');
    ui.showToast('Memory refreshed', 'success');
}

function collapseAll() {
    document.querySelectorAll('.memory-category-header').forEach(h => {
        h.classList.add('collapsed');
        h.nextElementSibling.style.display = 'none';
    });
}

async function sendAgentMessage() {
    const input = document.getElementById('agentInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Render user message
    ui.renderAgentMessage({
        role: 'user',
        content: message,
        timestamp: Date.now()
    });
    
    input.value = '';
    input.style.height = 'auto';
    
    // Process with agent
    const response = await agent.process(message);
}

function setInput(text) {
    const input = document.getElementById('agentInput');
    input.value = text;
    input.focus();
}

function clearAgentChat() {
    document.getElementById('agentMessages').innerHTML = '';
    agent.clearHistory();
    logger.info('Agent chat cleared');
}

function clearTerminal() {
    document.getElementById('terminalContent').innerHTML = '';
    logger.clear();
}

function toggleTerminal() {
    const panel = document.querySelector('.terminal-panel');
    panel.style.height = panel.style.height === '40px' ? '200px' : '40px';
}

function openFile(fileId) {
    ui.openFile(fileSystem.read(fileId));
}

function closeTab(fileId, event) {
    event.stopPropagation();
    const tab = document.querySelector(`.canvas-tab[data-file-id="${fileId}"]`);
    if (tab) tab.remove();
}

function analyzeFile(fileId) {
    const file = fileSystem.read(fileId);
    if (file) {
        agent.process(`Analyze this file: ${file.name}`);
    }
}

function summarizeFile(fileId) {
    const file = fileSystem.read(fileId);
    if (file) {
        agent.process(`Summarize this file: ${file.name}`);
    }
}

function editFile(fileId) {
    ui.showToast('Edit mode not yet implemented', 'info');
}

function executeTool(toolName) {
    agent.process(`/${toolName}`);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Config,
        EventBus,
        Logger,
        MemorySystem,
        ToolRegistry,
        KnowledgeGraph,
        Agent,
        FileSystem,
        UIController,
        bus,
        logger,
        memory,
        tools,
        knowledgeGraph,
        agent,
        fileSystem
    };
}