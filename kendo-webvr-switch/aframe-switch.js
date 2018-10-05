const _buttonOffset = 0.05;

AFRAME.registerComponent('switch', {
    schema: {
        width: { type: 'number', default: 0.72 },
        height: { type: 'number', default: 0.32 },
        checked: { type: 'boolean', default: false },
        fillColor: { type: 'color', default: '#199cad'  },
        fillColorUnchecked: { type: 'color', default: '#bbc5ce' },
        handleColor: { type: 'color', default: '#fff' }
    },
    init: function() {     
        var that = this;

        this.el.setAttribute('geometry', {
            primitive: "plane",
            width: this.data.width, 
            height: this.data.height,
        });

        this.el.setAttribute('material', {
            side: "double",
            color: this.data.fillColorUnchecked
        });

        // Button Handle
        this.btn = document.createElement('a-entity');
        this.btn.setAttribute('position', {
             x: (this.el.getAttribute("position").x - (this.data.width / 2) - _buttonOffset) / 2 + _buttonOffset, 
             y: 0, 
             z: 0 
        });
        this.btn.setAttribute('geometry', {
            primitive: "plane",
            width: (this.data.width / 2) - _buttonOffset,
            height: this.data.height - (_buttonOffset * 2)
        });
        this.btn.setAttribute('material', {
            side: "double",
            color: this.data.handleColor
        });
        this.el.appendChild(this.btn);

        // Events                
        this.el.addEventListener('click', function(ev) {
            that.toggle();
            that.el.dispatchEvent( new CustomEvent("change", { 
                detail: { 
                    width: that.data.width,
                    height: that.data.height,
                    checked: that.data.checked,
                    fillColor: that.data.fillColor,
                    fillColorUnchecked: that.data.fillColorUnchecked,
                    handleColor: that.data.handleColor
                }
            }));
        });
    },
    toggle: function(ev) {
        var isChecked = this.data.checked;
        
        if(isChecked) {
            this.setHandlePosition("right");                       
            this.el.setAttribute('material', { color: this.data.fillColorUnchecked });              
        } else {            
            this.setHandlePosition("left");
            this.el.setAttribute('material', { color: this.data.fillColor });
        }

        this.data.checked = !isChecked;
    },
    setHandlePosition: function(direction) {
        var wrapperPosition = this.el.getAttribute('position');
        var buttonPosition = this.btn.getAttribute('position');

        if(direction == 'left') {
            this.btn.setAttribute('position', {
                x: buttonPosition.x + (this.data.width / 2) - _buttonOffset,
                y: wrapperPosition.y,
                z: 0
            });
        } else {
            this.btn.setAttribute('position', {
                x: buttonPosition.x - (this.data.width / 2) + _buttonOffset,
                y: wrapperPosition.y,
                z: 0
            });
        }
    }
});

AFRAME.registerPrimitive('kendo-webvr-switch', {
    defaultComponents: {
        switch: {}
    },
    mappings: {
        width: 'switch.width',
        height: 'switch.height',
        checked: 'switch.checked',
        'fill-color': 'switch.fillColor',
        'fill-color-unchecked': 'switch.fillColorUnchecked',
        'handle-color': 'switch.handleColor'
    }
});