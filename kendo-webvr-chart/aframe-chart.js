AFRAME.registerComponent('chart', {
    schema: {
        xAxis: { type: 'string' },
        yAxis: { type: 'string' },
        zAxis: { type: 'string' },
        sizeField: { type: 'string' },
        itemTitle: { type: 'string' },
        dataSrc: { type: 'string' },
        xAxisScale: { type: 'number', default: 1 },
        yAxisScale: { type: 'number', default: 1 },
        zAxisScale: { type: 'number', default: 1 },
        sizeScale: { type: 'number', default: 1 },
        color: { type: 'string', default: '#fff' }
    }, 
    init: function () {
        this.generateGrid();
		this.createNavigator();
		this.createNumbering();
		this.populateChart(this.data.dataSrc);
		this.createTooltipElements();
    },
    axisNumberingConfigurator: {
        front: {
            x: "0 0 0",
            y: "0 0 0",
            z: "0 0 0"
        },
        right: {
            x: "0 0 0",
            y: "0 90 0",
            z: "-90 0 0"
        },
        back: {
            x: "0 180 0",
            y: "0 180 0",
            z: "0 0 0"
        },
        left: {
            x: "0 0 0",
            y: "0 -90 0",
            z: "-90 180 0"
        },
        top: {
            x: "-90 0 0",
            y: "0 0 0",
            z: "180 -90 -90"
        },
        bottom: {
            x: "90 0 0",
            y: "0 0 0",
            z: "0 -90 -90"
        }
    },
    colors: [ 
        '#1976d2',
        '#9ab342', 
        '#fff443',
        '#11909f', 
        '#3949ab',
        '#d7d931',
        '#7cb342',
        '#8e24aa',
        '#5e35b1',
        '#8d1269',
        '#00acc1',
        '#7d0f3b',
        '#039be5',
        '#9d0441',
        '#7f32c1',
        '#43a047',
        '#e53935',
        '#c2185b',
        '#fb8c00',
        '#ffb300',
        '#f4511e',
        '#00897b',
        '#c0ca33',
        '#fdd835',
        '#afb42b'
    ],
    navigatorSegmentsConfiguration: [{
        dataNavigation: "90 0 0",
        rotation: "0 0 0",
        dataFront: "top",
        visible: "true"
    },{
        dataNavigation: "0 90 0",
        rotation: "0 0 90",
        dataFront: "left",
        visible: "true"
    },{
        dataNavigation: "-90 0 0",
        rotation: "0 0 180",
        dataFront: "bottom",
        visible: "true"
    },{
        dataNavigation: "0 -90 0",
        rotation: "0 0 -90",
        dataFront: "right",
        visible: "true"
    },{
        dataNavigation: "0 0 0",
        rotation: "90 0 0",
        dataFront: "front",
        visible: "true"
    },{
        dataNavigation: "0 180 0",
        rotation: "90 180 0",
        dataFront: "back",
        visible: "true"
    },{
        dataNavigation: "30 -45 -20",
        rotation: "0 132 55",
        dataFront: "",
        visible: "false"
    },{
        dataNavigation: "-30 -135 -20",
        rotation: "0 -132 55",
        dataFront: ""
    },{
        dataNavigation: "-30 135 20",
        rotation: "0 -48 55",
        dataFront: "",
        visible: "true"
    },{
        dataNavigation: "30 45 20",
        rotation: "0 48 55",
        dataFront: "",
        visible: "true"
    },{
        dataNavigation: "-30 45 -20",
        rotation: "-19 35 126",
        dataFront: "",
        visible: "true"
    },{
        dataNavigation: "-30 -45 20",
        rotation: "-19 118 126",
        dataFront: "",
        visible: "true"
    },{
        dataNavigation: "30 135 -20",
        rotation: "-19 -62 126",
        dataFront: ""
    },{
        dataNavigation: "30 -135 20",
        rotation: "-19 -145 126",
        dataFront: "",
        visible: "true"
    }],
    loadMultiColorsForData: function(index, element) {
        element.setAttribute('color', this.colors[index]);

        return element;
    },
    loadSingleColorForData: function(element) {
        element.setAttribute('color', this.data.color);

        return element;
    },
    loadGreenRedShadingForData: function(profit, element) {
        if (profit > 0) {
            var profitInMilions = profit / 1000000;
            var green = Math.floor(128 + profitInMilions * 8);
            var redAndBlue = Math.floor(128 - profitInMilions * 8);

            element.setAttribute('color', 'rgb(' + redAndBlue + ', ' + green + ', ' + redAndBlue + ')');
        } else {
            var profitInMilions = profit / -1000000;
            var red = Math.floor(128 + profitInMilions * 8);
            var greenAndBlue = Math.floor(128 - profitInMilions * 8);

            element.setAttribute('color', 'rgb(' + red + ', ' + greenAndBlue + ', ' + greenAndBlue + ')');
        }

        return element;
    },
    createTooltipPlane: function(height, position) {
        var plane = document.createElement('a-plane');

        plane.setAttribute('color', '#3f5971');
        plane.setAttribute('material', 'transparent:true; opacity:0.8');
        plane.setAttribute('width', '12');
        plane.setAttribute('height', height);
        plane.setAttribute('position', position);
        
        return plane;
    },
    createTooltipElements: function() {
        var camera = document.getElementById('camera-entity');
        var header = this.createTooltipPlane('2.2', '7.5 0 -40');
        var body = this.createTooltipPlane('6.2', '7.5 -4.2 -40');

        body.setAttribute('visible', 'false');
        body.setAttribute('id', 'extended-tooltip');

        camera.appendChild(header);
        camera.appendChild(body);
    },
    createAxisLabel: function(position, value, rotation) {
        var axisLabel = document.createElement('a-text');

        axisLabel.setAttribute('width', '150');
        axisLabel.setAttribute('color', '#3f5971');
        axisLabel.setAttribute('position', position);
        axisLabel.setAttribute('value', value);
        axisLabel.setAttribute('rotation', rotation);

        return axisLabel;
    },
    createNumberStops: function(id, rotation) {
        var numberStops = document.createElement('a-entity');

        numberStops.setAttribute('id', id);
        numberStops.setAttribute('rotation', rotation);

        return numberStops;
    },
    createSingleStop: function(position, value, rotation) {
        var stop = document.createElement('a-text');

        stop.setAttribute('width', '150');
        stop.setAttribute('color', '#3f5971');
        stop.setAttribute('position', position);
        stop.setAttribute('value', value.toString());
        stop.setAttribute('rotation', rotation);

        return stop;
    },
    createNumbering: function() {
        var labelsContainer = document.createElement('a-entity');
        var numberStopsX = this.createNumberStops('number-stops-x', '0 0 0');
        var numberStopsY = this.createNumberStops('number-stops-y', '0 90 0');
        var numberStopsZ = this.createNumberStops('number-stops-z', '-90 0 0');

        var axisLabelX = this.createAxisLabel('79 5 1', 'total income 2017', '0 0 0');
        numberStopsX.appendChild(axisLabelX);

        var axisLabelY = this.createAxisLabel('-5 100 1', 'profit 2017', '0 0 90');
        numberStopsY.appendChild(axisLabelY);

        var axisLabelZ = this.createAxisLabel('1 -128 5', 'income change 2017 vs 2016', '0 90 90');
        numberStopsZ.appendChild(axisLabelZ);

        for(var i = -140; i <= 140; i += 20) {
            if (i === 0){
                continue;
            } else {
                var xStop = this.createSingleStop((i - 6).toString() + ', -3, 1', i, '0 0 0');
                numberStopsX.appendChild(xStop);

                var zStop = this.createSingleStop('1, ' + (i - 6).toString() + ', -3', i, '0 90 90');
                numberStopsZ.appendChild(zStop);

                var yStop = this.createSingleStop('3, ' + i.toString() + ', 1', i, '0 0 0');
                numberStopsY.appendChild(yStop);
            }
        }

        labelsContainer.appendChild(numberStopsX);
        labelsContainer.appendChild(numberStopsY);
        labelsContainer.appendChild(numberStopsZ);

        this.el.appendChild(labelsContainer);
    },
    createNavigatorSegment: function(configurationObject) {
        var element = document.createElement('a-sphere');
            
        element.setAttribute('color', this.data.color);
        element.setAttribute('theta-length', '18');
        element.setAttribute('radius', '150');
        element.setAttribute('material', 'side: double; transparent:true; opacity:0.2');
        element.setAttribute('data-navigation', configurationObject.dataNavigation);
        element.setAttribute('rotation', configurationObject.rotation);
        element.setAttribute('data-front', configurationObject.dataFront);
        element.setAttribute('visible', configurationObject.visible);

        return element;
    },
    createNavigator: function() {
        var that = this;
        var data = that.data;
        var navigatorElement = document.createElement('a-entity');

        for(var i = 0; i < that.navigatorSegmentsConfiguration.length; i ++) {
            var configurationObject = that.navigatorSegmentsConfiguration[i];
            var element = that.createNavigatorSegment(configurationObject);

            element.addEventListener('mouseenter', function(e) {
                var segment = e.target;
                segment.setAttribute('material', { side: 'double', transparent: true, opacity: 0.4 });
            });

            element.addEventListener('mouseleave', function(e) {
                var segment = e.target;
                segment.setAttribute('material', { side: 'double', transparent: true, opacity: 0.2 });
            });

            element.addEventListener('click', function(e) {
                var segment = e.target;
                var segments = segment.parentElement.children;
                var navigationPosition = segment.getAttribute('data-navigation');
                var frontPosition = segment.getAttribute('data-front');
                var chart = that.el;
                var navigationAnimation = document.createElement('a-animation');
                var scaleAnimation = document.createElement('a-animation');
                var xLabels = document.getElementById('number-stops-x');
                var yLabels = document.getElementById('number-stops-y');
                var zLabels = document.getElementById('number-stops-z');

                for(var i = 0; i < segments.length; i ++) {
                    segments[i].setAttribute('visible', 'true');
                }

                segment.setAttribute('visible', 'false');

                navigationAnimation.setAttribute('attribute', 'rotation');
                navigationAnimation.setAttribute('to', navigationPosition);
                navigationAnimation.setAttribute('dur', 1000);

                scaleAnimation.setAttribute('attribute', 'scale');
                scaleAnimation.setAttribute('dur', 1000);

                if (!!frontPosition && frontPosition.length > 0) {
                    var newLabelPositions = that.axisNumberingConfigurator[frontPosition];

                    xLabels.setAttribute('visible', 'true');
                    yLabels.setAttribute('visible', 'true');
                    zLabels.setAttribute('visible', 'true');

                    xLabels.setAttribute('rotation', newLabelPositions.x);
                    yLabels.setAttribute('rotation', newLabelPositions.y);
                    zLabels.setAttribute('rotation', newLabelPositions.z);

                    scaleAnimation.setAttribute('to', '0.7 0.7 0.7');
                } else {
                    xLabels.setAttribute('visible', 'false');
                    yLabels.setAttribute('visible', 'false');
                    zLabels.setAttribute('visible', 'false');

                    scaleAnimation.setAttribute('to', '0.9 0.9 0.9');
                }

                that.el.appendChild(navigationAnimation);
                that.el.appendChild(scaleAnimation);
            });

            navigatorElement.appendChild(element);
        }
        
        that.el.appendChild(navigatorElement);
    },
    generateGrid: function() {
        var that = this;
        var data = that.data;
        var container = that.el;

        for(var i = -70; i <= 70; i ++) {
            var xy1 = document.createElement('a-entity');
            var xz1 = document.createElement('a-entity');
            var yz1 = document.createElement('a-entity');

            var xy2 = document.createElement('a-entity');
            var xz2 = document.createElement('a-entity');
            var yz2 = document.createElement('a-entity');

            var multiplicator = 2;
            var baseGreatestValue = 70;
            var greatestValue = baseGreatestValue*multiplicator;
            var multiplayedIndex = i*multiplicator;

            if (i === 0) {
                var zMajor = document.createElement('a-cylinder');

                zMajor.setAttribute('radius', '0.2');
                zMajor.setAttribute('height', (greatestValue*multiplicator).toString());
                zMajor.setAttribute('color', '#000');
                zMajor.setAttribute('rotation', '90 0 0');
                container.appendChild(zMajor);

                var yMajor = zMajor.cloneNode(true);
                yMajor.setAttribute('rotation', '0 0 0');
                container.appendChild(yMajor);

                var xMajor = zMajor.cloneNode(true);
                xMajor.setAttribute('rotation', '0 0 90');
                container.appendChild(xMajor);

                var zMajor = document.createElement('a-entity');
                zMajor.setAttribute('height', (greatestValue*multiplicator).toString());
                zMajor.setAttribute('color', '#000');
                zMajor.setAttribute('rotation', '90 0 0');
                container.appendChild(zMajor);
            } else if(i % 10 === 0) {
                xy1.setAttribute('line', {
                    start: multiplayedIndex.toString() + ", " + -1*greatestValue + ", 0",
                    end: multiplayedIndex.toString() + ", " + greatestValue + ", 0",
                    color: "#bbb"
                });

                xz1.setAttribute('line', {
                    start: -1*greatestValue.toString() + ", 0, " + multiplayedIndex,
                    end: greatestValue.toString() + ", 0, " + multiplayedIndex,
                    color: "#bbb"
                });

                yz1.setAttribute('line', {
                    start: "0, " + multiplayedIndex + ", -140",
                    end: "0, " + multiplayedIndex + ", " + greatestValue,
                    color: "#bbb"
                });

                xy2.setAttribute('line', {
                    start: -1*greatestValue.toString() + ", " + multiplayedIndex.toString() + ", 0",
                    end: greatestValue.toString() + ", " + multiplayedIndex.toString() + ", 0",
                    color: "#bbb"
                });

                xz2.setAttribute('line', {
                    start: multiplayedIndex.toString() + ", 0, " + -1*greatestValue.toString(),
                    end: multiplayedIndex.toString() + ", 0, " + greatestValue.toString(),
                    color: "#bbb"
                });

                yz2.setAttribute('line', {
                    start: "0, " + -1*greatestValue +", " + multiplayedIndex,
                    end: "0, " + greatestValue +", " + multiplayedIndex,
                    color: "#bbb"
                });
            }else {
                xy1.setAttribute('line', {
                    start: multiplayedIndex.toString() + ", " + -1*greatestValue + ", 0",
                    end: multiplayedIndex.toString() + ", " + greatestValue + ", 0",
                    color: "#ddd"
                });

                xz1.setAttribute('line', {
                    start: -1*greatestValue.toString() + ", 0, " + multiplayedIndex,
                    end: greatestValue.toString() + ", 0, " + multiplayedIndex,
                    color: "#ccc"
                });

                yz1.setAttribute('line', {
                    start: "0, " + multiplayedIndex + ", " + -1*greatestValue,
                    end: "0, " + multiplayedIndex + ", " + greatestValue,
                    color: "#ddd"
                });

                xy2.setAttribute('line', {
                    start: -1*greatestValue.toString() + ", " + multiplayedIndex.toString() + ", 0",
                    end: greatestValue.toString() + ", " + multiplayedIndex.toString() + ", 0",
                    color: "#ddd"
                });

                xz2.setAttribute('line', {
                    start: multiplayedIndex.toString() + ", 0, " + -1*greatestValue,
                    end: multiplayedIndex.toString() + ", 0, " + greatestValue,
                    color: "#ccc"
                });

                yz2.setAttribute('line', {
                    start: "0, " + -1*greatestValue + ", " + multiplayedIndex,
                    end: "0, " + greatestValue + ", " + multiplayedIndex,
                    color: "#ddd"
                });
            }

            container.appendChild(xy1);
            container.appendChild(xz1);
            container.appendChild(yz1);

            container.appendChild(xy2);
            container.appendChild(xz2);
            container.appendChild(yz2);
        }
    },
    populateChart: function() {
        var that = this;
        var data = that.data;

        $.getJSON(this.data.dataSrc, function(json) {
            for(var i = 0; i < json.data.length; i ++) {
                var item = json.data[i];

                var element = document.createElement('a-sphere');
                var xPoint = item[data.xAxis] * data.xAxisScale; // 1000000;
                var yPoint = item[data.yAxis] * data.yAxisScale; // 100000;
                var zPoint = item[data.zAxis] * data.zAxisScale;
                var position = xPoint.toString() + ' ' + yPoint + ' ' + zPoint.toString();

                element = that.loadMultiColorsForData(i, element);

                element.setAttribute('position', position );
                element.setAttribute('radius', 0 );
                element.setAttribute('material', 'transparent:true; opacity:0.65');
                element.setAttribute('class', 'chart-item');

                for (var name in item) {
                    if (item.hasOwnProperty(name)) {
                        element.setAttribute('data-' + name, item[name]);
                    }
                }

                var animation = document.createElement('a-animation');
                animation.setAttribute('attribute', 'radius');
                animation.setAttribute('to', item[data.sizeField] * data.sizeScale); // 70
                animation.setAttribute('dur', 1000);

                element.appendChild(animation);

                element.addEventListener('mouseenter', function(e) {
                    var point = e.target;
                    var tooltip = document.querySelector('#camera-entity a-plane');
                    var titleAttribute = 'data-' + data.itemTitle;

                    tooltip.setAttribute('text', {
                        color: '#fff',
                        value: point.getAttribute(titleAttribute),
                        width: 20 * 1.5,
                        xOffset: 21 / 2 - 0.8
                    });

                    tooltip.setAttribute('visible', 'true');

                    point.setAttribute('material', 'transparent:true; opacity:1');
                });

                element.addEventListener('mouseleave', function(e) {
                    var point = e.target;
                    var tooltip = document.querySelector('#camera-entity a-plane');
                    var extendedTooltip = document.querySelector('#extended-tooltip');

                    tooltip.setAttribute('visible', 'false');
                    extendedTooltip.setAttribute('visible', 'false');

                    point.setAttribute('material', 'transparent:true; opacity:0.7');
                });

                element.addEventListener('click', function(e) {
                    var point = e.target;
                    var extendedTooltip = document.querySelector('#extended-tooltip');

                    extendedTooltip.setAttribute('text', {
                        color: '#fff',
                        value: data.sizeField + ': ' + point.getAttribute('data-' + data.sizeField) + '\n' +
                                data.xAxis + ': ' + kendo.toString(Number(point.getAttribute('data-' + data.xAxis)), 'c0') + '\n' +
                                'income change: ' + point.getAttribute('data-' + data.zAxis) + '%' + '\n' +
                                data.yAxis + ': ' + kendo.toString(Number(point.getAttribute('data-' + data.yAxis)), 'c0'),
                        width: 14 * 1.5,
                        xOffset: 12/2 - 0.8,
                        lineHeight: 60
                    });

                    extendedTooltip.setAttribute('visible', 'true');
                });

                that.el.appendChild(element);
            }
        });
    }
});

AFRAME.registerPrimitive('kendo-webvr-chart', {
    defaultComponents: {
        chart: {}
    },
    mappings: {
        'x-axis': 'chart.xAxis',
        'y-axis': 'chart.yAxis',
        'z-axis': 'chart.zAxis',
        'size-field': 'chart.sizeField',
        'item-title': 'chart.itemTitle',
        'data-src': 'chart.dataSrc',
        'x-axis-scale': 'chart.xAxisScale',
        'y-axis-scale': 'chart.yAxisScale',
        'z-axis-scale': 'chart.zAxisScale',
        'size-scale': 'chart.sizeScale',
        'color': 'chart.color'
    }
});