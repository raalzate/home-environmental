
window.onload = function() {

  google.charts.load('current', {'packages':['gauge', 'corechart']});
  google.charts.setOnLoadCallback(drawChart);
  

  function drawChart() {

      var chartGauge  = new google.visualization.Gauge(document
        .getElementById('chartGauge_div'));
      var chartLineCore  = new google.visualization.LineChart(document
        .getElementById('chartLineCore_div'));

      var socket            = io.connect('http://'+document.domain+':3300');
      var dataGauge         = null;
      var dataLineCore      = null;
      var dataTableGauge    = [];
      var dataTableLineCore = [];

      var gaugeOptions = {
          width: 600, height: 220,
          redFrom: 90, redTo: 100,
          yellowFrom:75, yellowTo: 90,
          minorTicks: 5
      };


      var lineCoreOptions = {
          title: 'Company Performance',
          curveType: 'function',
          legend: { position: 'bottom' }
      };

      socket.on('setSensor', function (emit) {
          dataTableGauge    = [];
          dataTableLineCore = [];

          var header = [];
          var body = [];
          
          header.push("Date");
          body.push(new Date());

          dataTableGauge.push(['Label', 'Value']);

          for(index in emit){
            dataTableGauge.push([emit[index].name, 0]);
            
            header.push(emit[index].name);
            body.push(0);
          }

          dataTableLineCore.push(header);
          dataTableLineCore.push(body);

          dataGauge    = google.visualization.arrayToDataTable(dataTableGauge);
          dataLineCore = google.visualization.arrayToDataTable(dataTableLineCore);

          chartGauge.draw(dataGauge, gaugeOptions);
          chartLineCore.draw(dataLineCore, lineCoreOptions);
      });


      socket.on('pushSensor', function (emit) {

        var rowLineCore = [new Date()];
        var index = 0; 
            
        for(var i in dataTableGauge) {
          if(emit.name == dataTableGauge[i][0]) {
            index = i - 1;
          }

          if(i > 0) {
            rowLineCore.push(parseFloat(emit.valueSensor));
          }
          
        }
        console.log(rowLineCore);
        dataLineCore.addRow(rowLineCore);
        dataGauge.setValue(index, 1, parseFloat(emit.valueSensor));

        chartGauge.draw(dataGauge, gaugeOptions);
        chartLineCore.draw(dataLineCore, lineCoreOptions);
          
      });
  }
}