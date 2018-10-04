AFRAME.registerComponent('dropdownlist', {
    schema: {
        dataSource: {},
        width: { type: 'number' }
    }, 
    init: function () {
        this.wrapper = document.createElement('a-entity');
        this.wrapper.setAttribute('position', '0 0 0.01');
        this.wrapper.setAttribute('geometry', {primitive: "plane", height: 0.5, width: this.data.width});
        this.wrapper.setAttribute('material', {color: "#bababa"});
        this.el.appendChild(this.wrapper);

        this.btn = document.createElement('a-entity');
        this.btn.setAttribute("class", "k-ddl-toggle-button")
        this.btn.setAttribute('position', '1.75 0 0.02');
        this.btn.setAttribute('geometry', {primitive: "plane", height: 0.5, width: 0.5});
        this.btn.setAttribute('material', {color: "#727272"});
        this.btn.setAttribute('text', {value: "<", color: "red",  wrapCount: "1"});
        this.el.appendChild(this.btn);

        this.popup = document.createElement('a-entity');
        this.popup.setAttribute("class", "k-ddl-popup");
        this.popup.setAttribute('position', '0 -0.51 0.01');
        this.popup.setAttribute('geometry', {primitive: "plane", width: this.data.width});
        this.popup.setAttribute('material', {transperant: true, opacity: 0});
        this.el.appendChild(this.popup);

        // var item = document.createElement('a-entity');
        // item.setAttribute("position", "0 0 0.03");
        // item.setAttribute('geometry', {primitive: "plane", height: 0.5, width: this.data.width});
        // item.setAttribute("text", {value: "hello", color: "red", wrapCount: 20});
        // item.setAttribute('material', {color: "#727272"});
        // this.popup.appendChild(item);

        // item = document.createElement('a-entity');
        // item.setAttribute("position", "0 -0.5 0.03");
        // item.setAttribute('geometry', {primitive: "plane", height: 0.5, width: this.data.width});
        // item.setAttribute("text", {value: "hello1", color: "red", wrapCount: 20});
        // item.setAttribute('material', {color: "#727272"});
        // this.popup.appendChild(item);

        var that = this;
        that.visible = false;
        this.el.addEventListener("click", function (ev) { 
             that.toggle() 
        });

        this.el.addEventListener("mouseenter", function (ev) { 
            if(ev.srcElement.className && ev.srcElement.className === "k-item"){
                var origPos = ev.srcElement.getAttribute("position");
                origPos.z = 0.1;
                ev.srcElement.setAttribute("position", origPos);
            }
        });

        this.el.addEventListener("mouseleave", function (ev) { 
            if(ev.srcElement.className && ev.srcElement.className === "k-item"){
                var origPos = ev.srcElement.getAttribute("position");
                origPos.z = 0.03;
                ev.srcElement.setAttribute("position", origPos);
            }
        });
    },
    update: function () {
    },
    loadData: function (data) {
        this.data.dataSource = data;
        var height = 0;
        var item;

        for(var i = 0; i < data.length; i++){
            item = document.createElement('a-entity');
            item.setAttribute("class", "k-item");
            item.setAttribute("position", "0 -" + height + " 0.03");
            item.setAttribute('geometry', {primitive: "plane", height: 0.5, width: this.data.width});
            item.setAttribute("text", {value: data[i], color: "red", wrapCount: 20});
            item.setAttribute('material', {color: "#727272"});
            // item.setAttribute("light", {type: "directional", castShadow: true});
            // light="type:directional; castShadow:true;"
            this.popup.appendChild(item);
            console.log("0 -" + height + "0.03")
            console.log(data[i])
            height += 0.5;
        }
    },
    toggle: function () {
        // debugger
        
        this.btn.setAttribute('text', {value: this.visible ? ">" : "<"})
        console.log(1);
        console.log(this.visible)

            this.popup.setAttribute("visible", this.visible ? "false" : "true");

        this.visible = !this.visible;


    }
});
AFRAME.registerPrimitive('kendo-webvr-dropdownlist', {
    defaultComponents: {
        dropdownlist: {}
    },
    mappings: {
        dataSource: 'dropdownlist.dataSource',
        width: 'dropdownlist.width'
    }
});