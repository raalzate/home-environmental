window.onload = function() {

    google.charts.load('current', {
        'packages': ['corechart']
    });
    google.charts.setOnLoadCallback(drawChart);
    var lineOptions = [];


    lineOptions['temperatura'] = {
        label: "Sensor de Temperatura por Fecha",
        dataDescription: "Valor de temperatura",
        redGreaterThan: 32,
        yellowGreaterThan: 25,
    };

    lineOptions['humedad'] = {
        label: "Sensor de Humedad por Fecha",
        dataDescription: "Valor de humedad",
        redGreaterThan: 64,
        yellowGreaterThan: 30,
    };

    lineOptions['calidad'] = {
        label: "Sensor de Calidad Aire por Fecha",
        dataDescription: "Valor de calidad de aire",
        redGreaterThan: 100,
        yellowGreaterThan: 24,
    };


    function drawChart() {
        var params = window.location.pathname.split("/");

        $.get('http://' + document.domain + ':3300/rest/data/' + params[2], function(response) {

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
                var data = [
                    ['Fecha', lineOptions[s].dataDescription, {
                        role: 'style'
                    }]
                ];
                var div = createLineDiv("node", s);
                var options = {
                    title: lineOptions[s].label,
                    width: "100%",
                    height: 600,
                    bar: {
                        groupWidth: "95%"
                    },
                    legend: {
                        position: "none"
                    },
                };
                for (d in sensor[s]) {
                    var color = 'color: gray';
                    if (parseFloat(sensor[s][d][1]) > parseFloat(lineOptions[s].yellowGreaterThan)) {
                        color = 'color: yellow';
                    }
                    if (parseFloat(sensor[s][d][1]) > parseFloat(lineOptions[s].redGreaterThan)) {
                        color = 'color: red';
                    }
                    var date = new Date(sensor[s][d][0]);
                    var dateLabel = date.getMonth()+"/"+date.getDate()+" "+date.getHours()+":"+date.getMinutes();
                    data.push([dateLabel, parseFloat(sensor[s][d][1]), color]);
                }

                var chart = new google.visualization.ColumnChart(div);
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
            return line;
        }

        return null;
    }

}