// Manages undo/redo history
export class HistoryManager {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
        this.undoButton = null;
        this.redoButton = null;
        this.currentState = null;
        this.savedState = null;
        this.ignoreNextNetworkUpdate = false;
    }
    
    initialize(undoButton, redoButton) {
        this.undoButton = undoButton;
        this.redoButton = redoButton;
        
        this.undoButton.addEventListener('click', () => {
            this.undo();
        });
        
        this.redoButton.addEventListener('click', () => {
            this.redo();
        });
        
        this.updateButtonStates();
    }
    
    addState(elements) {
        // Clone current elements to avoid reference issues
        const clonedElements = JSON.parse(JSON.stringify(elements));
        
        // Don't add a new state if it's identical to the current state
        if (this.currentState && JSON.stringify(this.currentState) === JSON.stringify(clonedElements)) {
            return;
        }
        
        // Add current state to undo stack
        if (this.currentState) {
            this.undoStack.push(this.currentState);
        }
        
        // Set current state and clear redo stack
        this.currentState = clonedElements;
        this.redoStack = [];
        
        // Prevent the history from growing too large
        if (this.undoStack.length > 50) {
            this.undoStack.shift();
        }
        
        // Update button states
        this.updateButtonStates();
    }
    
    undo() {
        if (this.undoStack.length === 0) return;
        
        // Move current state to redo stack
        if (this.currentState) {
            this.redoStack.push(this.currentState);
        }
        
        // Pop the last state from the undo stack
        this.currentState = this.undoStack.pop();
        
        // Apply the state
        this.applyState(this.currentState);
        
        // Update button states
        this.updateButtonStates();
        
        // Need to ignore the next network update to prevent feedback loops
        this.ignoreNextNetworkUpdate = true;
        
        return this.currentState;
    }
    
    redo() {
        if (this.redoStack.length === 0) return;
        
        // Move current state to undo stack
        if (this.currentState) {
            this.undoStack.push(this.currentState);
        }
        
        // Pop the last state from the redo stack
        this.currentState = this.redoStack.pop();
        
        // Apply the state
        this.applyState(this.currentState);
        
        // Update button states
        this.updateButtonStates();
        
        // Need to ignore the next network update to prevent feedback loops
        this.ignoreNextNetworkUpdate = true;
        
        return this.currentState;
    }
    
    applyState(state) {
        // Trigger the callback to apply the state to the canvas
        const event = new CustomEvent('historyStateChange', { detail: state });
        document.dispatchEvent(event);
    }
    
    updateButtonStates() {
        if (this.undoButton) {
            this.undoButton.disabled = this.undoStack.length === 0;
        }
        
        if (this.redoButton) {
            this.redoButton.disabled = this.redoStack.length === 0;
        }
    }
    
    updateFromNetwork(elements) {
        if (this.ignoreNextNetworkUpdate) {
            this.ignoreNextNetworkUpdate = false;
            return;
        }
        
        // Clone elements to avoid reference issues
        const clonedElements = JSON.parse(JSON.stringify(elements));
        
        // Add current state to undo stack if it exists
        if (this.currentState) {
            this.undoStack.push(this.currentState);
        }
        
        // Set current state and clear redo stack
        this.currentState = clonedElements;
        this.redoStack = [];
        
        // Update button states
        this.updateButtonStates();
    }
    
    markSaved() {
        // Mark current state as saved
        this.savedState = JSON.stringify(this.currentState);
    }
    
    hasUnsavedChanges() {
        if (!this.savedState) return this.undoStack.length > 0;
        return JSON.stringify(this.currentState) !== this.savedState;
    }
}