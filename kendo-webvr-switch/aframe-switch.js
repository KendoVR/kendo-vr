AFRAME.registerComponent('switch', {
    schema: {
        enabled: { type: 'boolean', default: true }
    },
    init: function() {
        // Wrapper
        this.wrapper = document.createElement('a-entity');
        this.wrapper.setAttribute('position', '0 0 0.01');
        this.wrapper.setAttribute('geometry', {
            primitive: "plane",
            width: 0.72, 
            height: 0.32,
        });
        this.wrapper.setAttribute('material', {
            side: "double",
            color: "#bababa"
        });
        this.el.appendChild(this.wrapper);

        // Button Handle
        this.btn = document.createElement('a-entity');
        this.btn.setAttribute('position', '0.195 0 0.02');
        this.btn.setAttribute('geometry', {
            primitive: "plane",
            width: 0.30,
            height: 0.24
        });
        this.btn.setAttribute('material', {
            side: "double",
            color: "red"
        });
        this.el.appendChild(this.btn);

        // Toggle
        var that = this;

        this.el.addEventListener('click', function(ev) {
            that.toggle();
            that.el.dispatchEvent( new CustomEvent("change", { state: that.enabled }) );
        });
    },
    toggle: function(ev) {
        var isEnabled = this.enabled;
console.log(isEnabled);
        if(isEnabled) {
            this.btn.setAttribute('position', '-0.2 0 0.02');
        } else {
            this.btn.setAttribute('position', '0.195 0 0.02');
        }
        that.setAttribute('enabled', !isEnabled);
    }
});

AFRAME.registerPrimitive('kendo-webvr-switch', {
    defaultComponents: {
        switch: {}
    },
    mappings: {
        enabled: 'switch.enabled'
    }
});