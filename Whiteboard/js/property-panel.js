// Manages the property panel for editing element properties
export class PropertyPanel {
    constructor() {
        this.panel = document.getElementById('property-panel');
        this.contentContainer = document.getElementById('property-content');
        this.currentElement = null;
        this.propertyChangeCallback = null;
    }
    
    setPropertyChangeCallback(callback) {
        this.propertyChangeCallback = callback;
    }
    
    showProperties(element) {
        this.currentElement = element;
        this.panel.style.display = 'block';
        
        // Clear current content
        this.contentContainer.innerHTML = '';
        
        // Add element type title
        const typeTitle = document.createElement('div');
        typeTitle.className = 'property-type-title';
        typeTitle.textContent = `${element.type.charAt(0).toUpperCase() + element.type.slice(1)} Properties`;
        this.contentContainer.appendChild(typeTitle);
        
        // Create properties group
        const propertiesGroup = document.createElement('div');
        propertiesGroup.className = 'property-group';
        
        // Add common properties
        if (element.strokeColor !== undefined) {
            this.addColorProperty(propertiesGroup, 'Stroke Color', 'strokeColor', element.strokeColor);
        }
        
        if (element.fillColor !== undefined) {
            this.addColorProperty(propertiesGroup, 'Fill Color', 'fillColor', element.fillColor);
        }
        
        if (element.strokeWidth !== undefined) {
            this.addNumberProperty(propertiesGroup, 'Stroke Width', 'strokeWidth', element.strokeWidth, 1, 20);
        }
        
        // Element-specific properties
        switch (element.type) {
            case 'rectangle':
            case 'section':
                this.addNumberProperty(propertiesGroup, 'X', 'x', element.x);
                this.addNumberProperty(propertiesGroup, 'Y', 'y', element.y);
                this.addNumberProperty(propertiesGroup, 'Width', 'width', element.width);
                this.addNumberProperty(propertiesGroup, 'Height', 'height', element.height);
                
                if (element.type === 'section') {
                    this.addTextProperty(propertiesGroup, 'Title', 'title', element.title || '');
                }
                break;
                
            case 'circle':
                this.addNumberProperty(propertiesGroup, 'X', 'x', element.x);
                this.addNumberProperty(propertiesGroup, 'Y', 'y', element.y);
                this.addNumberProperty(propertiesGroup, 'Radius', 'radius', element.radius, 1);
                break;
                
            case 'line':
                this.addNumberProperty(propertiesGroup, 'X1', 'x1', element.x1);
                this.addNumberProperty(propertiesGroup, 'Y1', 'y1', element.y1);
                this.addNumberProperty(propertiesGroup, 'X2', 'x2', element.x2);
                this.addNumberProperty(propertiesGroup, 'Y2', 'y2', element.y2);
                break;
                
            case 'text':
                this.addNumberProperty(propertiesGroup, 'X', 'x', element.x);
                this.addNumberProperty(propertiesGroup, 'Y', 'y', element.y);
                this.addTextProperty(propertiesGroup, 'Text', 'text', element.text);
                this.addFontProperty(propertiesGroup, 'Font', 'font', element.font || '18px Arial');
                break;
        }
        
        this.contentContainer.appendChild(propertiesGroup);
        
        // Add delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'tool-button property-delete-button';
        deleteButton.textContent = 'Delete Element';
        deleteButton.addEventListener('click', () => {
            if (this.propertyChangeCallback) {
                this.propertyChangeCallback('delete', this.currentElement.id);
            }
        });
        
        this.contentContainer.appendChild(deleteButton);
    }
    
    addColorProperty(container, label, property, value) {
        const propertyItem = document.createElement('div');
        propertyItem.className = 'property-item';
        
        const propertyLabel = document.createElement('span');
        propertyLabel.className = 'property-label';
        propertyLabel.textContent = label;
        
        const propertyInput = document.createElement('input');
        propertyInput.type = 'color';
        propertyInput.value = value;
        propertyInput.addEventListener('input', (e) => {
            this.handlePropertyChange(property, e.target.value);
        });
        
        propertyItem.appendChild(propertyLabel);
        propertyItem.appendChild(propertyInput);
        container.appendChild(propertyItem);
    }
    
    addNumberProperty(container, label, property, value, min, max) {
        const propertyItem = document.createElement('div');
        propertyItem.className = 'property-item';
        
        const propertyLabel = document.createElement('span');
        propertyLabel.className = 'property-label';
        propertyLabel.textContent = label;
        
        const propertyInput = document.createElement('input');
        propertyInput.type = 'number';
        propertyInput.className = 'property-input';
        propertyInput.value = value;
        if (min !== undefined) propertyInput.min = min;
        if (max !== undefined) propertyInput.max = max;
        
        propertyInput.addEventListener('change', (e) => {
            this.handlePropertyChange(property, parseInt(e.target.value, 10));
        });
        
        propertyItem.appendChild(propertyLabel);
        propertyItem.appendChild(propertyInput);
        container.appendChild(propertyItem);
    }
    
    addTextProperty(container, label, property, value) {
        const propertyItem = document.createElement('div');
        propertyItem.className = 'property-item';
        
        const propertyLabel = document.createElement('span');
        propertyLabel.className = 'property-label';
        propertyLabel.textContent = label;
        
        const propertyInput = document.createElement('input');
        propertyInput.type = 'text';
        propertyInput.className = 'property-input';
        propertyInput.value = value;
        
        propertyInput.addEventListener('change', (e) => {
            this.handlePropertyChange(property, e.target.value);
        });
        
        propertyItem.appendChild(propertyLabel);
        propertyItem.appendChild(propertyInput);
        container.appendChild(propertyItem);
    }
    
    addFontProperty(container, label, property, value) {
        const propertyItem = document.createElement('div');
        propertyItem.className = 'property-item';
        
        const propertyLabel = document.createElement('span');
        propertyLabel.className = 'property-label';
        propertyLabel.textContent = label;
        
        const propertyInput = document.createElement('select');
        propertyInput.className = 'property-input';
        
        const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48];
        const fontFamilies = ['Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia'];
        
        // Parse current font
        const sizeMatch = value.match(/(\d+)px/);
        const currentSize = sizeMatch ? parseInt(sizeMatch[1], 10) : 18;
        
        const fontMatch = value.match(/px\s+(.+)$/);
        const currentFont = fontMatch ? fontMatch[1] : 'Arial';
        
        fontSizes.forEach(size => {
            fontFamilies.forEach(family => {
                const option = document.createElement('option');
                option.value = `${size}px ${family}`;
                option.textContent = `${size}px ${family}`;
                
                if (size === currentSize && family === currentFont) {
                    option.selected = true;
                }
                
                propertyInput.appendChild(option);
            });
        });
        
        propertyInput.addEventListener('change', (e) => {
            this.handlePropertyChange(property, e.target.value);
        });
        
        propertyItem.appendChild(propertyLabel);
        propertyItem.appendChild(propertyInput);
        container.appendChild(propertyItem);
    }
    
    handlePropertyChange(property, value) {
        if (!this.currentElement) return;
        
        // Update the element property
        this.currentElement[property] = value;
        
        // Notify about the change
        if (this.propertyChangeCallback) {
            this.propertyChangeCallback('update', this.currentElement);
        }
    }
    
    updateProperties(element) {
        if (this.panel.style.display === 'block' && this.currentElement && element.id === this.currentElement.id) {
            // Update existing property panel with new values
            this.currentElement = element;
            
            // Update inputs with current values
            const inputs = this.contentContainer.querySelectorAll('input, select');
            inputs.forEach(input => {
                const property = input.closest('.property-item').querySelector('.property-label').textContent.toLowerCase().replace(' ', '_');
                const elementProperty = this.getPropertyNameFromLabel(property);
                
                if (element[elementProperty] !== undefined) {
                    input.value = element[elementProperty];
                }
            });
        }
    }
    
    getPropertyNameFromLabel(label) {
        const labelToProperty = {
            'stroke_color': 'strokeColor',
            'fill_color': 'fillColor',
            'stroke_width': 'strokeWidth',
            'x': 'x',
            'y': 'y',
            'width': 'width',
            'height': 'height',
            'radius': 'radius',
            'x1': 'x1',
            'y1': 'y1',
            'x2': 'x2',
            'y2': 'y2',
            'text': 'text',
            'font': 'font',
            'title': 'title'
        };
        
        return labelToProperty[label] || label;
    }
    
    hide() {
        this.panel.style.display = 'none';
        this.currentElement = null;
    }
}