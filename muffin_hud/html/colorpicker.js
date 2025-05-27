// Simple Color Picker Implementation
class ColorPicker {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.currentColor = '#FF4757';
        this.callback = null;
        this.init();
    }

    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 360;
        this.canvas.height = 200;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '200px';
        this.canvas.style.borderRadius = '8px';
        this.canvas.style.cursor = 'crosshair';
        
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        
        this.drawColorPicker();
        this.setupEvents();
    }

    drawColorPicker() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Draw the hue gradient
        const hueGradient = this.ctx.createLinearGradient(0, 0, width, 0);
        hueGradient.addColorStop(0, '#ff0000');
        hueGradient.addColorStop(0.17, '#ffff00');
        hueGradient.addColorStop(0.33, '#00ff00');
        hueGradient.addColorStop(0.5, '#00ffff');
        hueGradient.addColorStop(0.67, '#0000ff');
        hueGradient.addColorStop(0.83, '#ff00ff');
        hueGradient.addColorStop(1, '#ff0000');
        
        this.ctx.fillStyle = hueGradient;
        this.ctx.fillRect(0, 0, width, height);
        
        // Draw the white to transparent gradient
        const whiteGradient = this.ctx.createLinearGradient(0, 0, width, 0);
        whiteGradient.addColorStop(0, 'rgba(255,255,255,1)');
        whiteGradient.addColorStop(1, 'rgba(255,255,255,0)');
        
        this.ctx.fillStyle = whiteGradient;
        this.ctx.fillRect(0, 0, width, height);
        
        // Draw the black to transparent gradient
        const blackGradient = this.ctx.createLinearGradient(0, 0, 0, height);
        blackGradient.addColorStop(0, 'rgba(0,0,0,0)');
        blackGradient.addColorStop(1, 'rgba(0,0,0,1)');
        
        this.ctx.fillStyle = blackGradient;
        this.ctx.fillRect(0, 0, width, height);
    }

    setupEvents() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            
            const imageData = this.ctx.getImageData(x, y, 1, 1);
            const pixel = imageData.data;
            
            const color = this.rgbToHex(pixel[0], pixel[1], pixel[2]);
            this.currentColor = color;
            
            if (this.callback) {
                this.callback(color);
            }
        });
    }

    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    setCallback(callback) {
        this.callback = callback;
    }

    getCurrentColor() {
        return this.currentColor;
    }
}
