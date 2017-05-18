window.onload = function() {

    google.charts.load('current', {
        'packages': ['corechart']
    });
    google.charts.setOnLoadCallback(drawChart);
  

    function drawChart() {
        var params = window.location.pathname.split("/");
        document.getElementById("node-name-title").innerHTML = params[2].toUpperCase();
        
        var url = 'http://' + document.domain + ':3300/rest/data/' + params[2];
        if(params[3]){
            url = url + '/' + params[3];
        }
        
        $.get(url, function(response) {

            var sensor = [];

            //map data for sensor
            for (r in response) {
                if (sensor[response[r].name]) {
                    sensor[response[r].name].push([response[r].intoDate, response[r].data]);
                } else {
                    sensor[response[r].name] = [];
                    sensor[response[r].name].push([response[r].intoDate, response[r].data]);
                }
            }


            for (s in sensor) {
                if(lineOptions[s] == undefined){
                    continue;
                }
                var data = [
                    ['Fecha', lineOptions[s].dataDescription, {
                        role: 'style'
                    }]
                ];
                var div = createLineDiv("node", s);
                
                for (d in sensor[s]) {
                    var color = 'color: gray';
                    /*if (parseFloat(sensor[s][d][1]) > parseFloat(lineOptions[s].yellowGreaterThan)) {
                        color = 'color: yellow';
                    }
                    if (parseFloat(sensor[s][d][1]) > parseFloat(lineOptions[s].redGreaterThan)) {
                        color = 'color: red';
                    }*/
                    var date = new Date(sensor[s][d][0]);
                    var dateLabel = date.getMonth()+"/"+date.getDate()+" "+date.getHours()+":"+date.getMinutes();
                    data.push([dateLabel, parseFloat(sensor[s][d][1]), color]);

                }

                var options = {
                    title: lineOptions[s].label,
                    width: "100%",
                    height: 600,
                    curveType:'function',
                    hAxis: {
                      title: 'Fecha',
                      gridlines:{color: '#f3f3f3', count: 10}
                    },
                    legend : {position: 'none'},
                    vAxis: {
                      title: 'Valores censados',
                      gridlines:{color: '#f3f3f3', count: 10}
                    },
                    colors: ['#000', '#000'],
                    crosshair: {
                      color: '#000',
                      trigger: 'selection'
                    }
                };


                var chart = new google.visualization.LineChart(div);
                chart.draw(google.visualization.arrayToDataTable(data), options);
            }

        });


    }


    function createLineDiv(node, name) {
        if (!document.getElementById(node + "-" + name)) {
            var line = document.createElement('div');
            line.id = node + "-" + name;
            line.className = 'col-sm-12 col-md-12 col-xs-12';
            document.getElementById('linechart_material').appendChild(line);

            var item = document.createElement('li');
            item.id = "item-" + name;
            item.className = '';
            item.innerHTML = "<a href='#" + line.id + "'>" + name.toUpperCase() + "</a>";

            document.getElementById('menu-sensor').appendChild(item);

            return line;
        }

        return null;
    }

}