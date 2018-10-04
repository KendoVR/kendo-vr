AFRAME.registerComponent('grid', {
    schema: {
        data: { type: 'asset' }
    }, 
    init: function () {
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
              data = this.dataSource = JSON.parse(file);

        let totalWidth = sumSettingTo(data.columns, "width", data.columns.length);
        let totalHeight = sumSettingTo(data.rows, "height", data.rows.length);

        for (let j = 0; j < data.rows.length; j++) {
            let row = data.rows[j];
            let relativePositionY = sumSettingTo(data.rows, "height", j);

            let line = buildLine("0, " + -relativePositionY.toString() + ", 0",
                                totalWidth.toString() + ", " + -relativePositionY.toString() + ", 0", 
                                "red");

            this.el.appendChild(line);
            
            for (let i = 0; i < row.cells.length; i++) {
                let relativePositionX =  sumSettingTo(data.columns, "width", i);
                let width = data.columns[i].width;
                let cell = buildCell({
                                text: row.cells[i],
                                width: width,
                                height: row.height,
                                position: (width / 2 + relativePositionX).toString() + " " + 
                                          (-row.height / 2 - relativePositionY).toString() +
                                          " 0"
                            });                  
                cell.setAttribute("rowIndex", j); 
                cell.setAttribute("colIndex", i);               
                let line = buildLine(relativePositionX.toString() + ", " + -totalHeight.toString() + ", 0",
                                    relativePositionX.toString() + ", 0, 0", 
                                    "red");

                this.el.appendChild(cell);
                this.el.appendChild(line);
            }

        }        
    }
});
AFRAME.registerPrimitive('kendo-webvr-grid', {
    defaultComponents: {
        grid: {}
    },
    mappings: {
        data: 'grid.data'
    }
});

function buildCell (cell) {
    var column = document.createElement('a-entity');
    column.setAttribute("geometry", {
        primitive: "plane",
        width: cell.width,
        height: cell.height
    });
    column.setAttribute("material", {
        color: "grey"
    });
    column.setAttribute("text", {
        value: cell.text
    });
    column.setAttribute("position", cell.position);

    return column;
}

function buildLine (start, end, color ) {
    var line = document.createElement('a-entity');        
    line.setAttribute('line', {
        start: start,
        end: end,
        color: color
    });
    return line;
}

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