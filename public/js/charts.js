window.onload = function() {

    google.charts.load('current', {
        'packages': ['gauge', 'corechart']
    });
    google.charts.setOnLoadCallback(drawChart);

   var lineCoreOptions = {
          title: 'Censo en tiempo real',
          curveType: 'function',
          legend: { position: 'bottom' }
    };

    var gaugeTemperatureOptions = {
            width: 600,
            height: 220,
            redFrom: 90,
            redTo: 100,
            yellowFrom: 75,
            yellowTo: 90,
            minorTicks: 5
    };

    var gaugeHumidityOptions = {
            width: 600,
            height: 220,
            redFrom: 90,
            redTo: 100,
            yellowFrom: 75,
            yellowTo: 90,
            minorTicks: 5
    };

    var gaugeQualityOptions = {
            width: 600,
            height: 220,
            redFrom: 90,
            redTo: 100,
            yellowFrom: 75,
            yellowTo: 90,
            minorTicks: 5
    };

    var nodeRegisters = [];

    function setDataRegisters(objectRegister) {
        nodeRegisters = [];
        dataTableLineCore = [];
        
        var nameNode = objectRegister.name;
        console.debug("node -> "+nameNode);
        createNodeTitle(nameNode);

        var header = [];
        var body = [];
          
        header.push("Date");
        body.push(new Date());

        for (indexSensor in objectRegister.sensors) {
              var nameSensor = objectRegister.sensors[indexSensor];
              var gDiv = createGaugeDiv(nameNode, nameSensor);

              if(gDiv){
                console.debug("-- Sensor name -> "+nameSensor);
                var gauge = new google.visualization.Gauge(gDiv);

                dataTableGauge = [];
                dataTableGauge.push(['Label', 'Value']);
                dataTableGauge.push([nameSensor, 0]);

                dataGauge = google.visualization.arrayToDataTable(dataTableGauge);
                gauge.draw(dataGauge, gaugeTemperatureOptions);

                header.push(nameSensor);
                body.push(0);
              }  
        }
        
        var lDiv = createLineCoreDiv(nameNode);
        if(lDiv){
            var chartLineCore = new google.visualization.LineChart(lDiv);
            dataTableLineCore.push(header);
            dataTableLineCore.push(body);

            dataLineCore = google.visualization.arrayToDataTable(dataTableLineCore);
            chartLineCore.draw(dataLineCore, lineCoreOptions);
            nodeRegisters.push(objectRegister);
        }
    }

    function pushData(emit){

    }

    function drawChart() {
        var socket = io.connect('http://' + document.domain + ':3300');
        socket.on('setDataRegisters', setDataRegisters);
        //socket.on('pushData', pushData);
    }


    function createLineCoreDiv(node){

     if(!document.getElementById("lineCoreDiv-"+node)){
        var linecore = document.createElement('div');
        linecore.id = "lineCoreDiv-"+node;
        linecore.className = 'col-lg-12 hidden-xs panel panel-default';
        linecore.style.cssText = 'height:260px;';
        document.getElementById('charts').appendChild(linecore);
        return linecore;
      }
 
      return null;
    }

    function createGaugeDiv(node, name){
      if(!document.getElementById(node+"-"+name)){
        var gauge = document.createElement('div');
        gauge.id = node+"-"+name;
        gauge.className = 'col-sm-6 col-md-4 col-xs-12';
        document.getElementById('charts').appendChild(gauge);
        return gauge;
      }
 
      return null;
    }

    function createNodeTitle(node){  
      if(!document.getElementById("title-"+node)){
        var title = document.createElement('h2');
        title.id = "title-"+node;
        title.className = 'page-header col-sm-12';
        title.appendChild(document.createTextNode("NODO: "+node));
        document.getElementById('charts').appendChild(title);
        return title;
      }
      return null;
    }
}