window.onload = function() {

    google.charts.load('current', {
        'packages': ['gauge', 'corechart']
    });
    google.charts.setOnLoadCallback(drawChart);


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

    function setDataRegisters(emit) {
        nodeRegisters = [];
        for (index in emit) {
            var nameNode = emit[index].name;
            console.debug("node -> "+nameNode);
            for (indexSensor in emit[index].sensors) {
              var nameSensor = emit[index].sensors[indexSensor];
              console.debug("-- Sensor name -> "+nameSensor);
              var gDiv = createGaugeDiv(nameNode, nameSensor);
              var gauge = new google.visualization.Gauge(gDiv);

              dataTableGauge = [];
              dataTableGauge.push(['Label', 'Value']);
              dataTableGauge.push([nameSensor, 0]);

              dataGauge = google.visualization.arrayToDataTable(dataTableGauge);
              gauge.draw(dataGauge, gaugeTemperatureOptions);

            }
            nodeRegisters.push(emit[index]);
        }
    }

    function pushData(emit){

    }

    function drawChart() {
        var socket = io.connect('http://' + document.domain + ':3300');

        socket.on('setDataRegisters', setDataRegisters);
        //socket.on('pushData', pushData);
    }

    function createGaugeDiv(node, name){
      if(!document.getElementById(node+"-"+name)){
        var gauge = document.createElement('div');
        gauge.id = node+"-"+name;
        gauge.className = 'block';
        document.getElementById('chartGauge').appendChild(gauge);
        return gauge;
      }
 
      return document.getElementById('chartGauge');
    }
}