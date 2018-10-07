AFRAME.registerComponent('dropdownlist', {
    schema: {
        dataSource: {},
        opacity: {type: 'number', default: 0.5 },
        width: { type: 'number' },
        rowHeight: { type: 'number', default: 0.56 },
        textColor: { type: 'string', default: "#3f5971" },
        value: { type: 'string' }
    }, 
    init: function () {
        this.wrapper = document.createElement('a-entity');
        this.wrapper.setAttribute('position', '0 0 0.01');
        this.wrapper.setAttribute('geometry', {primitive: "plane", height: this.data.rowHeight, width: this.data.width});
        this.wrapper.setAttribute('material', {color: "white"});
        this.wrapper.setAttribute('text', {color: this.data.textColor, value: "", width: this.data.width * 1.5, xOffset: this.data.width / 2 - 0.8});
        this.wrapper.setAttribute('material', {transparant: true, opacity: this.data.opacity});
        this.el.appendChild(this.wrapper);

        this.btn = document.createElement('a-image');
        this.btn.setAttribute("class", "k-ddl-toggle-button")
        this.btn.setAttribute('position', this.data.width / 2 - 0.4 + ' 0 0.02');
        this.btn.setAttribute("width", 0.5);
        this.btn.setAttribute("height", this.data.rowHeight);
        this.btn.setAttribute("src", "./assets/arrow-chevron-down-active.svg");
        this.btn.setAttribute("transparent", true);
        
        // this.btn.setAttribute('geometry', {primitive: "plane", height: this.data.rowHeight, width: 0.5});
        // this.btn.setAttribute('material', {color: "white"});
        // this.btn.setAttribute('text', {value: "<", color: "black",  wrapCount: "1"});
        // this.btn.setAttribute('material', { transparant: true, opacity: 0, src:"#icon-up"});
        this.el.appendChild(this.btn);

        this.popup = document.createElement('a-entity');
        this.popup.setAttribute("class", "k-ddl-popup");
        this.popup.setAttribute('position', '0 -' + (this.data.rowHeight + 0.04) + ' 0.01');
        this.popup.setAttribute('geometry', {primitive: "plane", width: this.data.width});
        this.popup.setAttribute('material', {transparant: true, opacity: 0});
        this.popup.setAttribute('visible', false);
        this.el.appendChild(this.popup);

        var that = this;
        that.visible = false;
        this.el.addEventListener("click", function (ev) { 
             that.toggle()

             if(ev.srcElement.className && /k-item/.test(ev.srcElement.className)) {
                var newValue = ev.srcElement.components.text.data.value;
                that.el.dispatchEvent( new CustomEvent("change", {detail: { oldValue: that.data.value, newValue: newValue }}) );
                that.data.value = newValue;
                that.selectedItem = ev.srcElement;
                that.update();
             }
        });

        this.el.addEventListener("mouseenter", function (ev) { 
            if(ev.srcElement.className && /k-item/.test(ev.srcElement.className)){
                var origPos = ev.srcElement.getAttribute("position");
                var origMaterial = ev.srcElement.getAttribute("material");
                // var origText = ev.srcElement.getAttribute("text");
                origMaterial.opacity = 1;
                origPos.z = 0.2;
                // origText.color = "white";
                ev.srcElement.setAttribute("position", origPos);
                ev.srcElement.setAttribute('material', origMaterial);
                // ev.srcElement.setAttribute('text', origText);
            }
        });

        this.el.addEventListener("mouseleave", function (ev) { 
            if(ev.srcElement.className &&  /k-item/.test(ev.srcElement.className)){
                
                var origPos = ev.srcElement.getAttribute("position");
                var origMaterial = ev.srcElement.getAttribute("material");
                // var origText = ev.srcElement.getAttribute("text");
                origPos.z = 0.03;
                origMaterial.opacity = that.data.opacity;
                // origText.color = "black"
                ev.srcElement.setAttribute("position", origPos);
                ev.srcElement.setAttribute('material', origMaterial);
            }
        });
        
        this.loadData([
            "Polychrome View",
            "Monochrome View",
            "Bichrome View"
        ]);
    },
    update: function () {
        if(this.data.value && this.data.value !== "") {
            this.wrapper.setAttribute("text", {value: this.data.value});

            var oldSelected = document.querySelector(".k-selected");
            if(oldSelected) {
                var origText = oldSelected.getAttribute("text");
                var origMaterial = oldSelected.getAttribute("material");

                if (origMaterial) {
                    origMaterial.color = "white";
                }

                if (origText) {
                    origText.color = this.data.textColor;
                }

                oldSelected.setAttribute("material", origMaterial);
                oldSelected.setAttribute("text", origText);
                oldSelected.setAttribute("class", "k-item");
            }
            

            if(this.selectedItem){
                var origText = this.selectedItem.getAttribute("text");
                var origMaterial = this.selectedItem.getAttribute("material");
                origMaterial.color = "#199cad";
                origText.color = "white";
                this.selectedItem.setAttribute("material", origMaterial);
                this.selectedItem.setAttribute("text", origText);
                this.selectedItem.setAttribute("class", "k-item k-selected");
            }
        }
    },
    loadData: function (data) {
        this.data.dataSource = data;
        var height = 0;
        var item;

        for(var i = 0; i < data.length; i++){
            item = document.createElement('a-entity');
            item.setAttribute("class", "k-item");
            item.setAttribute("data-position", "0 -" + (height) + " 0.02");
            item.setAttribute('geometry', {primitive: "plane", height: this.data.rowHeight, width: this.data.width});
            
            if(data[i] === this.data.value){
                item.setAttribute('material', {color: "#199cad", transparant: true, opacity: this.data.opacity});
                item.setAttribute('text', {value: data[i], color: "white", width: this.data.width * 1.5, xOffset: this.data.width / 2 - 0.8});
                item.setAttribute("class", "k-item k-selected")
            }else{
                item.setAttribute('material', {color: "white", transparant: true, opacity: this.data.opacity});
                item.setAttribute("text", {value: data[i], color: this.data.textColor, width: this.data.width * 1.5, xOffset: this.data.width / 2 - 0.8});
            }

            this.popup.appendChild(item);
            height += this.data.rowHeight + 0.005;
        }
    },
    toggle: function () {
        this.btn.setAttribute('src', this.visible ? "./assets/arrow-chevron-down-active.svg" : "./assets/arrow-chevron-up-active.svg");
        
        if(!this.visible){
            this.popup.setAttribute("visible", true);
        }
        
        var items = document.querySelectorAll(".k-item");

        for(var i = 0; i < items.length; i++){
            var originalPos = items[i].getAttribute("data-position");
            var y = originalPos.split(" ")[1];
            var z = originalPos.split(" ")[2];
            
            if(this.visible) {
                y = 0;
            }

            var that = this;

            items[i].setAttribute("animation", {
                property: "position",
                to: "0 " + y + " " + z,
                dur: 500
            });  
        }

        if(that.visible) {
            setTimeout(function () {
                that.popup.setAttribute("visible", false);
            },500)
        }
        
        this.visible = !this.visible;
    }
});
AFRAME.registerPrimitive('kendo-webvr-dropdownlist', {
    defaultComponents: {
        dropdownlist: {}
    },
    mappings: {
        dataSource: 'dropdownlist.dataSource',
        width: 'dropdownlist.width',
        value: 'dropdownlist.value',
        opacity: 'dropdownlist.opacity',
        "row-height": 'dropdownlist.rowHeight'
    }
});