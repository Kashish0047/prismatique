// Visual Designer JavaScript - Drag and Drop Interface
class VisualDesigner {
    constructor() {
        this.canvas = document.getElementById('design-canvas');
        this.elementsList = document.getElementById('elements-list');
        this.currentTool = 'select';
        this.selectedElement = null;
        this.elements = [];
        this.elementId = 0;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.showGrid = false;
        this.showSnap = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPropertyListeners();
        this.createInitialElements();
    }

    setupEventListeners() {
        // Tool selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.currentTarget.dataset.tool;
                this.selectTool(tool);
            });
        });

        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));

        // Toolbar events
        document.getElementById('zoom-in')?.addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out')?.addEventListener('click', () => this.zoomOut());
        document.getElementById('grid-toggle')?.addEventListener('click', () => this.toggleGrid());
        document.getElementById('snap-toggle')?.addEventListener('click', () => this.toggleSnap());

        // Context menu
        document.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
        document.addEventListener('click', (e) => this.hideContextMenu());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Action buttons
        document.getElementById('save-design')?.addEventListener('click', () => this.saveDesign());
        document.getElementById('preview-design')?.addEventListener('click', () => this.previewDesign());
        document.getElementById('clear-canvas')?.addEventListener('click', () => this.clearCanvas());
    }

    setupPropertyListeners() {
        document.getElementById('property-text')?.addEventListener('input', (e) => this.updateSelectedElement('text', e.target.value));
        document.getElementById('property-fontsize')?.addEventListener('input', (e) => this.updateSelectedElement('fontSize', e.target.value + 'px'));
        document.getElementById('property-color')?.addEventListener('input', (e) => this.updateSelectedElement('color', e.target.value));
        document.getElementById('property-bgcolor')?.addEventListener('input', (e) => this.updateSelectedElement('backgroundColor', e.target.value));
        document.getElementById('property-radius')?.addEventListener('input', (e) => this.updateSelectedElement('borderRadius', e.target.value + 'px'));
        document.getElementById('property-opacity')?.addEventListener('input', (e) => this.updateSelectedElement('opacity', e.target.value / 100));
        document.getElementById('property-shadow')?.addEventListener('input', (e) => this.updateSelectedElement('boxShadow', e.target.value + 'px'));
    }

    selectTool(tool) {
        this.currentTool = tool;
        
        // Update tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-tool="${tool}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Update cursor
        this.canvas.style.cursor = this.getCursorForTool(tool);
    }

    getCursorForTool(tool) {
        const cursors = {
            select: 'default',
            text: 'text',
            image: 'crosshair',
            shape: 'crosshair',
            button: 'pointer',
            delete: 'not-allowed'
        };
        return cursors[tool] || 'default';
    }

    createInitialElements() {
        // Create some sample elements to start with
        const heroTitle = this.createElement('text', 'The Bonuses', 200, 100);
        const subtitle = this.createElement('text', 'Discover elite casinos with...', 250, 200);
        const feature1 = this.createElement('text', '100% Verified', 350, 300);
        const feature2 = this.createElement('text', 'Fast Payouts', 550, 300);
        const feature3 = this.createElement('text', '10k+ Players', 750, 300);

        this.addElement(heroTitle);
        this.addElement(subtitle);
        this.addElement(feature1);
        this.addElement(feature2);
        this.addElement(feature3);
    }

    createElement(type, text, x, y) {
        const element = document.createElement('div');
        element.className = 'design-element';
        element.dataset.elementId = this.elementId++;
        element.dataset.type = type;
        element.style.left = x + 'px';
        element.style.top = y + 'px';
        
        if (type === 'text') {
            element.innerHTML = `<span class="text-content">${text}</span>`;
            element.style.fontSize = '24px';
            element.style.color = '#ffffff';
        } else if (type === 'button') {
            element.innerHTML = text;
            element.className += ' button-element';
        } else if (type === 'image') {
            element.innerHTML = `<img src="pris.png" alt="${text}" style="width: 100%; height: auto;">`;
            element.className += ' image-element';
        } else if (type === 'shape') {
            element.className += ' shape-element circle';
            element.style.width = '100px';
            element.style.height = '100px';
        }

        // Add to canvas
        this.canvas.appendChild(element);
        this.elements.push(element);
        
        // Add to elements list
        this.addElementToList(element);
        
        // Make draggable
        this.makeElementDraggable(element);
    }

    addElementToList(element) {
        const listItem = document.createElement('div');
        listItem.className = 'element-list-item';
        listItem.innerHTML = `
            <div class="element-info">
                <span class="element-type">${element.dataset.type}</span>
                <span class="element-text">${element.textContent || element.querySelector('img')?.alt || 'Element'}</span>
            </div>
            <button class="element-delete" data-element-id="${element.dataset.elementId}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        this.elementsList.appendChild(listItem);

        // Add delete functionality
        listItem.querySelector('.element-delete').addEventListener('click', () => {
            this.deleteElement(element.dataset.elementId);
        });
    }

    makeElementDraggable(element) {
        element.addEventListener('mousedown', (e) => {
            if (this.currentTool === 'select') {
                e.preventDefault();
                this.startDragging(e, element);
            }
        });
    }

    startDragging(e, element) {
        this.isDragging = true;
        this.selectedElement = element;
        this.dragOffset = {
            x: e.clientX - element.offsetLeft,
            y: e.clientY - element.offsetTop
        };
        
        element.classList.add('dragging');
        element.style.zIndex = 1000;
        
        this.updatePropertiesPanel(element);
    }

    handleMouseMove(e) {
        if (!this.isDragging || !this.selectedElement) return;
        
        e.preventDefault();
        
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        
        // Apply snapping if enabled
        let finalX = x;
        let finalY = y;
        
        if (this.showSnap) {
            const snapX = Math.round(x / 50) * 50;
            const snapY = Math.round(y / 50) * 50;
            finalX = snapX;
            finalY = snapY;
        }
        
        this.selectedElement.style.left = finalX + 'px';
        this.selectedElement.style.top = finalY + 'px';
    }

    handleMouseUp(e) => {
        if (this.isDragging && this.selectedElement) {
            this.isDragging = false;
            this.selectedElement.classList.remove('dragging');
            this.selectedElement.style.zIndex = '';
        }
    }

    handleDoubleClick(e) {
        if (this.currentTool === 'text') {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const text = prompt('Enter text:');
            if (text) {
                this.createElement('text', text, x, y);
            }
        }
    }

    handleContextMenu(e) {
        e.preventDefault();
        
        const target = e.target;
        if (!target.classList.contains('design-element')) return;
        
        this.showContextMenu(e.clientX, e.clientY, target);
    }

    showContextMenu(x, y, target) {
        const menu = document.getElementById('context-menu');
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
        menu.classList.remove('hidden');
        
        // Update context menu actions
        menu.querySelectorAll('.context-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                this.handleContextAction(action, target);
            });
        });
    }

    hideContextMenu() {
        document.getElementById('context-menu').classList.add('hidden');
    }

    handleContextAction(action, target) {
        const element = target.closest('.design-element');
        if (!element) return;
        
        switch (action) {
            case 'edit-text':
                const currentText = element.querySelector('.text-content')?.textContent || '';
                const newText = prompt('Edit text:', currentText);
                if (newText) {
                    element.querySelector('.text-content').textContent = newText;
                }
                break;
            case 'duplicate':
                const rect = element.getBoundingClientRect();
                const clone = element.cloneNode(true);
                clone.style.left = (rect.left + 20) + 'px';
                clone.style.top = (rect.top + 20) + 'px';
                clone.dataset.elementId = this.elementId++;
                this.canvas.appendChild(clone);
                this.elements.push(clone);
                this.addElementToList(clone);
                this.makeElementDraggable(clone);
                break;
            case 'delete':
                this.deleteElement(element.dataset.elementId);
                break;
            case 'bring-front':
                element.style.zIndex = 999;
                break;
            case 'send-back':
                element.style.zIndex = 1;
                break;
        }
        
        this.hideContextMenu();
    }

    deleteElement(elementId) {
        const element = document.querySelector(`[data-element-id="${elementId}"]`);
        if (element) {
            element.remove();
            this.elements = this.elements.filter(el => el.dataset.elementId !== elementId);
            
            // Remove from elements list
            const listItem = element.closest('.element-list-item');
            if (listItem) {
                listItem.remove();
            }
        }
    }

    updateSelectedElement(property, value) {
        if (!this.selectedElement) return;
        
        switch (property) {
            case 'text':
                const textContent = this.selectedElement.querySelector('.text-content');
                if (textContent) {
                    textContent.textContent = value;
                }
                break;
            case 'fontSize':
                this.selectedElement.style.fontSize = value;
                document.getElementById('property-fontsize').value = parseInt(value);
                document.querySelector('.property-value').textContent = value;
                break;
            case 'color':
                this.selectedElement.style.color = value;
                document.getElementById('property-color').value = value;
                break;
            case 'backgroundColor':
                this.selectedElement.style.backgroundColor = value;
                document.getElementById('property-bgcolor').value = value;
                break;
            case 'borderRadius':
                this.selectedElement.style.borderRadius = value;
                document.getElementById('property-radius').value = parseInt(value);
                document.querySelector('.property-value').textContent = value;
                break;
            case 'opacity':
                this.selectedElement.style.opacity = value;
                document.getElementById('property-opacity').value = Math.round(value * 100);
                document.querySelector('.property-value').textContent = Math.round(value * 100) + '%';
                break;
            case 'boxShadow':
                this.selectedElement.style.boxShadow = `0 ${value}px 10px rgba(0, 0, 0, 0.3)`;
                document.getElementById('property-shadow').value = parseInt(value);
                document.querySelector('.property-value').textContent = value + 'px';
                break;
        }
    }

    updatePropertiesPanel(element) {
        if (!element) return;
        
        // Update property values
        const textContent = element.querySelector('.text-content')?.textContent || '';
        document.getElementById('property-text').value = textContent;
        
        const computedStyle = window.getComputedStyle(element);
        document.getElementById('property-fontsize').value = parseInt(computedStyle.fontSize) || 24;
        document.getElementById('property-color').value = this.rgbToHex(computedStyle.color) || '#ffffff';
        document.getElementById('property-bgcolor').value = this.rgbToHex(computedStyle.backgroundColor) || '#0066cc';
        document.getElementById('property-radius').value = parseInt(computedStyle.borderRadius) || 8;
        document.getElementById('property-opacity').value = Math.round((parseFloat(computedStyle.opacity) || 1) * 100);
        document.getElementById('property-shadow').value = parseInt((computedStyle.boxShadow?.match(/\d+/) || [5]));
        
        // Update value displays
        document.querySelectorAll('.property-value').forEach((span, index) => {
            const inputs = document.querySelectorAll('.property-slider');
            if (inputs[index]) {
                span.textContent = inputs[index].value + (inputs[index].type.includes('color') ? '' : 'px');
            }
        });
    }

    rgbToHex(rgb) {
        if (!rgb) return '#000000';
        const result = rgb.match(/\d+/g);
        return '#' + result.map(x => {
            const hex = parseInt(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    zoomIn() {
        const currentScale = parseFloat(this.canvas.style.transform?.replace('scale(', '')?.replace(')', '') || '1');
        const newScale = Math.min(currentScale + 0.1, 3);
        this.canvas.style.transform = `scale(${newScale})`;
    }

    zoomOut() {
        const currentScale = parseFloat(this.canvas.style.transform?.replace('scale(', '')?.replace(')', '') || '1');
        const newScale = Math.max(currentScale - 0.1, 0.5);
        this.canvas.style.transform = `scale(${newScale})`;
    }

    toggleGrid() {
        this.showGrid = !this.showGrid;
        this.updateGridOverlay();
    }

    toggleSnap() {
        this.showSnap = !this.showSnap;
        this.updateSnapLines();
    }

    updateGridOverlay() {
        let gridOverlay = document.querySelector('.grid-overlay');
        if (!gridOverlay) {
            gridOverlay = document.createElement('div');
            gridOverlay.className = 'grid-overlay';
            this.canvas.appendChild(gridOverlay);
        }
        
        gridOverlay.className = this.showGrid ? 'grid-overlay active' : 'grid-overlay';
    }

    updateSnapLines() {
        let snapContainer = document.querySelector('.snap-lines');
        if (!snapContainer) {
            snapContainer = document.createElement('div');
            snapContainer.className = 'snap-lines';
            this.canvas.appendChild(snapContainer);
        }
        
        snapContainer.innerHTML = this.showSnap ? `
            <div class="snap-line horizontal center"></div>
            <div class="snap-line vertical center"></div>
        ` : '';
    }

    clearCanvas() {
        if (confirm('Clear all elements?')) {
            this.canvas.innerHTML = '';
            this.elements = [];
            this.elementsList.innerHTML = '';
            this.selectedElement = null;
            this.showStatus('Canvas cleared', 'info');
        }
    }

    saveDesign() {
        try {
            const designData = this.exportDesign();
            console.log('Saving design:', designData);
            
            // In real implementation, this would save to server
            this.showStatus('Design saved and deployed!', 'success');
        } catch (error) {
            console.error('Save error:', error);
            this.showStatus('Error saving design', 'error');
        }
    }

    previewDesign() {
        const designData = this.exportDesign();
        const previewHTML = this.generatePreviewHTML(designData);
        
        const preview = window.open('', 'preview', 'width=1000,height=700');
        preview.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { 
                        margin: 0; 
                        padding: 2rem; 
                        background: #1a1a1a; 
                        font-family: Arial; 
                    }
                    .preview-element { 
                        position: absolute; 
                        padding: 1rem; 
                        border-radius: 8px; 
                        background: var(--dark-gray); 
                        border: 2px solid var(--accent-blue);
                    }
                </style>
            </head>
            <body>
                ${previewHTML}
            </body>
            </html>
        `);
        preview.document.close();
    }

    exportDesign() {
        return this.elements.map(element => ({
            type: element.dataset.type,
            content: element.innerHTML,
            style: {
                left: element.style.left,
                top: element.style.top,
                fontSize: element.style.fontSize,
                color: element.style.color,
                backgroundColor: element.style.backgroundColor,
                borderRadius: element.style.borderRadius,
                opacity: element.style.opacity,
                boxShadow: element.style.boxShadow
            }
        }));
    }

    generatePreviewHTML(designData) {
        return designData.map(element => {
            const style = `position: absolute; left: ${element.style.left}; top: ${element.style.top}; ${element.style.fontSize}; color: ${element.style.color}; background: ${element.style.backgroundColor}; border-radius: ${element.style.borderRadius}; opacity: ${element.style.opacity}; box-shadow: ${element.style.boxShadow}; padding: 1rem;`;
            return `<div class="preview-element" style="${style}">${element.innerHTML}</div>`;
        }).join('');
    }

    handleKeyboard(e) {
        if (e.key === 'Delete' && this.selectedElement) {
            this.deleteElement(this.selectedElement.dataset.elementId);
        } else if (e.key === 'Escape') {
            this.selectedElement = null;
            this.updatePropertiesPanel(null);
        }
    }

    showStatus(message, type = 'success') {
        const statusEl = document.getElementById('status-message');
        const statusText = document.getElementById('status-text');
        
        if (statusEl && statusText) {
            statusText.textContent = message;
            statusEl.className = `status-message ${type}`;
            
            setTimeout(() => {
                statusEl.classList.add('hidden');
            }, 3000);
        }
    }
}

// Initialize visual designer
document.addEventListener('DOMContentLoaded', () => {
    new VisualDesigner();
});
