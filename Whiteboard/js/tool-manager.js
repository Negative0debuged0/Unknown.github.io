// Manages the drawing tools and user interactions
export class ToolManager {
    constructor(canvas, elementManager, propertyPanel) {
        this.canvas = canvas;
        this.elementManager = elementManager;
        this.propertyPanel = propertyPanel;
        this.historyManager = null;
        
        this.currentTool = 'select';
        this.isDrawing = false;
        this.startX = 0;
        this.startY = 0;
        this.lastX = 0;
        this.lastY = 0;
        
        // Drawing settings
        this.strokeColor = '#ffffff'; 
        this.fillColor = '#333333';
        this.strokeWidth = 3;
        
        // Text tool variables
        this.textInputContainer = document.getElementById('text-input-container');
        this.textInput = document.getElementById('text-input');
        this.textSubmitButton = document.getElementById('text-submit');
        this.textCancelButton = document.getElementById('text-cancel');
        
        // Current temp shape being drawn
        this.currentShape = null;
        
        // Tool buttons
        this.toolButtons = document.querySelectorAll('.tool-button[data-tool]');
    }
    
    setHistoryManager(historyManager) {
        this.historyManager = historyManager;
    }
    
    initialize() {
        // Initialize drawing settings from inputs
        this.strokeColor = document.getElementById('stroke-color').value;
        this.fillColor = document.getElementById('fill-color').value;
        this.strokeWidth = parseInt(document.getElementById('stroke-width').value);
        
        // Set up the event listeners for the tool buttons
        this.toolButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.setTool(e.currentTarget.dataset.tool);
            });
        });
        
        // Set up the color and stroke width controls
        document.getElementById('stroke-color').addEventListener('input', (e) => {
            this.strokeColor = e.target.value;
            this.updateSelectedElementProperties();
        });
        
        document.getElementById('fill-color').addEventListener('input', (e) => {
            this.fillColor = e.target.value;
            this.updateSelectedElementProperties();
        });
        
        document.getElementById('stroke-width').addEventListener('input', (e) => {
            this.strokeWidth = parseInt(e.target.value);
            this.updateSelectedElementProperties();
        });
        
        // Set up mouse event listeners on the canvas
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        
        // Text tool event listeners
        this.textSubmitButton.addEventListener('click', this.handleTextSubmit.bind(this));
        this.textCancelButton.addEventListener('click', this.handleTextCancel.bind(this));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Double click for editing text
        this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
        
        // Initial tool selection
        this.setTool('select');
    }
    
    setTool(toolName) {
        this.currentTool = toolName;
        
        // Update the active tool button
        this.toolButtons.forEach(button => {
            if (button.dataset.tool === toolName) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // If switching to a tool other than select, deselect current selection
        if (toolName !== 'select') {
            this.elementManager.clearSelection();
            this.propertyPanel.hide();
        }
        
        // Special cursor styles for different tools but still respect custom cursor
        if (document.body.style.cursor === 'none') {
            this.canvas.style.cursor = 'none';
        } else {
            if (this.currentTool === 'pen') {
                this.canvas.style.cursor = 'crosshair';
            } else if (this.currentTool === 'select') {
                this.canvas.style.cursor = 'default';
            } else {
                this.canvas.style.cursor = 'crosshair';
            }
        }
    }
    
    handleMouseDown(e) {
        this.isDrawing = true;
        
        // Get mouse position relative to canvas
        const rect = this.canvas.getBoundingClientRect();
        this.startX = e.clientX - rect.left;
        this.startY = e.clientY - rect.top;
        this.lastX = this.startX;
        this.lastY = this.startY;
        
        // Different actions based on current tool
        switch (this.currentTool) {
            case 'select':
                const clickedElement = this.elementManager.findElementAt(this.startX, this.startY);
                this.elementManager.handleSelection(clickedElement, this.startX, this.startY);
                break;
                
            case 'pen':
                // Start a new pen path
                this.currentShape = {
                    type: 'path',
                    points: [[this.startX, this.startY]],
                    strokeColor: this.strokeColor,
                    strokeWidth: this.strokeWidth,
                    id: Date.now().toString()
                };
                break;
                
            case 'text':
                // Text is handled on mouseup to prevent drawing behavior
                break;
                
            case 'section':
                // Start drawing a section
                this.currentShape = {
                    type: 'section',
                    x: this.startX,
                    y: this.startY,
                    width: 0,
                    height: 0,
                    strokeColor: this.strokeColor,
                    fillColor: this.fillColor,
                    strokeWidth: this.strokeWidth,
                    content: [],
                    id: Date.now().toString()
                };
                break;
                
            default:
                // For other shapes, just store the starting coordinates
                // The shape will be created on mouseup
                break;
        }
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        if (!this.isDrawing) return;
        
        switch (this.currentTool) {
            case 'select':
                // Move the selected element
                this.elementManager.handleDrag(currentX, currentY);
                break;
                
            case 'pen':
                // Add point to the current path
                if (this.currentShape && this.currentShape.points) {
                    this.currentShape.points.push([currentX, currentY]);
                    this.redrawCanvasWithTemp();
                    
                    // For pen tool, sync frequently for real-time drawing
                    if (this.currentShape.points.length % 5 === 0) {  // Sync every 5 points
                        const tempElement = {...this.currentShape};
                        this.elementManager.syncElement(tempElement);
                    }
                }
                break;
                
            case 'rectangle':
                // Update the preview rectangle
                this.currentShape = {
                    type: 'rectangle',
                    x: Math.min(this.startX, currentX),
                    y: Math.min(this.startY, currentY),
                    width: Math.abs(currentX - this.startX),
                    height: Math.abs(currentY - this.startY),
                    strokeColor: this.strokeColor,
                    fillColor: this.fillColor,
                    strokeWidth: this.strokeWidth,
                    id: Date.now().toString()
                };
                this.redrawCanvasWithTemp();
                break;
                
            case 'circle':
                // Update the preview circle
                const radius = Math.sqrt(
                    Math.pow(currentX - this.startX, 2) + 
                    Math.pow(currentY - this.startY, 2)
                );
                
                this.currentShape = {
                    type: 'circle',
                    x: this.startX,
                    y: this.startY,
                    radius: radius,
                    strokeColor: this.strokeColor,
                    fillColor: this.fillColor,
                    strokeWidth: this.strokeWidth,
                    id: Date.now().toString()
                };
                this.redrawCanvasWithTemp();
                break;
                
            case 'line':
                // Update the preview line
                this.currentShape = {
                    type: 'line',
                    x1: this.startX,
                    y1: this.startY,
                    x2: currentX,
                    y2: currentY,
                    strokeColor: this.strokeColor,
                    strokeWidth: this.strokeWidth,
                    id: Date.now().toString()
                };
                this.redrawCanvasWithTemp();
                break;
                
            case 'section':
                // Update the preview section
                if (this.currentShape) {
                    this.currentShape.width = currentX - this.startX;
                    this.currentShape.height = currentY - this.startY;
                    this.redrawCanvasWithTemp();
                }
                break;
        }
        
        this.lastX = currentX;
        this.lastY = currentY;
    }
    
    handleMouseUp(e) {
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        switch (this.currentTool) {
            case 'select':
                // Finish moving the element
                this.elementManager.handleSelectionComplete();
                this.historyManager.addState(this.elementManager.getAllElements());
                break;
                
            case 'text':
                // Show text input at click location
                this.showTextInput(this.startX, this.startY);
                break;
                
            case 'pen':
                // Finish drawing path
                if (this.currentShape && this.currentShape.points.length > 1) {
                    // Add a final point if it's different from the last one
                    const lastPoint = this.currentShape.points[this.currentShape.points.length - 1];
                    if (lastPoint[0] !== currentX || lastPoint[1] !== currentY) {
                        this.currentShape.points.push([currentX, currentY]);
                    }
                    
                    // Only add the path if it has enough distinct points
                    if (this.currentShape.points.length > 2) {
                        this.elementManager.addElement(this.currentShape);
                        this.historyManager.addState(this.elementManager.getAllElements());
                    }
                }
                break;
                
            default:
                // Add the current shape to the elements array
                if (this.currentShape) {
                    if ((this.currentTool === 'rectangle' || this.currentTool === 'section') && 
                        (this.currentShape.width < 5 || this.currentShape.height < 5)) {
                        // Ignore very small rectangles/sections (likely accidental clicks)
                    } else if (this.currentTool === 'circle' && this.currentShape.radius < 5) {
                        // Ignore very small circles
                    } else if (this.currentTool === 'line' && 
                        Math.abs(this.currentShape.x1 - this.currentShape.x2) < 5 && 
                        Math.abs(this.currentShape.y1 - this.currentShape.y2) < 5) {
                        // Ignore very short lines
                    } else {
                        this.elementManager.addElement(this.currentShape);
                        this.historyManager.addState(this.elementManager.getAllElements());
                    }
                }
                break;
        }
        
        // Reset drawing state
        this.isDrawing = false;
        this.currentShape = null;
        this.elementManager.redrawCanvas();
    }
    
    handleMouseLeave() {
        if (this.isDrawing && this.currentTool !== 'select') {
            // Finish the current drawing operation when mouse leaves the canvas
            this.handleMouseUp({ clientX: this.lastX, clientY: this.lastY });
        }
    }
    
    handleTouchStart(e) {
        if (e.touches.length === 1) {
            // Convert touch to mouse event
            const touch = e.touches[0];
            this.handleMouseDown({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        }
        e.preventDefault();
    }
    
    handleTouchMove(e) {
        if (e.touches.length === 1) {
            // Convert touch to mouse event
            const touch = e.touches[0];
            this.handleMouseMove({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        }
        e.preventDefault();
    }
    
    handleTouchEnd(e) {
        // Use the last touch position
        this.handleMouseUp({
            clientX: this.lastX,
            clientY: this.lastY
        });
        e.preventDefault();
    }
    
    handleDoubleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if we double-clicked on a text element
        const element = this.elementManager.findElementAt(x, y);
        if (element && element.type === 'text') {
            // Edit existing text
            this.showTextInput(element.x, element.y, element.text, element);
        }
    }
    
    showTextInput(x, y, existingText = '', existingElement = null) {
        // Position and show the text input container
        this.textInputContainer.style.left = `${x}px`;
        this.textInputContainer.style.top = `${y}px`;
        this.textInputContainer.style.display = 'block';
        
        // Set any existing text
        this.textInput.value = existingText;
        
        // Focus the text area
        this.textInput.focus();
        
        // Store reference to existing element for editing
        this.textInput.dataset.editingElement = existingElement ? existingElement.id : '';
    }
    
    handleTextSubmit() {
        const text = this.textInput.value.trim();
        if (text) {
            // Check if we're editing an existing element
            const editingId = this.textInput.dataset.editingElement;
            
            if (editingId) {
                // Update existing text element
                this.elementManager.updateElementText(editingId, text);
            } else {
                // Add new text element
                const textElement = {
                    type: 'text',
                    x: parseInt(this.textInputContainer.style.left),
                    y: parseInt(this.textInputContainer.style.top),
                    text: text,
                    font: '18px Arial',
                    strokeColor: this.strokeColor,
                    id: Date.now().toString()
                };
                
                this.elementManager.addElement(textElement);
            }
            
            this.historyManager.addState(this.elementManager.getAllElements());
        }
        
        // Hide the text input
        this.textInputContainer.style.display = 'none';
        this.textInput.value = '';
        this.textInput.dataset.editingElement = '';
    }
    
    handleTextCancel() {
        // Hide the text input without adding text
        this.textInputContainer.style.display = 'none';
        this.textInput.value = '';
        this.textInput.dataset.editingElement = '';
    }
    
    redrawCanvasWithTemp() {
        // First draw all permanent elements
        this.elementManager.redrawCanvas();
        
        // Then draw the current temporary shape
        if (this.currentShape) {
            const ctx = this.canvas.getContext('2d');
            this.drawShape(ctx, this.currentShape);
        }
    }
    
    drawShape(ctx, shape) {
        // Helper to draw any shape
        ctx.strokeStyle = shape.strokeColor;
        ctx.fillStyle = shape.fillColor;
        ctx.lineWidth = shape.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        switch (shape.type) {
            case 'path':
                if (shape.points && shape.points.length > 0) {
                    ctx.beginPath();
                    ctx.moveTo(shape.points[0][0], shape.points[0][1]);
                    
                    for (let i = 1; i < shape.points.length; i++) {
                        ctx.lineTo(shape.points[i][0], shape.points[i][1]);
                    }
                    
                    ctx.stroke();
                }
                break;
                
            case 'rectangle':
                ctx.beginPath();
                ctx.rect(shape.x, shape.y, shape.width, shape.height);
                if (shape.fillColor !== 'transparent') {
                    ctx.fill();
                }
                ctx.stroke();
                break;
                
            case 'circle':
                ctx.beginPath();
                ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
                if (shape.fillColor !== 'transparent') {
                    ctx.fill();
                }
                ctx.stroke();
                break;
                
            case 'line':
                ctx.beginPath();
                ctx.moveTo(shape.x1, shape.y1);
                ctx.lineTo(shape.x2, shape.y2);
                ctx.stroke();
                break;
                
            case 'text':
                ctx.font = shape.font;
                ctx.fillStyle = shape.strokeColor;
                ctx.fillText(shape.text, shape.x, shape.y + 20); // +20 for baseline
                break;
                
            case 'section':
                // Draw a section (rectangle with a title bar)
                ctx.beginPath();
                ctx.rect(shape.x, shape.y, shape.width, shape.height);
                if (shape.fillColor !== 'transparent') {
                    ctx.fill();
                }
                ctx.stroke();
                
                // Draw title bar
                ctx.beginPath();
                const titleHeight = 25;
                ctx.rect(shape.x, shape.y, shape.width, titleHeight);
                ctx.fillStyle = shape.strokeColor; // Use stroke color for title bar
                ctx.fill();
                ctx.stroke();
                break;
        }
    }
    
    updateSelectedElementProperties() {
        const selectedElement = this.elementManager.getSelectedElement();
        if (selectedElement) {
            // Update the properties of the selected element
            if (selectedElement.strokeColor !== undefined) {
                selectedElement.strokeColor = this.strokeColor;
            }
            
            if (selectedElement.fillColor !== undefined) {
                selectedElement.fillColor = this.fillColor;
            }
            
            if (selectedElement.strokeWidth !== undefined) {
                selectedElement.strokeWidth = this.strokeWidth;
            }
            
            // Redraw and sync changes
            this.elementManager.redrawCanvas();
            this.historyManager.addState(this.elementManager.getAllElements());
            this.elementManager.syncElement(selectedElement);
        }
    }
}