AFRAME.registerComponent('navigatior-segment', {
    schema: {
        color: {
            default: '#fff',
            hover: '#daa'
        }
    },
    init: function () {
        var data = this.data;
        var el = this.el;
        var defaultColor = el.getAttribute('material').color;

        el.addEventListener('mouseenter', function () {
            el.setAttribute('color', data.hover);
        });

        el.addEventListener('mouseleave', function () {
            el.setAttribute('color', data.default);
        });
    }
});

AFRAME.registerComponent('navigatior', {
    
});

AFRAME.registerPrimitive('kendo-webvr-navigator', {
    defaultComponents: {
        navigatior: {}
    },
    mappings: {
    }
});