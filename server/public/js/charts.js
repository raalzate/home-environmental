window.onload = function() {

    google.charts.load('current', {
        'packages': ['gauge', 'corechart']
    });
    google.charts.setOnLoadCallback(initAllCharts);

    var renderSender = [];
    var dataInfo = [];
    var dataLineCore = [];
    var gaugeOptions = [];

    var widgetTitle = {
        "temperatura":"Temperatura en °C",
        "humedad":"Humedad Ambiente",
        "calidad": "Calidad del Aire",
        "direccion":"Direccion del viento"
    };
    var widgets = {
        "": function(id){wg_default(id, renderSender)},
        "temperatura": function(id){wg_thermometer(id, renderSender)},
        "humedad": function(id) {wg_humididy(id, renderSender)},
        "calidad":function(id) {wg_quality(id, renderSender)},
        "direccion":function(id) {wg_vane(id, renderSender)}
    }
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
                var divWidget = createDivWidget(nameNode, nameSensor);
                if (divWidget) {
                    console.debug("-- Sensor name -> " + nameSensor);
                    header.push(nameSensor);
                    body.push(0);

                    widgets[nameSensor](divWidget.id);

                    dataTableGauge = [];
                    dataTableGauge.push(['Label', 'Value']);
                    dataTableGauge.push([nameSensor, 0]);
                    var data = google.visualization.arrayToDataTable(dataTableGauge);

                    dataInfo[nameNode].push({
                        nameSensor: nameSensor,
                        id: divWidget.id,
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

    function renderSenderValue(id, value){
        if(renderSender.hasOwnProperty(id)){
            renderSender[id].feedData("&value=" + value);
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
                renderSenderValue(id, value);
                rowLineCore.push(value);
            } else {
                rowLineCore.push(nodeDataInfo[i].data.getValue(0, 1));
            }

        }
        console.log(dataLineCore);
        dataLineCore[node].data.addRow(rowLineCore);
        dataLineCore[node].lineCore.draw(dataLineCore[node].data, lineCoreOptions);
    }

    function successSetData(node, nameSensor) {
        document.getElementById("panel-" + node + "-" + nameSensor).className = "panel panel-success";
        setTimeout(function() {
            document.getElementById("panel-" + node + "-" + nameSensor).className = "panel panel-info";
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

    function createDivWidget(node, nameSensor) {
        if (!document.getElementById(node + "-" + nameSensor)) {
            var divWidget = document.createElement('div');
            divWidget.id = node + "-" + nameSensor;

            var container = document.createElement('center');
            var body = document.createElement("div");
            var title = document.createElement("div");
            var content = document.createElement("div");

            title.innerHTML = getBtnConfig(node, nameSensor);
            title.innerHTML += "<h3 class='panel-title'>"+widgetTitle[nameSensor]+"</h3>";
            
            container.className = 'col-sm-4 col-md-4 col-xs-12';

            content.className = "panel panel-info";
            content.id = "panel-" + divWidget.id;

            title.className = "panel-heading";
            body.className = "panel-body";
            body.appendChild(divWidget);

            content.appendChild(title);
            content.appendChild(body);
            container.appendChild(content);

            document.getElementById('charts').appendChild(container);
            return divWidget;
        }

        return null;
    }

    function createNodeTitle(node) {
        if (!document.getElementById("title-" + node)) {
            var title = document.createElement('h2');
            title.id = "title-" + node;
            title.className = 'page-header col-sm-12';

            var link = document.createElement('span');
            link.innerHTML = "<a href='/charts/" + node + "' title='Ver datos de este nodo'>NODO: " + node.toUpperCase() + "</a>";
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


    function getBtnConfig(node, nameSensor) {
        var html = '<div class="dropdown pull-right">';
        html += '<button type="button" data-toggle="dropdown" class="btn dropdown-toggle glyphicon glyphicon-cog"  style="margin-top: -8px;margin-right: -12px;padding: 4px;background-color: transparent;">';
        html += '<span class="caret"></span></button>';
        html += '<ul role="menu" class="dropdown-menu">';
        html += '<li role="presentation"><a role="menuitem" tabindex="-1" href="/charts/'+node+'/'+nameSensor+'">Ver Estadisticas</a></li>';
        html += '<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Deshabilitar Sensor</a></li>';
        html += '</ul></div>';
        return html;
    }
    
}