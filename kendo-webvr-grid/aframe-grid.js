AFRAME.registerComponent('grid', {
    schema: {
        data: { type: 'asset' },
        sortable: {type: 'boolean', default: true},
        height: {type: 'number', default: 400},
        pageSize: {type: 'number', default: 3}
    }, 
    init: function () {
        this.lineColor = "#bbb5c0";
        this.gridBackColor = "#ffffff";
        this.gridForeColor = "#29313c";
        this.headerHeight = 12;
        this.headerBackColor = "#199cad";
        this.headerForeColor = "#ffffff";       
        this.loader = new THREE.FileLoader();
    },
    update: function () {
        const data = this.data;

        if (data.data){
            this.loader.load(data.data, this.onDataLoaded.bind(this));
        }
    },
    onDataLoaded: function (file) {
        const el = this.el,
              opts = this.data,
              json = JSON.parse(file);

        this.dataSource = json.data;
        this.columns = json.columns;
        this.sortable = opts.sortable;
        this.rowHeight = opts.height / this.dataSource.length;
        this.totalWidth = sumSettingTo(this.columns, "width", this.columns.length);
        this.totalHeight = opts.height + this.headerHeight; 
        this.pageCount = this.dataSource.length / this.pageSize;

        this.buildHeaderColumns();

        //this.buildContainerLines();
        
        this.buildTemplateColumns();
        this.buildColumns();
    },
    buildHeaderColumns () {
        for (let i = 0; i < this.columns.length; i++) {
            let line;
            let column = this.columns[i];
            let relativePositionX = sumSettingTo(this.columns, "width", i);
            
            let aCell = this.buildCell({
                text: column.title || "",
                field: column.field || "",
                color: this.headerBackColor,
                textColor: this.headerForeColor,
                width: column.width,
                height: this.headerHeight,
                position: (column.width / 2 + relativePositionX).toString() + " " +
                          -this.headerHeight.toString() + " 0.5"
            });

            if (this.sortable && column.field) {
                let position = aCell.getAttribute("position");
                let sortIconWidth = 5;
                position.x = position.x - sortIconWidth + column.width/ 2;
                let sortButton = this.buildImage({
                    height: this.headerHeight / 2,
                    position: position,
                    visible: false,
                    width: sortIconWidth
                });

                aCell.addEventListener("click", function () {
                    let sortField = this.getAttribute("field");
                    let sortIcon = this.getElementsByTagName("a-image")[0];
                    let sortDirection = sortIcon.getAttribute("direction");

                    for (let element of this.parentEl.getElementsByTagName("a-image")) {
                        element.setAttribute("visible", false);
                        element.removeAttribute("direction");
                    }

                    if (sortDirection === "desc") {
                        sortIcon.setAttribute("visible", false);
                        sortIcon.removeAttribute("direction");

                        sort.call(this, "");
                    } else if (sortDirection === "asc") {
                        sortIcon.setAttribute("visible", true);
                        sortIcon.setAttribute("direction", "desc");
                        sortIcon.setAttribute("src", "#desc");
                        
                        sort.call(this, "desc");
                    } else {
                        sortIcon.setAttribute("visible", true);
                        sortIcon.setAttribute("direction", "asc");
                        sortIcon.setAttribute("src", "#asc");
                        
                        sort.call(this, "asc");
                    }
                });

                aCell.appendChild(sortButton);
            }
                          
            line = this.buildLine(relativePositionX.toString() + ", " + -this.totalHeight.toString() + ", 0",
                            relativePositionX.toString() + ", 0, 0", 
                            this.lineColor);

            //this.el.appendChild(line);
            this.el.appendChild(aCell);
        }
    },
    buildTemplateColumns () {
        let templateCols = this.columns.filter(e => e.template);
        for (let j = 0; j < templateCols.length; j++) {
            let columnIndex = this.columns.indexOf(templateCols[j]);
            for (let i = 0; i < this.dataSource.length; i++) {
                let relativePositionX = sumSettingTo(this.columns, "width", columnIndex);
                let cell = this.buildTemplateCell({
                    template: templateCols[j].template,
                    width: templateCols[j].width,
                    color: this.gridBackColor,
                    page: Math.floor(i/this.data.pageSize),
                    visible: i < this.data.pageSize - 1 ? true : false,
                    height: this.rowHeight,
                    position: (templateCols[j].width / 2 + relativePositionX).toString() + " " + 
                              (-this.rowHeight / 2 - this.rowHeight * (i + 1  - this.data.pageSize * (Math.floor(i/this.data.pageSize))) - this.headerHeight/2).toString() +
                              " 0"
                });                          
                cell.setAttribute("rowIndex", i);
                this.el.appendChild(cell);
            }
        }  

    },
    buildColumns () {        
        for (let j = 0; j < this.dataSource.length; j++) {
            let row = this.dataSource[j];

            let line = this.buildLine("0, " + -(((j + 1) * this.rowHeight) + this.headerHeight / 2).toString() + ", 0",
                                this.totalWidth.toString() + ", " + -(((j + 1) * this.rowHeight) + this.headerHeight / 2).toString() + ", 0", 
                                this.lineColor);
            
            for (let column in row) {
                let columnIndex = this.columns.map(e => e.field).indexOf(column); 
                let relativePositionX =  sumSettingTo(this.columns, "width", columnIndex);
                let width = this.columns[columnIndex].width;
                let cell = this.buildCell({
                                text: row[column].toString(),
                                width: width,
                                color: this.gridBackColor,
                                textColor: this.gridForeColor,
                                field: column,
                                page: Math.floor(j / this.data.pageSize),
                                visible: j < this.data.pageSize - 1 ? true : false,
                                height: this.rowHeight,
                                position: (width / 2 + relativePositionX).toString() + " " + 
                                          (-this.rowHeight / 2 - this.rowHeight * (j + 1  - this.data.pageSize * (Math.floor(j/this.data.pageSize))) - this.headerHeight/2).toString() +
                                          " -0." + Math.ceil(j/this.data.pageSize).toString(),
                                posssition: (width / 2 + relativePositionX).toString() + " " + 
                                            (-this.rowHeight / 2 - this.rowHeight * (j+1) - this.headerHeight/2).toString() +
                                            " 0"
                            });                          
                cell.setAttribute("rowIndex", j);
                //external method
                cell.addEventListener("mouseenter", function () {
                    let rowIndex = this.getAttribute("rowIndex");
                    let cols = this.parentEl.getChildEntities().filter(item => item.getAttribute("rowIndex") == rowIndex);

                    for(let col of cols) {
                        let position = col.getAttribute("position");
                        position.z = 1;
                        col.setAttribute("position", position);
                        col.setAttribute('material', { transperant: true, opacity: 1 });
                    }
                });
                cell.addEventListener("mouseleave", function () {
                    let rowIndex = this.getAttribute("rowIndex");
                    let cols = this.parentEl.getChildEntities().filter(item => item.getAttribute("rowIndex") == rowIndex);

                    for(let col of cols) {
                        let position = col.getAttribute("position");
                        position.z = 0;
                        col.setAttribute("position", position);
                        col.setAttribute('material', { transperant: true, opacity: 0.9 });
                    }
                });

                this.el.appendChild(cell);
            }

            if (j > 0 && j < this.data.pageSize - 1) {
                this.el.appendChild(line);
            } else if (j == this.data.pageSize) {
                let footer = this.buildPager({
                    width: this.totalWidth,
                    height: this.rowHeight,
                    visible: true,
                    page: 0,
                    icon: "#scrollDown",
                    position: (this.totalWidth / 2).toString() + " " + 
                              (-this.rowHeight / 2 - this.rowHeight * j - this.headerHeight/2).toString() +
                              " 0"
                });
                footer.setAttribute("material", {
                    transparent: true
                })
                
                footer.addEventListener("click", function () {
                    let oldPage = this.getAttribute("page");
                    let page = parseInt(oldPage) + 1;                    
                    let currentPageCells = this.parentEl.getChildEntities().filter(function (item) { return item.getAttribute("page") == oldPage && item.getAttribute("rowIndex") });
                    let pageCells = this.parentEl.getChildEntities().filter(function (item) { return item.getAttribute("page") == page && item.getAttribute("rowIndex") });

                    this.setAttribute("page", page);

                    for (let cell of currentPageCells) {
                        cell.setAttribute("visible", false);
                    }

                    for (let cell of pageCells) {
                        cell.setAttribute("animation", {
                            property: "visible",
                            begin: 400,
                            to: true
                        });
                    }
                })

                this.el.appendChild(footer);
            } else if (j == 0) {
                let header = this.buildPager({
                    width: this.totalWidth,
                    height: this.rowHeight,
                    visible: false,
                    icon: "#scrollUp",
                    position: (this.totalWidth / 2).toString() + " " + 
                              (-this.rowHeight - this.headerHeight).toString() +
                              " 0.3"
                });
                this.el.appendChild(header);
            }
        } 
    },
    buildContainerLines () {
        this.el.appendChild(this.buildLine("0, 0, 0", this.totalWidth + ", 0, 0", this.lineColor));
        this.el.appendChild(this.buildLine(this.totalWidth + ", " + -this.totalHeight.toString() + ", 0", this.totalWidth + ", 0, 0", this.lineColor));
        this.el.appendChild(this.buildLine("0, " + -this.totalHeight.toString() + ", 0", "0, 0, 0", this.lineColor));
        this.el.appendChild(this.buildLine("0, " + -this.totalHeight.toString() + ", 0", this.totalWidth + ", " + -this.totalHeight.toString() + ", 0", this.lineColor));
    },
    buildPager (pager) {
        let footer = document.createElement('a-entity');
        let icon = this.buildImage({
            width: 10,
            height: 10,
            visible: true,
            src: pager.icon,
            position: "0 0 0"
        });
        
        footer.setAttribute("geometry", {
            primitive: "plane",
            width: pager.width,
            height: pager.height
        });

        footer.setAttribute("material", {
            src: "#gradient"
        });
        footer.setAttribute("position", pager.position);
        footer.setAttribute("visible", pager.visible);
        footer.setAttribute("page", pager.page);

        footer.appendChild(icon);

        return footer;
    },
    buildCell (cell) {
        let aCell = document.createElement('a-entity');
    
        aCell.setAttribute("geometry", {
            primitive: "plane",
            width: cell.width,
            height: cell.height
        });
        aCell.setAttribute("material", {
            color: cell.color,
            transparent: true,
            opacity: 0.9
        });
        aCell.setAttribute("text", {
            value: cell.text,
            color: cell.textColor,
            xOffset: cell.width * 0.7,
            width: cell.width * 2
        });
        aCell.setAttribute("field", cell.field);
        aCell.setAttribute("page", cell.page);
        aCell.setAttribute("visible", cell.visible);
        aCell.setAttribute("position", cell.position);
    
        return aCell;
    },
    buildTemplateCell (cell) {
        let templateCell = document.createElement('a-entity');
    
        templateCell.setAttribute("geometry", {
            primitive: "plane",
            width: cell.width,
            height: cell.height
        });
        templateCell.setAttribute("material", {
            color: cell.color,
            transparent: true,
            opacity: 0.9
        });
        
        templateCell.setAttribute("position", cell.position);
        templateCell.setAttribute("page", cell.page);
        templateCell.setAttribute("visible", cell.visible);
        templateCell.appendChild(document.getElementsByClassName(cell.template)[0].cloneNode());
    
        return templateCell;
    },
    buildImage (image) {
        let aImage = document.createElement('a-image');
    
        aImage.setAttribute("width", image.width);
        aImage.setAttribute("height", image.height);
        aImage.setAttribute("transparent", true);
        aImage.setAttribute("position", image.position);

        if (image.src) {
            aImage.setAttribute("src", image.src);
        }

        aImage.setAttribute("visible", image.visible);
    
        return aImage;
    },
    buildLine (start, end, color) {
        let aLine = document.createElement('a-entity');        
        aLine.setAttribute('line', {
            start: start,
            end: end,
            color: color
        });
        return aLine;
    }    
});
AFRAME.registerPrimitive('kendo-webvr-grid', {
    defaultComponents: {
        grid: {}
    },
    mappings: {
        data: 'grid.data',
        sortable: 'grid.sortable',
        height: 'grid.height',
        pagesize: 'grid.pageSize'
    }
});

function sumSettingTo (array, setting, index) {
    if (index === 0) {
        return 0;
    }
    return array.map(item => item[setting]).reduce(function (sum, current, idx) {
        if (idx < index) {
            return sum + current;
        } else {
            return sum;
        }
    })
}

function sort (direction) {
    let allCells = this.parentEl.getChildEntities().filter(function (item) { return item.getAttribute("rowindex") });
    let oldCells = allCells.filter(item => item.getAttribute("field") == this.getAttribute("field"));
    let directionMultiplier = direction === "asc" ? 1 : -1;
    let sortedCells;

    oldCells.sort(function (a, b) {
        return a.getAttribute("position").y > b.getAttribute("position").y ? -1 : 1;
    });

    if (direction) {
        sortedCells = allCells.filter(item => item.getAttribute("field") == this.getAttribute("field")).sort(function(a, b) {
            if (isNaN(parseInt(a.getAttribute("text").value))) {
                return a.getAttribute("text").value == b.getAttribute("text").value
                ? 0
                : (a.getAttribute("text").value > b.getAttribute("text").value ? 1*directionMultiplier : -1*directionMultiplier);
            } else {
                return parseInt(a.getAttribute("text").value) == parseInt(b.getAttribute("text").value)
                ? 0
                : (parseInt(a.getAttribute("text").value) > parseInt(b.getAttribute("text").value) ? 1*directionMultiplier : -1*directionMultiplier);
            }
        });
    } else {
        sortedCells = allCells.filter(item => item.getAttribute("field") == this.getAttribute("field")).sort(function(a, b) {
            return a.getAttribute("rowIndex") > b.getAttribute("rowIndex") ? 1 : -1;
        });
    }
            
    for (let i=0; i< sortedCells.length; i++) {
        let cellsByRow = allCells.filter(function (cell) {
            return cell.getAttribute("rowIndex") === sortedCells[i].getAttribute("rowIndex");
        });

        for (let cell of cellsByRow) {
            let xyz = cell.getAttribute("position").toArray();
            xyz[1] = oldCells[i].getAttribute("position").toArray()[1];

            cell.setAttribute("animation", {
                property: "position",
                dur: 400,
                to: xyz.toString().replace(",", " ")
            })
        }
    }
}