// Manages all elements on the whiteboard
export class ElementManager {
    constructor(canvas, propertyPanel) {
        this.canvas = canvas;
        this.propertyPanel = propertyPanel;
        this.elements = [];
        this.selectedElement = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.networkManager = null;
        this.historyManager = null;
    }
    
    setHistoryManager(historyManager) {
        this.historyManager = historyManager;
    }
    
    setNetworkManager(networkManager) {
        this.networkManager = networkManager;
    }
    
    addElement(element) {
        // Add the element to our array
        this.elements.push(element);
        
        // Redraw canvas with the new element
        this.redrawCanvas();
        
        // Sync element with other users
        this.syncElement(element);
    }
    
    syncElement(element) {
        // Network sync disabled - just a stub method
    }
    
    getAllElements() {
        return [...this.elements];
    }
    
    redrawCanvas() {
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawAllElements(ctx);
    }
    
    drawAllElements(ctx) {
        // Draw all elements in order
        for (const element of this.elements) {
            this.drawElement(ctx, element);
        }
        
        // If there's a selected element, draw its selection outline
        if (this.selectedElement) {
            this.drawSelectionOutline(ctx, this.selectedElement);
        }
    }
    
    drawElement(ctx, element) {
        ctx.strokeStyle = element.strokeColor;
        ctx.fillStyle = element.fillColor || 'transparent';
        ctx.lineWidth = element.strokeWidth || 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        switch (element.type) {
            case 'path':
                this.drawPath(ctx, element);
                break;
                
            case 'rectangle':
                this.drawRectangle(ctx, element);
                break;
                
            case 'circle':
                this.drawCircle(ctx, element);
                break;
                
            case 'line':
                this.drawLine(ctx, element);
                break;
                
            case 'text':
                this.drawText(ctx, element);
                break;
                
            case 'section':
                this.drawSection(ctx, element);
                break;
        }
    }
    
    drawPath(ctx, element) {
        if (element.points && element.points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(element.points[0][0], element.points[0][1]);
            
            for (let i = 1; i < element.points.length; i++) {
                ctx.lineTo(element.points[i][0], element.points[i][1]);
            }
            
            ctx.stroke();
        }
    }
    
    drawRectangle(ctx, element) {
        ctx.beginPath();
        ctx.rect(element.x, element.y, element.width, element.height);
        
        if (element.fillColor && element.fillColor !== 'transparent') {
            ctx.fill();
        }
        
        ctx.stroke();
    }
    
    drawCircle(ctx, element) {
        ctx.beginPath();
        ctx.arc(element.x, element.y, element.radius, 0, Math.PI * 2);
        
        if (element.fillColor && element.fillColor !== 'transparent') {
            ctx.fill();
        }
        
        ctx.stroke();
    }
    
    drawLine(ctx, element) {
        ctx.beginPath();
        ctx.moveTo(element.x1, element.y1);
        ctx.lineTo(element.x2, element.y2);
        ctx.stroke();
    }
    
    drawText(ctx, element) {
        ctx.font = element.font || '18px Arial';
        ctx.fillStyle = element.strokeColor;
        ctx.fillText(element.text, element.x, element.y + 20); // +20 for baseline
    }
    
    drawSection(ctx, element) {
        // Draw the section container
        ctx.beginPath();
        ctx.rect(element.x, element.y, element.width, element.height);
        
        if (element.fillColor && element.fillColor !== 'transparent') {
            ctx.fill();
        }
        
        ctx.stroke();
        
        // Draw title bar
        const titleHeight = 25;
        ctx.beginPath();
        ctx.rect(element.x, element.y, element.width, titleHeight);
        ctx.fillStyle = element.strokeColor; // Use stroke color for title
        ctx.fill();
        ctx.stroke();
        
        // Draw section title if exists
        if (element.title) {
            ctx.fillStyle = '#ffffff'; // White text for title
            ctx.font = '14px Arial';
            ctx.fillText(element.title, element.x + 10, element.y + 17);
        }
        
        // Draw any content elements inside this section
        if (element.content && element.content.length > 0) {
            for (const contentElement of element.content) {
                // Adjust position to be relative to the section
                const adjustedElement = { ...contentElement };
                if (adjustedElement.x !== undefined) {
                    adjustedElement.x += element.x;
                }
                if (adjustedElement.y !== undefined) {
                    adjustedElement.y += element.y + titleHeight;
                }
                this.drawElement(ctx, adjustedElement);
            }
        }
    }
    
    drawSelectionOutline(ctx, element) {
        ctx.strokeStyle = '#00a8ff'; // Selection color
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]); // Dashed line
        
        // Get element bounds
        const bounds = this.getElementBounds(element);
        
        // Draw selection rectangle
        ctx.strokeRect(
            bounds.x - 5, 
            bounds.y - 5, 
            bounds.width + 10, 
            bounds.height + 10
        );
        
        // Reset line dash
        ctx.setLineDash([]);
        
        // Draw resize handles at corners
        const handleSize = 8;
        const handles = [
            { x: bounds.x - 5, y: bounds.y - 5 },                         // Top-left
            { x: bounds.x + bounds.width / 2 - handleSize / 2, y: bounds.y - 5 }, // Top-center
            { x: bounds.x + bounds.width - handleSize + 5, y: bounds.y - 5 },      // Top-right
            { x: bounds.x + bounds.width - handleSize + 5, y: bounds.y + bounds.height / 2 - handleSize / 2 }, // Middle-right
            { x: bounds.x + bounds.width - handleSize + 5, y: bounds.y + bounds.height - handleSize + 5 },     // Bottom-right
            { x: bounds.x + bounds.width / 2 - handleSize / 2, y: bounds.y + bounds.height - handleSize + 5 }, // Bottom-center
            { x: bounds.x - 5, y: bounds.y + bounds.height - handleSize + 5 },      // Bottom-left
            { x: bounds.x - 5, y: bounds.y + bounds.height / 2 - handleSize / 2 }  // Middle-left
        ];
        
        ctx.fillStyle = '#ffffff';
        handles.forEach(handle => {
            ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
            ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
        });
    }
    
    getElementBounds(element) {
        switch (element.type) {
            case 'rectangle':
            case 'section':
                return {
                    x: element.x,
                    y: element.y,
                    width: element.width,
                    height: element.height
                };
                
            case 'circle':
                return {
                    x: element.x - element.radius,
                    y: element.y - element.radius,
                    width: element.radius * 2,
                    height: element.radius * 2
                };
                
            case 'line':
                const minX = Math.min(element.x1, element.x2);
                const minY = Math.min(element.y1, element.y2);
                const maxX = Math.max(element.x1, element.x2);
                const maxY = Math.max(element.y1, element.y2);
                
                return {
                    x: minX,
                    y: minY,
                    width: maxX - minX,
                    height: maxY - minY
                };
                
            case 'text':
                // Approximate text bounds
                const ctx = this.canvas.getContext('2d');
                ctx.font = element.font || '18px Arial';
                const metrics = ctx.measureText(element.text);
                
                return {
                    x: element.x,
                    y: element.y,
                    width: metrics.width,
                    height: 24  // Approximate height
                };
                
            case 'path':
                if (!element.points || element.points.length === 0) {
                    return { x: 0, y: 0, width: 0, height: 0 };
                }
                
                // Find min/max coordinates in the path
                let pathMinX = element.points[0][0];
                let pathMinY = element.points[0][1];
                let pathMaxX = element.points[0][0];
                let pathMaxY = element.points[0][1];
                
                for (const point of element.points) {
                    pathMinX = Math.min(pathMinX, point[0]);
                    pathMinY = Math.min(pathMinY, point[1]);
                    pathMaxX = Math.max(pathMaxX, point[0]);
                    pathMaxY = Math.max(pathMaxY, point[1]);
                }
                
                return {
                    x: pathMinX,
                    y: pathMinY,
                    width: pathMaxX - pathMinX,
                    height: pathMaxY - pathMinY
                };
                
            default:
                return { x: 0, y: 0, width: 0, height: 0 };
        }
    }
    
    isPointInElement(x, y, element) {
        const bounds = this.getElementBounds(element);
        
        switch (element.type) {
            case 'rectangle':
            case 'section':
                return (
                    x >= bounds.x &&
                    x <= bounds.x + bounds.width &&
                    y >= bounds.y &&
                    y <= bounds.y + bounds.height
                );
                
            case 'circle':
                const distanceToCircle = Math.sqrt(
                    Math.pow(x - element.x, 2) + 
                    Math.pow(y - element.y, 2)
                );
                return distanceToCircle <= element.radius;
                
            case 'line':
                // Check if point is close enough to the line
                const A = { x: element.x1, y: element.y1 };
                const B = { x: element.x2, y: element.y2 };
                const P = { x, y };
                
                const distAB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
                const distAP = Math.sqrt(Math.pow(P.x - A.x, 2) + Math.pow(P.y - A.y, 2));
                const distBP = Math.sqrt(Math.pow(P.x - B.x, 2) + Math.pow(P.y - B.y, 2));
                
                // If the point is beyond the line segment, return false
                if (distAP + distBP - distAB > 0.1) {
                    return false;
                }
                
                // Calculate distance from point to line
                const numerator = Math.abs((B.y - A.y) * P.x - (B.x - A.x) * P.y + B.x * A.y - B.y * A.x);
                const denominator = Math.sqrt(Math.pow(B.y - A.y, 2) + Math.pow(B.x - A.x, 2));
                const distanceToLine = numerator / denominator;
                
                return distanceToLine <= 5; // 5px threshold
                
            case 'text':
                // Simple rectangular bounds for text
                return (
                    x >= bounds.x &&
                    x <= bounds.x + bounds.width &&
                    y >= bounds.y &&
                    y <= bounds.y + bounds.height
                );
                
            case 'path':
                // For paths, check if point is near any segment
                if (!element.points || element.points.length < 2) {
                    return false;
                }
                
                for (let i = 1; i < element.points.length; i++) {
                    const A = { x: element.points[i-1][0], y: element.points[i-1][1] };
                    const B = { x: element.points[i][0], y: element.points[i][1] };
                    const P = { x, y };
                    
                    const lineDistAB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
                    const lineDistAP = Math.sqrt(Math.pow(P.x - A.x, 2) + Math.pow(P.y - A.y, 2));
                    const lineDistBP = Math.sqrt(Math.pow(P.x - B.x, 2) + Math.pow(P.y - B.y, 2));
                    
                    // If point is beyond the line segment, skip to next segment
                    if (lineDistAP + lineDistBP - lineDistAB > 0.1) {
                        continue;
                    }
                    
                    // Calculate distance from point to line segment
                    const lineNumerator = Math.abs((B.y - A.y) * P.x - (B.x - A.x) * P.y + B.x * A.y - B.y * A.x);
                    const lineDenominator = Math.sqrt(Math.pow(B.y - A.y, 2) + Math.pow(B.x - A.x, 2));	
                    const pathDistance = lineNumerator / lineDenominator;
                    
                    if (pathDistance <= 5) { // 5px threshold
                        return true;
                    }
                }
                return false;
                
            default:
                return false;
        }
    }
    
    findElementAt(x, y) {
        // Search elements in reverse order (top layer first)
        for (let i = this.elements.length - 1; i >= 0; i--) {
            const element = this.elements[i];
            if (this.isPointInElement(x, y, element)) {
                return element;
            }
        }
        return null;
    }
    
    handleSelection(element, x, y) {
        if (element) {
            this.selectedElement = element;
            
            // Calculate the offset from the mouse to the element's origin
            const bounds = this.getElementBounds(element);
            this.dragOffset = {
                x: x - bounds.x,
                y: y - bounds.y
            };
            
            this.isDragging = true;
            
            // Show property panel for the selected element
            this.propertyPanel.showProperties(element);
            
            // Redraw to show selection
            this.redrawCanvas();
        } else {
            this.clearSelection();
        }
    }
    
    handleDrag(x, y) {
        if (!this.isDragging || !this.selectedElement) return;
        
        const newX = x - this.dragOffset.x;
        const newY = y - this.dragOffset.y;
        
        // Move the element based on its type
        switch (this.selectedElement.type) {
            case 'rectangle':
            case 'section':
                this.selectedElement.x = newX;
                this.selectedElement.y = newY;
                break;
                
            case 'circle':
                this.selectedElement.x = newX + this.dragOffset.x;
                this.selectedElement.y = newY + this.dragOffset.y;
                break;
                
            case 'line':
                const dx = newX - (this.selectedElement.x1 - this.dragOffset.x);
                const dy = newY - (this.selectedElement.y1 - this.dragOffset.y);
                
                this.selectedElement.x1 += dx;
                this.selectedElement.y1 += dy;
                this.selectedElement.x2 += dx;
                this.selectedElement.y2 += dy;
                break;
                
            case 'text':
                this.selectedElement.x = newX;
                this.selectedElement.y = newY;
                break;
                
            case 'path':
                if (this.selectedElement.points && this.selectedElement.points.length > 0) {
                    const bounds = this.getElementBounds(this.selectedElement);
                    const dx = newX - bounds.x;
                    const dy = newY - bounds.y;
                    
                    // Move all points in the path
                    for (let i = 0; i < this.selectedElement.points.length; i++) {
                        this.selectedElement.points[i][0] += dx;
                        this.selectedElement.points[i][1] += dy;
                    }
                }
                break;
        }
        
        // Update property panel if visible
        this.propertyPanel.updateProperties(this.selectedElement);
        
        // Redraw canvas
        this.redrawCanvas();
    }
    
    handleSelectionComplete() {
        if (this.isDragging && this.selectedElement) {
            // Sync the moved element
            this.syncElement(this.selectedElement);
        }
        
        this.isDragging = false;
    }
    
    clearSelection() {
        this.selectedElement = null;
        this.isDragging = false;
        this.propertyPanel.hide();
        this.redrawCanvas();
    }
    
    getSelectedElement() {
        return this.selectedElement;
    }
    
    updateElementProperty(elementId, property, value) {
        const element = this.findElementById(elementId);
        if (element) {
            element[property] = value;
            this.redrawCanvas();
            this.syncElement(element);
        }
    }
    
    updateElementText(elementId, text) {
        const element = this.findElementById(elementId);
        if (element && element.type === 'text') {
            element.text = text;
            this.redrawCanvas();
            this.syncElement(element);
        }
    }
    
    findElementById(id) {
        return this.elements.find(element => element.id === id);
    }
    
    addNetworkElement(element) {
        // Prevent duplicates
        const index = this.elements.findIndex(e => e.id === element.id);
        if (index !== -1) {
            this.elements[index] = element;
        } else {
            this.elements.push(element);
        }
        
        this.redrawCanvas();
        
        // Return the element for chaining
        return element;
    }
    
    removeElement(elementId) {
        const index = this.elements.findIndex(element => element.id === elementId);
        if (index !== -1) {
            this.elements.splice(index, 1);
            
            if (this.selectedElement && this.selectedElement.id === elementId) {
                this.clearSelection();
            }
            
            this.redrawCanvas();
            
            if (this.historyManager) {
                this.historyManager.addState(this.getAllElements());
            }
        }
    }
    
    clearAllElements() {
        this.elements = [];
        this.clearSelection();
        this.redrawCanvas();
    }
    
    setElements(elements) {
        this.elements = elements;
        this.redrawCanvas();
    }
}