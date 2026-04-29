/**
 * KnowledgeOS - AI-Native Knowledge Operating System
 * Powered by Agent-Zero Framework
 * 
 * A file system that understands, restructures, and orchestrates documents
 * through AI-driven operations and natural language interfaces.
 */

// ============================================
// CORE SYSTEM ARCHITECTURE
// ============================================

class KnowledgeOS {
    constructor() {
        this.version = '1.0.0';
        this.files = new Map();
        this.knowledgeGraph = new KnowledgeGraph();
        this.aiAgent = new KnowledgeAIAgent();
        this.versionControl = new VersionControl();
        this.searchEngine = new SearchEngine();
        this.ui = new UIController();
        this.eventBus = new EventBus();
        
        this.state = {
            activeFiles: [],
            selectedFiles: new Set(),
            currentWorkspace: 'default',
            aiPanelOpen: true,
            knowledgeGraphOpen: false,
            uploadQueue: [],
            processingQueue: []
        };
        
        this.init();
    }

    init() {
        console.log(`🧠 KnowledgeOS v${this.version} initializing...`);
        
        this.setupEventListeners();
        this.initializeFileSystem();
        this.initializeAIAgent();
        this.initializeKnowledgeGraph();
        this.setupKeyboardShortcuts();
        
        console.log('✅ KnowledgeOS ready');
        this.showToast('KnowledgeOS initialized', 'success');
    }

    setupEventListeners() {
        // File drop zone
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        
        dropZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            this.handleFileDrop(e);
        });

        // AI Input
        const aiInput = document.getElementById('aiInput');
        aiInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendAIMessage();
            }
        });

        aiInput.addEventListener('input', () => {
            aiInput.style.height = 'auto';
            aiInput.style.height = Math.min(aiInput.scrollHeight, 120) + 'px';
        });

        // Omnibox
        const omnibox = document.getElementById('omnibox');
        omnibox.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleOmniboxCommand(omnibox.value);
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Cmd/Ctrl + K - Focus omnibox
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('omnibox').focus();
            }
            
            // Cmd/Ctrl + U - Open upload
            if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
                e.preventDefault();
                this.openUploadModal();
            }
            
            // Cmd/Ctrl + / - Toggle AI panel
            if ((e.metaKey || e.ctrlKey) && e.key === '/') {
                e.preventDefault();
                this.toggleAIPanel();
            }
            
            // Escape - Close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    // ============================================
    // FILE SYSTEM OPERATIONS
    // ============================================

    async handleFileSelect(event) {
        const files = Array.from(event.target.files);
        await this.processFiles(files);
    }

    async handleFileDrop(event) {
        const files = Array.from(event.dataTransfer.files);
        await this.processFiles(files);
    }

    async processFiles(files) {
        this.showToast(`Processing ${files.length} file(s)...`, 'info');
        
        for (const file of files) {
            try {
                const knowledgeFile = await this.ingestFile(file);
                this.files.set(knowledgeFile.id, knowledgeFile);
                this.state.uploadQueue.push(knowledgeFile);
                
                // Add to file tree
                this.ui.addFileToTree(knowledgeFile);
                
                // Index for search
                this.searchEngine.indexFile(knowledgeFile);
                
                // Add to knowledge graph
                this.knowledgeGraph.addNode(knowledgeFile);
                
                console.log(`📄 Ingested: ${knowledgeFile.name}`);
            } catch (error) {
                console.error(`❌ Failed to ingest ${file.name}:`, error);
                this.showToast(`Failed to process ${file.name}`, 'error');
            }
        }
        
        this.closeUploadModal();
        this.showToast(`${files.length} file(s) uploaded successfully`, 'success');
        
        // Trigger AI analysis
        this.aiAgent.analyzeFiles(this.state.uploadQueue);
        this.state.uploadQueue = [];
    }

    async ingestFile(file) {
        const id = this.generateId();
        const content = await this.readFileContent(file);
        const metadata = await this.extractMetadata(file, content);
        
        return {
            id,
            name: file.name,
            type: file.type,
            size: file.size,
            content,
            metadata,
            createdAt: new Date(),
            modifiedAt: new Date(),
            version: 1,
            tags: [],
            relationships: [],
            annotations: [],
            extractedEntities: [],
            summary: null,
            embeddings: null
        };
    }

    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            
            if (file.type.startsWith('text/') || 
                file.name.endsWith('.json') || 
                file.name.endsWith('.md') ||
                file.name.endsWith('.js') ||
                file.name.endsWith('.py') ||
                file.name.endsWith('.html') ||
                file.name.endsWith('.css')) {
                reader.readAsText(file);
            } else if (file.type === 'application/pdf') {
                // For demo, we'll extract text representation
                reader.readAsText(file);
            } else {
                reader.readAsDataURL(file);
            }
        });
    }

    async extractMetadata(file, content) {
        const metadata = {
            extension: file.name.split('.').pop().toLowerCase(),
            wordCount: 0,
            lineCount: 0,
            detectedLanguage: 'en',
            entities: [],
            topics: [],
            sentiment: null
        };

        if (typeof content === 'string') {
            metadata.wordCount = content.split(/\s+/).length;
            metadata.lineCount = content.split('\n').length;
            
            // Detect file type from content
            if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
                metadata.format = 'json';
            } else if (content.includes('---') && content.includes('title:')) {
                metadata.format = 'yaml-frontmatter';
            } else if (content.includes('function') || content.includes('class')) {
                metadata.format = 'code';
            } else {
                metadata.format = 'text';
            }
        }

        return metadata;
    }

    generateId() {
        return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ============================================
    // AI AGENT INTERFACE
    // ============================================

    sendAIMessage() {
        const input = document.getElementById('aiInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Add user message to UI
        this.ui.addAIMessage(message, 'user');
        input.value = '';
        input.style.height = 'auto';
        
        // Process with AI agent
        this.aiAgent.processMessage(message, (response) => {
            this.ui.addAIMessage(response.content, 'agent', response.actions);
        });
    }

    setAIInput(text) {
        const input = document.getElementById('aiInput');
        input.value = text;
        input.focus();
    }

    handleOmniboxCommand(query) {
        if (!query.trim()) return;
        
        // Check if it's a command
        if (query.startsWith('/')) {
            this.executeCommand(query);
        } else {
            // Search
            const results = this.searchEngine.search(query);
            this.ui.displaySearchResults(results);
        }
        
        document.getElementById('omnibox').value = '';
    }

    executeCommand(command) {
        const parts = command.slice(1).split(' ');
        const cmd = parts[0];
        const args = parts.slice(1);
        
        switch (cmd) {
            case 'create':
                this.createFile(args.join(' '));
                break;
            case 'merge':
                this.mergeFiles(args);
                break;
            case 'split':
                this.splitFile(args[0], args[1]);
                break;
            case 'summarize':
                this.summarizeFile(args[0]);
                break;
            case 'analyze':
                this.analyzeFile(args[0]);
                break;
            case 'help':
                this.showCommandHelp();
                break;
            default:
                this.showToast(`Unknown command: ${cmd}`, 'error');
        }
    }

    // ============================================
    // FILE OPERATIONS (AI-DRIVEN)
    // ============================================

    async createFile(name, content = '', type = 'txt') {
        const id = this.generateId();
        const file = {
            id,
            name: name || `untitled.${type}`,
            type: `text/${type}`,
            size: content.length,
            content,
            metadata: {
                extension: type,
                wordCount: content.split(/\s+/).length,
                lineCount: content.split('\n').length,
                format: type
            },
            createdAt: new Date(),
            modifiedAt: new Date(),
            version: 1,
            tags: [],
            relationships: [],
            annotations: []
        };
        
        this.files.set(id, file);
        this.ui.addFileToTree(file);
        this.openFile(id);
        
        this.showToast(`Created ${file.name}`, 'success');
        return file;
    }

    async editFile(fileId, edits) {
        const file = this.files.get(fileId);
        if (!file) {
            this.showToast('File not found', 'error');
            return;
        }
        
        // Create version backup
        this.versionControl.saveVersion(file);
        
        // Apply edits
        if (edits.content !== undefined) {
            file.content = edits.content;
        }
        if (edits.name !== undefined) {
            file.name = edits.name;
        }
        if (edits.tags !== undefined) {
            file.tags = edits.tags;
        }
        
        file.modifiedAt = new Date();
        file.version++;
        
        // Re-index
        this.searchEngine.indexFile(file);
        this.ui.updateFileInTree(file);
        
        this.showToast(`Updated ${file.name} (v${file.version})`, 'success');
        return file;
    }

    async mergeFiles(fileIds, newName = null) {
        const files = fileIds.map(id => this.files.get(id)).filter(Boolean);
        if (files.length < 2) {
            this.showToast('Select at least 2 files to merge', 'error');
            return;
        }
        
        const mergedContent = files.map(f => 
            `<!-- ${f.name} -->\n${f.content}\n`
        ).join('\n---\n\n');
        
        const mergedFile = await this.createFile(
            newName || `merged_${Date.now()}.md`,
            mergedContent,
            'md'
        );
        
        // Create relationships
        files.forEach(f => {
            f.relationships.push({
                type: 'merged_into',
                targetId: mergedFile.id
            });
        });
        
        this.showToast(`Merged ${files.length} files into ${mergedFile.name}`, 'success');
        return mergedFile;
    }

    async splitFile(fileId, splitPoints) {
        const file = this.files.get(fileId);
        if (!file) {
            this.showToast('File not found', 'error');
            return;
        }
        
        const parts = this.aiAgent.splitDocument(file.content, splitPoints);
        const newFiles = [];
        
        for (let i = 0; i < parts.length; i++) {
            const newFile = await this.createFile(
                `${file.name.replace(/\.[^.]+$/, '')}_part${i + 1}.md`,
                parts[i],
                'md'
            );
            newFiles.push(newFile);
            
            // Create relationship
            file.relationships.push({
                type: 'split_into',
                targetId: newFile.id
            });
        }
        
        this.showToast(`Split ${file.name} into ${newFiles.length} parts`, 'success');
        return newFiles;
    }

    async refactorFile(fileId, instructions) {
        const file = this.files.get(fileId);
        if (!file) {
            this.showToast('File not found', 'error');
            return;
        }
        
        // Save version before refactoring
        this.versionControl.saveVersion(file);
        
        // AI-driven refactoring
        const refactored = await this.aiAgent.refactor(file, instructions);
        
        file.content = refactored.content;
        file.metadata.refactored = true;
        file.metadata.refactorNotes = instructions;
        file.modifiedAt = new Date();
        file.version++;
        
        this.searchEngine.indexFile(file);
        this.ui.updateFileInTree(file);
        
        this.showToast(`Refactored ${file.name}`, 'success');
        return file;
    }

    async summarizeFile(fileId) {
        const file = this.files.get(fileId);
        if (!file) {
            this.showToast('File not found', 'error');
            return;
        }
        
        const summary = await this.aiAgent.summarize(file);
        
        // Create summary file
        const summaryFile = await this.createFile(
            `${file.name.replace(/\.[^.]+$/, '')}_summary.md`,
            `# Summary: ${file.name}\n\n${summary}`,
            'md'
        );
        
        // Link to original
        file.relationships.push({
            type: 'summarized_by',
            targetId: summaryFile.id
        });
        
        this.showToast(`Created summary for ${file.name}`, 'success');
        return summaryFile;
    }

    async analyzeFile(fileId) {
        const file = this.files.get(fileId);
        if (!file) {
            this.showToast('File not found', 'error');
            return;
        }
        
        const analysis = await this.aiAgent.analyze(file);
        
        // Store analysis results
        file.analysis = analysis;
        file.extractedEntities = analysis.entities || [];
        file.metadata.topics = analysis.topics || [];
        file.metadata.sentiment = analysis.sentiment;
        
        // Update knowledge graph
        analysis.entities?.forEach(entity => {
            this.knowledgeGraph.addEntity(entity, file.id);
        });
        
        this.ui.displayAnalysis(file, analysis);
        this.showToast(`Analysis complete for ${file.name}`, 'success');
        
        return analysis;
    }

    // ============================================
    // UI CONTROLS
    // ============================================

    openUploadModal() {
        document.getElementById('uploadModal').classList.add('active');
    }

    closeUploadModal() {
        document.getElementById('uploadModal').classList.remove('active');
    }

    toggleAIPanel() {
        const panel = document.getElementById('aiPanel');
        this.state.aiPanelOpen = !this.state.aiPanelOpen;
        panel.style.display = this.state.aiPanelOpen ? 'flex' : 'none';
    }

    toggleKnowledgeGraph() {
        const panel = document.getElementById('knowledgeGraphPanel');
        this.state.knowledgeGraphOpen = !this.state.knowledgeGraphOpen;
        panel.classList.toggle('open', this.state.knowledgeGraphOpen);
        
        if (this.state.knowledgeGraphOpen) {
            this.knowledgeGraph.render();
        }
    }

    closeAllModals() {
        this.closeUploadModal();
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    }

    openFile(fileId) {
        const file = this.files.get(fileId);
        if (!file) return;
        
        // Add to active files if not already open
        if (!this.state.activeFiles.find(f => f.id === fileId)) {
            this.state.activeFiles.push(file);
        }
        
        this.ui.openFile(file);
    }

    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast';
        
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle'
        };
        
        toast.innerHTML = `
            <div class="toast-icon ${type}">
                <i class="fas fa-${icons[type]}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    showCommandHelp() {
        const help = `
Available Commands:
/create <filename> - Create a new file
/merge <file1> <file2> ... - Merge multiple files
/split <file> <criteria> - Split a file into parts
/summarize <file> - Generate a summary
/analyze <file> - Deep analysis with entities and insights
/help - Show this help message
        `;
        
        this.ui.addAIMessage(help, 'agent');
    }
}

// ============================================
// AI AGENT CLASS
// ============================================

class KnowledgeAIAgent {
    constructor() {
        this.context = {
            conversationHistory: [],
            userPreferences: {},
            activeFiles: [],
            systemPrompt: this.getSystemPrompt()
        };
        
        this.capabilities = {
            canCreate: true,
            canEdit: true,
            canMerge: true,
            canSplit: true,
            canAnalyze: true,
            canSummarize: true,
            canRefactor: true
        };
    }

    getSystemPrompt() {
        return `You are KnowledgeOS, an AI-native knowledge operating system. Your purpose is to help users manage, understand, and transform their documents through intelligent operations.

Core Capabilities:
- File creation, editing, merging, splitting
- Content analysis and entity extraction
- Summarization and synthesis
- Cross-document reasoning
- Knowledge graph construction
- Natural language file operations

When responding:
1. Be concise but informative
2. Offer actionable next steps
3. Use citations when referencing specific content
4. Suggest relevant operations the user might want to perform
5. Maintain awareness of the full document corpus`;
    }

    async processMessage(message, callback) {
        // Add to conversation history
        this.context.conversationHistory.push({
            role: 'user',
            content: message,
            timestamp: new Date()
        });

        // Parse intent
        const intent = this.parseIntent(message);
        
        // Generate response based on intent
        let response = await this.generateResponse(intent, message);
        
        // Add to history
        this.context.conversationHistory.push({
            role: 'assistant',
            content: response.content,
            timestamp: new Date()
        });

        callback(response);
    }

    parseIntent(message) {
        const lowerMessage = message.toLowerCase();
        
        // File operations
        if (/create|new file|make a file/i.test(lowerMessage)) {
            return { type: 'CREATE_FILE', confidence: 0.9 };
        }
        if (/edit|modify|change|update/i.test(lowerMessage)) {
            return { type: 'EDIT_FILE', confidence: 0.85 };
        }
        if (/merge|combine|join/i.test(lowerMessage)) {
            return { type: 'MERGE_FILES', confidence: 0.9 };
        }
        if (/split|divide|separate/i.test(lowerMessage)) {
            return { type: 'SPLIT_FILE', confidence: 0.85 };
        }
        if (/summarize|summary|tl;dr/i.test(lowerMessage)) {
            return { type: 'SUMMARIZE', confidence: 0.95 };
        }
        if (/analyze|examine|study/i.test(lowerMessage)) {
            return { type: 'ANALYZE', confidence: 0.9 };
        }
        if (/refactor|restructure|reorganize/i.test(lowerMessage)) {
            return { type: 'REFACTOR', confidence: 0.85 };
        }
        if (/search|find|look for/i.test(lowerMessage)) {
            return { type: 'SEARCH', confidence: 0.9 };
        }
        if (/connect|relationship|link/i.test(lowerMessage)) {
            return { type: 'FIND_CONNECTIONS', confidence: 0.85 };
        }
        
        // Information queries
        if (/what|how|why|explain|tell me/i.test(lowerMessage)) {
            return { type: 'QUERY', confidence: 0.8 };
        }
        
        return { type: 'GENERAL', confidence: 0.5 };
    }

    async generateResponse(intent, message) {
        const responses = {
            CREATE_FILE: () => ({
                content: `I'll create a new file for you. What would you like to name it and what content should it contain?`,
                actions: [
                    { label: 'Create blank file', action: 'create_blank' },
                    { label: 'Create from template', action: 'create_template' }
                ]
            }),
            
            EDIT_FILE: () => ({
                content: `I can help you edit files. Which file would you like to modify, and what changes should I make?`,
                actions: [
                    { label: 'Show recent files', action: 'show_recent' }
                ]
            }),
            
            MERGE_FILES: () => ({
                content: `I can merge multiple files together. Please select the files you'd like to combine.`,
                actions: [
                    { label: 'Select files', action: 'select_files' }
                ]
            }),
            
            SUMMARIZE: () => {
                // Extract file reference if present
                const fileMatch = message.match(/(?:summarize|summary of)\s+(.+)/i);
                if (fileMatch) {
                    return {
                        content: `I'll create a summary of "${fileMatch[1]}". This will extract the key points, main arguments, and essential information while preserving the original meaning.`,
                        actions: [
                            { label: 'Create summary', action: 'summarize', params: { file: fileMatch[1] } },
                            { label: 'Create detailed analysis', action: 'analyze', params: { file: fileMatch[1] } }
                        ]
                    };
                }
                return {
                    content: `I can summarize documents for you. Which file would you like me to summarize?`,
                    actions: [
                        { label: 'Show files', action: 'show_files' }
                    ]
                };
            },
            
            ANALYZE: () => ({
                content: `I'll perform a comprehensive analysis. This includes entity extraction, topic identification, sentiment analysis, relationship mapping, and key insight discovery.`,
                actions: [
                    { label: 'Quick analysis', action: 'quick_analyze' },
                    { label: 'Deep analysis', action: 'deep_analyze' }
                ]
            }),
            
            SEARCH: () => ({
                content: `Searching across your knowledge base...`,
                actions: [
                    { label: 'Advanced search', action: 'advanced_search' }
                ]
            }),
            
            FIND_CONNECTIONS: () => ({
                content: `I'll analyze your documents to find connections, patterns, and relationships. This can reveal hidden insights across your entire corpus.`,
                actions: [
                    { label: 'Find all connections', action: 'find_all_connections' },
                    { label: 'Focus on selected files', action: 'find_selected_connections' }
                ]
            }),
            
            QUERY: () => ({
                content: `Based on your documents, I can help answer that. Let me search through your knowledge base for relevant information.`,
                actions: [
                    { label: 'Show sources', action: 'show_sources' }
                ]
            }),
            
            GENERAL: () => ({
                content: `I'm here to help you manage and understand your documents. You can ask me to create, edit, merge, analyze, or summarize files. What would you like to do?`,
                actions: [
                    { label: 'Upload files', action: 'upload' },
                    { label: 'View knowledge graph', action: 'show_graph' },
                    { label: 'Search documents', action: 'search' }
                ]
            })
        };
        
        const responseGenerator = responses[intent.type] || responses.GENERAL;
        return responseGenerator();
    }

    async summarize(file) {
        // Simulated AI summarization
        const content = typeof file.content === 'string' ? file.content : '';
        const paragraphs = content.split('\n\n').filter(p => p.trim());
        
        if (paragraphs.length === 0) {
            return 'No content to summarize.';
        }
        
        // Extract key sentences (simplified)
        const keyPoints = paragraphs.slice(0, 3).map(p => {
            const sentences = p.split(/[.!?]+/).filter(s => s.trim().length > 20);
            return sentences[0]?.trim() || p.slice(0, 100) + '...';
        });
        
        return `## Summary of ${file.name}\n\n### Key Points\n${keyPoints.map(p => `- ${p}`).join('\n')}\n\n### Overview\nThis document contains ${file.metadata?.wordCount || 'unknown'} words across ${paragraphs.length} sections. The content appears to focus on ${file.metadata?.topics?.join(', ') || 'general topics'}.`;
    }

    async analyze(file) {
        const content = typeof file.content === 'string' ? file.content : '';
        
        // Extract entities (simplified)
        const entities = this.extractEntities(content);
        
        // Identify topics
        const topics = this.identifyTopics(content);
        
        // Sentiment analysis (simplified)
        const sentiment = this.analyzeSentiment(content);
        
        return {
            entities,
            topics,
            sentiment,
            wordCount: file.metadata?.wordCount || 0,
            readingTime: Math.ceil((file.metadata?.wordCount || 0) / 200),
            complexity: this.assessComplexity(content),
            keyPhrases: this.extractKeyPhrases(content),
            contradictions: this.findContradictions(content),
            redundancies: this.findRedundancies(content)
        };
    }

    extractEntities(content) {
        const entities = [];
        
        // Simple entity extraction patterns
        const patterns = {
            person: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
            organization: /\b[A-Z][A-Za-z]* (?:Inc|Corp|LLC|Ltd|Company)\b/g,
            date: /\b(?:January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2},? \d{4}\b/g,
            email: /\b[\w.-]+@[\w.-]+\.\w+\b/g,
            url: /https?:\/\/[^\s]+/g,
            money: /\$[\d,]+(?:\.\d{2})?/g
        };
        
        for (const [type, pattern] of Object.entries(patterns)) {
            const matches = content.match(pattern) || [];
            matches.forEach(match => {
                if (!entities.find(e => e.text === match)) {
                    entities.push({ type, text: match });
                }
            });
        }
        
        return entities;
    }

    identifyTopics(content) {
        // Simple topic identification based on word frequency
        const words = content.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
        const stopWords = new Set(['this', 'that', 'with', 'from', 'they', 'have', 'been', 'were', 'said']);
        
        const frequency = {};
        words.forEach(word => {
            if (!stopWords.has(word)) {
                frequency[word] = (frequency[word] || 0) + 1;
            }
        });
        
        return Object.entries(frequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word);
    }

    analyzeSentiment(content) {
        const positive = ['good', 'great', 'excellent', 'positive', 'success', 'benefit', 'improve', 'better'];
        const negative = ['bad', 'poor', 'negative', 'fail', 'problem', 'issue', 'concern', 'risk'];
        
        const lowerContent = content.toLowerCase();
        let posCount = positive.filter(w => lowerContent.includes(w)).length;
        let negCount = negative.filter(w => lowerContent.includes(w)).length;
        
        if (posCount > negCount * 1.5) return 'positive';
        if (negCount > posCount * 1.5) return 'negative';
        return 'neutral';
    }

    assessComplexity(content) {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim());
        const words = content.split(/\s+/).filter(w => w.trim());
        
        if (sentences.length === 0) return 'unknown';
        
        const avgWordsPerSentence = words.length / sentences.length;
        
        if (avgWordsPerSentence > 25) return 'high';
        if (avgWordsPerSentence > 15) return 'medium';
        return 'low';
    }

    extractKeyPhrases(content) {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 30);
        return sentences.slice(0, 3).map(s => s.trim().slice(0, 100) + '...');
    }

    findContradictions(content) {
        // Simplified contradiction detection
        return [];
    }

    findRedundancies(content) {
        // Simplified redundancy detection
        return [];
    }

    async refactor(file, instructions) {
        // Simulated refactoring based on instructions
        let content = file.content;
        
        if (instructions.includes('restructure')) {
            // Add headings
            const paragraphs = content.split('\n\n');
            content = paragraphs.map((p, i) => {
                if (i === 0) return `# ${p.slice(0, 50)}\n\n${p}`;
                if (p.length > 100) return `## Section ${i}\n\n${p}`;
                return p;
            }).join('\n\n');
        }
        
        if (instructions.includes('format')) {
            // Basic formatting
            content = content.replace(/\n{3,}/g, '\n\n');
        }
        
        return { content };
    }

    splitDocument(content, criteria) {
        if (criteria === 'paragraphs') {
            return content.split('\n\n').filter(p => p.trim());
        }
        if (criteria === 'sections') {
            return content.split(/#{1,6}\s/).filter(s => s.trim());
        }
        // Default: split into roughly equal parts
        const lines = content.split('\n');
        const mid = Math.floor(lines.length / 2);
        return [
            lines.slice(0, mid).join('\n'),
            lines.slice(mid).join('\n')
        ];
    }

    async analyzeFiles(files) {
        for (const file of files) {
            await this.analyze(file);
        }
    }
}

// ============================================
// KNOWLEDGE GRAPH
// ============================================

class KnowledgeGraph {
    constructor() {
        this.nodes = new Map();
        this.edges = [];
        this.network = null;
    }

    addNode(file) {
        this.nodes.set(file.id, {
            id: file.id,
            label: file.name,
            group: file.metadata?.format || 'unknown',
            title: `${file.name}\n${file.metadata?.wordCount || 0} words`,
            value: file.metadata?.wordCount || 1
        });
    }

    addEntity(entity, fileId) {
        const entityId = `entity_${entity.text.replace(/\s+/g, '_')}`;
        
        if (!this.nodes.has(entityId)) {
            this.nodes.set(entityId, {
                id: entityId,
                label: entity.text,
                group: 'entity',
                shape: 'dot',
                color: this.getEntityColor(entity.type)
            });
        }
        
        this.edges.push({
            from: fileId,
            to: entityId,
            label: 'contains'
        });
    }

    getEntityColor(type) {
        const colors = {
            person: '#d4a853',
            organization: '#8b5cf6',
            date: '#06b6d4',
            email: '#10b981',
            url: '#f59e0b',
            money: '#f43f5e'
        };
        return colors[type] || '#94a3b8';
    }

    render() {
        const container = document.getElementById('knowledgeGraph');
        if (!container) return;
        
        const data = {
            nodes: Array.from(this.nodes.values()),
            edges: this.edges
        };
        
        const options = {
            nodes: {
                font: {
                    face: 'Inter',
                    color: '#f8fafc',
                    size: 12
                },
                borderWidth: 2,
                shadow: true
            },
            edges: {
                color: {
                    color: '#475569',
                    highlight: '#d4a853'
                },
                font: {
                    face: 'Inter',
                    color: '#64748b',
                    size: 10
                }
            },
            physics: {
                forceAtlas2Based: {
                    gravitationalConstant: -50,
                    centralGravity: 0.01,
                    springLength: 100,
                    springConstant: 0.08
                },
                maxVelocity: 50,
                solver: 'forceAtlas2Based',
                timestep: 0.35,
                stabilization: { iterations: 150 }
            },
            interaction: {
                hover: true,
                tooltipDelay: 200
            }
        };
        
        this.network = new vis.Network(container, data, options);
    }
}

// ============================================
// SEARCH ENGINE
// ============================================

class SearchEngine {
    constructor() {
        this.index = new Map();
    }

    indexFile(file) {
        const terms = this.tokenize(file.content);
        
        terms.forEach(term => {
            if (!this.index.has(term)) {
                this.index.set(term, new Set());
            }
            this.index.get(term).add(file.id);
        });
    }

    tokenize(content) {
        if (typeof content !== 'string') return [];
        
        return content
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(term => term.length > 2);
    }

    search(query) {
        const terms = this.tokenize(query);
        const results = new Map();
        
        terms.forEach(term => {
            const fileIds = this.index.get(term) || new Set();
            fileIds.forEach(id => {
                results.set(id, (results.get(id) || 0) + 1);
            });
        });
        
        return Array.from(results.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([id, score]) => ({ id, score }));
    }
}

// ============================================
// VERSION CONTROL
// ============================================

class VersionControl {
    constructor() {
        this.versions = new Map();
    }

    saveVersion(file) {
        if (!this.versions.has(file.id)) {
            this.versions.set(file.id, []);
        }
        
        this.versions.get(file.id).push({
            version: file.version,
            content: file.content,
            timestamp: new Date(),
            metadata: { ...file.metadata }
        });
    }

    getVersions(fileId) {
        return this.versions.get(fileId) || [];
    }

    restoreVersion(fileId, versionNumber) {
        const versions = this.versions.get(fileId) || [];
        const version = versions.find(v => v.version === versionNumber);
        return version || null;
    }
}

// ============================================
// UI CONTROLLER
// ============================================

class UIController {
    constructor() {
        this.fileTreeElement = document.getElementById('fileTree');
        this.viewerTabsElement = document.getElementById('viewerTabs');
        this.viewerContentElement = document.getElementById('viewerContent');
        this.aiMessagesElement = document.getElementById('aiMessages');
    }

    addFileToTree(file) {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.dataset.fileId = file.id;
        item.onclick = () => window.knowledgeOS.openFile(file.id);
        
        const iconClass = this.getFileIcon(file.metadata?.extension);
        
        item.innerHTML = `
            <i class="file-icon fas ${iconClass}"></i>
            <span class="file-name">${file.name}</span>
            <span class="file-meta">${this.formatSize(file.size)}</span>
        `;
        
        this.fileTreeElement.appendChild(item);
    }

    updateFileInTree(file) {
        const item = this.fileTreeElement.querySelector(`[data-file-id="${file.id}"]`);
        if (item) {
            item.querySelector('.file-name').textContent = file.name;
        }
    }

    getFileIcon(extension) {
        const icons = {
            pdf: 'fa-file-pdf',
            md: 'fa-file-alt',
            txt: 'fa-file-alt',
            json: 'fa-file-code',
            js: 'fa-file-code',
            py: 'fa-file-code',
            html: 'fa-file-code',
            css: 'fa-file-code',
            csv: 'fa-file-csv',
            xlsx: 'fa-file-excel',
            docx: 'fa-file-word',
            zip: 'fa-file-archive'
        };
        return icons[extension] || 'fa-file';
    }

    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    openFile(file) {
        // Add tab
        this.addTab(file);
        
        // Show content
        this.viewerContentElement.innerHTML = this.renderFileContent(file);
    }

    addTab(file) {
        // Check if tab already exists
        const existingTab = this.viewerTabsElement.querySelector(`[data-file-id="${file.id}"]`);
        if (existingTab) {
            existingTab.classList.add('active');
            return;
        }
        
        // Remove active from other tabs
        this.viewerTabsElement.querySelectorAll('.viewer-tab').forEach(t => t.classList.remove('active'));
        
        // Add new tab
        const tab = document.createElement('button');
        tab.className = 'viewer-tab active';
        tab.dataset.fileId = file.id;
        tab.innerHTML = `
            <i class="fas ${this.getFileIcon(file.metadata?.extension)}"></i>
            <span>${file.name}</span>
            <button class="viewer-tab-close" onclick="event.stopPropagation(); window.knowledgeOS.closeFile('${file.id}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        tab.onclick = () => window.knowledgeOS.openFile(file.id);
        
        this.viewerTabsElement.appendChild(tab);
    }

    renderFileContent(file) {
        if (file.metadata?.format === 'code' || ['js', 'py', 'html', 'css', 'json'].includes(file.metadata?.extension)) {
            return `
                <div class="code-block">
                    <div class="code-header">
                        <span class="code-language">${file.metadata?.extension || 'text'}</span>
                        <div class="code-actions">
                            <button class="code-action" onclick="navigator.clipboard.writeText(window.knowledgeOS.files.get('${file.id}').content)">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                    </div>
                    <pre class="code-content"><code>${this.escapeHtml(file.content)}</code></pre>
                </div>
            `;
        }
        
        if (file.metadata?.extension === 'md') {
            return `<div class="markdown-content" style="max-width: 800px; margin: 0 auto; line-height: 1.8;">${this.renderMarkdown(file.content)}</div>`;
        }
        
        return `<pre style="white-space: pre-wrap; font-family: var(--font-mono); font-size: 0.875rem; line-height: 1.6;">${this.escapeHtml(file.content)}</pre>`;
    }

    renderMarkdown(content) {
        // Simple markdown rendering
        return content
            .replace(/^# (.+)$/gm, '<h1 style="font-size: 2rem; margin-bottom: 1rem; color: var(--knowledge-gold);">$1</h1>')
            .replace(/^## (.+)$/gm, '<h2 style="font-size: 1.5rem; margin: 1.5rem 0 1rem; color: var(--text-primary);">$1</h2>')
            .replace(/^### (.+)$/gm, '<h3 style="font-size: 1.25rem; margin: 1rem 0 0.5rem; color: var(--text-secondary);">$1</h3>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code style="background: var(--surface-card); padding: 0.125rem 0.375rem; border-radius: 4px; font-family: var(--font-mono);">$1</code>')
            .replace(/\n/g, '<br>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    addAIMessage(content, sender, actions = []) {
        const message = document.createElement('div');
        message.className = 'ai-message';
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        message.innerHTML = `
            <div class="ai-message-header">
                <div class="ai-avatar">${sender === 'user' ? 'U' : 'AI'}</div>
                <span class="ai-name">${sender === 'user' ? 'You' : 'KnowledgeOS'}</span>
                <span class="ai-time">${time}</span>
            </div>
            <div class="ai-content">${this.formatAIContent(content)}</div>
            ${actions.length > 0 ? `
                <div class="ai-action-buttons">
                    ${actions.map(a => `<button class="ai-action-btn" onclick="window.knowledgeOS.handleAIAction('${a.action}', ${JSON.stringify(a.params || {}).replace(/"/g, '&quot;')})">${a.label}</button>`).join('')}
                </div>
            ` : ''}
        `;
        
        this.aiMessagesElement.appendChild(message);
        this.aiMessagesElement.scrollTop = this.aiMessagesElement.scrollHeight;
    }

    formatAIContent(content) {
        // Convert markdown-like formatting
        return content
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre style="background: var(--surface-card); padding: 1rem; border-radius: 8px; overflow-x: auto; margin: 0.75rem 0;"><code>$2</code></pre>')
            .replace(/`(.+?)`/g, '<code style="background: var(--surface-card); padding: 0.125rem 0.375rem; border-radius: 4px;">$1</code>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/^- (.+)$/gm, '<li style="margin-left: 1.5rem;">$1</li>')
            .replace(/\n/g, '<p style="margin-bottom: 0.75rem;">');
    }

    displaySearchResults(results) {
        // Implementation for search results display
    }

    displayAnalysis(file, analysis) {
        const content = `
## Analysis: ${file.name}

### Document Statistics
- **Word Count:** ${analysis.wordCount.toLocaleString()}
- **Reading Time:** ~${analysis.readingTime} minutes
- **Complexity:** ${analysis.complexity}
- **Sentiment:** ${analysis.sentiment}

### Key Topics
${analysis.topics.map(t => `- ${t}`).join('\n')}

### Extracted Entities
${analysis.entities.slice(0, 10).map(e => `- **${e.text}** (${e.type})`).join('\n')}

### Key Phrases
${analysis.keyPhrases.map(p => `- "${p}"`).join('\n')}
        `;
        
        this.addAIMessage(content, 'agent');
    }
}

// ============================================
// EVENT BUS
// ============================================

class EventBus {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }

    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
}

// ============================================
// INITIALIZATION
// ============================================

// Initialize the Knowledge Operating System
window.knowledgeOS = new KnowledgeOS();

// Global functions for HTML event handlers
function openUploadModal() {
    window.knowledgeOS.openUploadModal();
}

function closeUploadModal() {
    window.knowledgeOS.closeUploadModal();
}

function toggleAIPanel() {
    window.knowledgeOS.toggleAIPanel();
}

function toggleKnowledgeGraph() {
    window.knowledgeOS.toggleKnowledgeGraph();
}

function sendAIMessage() {
    window.knowledgeOS.sendAIMessage();
}

function setAIInput(text) {
    window.knowledgeOS.setAIInput(text);
}

function handleAIKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        sendAIMessage();
    }
}

// Initialize sample files for demo
window.knowledgeOS.initializeFileSystem = function() {
    // Add some demo files
    const demoFiles = [
        {
            id: 'file_demo_1',
            name: 'Project_Proposal.md',
            type: 'text/markdown',
            size: 2540,
            content: `# Project Proposal: AI Knowledge Management System

## Executive Summary

This proposal outlines the development of an AI-native knowledge operating system that transforms how organizations manage, understand, and leverage their information assets.

## Key Objectives

1. **Unified Knowledge Graph**: Create a connected network of all organizational knowledge
2. **AI-Driven Insights**: Automatically surface connections, contradictions, and opportunities
3. **Natural Language Operations**: Enable file manipulation through conversational interfaces
4. **Version Control & Provenance**: Track every change and maintain complete history

## Technical Architecture

The system will be built on the Agent-Zero framework, extended with:
- Vector database for semantic search
- Knowledge graph for relationship mapping
- LLM integration for natural language processing
- Real-time collaboration engine

## Timeline & Budget

- Phase 1 (Months 1-3): Core infrastructure
- Phase 2 (Months 4-6): AI capabilities
- Phase 3 (Months 7-9): Advanced features
- Total Budget: $2.4M`,
            metadata: {
                extension: 'md',
                wordCount: 142,
                lineCount: 35,
                format: 'markdown'
            },
            createdAt: new Date(),
            modifiedAt: new Date(),
            version: 1,
            tags: ['proposal', 'ai', 'project'],
            relationships: []
        },
        {
            id: 'file_demo_2',
            name: 'Financial_Q3_2024.json',
            type: 'application/json',
            size: 1840,
            content: JSON.stringify({
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
            }, null, 2),
            metadata: {
                extension: 'json',
                wordCount: 45,
                lineCount: 25,
                format: 'json'
            },
            createdAt: new Date(),
            modifiedAt: new Date(),
            version: 1,
            tags: ['financial', 'q3', '2024'],
            relationships: []
        },
        {
            id: 'file_demo_3',
            name: 'API_Documentation.md',
            type: 'text/markdown',
            size: 3200,
            content: `# API Documentation

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

**Request Body:**
- \`query\`: Natural language query (required)
- \`context\`: Additional context (optional)
- \`maxResults\`: Maximum results to return (default: 10)

## Rate Limits

- Free tier: 100 requests/hour
- Pro tier: 10,000 requests/hour
- Enterprise: Unlimited`,
            metadata: {
                extension: 'md',
                wordCount: 98,
                lineCount: 52,
                format: 'markdown'
            },
            createdAt: new Date(),
            modifiedAt: new Date(),
            version: 1,
            tags: ['api', 'documentation', 'reference'],
            relationships: []
        }
    ];

    demoFiles.forEach(file => {
        this.files.set(file.id, file);
        this.ui.addFileToTree(file);
        this.searchEngine.indexFile(file);
        this.knowledgeGraph.addNode(file);
    });

    console.log('📁 Demo files loaded');
};

// Call initialization
setTimeout(() => {
    window.knowledgeOS.initializeFileSystem();
}, 100);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        KnowledgeOS,
        KnowledgeAIAgent,
        KnowledgeGraph,
        SearchEngine,
        VersionControl,
        UIController,
        EventBus
    };
}