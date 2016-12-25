window.onload = function() {

    google.charts.load('current', {
        'packages': ['gauge', 'corechart']
    });
    google.charts.setOnLoadCallback(initAllCharts);

    var dataInfo = [];
    var dataLineCore = [];
    var gaugeOptions = [];
    var lineCoreOptions = {
        title: 'Sensores en tiempo real',
        curveType: 'function',
        legend: {
            position: 'bottom'
        }
    };

    //esta funcion se encarga de inicializar los datos y los widget
    function setDataRegisters(objectRegister) {

        var nameNode = objectRegister.name;
        console.debug("node -> " + nameNode);

        if (createNodeTitle(nameNode)) {
            dataTableLineCore = [];

            //inicializa el objecto para las graficas
            dataLineCore[nameNode] = {};
            dataInfo[nameNode] = [];

            var header = [];
            var body = [];

            header.push("Date");
            body.push(new Date());
            console.debug("sensores obtenidos del registro -> ");
            console.debug(objectRegister.sensors);

            for (indexSensor in objectRegister.sensors) {
                var nameSensor = objectRegister.sensors[indexSensor];
                var canvas = createCanvasDiv(nameNode, nameSensor);
                if (canvas) {
                    console.debug("-- Sensor name -> " + nameSensor);
                    header.push(nameSensor);
                    body.push(0);
                    setingValuesSensors(nameSensor, canvas.id, 0);

                    dataTableGauge = [];
                    dataTableGauge.push(['Label', 'Value']);
                    dataTableGauge.push([nameSensor, 0]);
                    var data = google.visualization.arrayToDataTable(dataTableGauge);

                    dataInfo[nameNode].push({
                        nameSensor: nameSensor,
                        id: canvas.id,
                        data: data
                    });
                }
            }

            //pintar la linea de tiempo 
            var lDiv = createLineCoreDiv(nameNode);
            if (lDiv) {
                var lineCore = new google.visualization.LineChart(lDiv);

                dataTableLineCore.push(header);
                dataTableLineCore.push(body);

                var data = google.visualization.arrayToDataTable(dataTableLineCore);
                dataLineCore[nameNode] = {
                    data: data,
                    lineCore: lineCore
                };

                lineCore.draw(data, lineCoreOptions);
            }
        }


    }

    function setingValuesSensors(nameSensor, id, value) {
        if (nameSensor == "temperatura") {
            graphThermometer(id, value);
        }
        if (nameSensor == "humedad") {
            graphHumedad(id, value);
        }

        if (nameSensor == "calidad") {
            graphCalidad(id, value);
        }

        if (nameSensor == "anemometro") {
            graphAnemometro(id, value);
        }

        if (nameSensor == "direccion-viento") {
            graphDireccion(id, value);
        }

    }

    function pushData(emit) {
        var rowLineCore = [new Date()];

        var node = emit.node;
        var sensor = emit.name;
        var nodeDataInfo = dataInfo[node];

        console.debug("**** Pindando datos para el nodo '" + node + "' ****");

        for (var i in nodeDataInfo) {
            if (sensor == nodeDataInfo[i].nameSensor) {
                var nameSensor = nodeDataInfo[i].nameSensor;
                var id = nodeDataInfo[i].id;
                var value = parseFloat(emit.data);

                console.debug("Pintar '" + nameSensor + "' con el valor: " + value);
                successSetData(node, nameSensor);
                nodeDataInfo[i].data.setValue(0, 1, value);
                setingValuesSensors(nameSensor, id, value);
                rowLineCore.push(value);
            } else {
                rowLineCore.push(nodeDataInfo[i].data.getValue(0, 1));
            }

        }
        console.log(dataLineCore);
        dataLineCore[node].data.addRow(rowLineCore);
        dataLineCore[node].lineCore.draw(dataLineCore[node].data, lineCoreOptions);
    }

    function successSetData(node, nameSensor){
        document.getElementById("panel-"+node + "-" + nameSensor).className = "panel panel-success";
        setTimeout(function (){
            document.getElementById("panel-"+node + "-" + nameSensor).className 
                = "panel panel-info";
        }, 1500);
    }

    
    function initAllCharts() {
        var socket = io.connect('http://' + document.domain + ':3300');
        socket.on('setDataRegisters', setDataRegisters);
        socket.on('pushData', pushData);
    }


    function createLineCoreDiv(node) {

        if (!document.getElementById("lineCoreDiv-" + node)) {
            var linecore = document.createElement('div');
            linecore.id = "lineCoreDiv-" + node;
            linecore.className = 'col-lg-12 hidden-xs panel';
            linecore.style.cssText = 'height:260px;';
            document.getElementById('charts').appendChild(linecore);
            return linecore;
        }

        return null;
    }

    function createCanvasDiv(node, nameSensor) {
        if (!document.getElementById(node + "-" + nameSensor)) {
            var canvas = document.createElement('canvas');
            canvas.id = node + "-" + nameSensor;

            var container = document.createElement('center');
            var body = document.createElement("div");
            var title = document.createElement("div");
            var content = document.createElement("div");

            title.innerHTML = getBtnConfig(canvas.id);

            if (nameSensor == "temperatura") {
                canvas.setAttribute('height', '350');
                canvas.setAttribute('width', '175');
                title.innerHTML += "<h3 class='panel-title'>Temperatura en °C</h3>";
            }
            if (nameSensor == "humedad") {
                canvas.setAttribute('height', '350');
                canvas.setAttribute('width', '500');
                title.innerHTML += "<h3 class='panel-title'>Humedad relativa</h3>";
            }
            if (nameSensor == "calidad") {
                canvas.setAttribute('height', '350');
                canvas.setAttribute('width', '500');
                title.innerHTML += "<h3 class='panel-title'>Calidad del aire PM10 µg/m³</h3>";
            }

            if (nameSensor == "anemometro") {
                canvas.setAttribute('height', '300');
                canvas.setAttribute('width', '300');
                title.innerHTML += "<h3 class='panel-title'>Anemometro en K/h</h3>";
            }

            if (nameSensor == "direccion-viento") {
                canvas.setAttribute('height', '300');
                canvas.setAttribute('width', '300');
                title.innerHTML += "<h3 class='panel-title'>Dirección del viento</h3>";
            }

            container.className = 'col-sm-6 col-md-6 col-xs-12';
           
            content.className = "panel panel-info";
            content.id = "panel-"+canvas.id;

            title.className = "panel-heading";
            body.className = "panel-body";
            body.appendChild(canvas);

            content.appendChild(title);
            content.appendChild(body);
            container.appendChild(content);

            document.getElementById('charts').appendChild(container);
            return canvas;
        }

        return null;
    }

    function createNodeTitle(node) {
        if (!document.getElementById("title-" + node)) {
            var title = document.createElement('h2');
            title.id = "title-" + node;
            title.className = 'page-header col-sm-12';

            var link = document.createElement('span');
            var textNode = "<a href='/charts/" + node + "' title='Ver datos de este nodo'>NODO: " + node.toUpperCase() + "</a>";
            link.innerHTML = textNode;
            title.appendChild(link);

            document.getElementById('charts').appendChild(title);

            var item = document.createElement('li');
            item.id = "item-" + node;
            item.className = '';
            item.innerHTML = "<a href='#" + title.id + "'>" + node.toUpperCase() + "</a>";

            document.getElementById('menu-sensor').appendChild(item);


            return title;
        }
        return null;
    }


    function getBtnConfig(id){
        var html = '<div class="dropdown pull-right">';
         html += '<button type="button" data-toggle="dropdown" class="btn dropdown-toggle glyphicon glyphicon-cog"  style="margin-top: -8px;margin-right: -12px;padding: 4px;">';
         html += '<span class="caret"></span></button>';
         html += '<ul role="menu" class="dropdown-menu">';
         html += '<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Agregar Reglas</a></li>';
         html += '<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Ver Estadisticas</a></li>';
         html += '<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Deshabilitar Sensor</a></li>';
         html += '</ul></div>';
        return html;
    }

    function graphHumedad(id, value) {

        return new RGraph.VProgress({
            id: id,
            min: 0,
            max: 100,
            value: value,
            options: {
                textAccessible: true,
                colors: ['pink'],
                scale: {
                    decimals: 1
                },
                gutter: {
                    left: 225,
                    right: 225
                },
                margin: 10,
                tickmarks: {
                    inner: true
                }
            }
        }).draw();

    }


    function graphThermometer(id, value) {
        return new RGraph.Thermometer({
            id: id,
            min: 0,
            max: 55,
            value: value,
            options: {
                textAccessible: true,
                scale: {
                    visible: true,
                    decimals: 2
                },
                gutter: {
                    left: 60,
                    right: 60
                },
                'shadow.color': '#ccc',
                'shadow.offsetx': 2,
                'shadow.offsety': 2,
                'shadow.blur': 5
            }
        }).draw();
    }

    function graphCalidad(id, value) {
        return new RGraph.Meter({
            id: id,
            min: 0,
            max: 300,
            value: value,
            options: {
                anglesStart: RGraph.PI + 0.5,
                anglesEnd: RGraph.TWOPI - 0.5,
                linewidthSegments: 15,
                textSize: 16,
                strokestyle: 'white',
                segmentRadiusStart: 155,
                border: 0,
                tickmarksSmallNum: 0,
                tickmarksBigNum: 0,
                adjustable: true
            }
        }).on('beforedraw', function(obj) {
            RGraph.clear(obj.canvas, 'white');
        }).draw();
    }

    function graphAnemometro(id, value) {
        return new RGraph.Gauge({
            id: id,
            min: 0,
            max: 300,
            value: value,
            options: {
                textSize: 12,
                scaleDecimals: 0,
                tickmarks: {
                    small: 50,
                    big: 5
                },
                title: {
                    top: {
                        self: 'Velocidad',
                        size: 16,
                        pos: 0.25
                    },
                    bottom: {
                        self: 'K/h',
                        color: '#aaa',
                        size: 14
                    }
                }
            }
        }).draw();
    }

    function graphDireccion(id, value) {
        return new RGraph.Odometer({
            id: id,
            min: 0,
            max: 12,
            value: value
          
        }).draw();
    }
}