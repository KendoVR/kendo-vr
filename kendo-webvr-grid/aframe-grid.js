AFRAME.registerComponent('grid', {
    schema: {
        data: { type: 'asset' },
        sortable: {type: 'boolean', default: true},
        height: {type: 'number', default: 400},
        pageSize: {type: 'number', default: 3},
        visibleToColumnIndex: {type: 'number' }
    }, 
    init: function () {
        this.lineColor = "#e7ebed";
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
        this.totalWidth = sumSettingTo(this.columns, "width", opts.visibleToColumnIndex ? opts.visibleToColumnIndex : this.columns.length);
        this.totalHeight = opts.height + this.headerHeight; 
        this.pageCount = Math.ceil(this.dataSource.length / opts.pageSize);

        let items = this.el.getChildEntities();

        if (!opts.visibleToColumnIndex) {
            opts.visibleToColumnIndex = this.columns.length;
            this.el.setAttribute("visibleTo", opts.visibleToColumnIndex);
        }        

        if (this.footer) {
            this.footer.setAttribute("geometry", {
                width: this.totalWidth,
                height: this.rowHeight
            });
            this.footer.setAttribute("position", (this.totalWidth / 2).toString() + " " + 
                                                (-this.rowHeight / 2 - this.rowHeight * (this.data.pageSize + 1) - this.headerHeight/2).toString() +
                                                " 0");
        }

        if (this.header) {
            this.header.setAttribute("geometry", {
                width: this.totalWidth,
                height: this.rowHeight
            });
            this.header.setAttribute("position", (this.totalWidth / 2).toString() + " " + 
                                                (-this.headerHeight).toString() +
                                                " 0");
            if (this.header.getAttribute("visible")) {
                let headerCells = items.filter(item => item.getAttribute("class") == "gridHeader");
                for (let cell of items.filter(item => item.getAttribute("class") == "gridHeader" && !item.getAttribute("visible"))) {
                    let position = cell.getAttribute("position");
                    position.y = position.y + cell.getAttribute("geometry").height;
                    cell.setAttribute("position", position.toArray().toString().replace(/,/g, ' '));
                }
            }
        }  

        if (!items.length) {
            this.buildHeaderColumns();        
            this.buildTemplateColumns();
            this.buildColumns();
        } else {
            let cols = items.filter(item => item.getAttribute("colIndex"));
            let lines = items.filter(item => item.getAttribute("line"));
            for (let col of cols) {
                col.setAttribute("visible", col.getAttribute("colIndex") < opts.visibleToColumnIndex && 
                                            (col.getAttribute("page") == this.el.getAttribute("page") ||
                                            col.getAttribute("class") == "gridHeader") ? true : false);
            }
            
            for (let line of lines) {
                line.setAttribute("line", {
                    end: {
                        x: this.totalWidth.toString(),
                        y: line.getAttribute("line").end.y,
                        z: line.getAttribute("line").end.z
                    }
                });
            }
        }      

        this.el.setAttribute("page", 0);        
        this.el.setAttribute("pageCount", this.pageCount);
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
                visible: this.data.visibleToColumnIndex > i ? true : false,
                textColor: this.headerForeColor,
                width: column.width,
                opacity: "1",
                height: this.headerHeight,
                position: (column.width / 2 + relativePositionX).toString() + " " +
                          -this.headerHeight.toString() + " 0.7"
            });

            aCell.setAttribute("class", "gridHeader");
            aCell.setAttribute("colIndex", i);

            if (this.sortable && column.field) {
                let position = aCell.getAttribute("position");
                let sortIconWidth = 5;
                position.x = position.x - sortIconWidth + column.width/ 2;
                position.z = 0.6;
                let sortButton = this.buildImage({
                    height: this.headerHeight / 2,
                    position: position,
                    visible: false,
                    width: sortIconWidth
                });

                sortButton.setAttribute("direction", "desc");

                aCell.addEventListener("click", function () {
                    let sortField = this.getAttribute("field");
                    let sortIcon = this.getElementsByTagName("a-image")[0];
                    let sortDirection = sortIcon.getAttribute("direction");

                    for (let element of this.parentEl.querySelectorAll(".gridHeader a-image")) {
                        element.setAttribute("visible", false);
                        sortIcon.setAttribute("direction", "desc");
                    }

                    if (sortDirection === "desc") {
                        sortIcon.setAttribute("visible", true);
                        sortIcon.setAttribute("direction", "asc");
                        sortIcon.setAttribute("src", "#asc");
                        
                        sort.call(this, "asc");
                    } else if (sortDirection === "asc") {
                        sortIcon.setAttribute("visible", true);
                        sortIcon.setAttribute("direction", "desc");
                        sortIcon.setAttribute("src", "#desc");
                        
                        sort.call(this, "desc");
                    }
                });

                aCell.appendChild(sortButton);
            }
                   
            if (i == 0) {
                let templateCol = this.columns.filter(e => e.template)[0];
                let tCell = this.buildTemplateCell({
                    template: templateCol.template,
                    width: templateCol.width,
                    color: this.headerBackColor,
                    preventEvents: true,
                    opacity: "1",
                    page: 0,
                    visible: true,
                    height: this.headerHeight,
                    position: (templateCol.width / 2 + relativePositionX).toString() + " " + 
                              -this.headerHeight.toString() +
                                " 0.7"
                });     
                
                tCell.setAttribute("class", "gridHeader");
                tCell.getChildEntities()[0].setAttribute('fill-color', "#fff"); 
                tCell.getChildEntities()[0].setAttribute('handle-color', "#199cad"); 

                this.el.appendChild(tCell);  
            }
              
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
                    opacity: "0.9",
                    page: Math.floor(i/this.data.pageSize),
                    visible: i < this.data.pageSize ? true : false,
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

            let line = this.buildLine("0, " + -(((j + 1) * this.rowHeight) + this.headerHeight / 2).toString() + ", 1",
                                this.totalWidth.toString() + ", " + -(((j + 1) * this.rowHeight) + this.headerHeight / 2).toString() + ", 1");
            
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
                                opacity: "0.9",
                                page: Math.floor(j / this.data.pageSize),
                                visible: (j < this.data.pageSize && this.data.visibleToColumnIndex > columnIndex  ? true : false),
                                height: this.rowHeight,
                                position: (width / 2 + relativePositionX).toString() + " " + 
                                          (-this.rowHeight / 2 - this.rowHeight * (j + 1  - this.data.pageSize * (Math.floor(j/this.data.pageSize))) - this.headerHeight/2).toString() +
                                          " 1"
                            });                          
                cell.setAttribute("rowIndex", j);      
                cell.setAttribute("colIndex", columnIndex);
                //external method
                this.attachCellEvents(cell);
                this.el.appendChild(cell);
            }

            if (j > 0 && j < this.data.pageSize - 1) {
                this.el.appendChild(line);
            } else if (j == this.data.pageSize) {
                this.buildFooter();
                this.el.appendChild(this.footer);
            } else if (j == 0) {
                this.buildHeader();
                this.el.appendChild(this.header);
            }
        } 
    },
    attachCellEvents (cell) {
        cell.addEventListener("mouseenter", function () {
            let rowIndex = this.getAttribute("rowIndex");
            let cols = this.parentEl.getChildEntities().filter(item => item.getAttribute("rowIndex") == rowIndex);

            for(let col of cols) {
                let position = col.getAttribute("position");
                position.z = 1;
                col.setAttribute("position", position);
            }
        });
        cell.addEventListener("mouseleave", function () {
            let rowIndex = this.getAttribute("rowIndex");
            let cols = this.parentEl.getChildEntities().filter(item => item.getAttribute("rowIndex") == rowIndex);

            for(let col of cols) {
                let position = col.getAttribute("position");
                position.z = 0;
                col.setAttribute("position", position);
            }
        });
    },
    buildContainerLines () {
        this.el.appendChild(this.buildLine("0, 0, 0", this.totalWidth + ", 0, 0", this.lineColor));
        this.el.appendChild(this.buildLine(this.totalWidth + ", " + -this.totalHeight.toString() + ", 0", this.totalWidth + ", 0, 0", this.lineColor));
        this.el.appendChild(this.buildLine("0, " + -this.totalHeight.toString() + ", 0", "0, 0, 0", this.lineColor));
        this.el.appendChild(this.buildLine("0, " + -this.totalHeight.toString() + ", 0", this.totalWidth + ", " + -this.totalHeight.toString() + ", 0", this.lineColor));
    },
    buildHeader () {
        this.header = this.buildPager({
            width: this.totalWidth,
            height: this.headerHeight,
            id: "scrollUp",
            visible: false,
            gradient: "#upGradient",
            icon: "#scrollUp",
            position: (this.totalWidth / 2).toString() + " " + 
                      (-this.headerHeight).toString() +
                      " 0.01"
        });
        
        this.header.setAttribute("material", {
            transparent: true
        })
        
        this.header.addEventListener("click", function () {
            let that = this;
            let oldPage = that.parentEl.getAttribute("page");
            let page = parseInt(oldPage) - 1; 
            let children = that.parentEl.getChildEntities().filter(item => item.getAttribute("visible") || item.id == "scrollDown");               
            let currentPageCells = children.filter(function (item) { return item.getAttribute("page") == oldPage && item.getAttribute("rowIndex") });
            let pageCells = that.parentEl.getChildEntities().filter(function (item) { return item.getAttribute("page") == page && item.getAttribute("rowIndex") && item.getAttribute("colIndex") < parseInt(that.parentEl.getAttribute("visibleto"))});
            let headerCells = children.filter(item => item.getAttribute("class") == "gridHeader");
            this.parentEl.setAttribute("page", page);

            for (let cell of currentPageCells) {
                cell.setAttribute("visible", false);
            }

            for (let cell of pageCells) {
                cell.setAttribute("visible", true);
            }
             
            if (page == 0) {
                this.setAttribute("visible", false);
                for (let cell of headerCells) {
                    let position = cell.getAttribute("position");
                    position.y = position.y - cell.getAttribute("geometry").height;
                    cell.setAttribute("position", position.toArray().toString().replace(/,/g, ' '));
                }
            }
            children.find(item => item.id == "scrollDown").setAttribute("visible", true);

        })
    },
    buildFooter () {
        this.footer = this.buildPager({
            width: this.totalWidth,
            height: this.rowHeight,
            id: "scrollDown",
            visible: true,
            gradient: "#downGradient",
            icon: "#scrollDown",
            position: (this.totalWidth / 2).toString() + " " + 
                      (-this.rowHeight / 2 - this.rowHeight * (this.data.pageSize + 1) - this.headerHeight/2).toString() +
                      " 0"
        });
        this.footer.setAttribute("material", {
            transparent: true
        })
        
        this.footer.addEventListener("click", function () {
            let that = this;
            let oldPage = that.parentEl.getAttribute("page");
            let page = parseInt(oldPage) + 1;        
            let children = that.parentEl.getChildEntities().filter(item => item.getAttribute("visible") || item.id == "scrollUp");       
            let currentPageCells = children.filter(function (item) { return item.getAttribute("page") == oldPage && item.getAttribute("rowIndex") });
            let pageCells = that.parentEl.getChildEntities().filter(function (item) { return item.getAttribute("page") == page && item.getAttribute("rowIndex") && item.getAttribute("colIndex") < parseInt(that.parentEl.getAttribute("visibleto")) });
            let headerCells = children.filter(item => item.getAttribute("class") == "gridHeader");

            this.parentEl.setAttribute("page", page);

            for (let cell of currentPageCells) {
                cell.setAttribute("visible", false);
            }

            for (let cell of pageCells) {
                cell.setAttribute("visible", true);
            }

            if (page + 1 == this.parentEl.getAttribute("pageCount")) {
                this.setAttribute("visible", false)
            } else if (parseInt(oldPage) == 0 && !children.find(item => item.id == "scrollUp").getAttribute("visible")) {                    
                children.find(item => item.id == "scrollUp").setAttribute("visible", true);
                for (let cell of headerCells) {
                    let position = cell.getAttribute("position");
                    position.y = position.y + cell.getAttribute("geometry").height;
                    cell.setAttribute("position", position.toArray().toString().replace(/,/g, ' '));
                }
            }
        })
    },
    buildPager (pager) {
        let geometry = document.createElement('a-entity');
        let icon = this.buildImage({
            width: 10,
            height: 10,
            visible: true,
            src: pager.icon,
            position: "0 0 0.02"
        });
        
        geometry.setAttribute("geometry", {
            primitive: "plane",
            width: pager.width,
            height: pager.height
        });

        geometry.setAttribute("material", {
            src: pager.gradient
        });
        geometry.setAttribute("position", pager.position);
        geometry.setAttribute("visible", pager.visible);
        geometry.setAttribute("id", pager.id);

        geometry.appendChild(icon);

        return geometry;
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
            transparent: cell.opacity === "1" ? false : true,
            opacity: cell.opacity
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
            transparent: cell.opacity == "1" ? false : true,
            opacity: cell.opacity
        });
        
        templateCell.setAttribute("position", cell.position);
        templateCell.setAttribute("page", cell.page);
        templateCell.setAttribute("visible", cell.visible);
        templateCell.appendChild(document.getElementsByClassName(cell.template)[0].cloneNode());
        
        if (!cell.preventEvents) {
            this.attachCellEvents(templateCell);
        }
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
    buildLine (start, end) {
        let aLine = document.createElement('a-entity');        
        aLine.setAttribute('line', {
            start: start,
            end: end,
            color: this.lineColor
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
        pagesize: 'grid.pageSize',
        visibleto: 'grid.visibleToColumnIndex'
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
    let allCells = this.parentEl.getChildEntities().filter(function (item) { return item.getAttribute("rowindex") && item.getAttribute("text") });
    let oldCells = allCells.filter(item => item.getAttribute("field") == this.getAttribute("field"));
    let directionMultiplier = direction === "asc" ? 1 : -1;
    let sortedCells = oldCells.slice();

    if (direction) {
        sortedCells = sortedCells.sort(function(a, b) {
            if (isNaN(parseInt(a.getAttribute("text").value))) {
                return a.getAttribute("text").value == b.getAttribute("text").value
                ? 0 
                : (a.getAttribute("text").value > b.getAttribute("text").value ? 1*directionMultiplier : -1*directionMultiplier);
            } else {
                return a.getAttribute("text").value.localeCompare(b.getAttribute("text").value);
            }
        });
    }
            
    for (let i=0; i< sortedCells.length; i++) {
        let sortedCellsByRow = allCells.filter(function (cell) {
            return cell.getAttribute("rowIndex") === sortedCells[i].getAttribute("rowIndex");
        });
        let cellsByRow = allCells.filter(function (cell) {
            return cell.getAttribute("rowIndex") === oldCells[i].getAttribute("rowIndex");
        });

        for (let j = 0; j < sortedCellsByRow.length; j ++) {
            let text = cellsByRow[j].getAttribute("text").value;
            text = sortedCellsByRow[j].getAttribute("text").value;

            cellsByRow[j].setAttribute("sortText", text)
        }
    }

    for (let cell of allCells) {
        cell.setAttribute("text", {
            value: cell.getAttribute("sortText")
        });
        cell.removeAttribute("sortText");
    }
}