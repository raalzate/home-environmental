window.onload = function() {

    google.charts.load('current', {
        'packages': ['gauge', 'corechart']
    });
    google.charts.setOnLoadCallback(drawChart);

    var dataGauge = [];
    var dataLineCore = [];
    var gaugeOptions = [];
    var lineCoreOptions = {
        title: 'Sensores en tiempo real',
        curveType: 'function',
        legend: {
            position: 'bottom'
        }
    };

    gaugeOptions['temperatura'] = {
        label: "Temperatura",
        options: {
            width: 620,
            height: 230,
            min: -14,
            max: 60,
            redFrom: 34,
            redTo: 60,
            yellowFrom: 24,
            yellowTo: 34,
            minorTicks: 5,
            majorTicks: ["__ Grados", "Frio", "Calido", "°C __"]
        }
    };

    gaugeOptions['humedad'] = {
        label: "Humedad",
        options: {
            width: 600,
            height: 220,
            redFrom: 90,
            redTo: 100,
            yellowFrom: 75,
            yellowTo: 90,
            minorTicks: 5
        }
    };

    gaugeOptions['calidad'] = {
        label: "Calidad Aire",
        options: {
            width: 600,
            height: 220,
            redFrom: 90,
            redTo: 100,
            yellowFrom: 75,
            yellowTo: 90,
            minorTicks: 5
        }
    };


    function setDataRegisters(objectRegister) {

        var nameNode = objectRegister.name;
        console.debug("node -> " + nameNode);

        if (createNodeTitle(nameNode)) {
            dataTableLineCore = [];

            //inicializa el objecto para las graficas
            dataGauge[nameNode] = [];
            dataLineCore[nameNode] = {};

            var header = [];
            var body = [];

            header.push("Date");
            body.push(new Date());

            for (indexSensor in objectRegister.sensors) {
                var nameSensor = objectRegister.sensors[indexSensor];
                var gDiv = createGaugeDiv(nameNode, nameSensor);

                if (gDiv) {
                    console.debug("-- Sensor name -> " + nameSensor);
                    var gauge = new google.visualization.Gauge(gDiv);

                    dataTableGauge = [];
                    dataTableGauge.push(['Label', 'Value']);
                    dataTableGauge.push([gaugeOptions[nameSensor].label, 0]);

                    header.push(nameSensor);
                    body.push(0);

                    var data = google.visualization.arrayToDataTable(dataTableGauge);
                    //agregar al guage los objectos  
                    dataGauge[nameNode].push({
                        nameSensor: nameSensor,
                        data: data,
                        gauge: gauge
                    });
                    //pinta el gauge
                    gauge.draw(data, gaugeOptions[nameSensor].options);
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

    function pushData(emit) {
        var rowLineCore = [new Date()];

        var node = emit.name;
        var sensors = emit.data;
        var nodeGauge = dataGauge[node];
        console.debug("**** Pindando datos para el nodo '" + node + "' ****");
        console.log(emit);
        for (var i in nodeGauge) {
            for (var j in sensors) {
                if (sensors[j].hasOwnProperty(nodeGauge[i].nameSensor)) {
                    var nameSensor = nodeGauge[i].nameSensor;
                    var value = parseFloat(sensors[j][nameSensor]);

                    console.debug("Pintar '" + nameSensor + "' con el valor: " + parseFloat(sensors[j][nameSensor]));
                    nodeGauge[i].data.setValue(0, 1, value);
                    nodeGauge[i].gauge.draw(nodeGauge[i].data, gaugeOptions[nameSensor].options);

                    rowLineCore.push(value);
                }
            }
        }
        console.log(dataLineCore);
        dataLineCore[node].data.addRow(rowLineCore);
        dataLineCore[node].lineCore.draw(dataLineCore[node].data, lineCoreOptions);
    }

    function drawChart() {
        var socket = io.connect('http://' + document.domain + ':3300');
        socket.on('setDataRegisters', setDataRegisters);
        socket.on('pushData', pushData);
    }


    function createLineCoreDiv(node) {

        if (!document.getElementById("lineCoreDiv-" + node)) {
            var linecore = document.createElement('div');
            linecore.id = "lineCoreDiv-" + node;
            linecore.className = 'col-lg-12 hidden-xs panel panel-default';
            linecore.style.cssText = 'height:260px;';
            document.getElementById('charts').appendChild(linecore);
            return linecore;
        }

        return null;
    }

    function createGaugeDiv(node, name) {
        if (!document.getElementById(node + "-" + name)) {
            var gauge = document.createElement('div');
            gauge.id = node + "-" + name;
            gauge.className = 'col-sm-6 col-md-4 col-xs-12';
            document.getElementById('charts').appendChild(gauge);
            return gauge;
        }

        return null;
    }

    function createNodeTitle(node) {
        if (!document.getElementById("title-" + node)) {
            var title = document.createElement('h2');
            title.id = "title-" + node;
            title.className = 'page-header col-sm-12';
            title.appendChild(document.createTextNode("NODO: " + node));
            document.getElementById('charts').appendChild(title);
            return title;
        }
        return null;
    }
}