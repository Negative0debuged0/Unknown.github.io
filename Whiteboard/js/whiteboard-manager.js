// Main controller class for the whiteboard
export class WhiteboardManager {
    constructor(canvas, container, toolManager, elementManager, propertyPanel, historyManager, networkManager) {
        this.canvas = canvas;
        this.container = container;
        this.ctx = canvas.getContext('2d');
        this.toolManager = toolManager;
        this.elementManager = elementManager;
        this.propertyPanel = propertyPanel;
        this.historyManager = historyManager;
        this.networkManager = networkManager;
        
        // Setup references between components
        this.toolManager.setHistoryManager(this.historyManager);
        this.elementManager.setHistoryManager(this.historyManager);
        this.elementManager.setNetworkManager(this.networkManager);
        
        // Resize handling
        this.resizeObserver = new ResizeObserver(this.handleResize.bind(this));
        
        // Undo/Redo buttons
        this.undoButton = document.getElementById('undo-button');
        this.redoButton = document.getElementById('redo-button');
        
        // Save button
        this.saveButton = document.getElementById('save-button');
    }
    
    initialize() {
        // Setup canvas size
        this.handleResize();
        
        // Start listening for resize events
        this.resizeObserver.observe(this.container);
        
        // Initialize tools
        this.toolManager.initialize();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize history manager
        this.historyManager.initialize(this.undoButton, this.redoButton);
        
        // Start network sync
        this.networkManager.initialize();
    }
    
    handleResize() {
        const { width, height } = this.container.getBoundingClientRect();
        
        // Only update if size has actually changed
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.redraw();
            
            // Broadcast the resize to the network
            if (this.networkManager && this.networkManager.connected) {
                this.networkManager.room.get('canvasSize').put({
                    width: width,
                    height: height,
                    lastUpdate: Date.now(),
                    updatedBy: this.networkManager.userId
                });
            }
        }
    }
    
    redraw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Redraw all elements
        this.elementManager.drawAllElements(this.ctx);
    }
    
    setupEventListeners() {
        // Save button
        this.saveButton.addEventListener('click', this.saveCanvas.bind(this));
        
        // Window unload event to warn about unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (this.historyManager.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        });
    }
    
    saveCanvas() {
        // Create temporary canvas for saving (to handle background)
        const saveCanvas = document.createElement('canvas');
        saveCanvas.width = this.canvas.width;
        saveCanvas.height = this.canvas.height;
        const saveCtx = saveCanvas.getContext('2d');
        
        // Fill with background color
        saveCtx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--canvas-bg').trim();
        saveCtx.fillRect(0, 0, saveCanvas.width, saveCanvas.height);
        
        // Draw elements
        this.elementManager.drawAllElements(saveCtx);
        
        // Convert to image and trigger download
        try {
            const dataUrl = saveCanvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'whiteboard.png';
            link.href = dataUrl;
            link.click();
            
            // Mark as saved
            this.historyManager.markSaved();
            
            // Show notification
            const event = new CustomEvent('notification', { 
                detail: { message: 'Image saved successfully!' } 
            });
            document.dispatchEvent(event);
        } catch (error) {
            console.error('Error saving canvas:', error);
            alert('Failed to save the whiteboard. Try again or check console for errors.');
        }
    }
    
    clearWhiteboard() {
        // Clear all elements (removed network notification)
        this.elementManager.clearAllElements();
        this.historyManager.addState(this.elementManager.getAllElements());
        this.redraw();
    }
}