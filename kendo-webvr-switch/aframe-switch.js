const _buttonOffset = 0.05;

AFRAME.registerComponent('switch', {
    schema: {
        width: { type: 'number', default: 0.72 },
        height: { type: 'number', default: 0.32 },
        checked: { type: 'boolean', default: false },
        fillColor: { type: 'color', default: '#fff'  },
        checkedColor: { type: 'color', default: '#42a9b8' },
        uncheckedColor: { type: 'color', default: '#bebebe' }
    },
    init: function() {     
        var that = this;
        
        // Wrapper
        this.wrapper = document.createElement('a-entity');   
        this.wrapper.setAttribute('geometry', {
            primitive: "plane",
            width: this.data.width, 
            height: this.data.height,
        });

        this.wrapper.setAttribute('material', {
            side: "double",
            color: this.data.fillColor
        });
        this.el.appendChild(this.wrapper);

        // Button Handle
        this.btn = document.createElement('a-entity');
        this.btn.setAttribute('position', {
             x: (this.wrapper.getAttribute("position").x - (this.data.width / 2) - _buttonOffset) / 2 + _buttonOffset, 
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
            color: this.data.uncheckedColor
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
                    checkedColor: that.data.checkedColor,
                    uncheckedColor: that.data.uncheckedColor
                }
            }));
        });
    },
    toggle: function(ev) {
        var isChecked = this.data.checked;
        
        if(isChecked) {
            this.setHandlePosition("right");                       
            this.btn.setAttribute('material', { color: this.data.uncheckedColor });              
        } else {            
            this.setHandlePosition("left");
            this.btn.setAttribute('material', { color: this.data.checkedColor });
        }

        this.data.checked = !isChecked;
    },
    setHandlePosition: function(direction) {
        var wrapperPosition = this.wrapper.getAttribute('position');
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
        'checked-color': 'switch.checkedColor',
        'unchecked-color': 'switch.uncheckedColor'
    }
});