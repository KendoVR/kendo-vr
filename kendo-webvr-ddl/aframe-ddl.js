AFRAME.registerComponent('dropdownlist', {
    schema: {
        data: { type: 'asset' },
        width: { type: 'number' }
    }, 
    init: function () {
        this.wrapper = document.createElement('a-entity');
        this.wrapper.setAttribute('position', '0 0 0.01');
        this.wrapper.setAttribute('geometry', {primitive: "plane", height: 0.5, width: this.data.width});
        this.wrapper.setAttribute('material', {color: "#bababa"});
        this.el.appendChild(this.wrapper);

        this.btn = document.createElement('a-entity');
        this.btn.setAttribute("id", "k-ddl-toggle-button")
        this.btn.setAttribute('position', '0 0 0.02');
        this.btn.setAttribute('geometry', {primitive: "plane", height: 0.5, width: 0.5});
        this.btn.setAttribute('material', {color: "#727272"});
        this.el.appendChild(this.btn);

        document.querySelector("#k-ddl-toggle-button").addEventListener("click", function () {
            alert(1)
        });

        // this.el.addEventListener("click", function () {
        //     console.log(1);
        // });
    },
    update: function () {

    },
    loadData: function () {

    },
    toggle: function () {
        debugger

    }
});
AFRAME.registerPrimitive('kendo-webvr-dropdownlist', {
    defaultComponents: {
        dropdownlist: {}
    },
    mappings: {
        data: 'dropdownlist.data',
        width: 'dropdownlist.width'
    }
});