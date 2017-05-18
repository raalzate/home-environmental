  var lineOptions = [];
    var renderSender = [];

   lineOptions['temperatura'] = {
        label: "SENSOR DE TEMPERATURA",
        dataDescription: "Valor de temperatura",
        redGreaterThan: 32,
        yellowGreaterThan: 25,
    };

    lineOptions['humedad'] = {
        label: "SENSOR DE HUMEDAD",
        dataDescription: "Valor de humedad",
        redGreaterThan: 64,
        yellowGreaterThan: 30,
    };

    lineOptions['calidad'] = {
        label: "SENSOR DE CALIDAD DE AIRE",
        dataDescription: "Valor de calidad de aire",
        redGreaterThan: 100,
        yellowGreaterThan: 24,
    };

     var widgetTitle = {
        "temperatura":"Temperatura en °C",
        "humedad":"Humedad Ambiente",
        "calidad": "Calidad del Aire",
        "direccion":"Direccion del viento",
        "anemometro":"Anemometro"
    };
    var widgets = {
        "anemometro": function(id){wg_default(id, renderSender)},
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