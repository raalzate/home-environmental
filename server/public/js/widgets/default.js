function wg_default(id, renderSender) {
        return new FusionCharts({
            type: 'angulargauge',
            renderAt: id,
            id: "thm-"+id,
		    width: '320',
		    height: '200',
		    dataFormat: 'json',
		    dataSource: {
		        "chart": {
		            "lowerLimit": "0",
		            "upperLimit": "100",
		            "editMode": "1",
		            "showValue": "1",
		            "valueBelowPivot": "1",
		            "tickValueDistance": "25",
		            "gaugeFillMix": "{dark-30},{light-60},{dark-10}",
		            "gaugeFillRatio": "15",
		            "theme": "fint",
		            "valueFontSize": "14"
		        },
		        "colorRange": {
		            "color": [{
		                "minValue": "0",
		                "maxValue": "50",
		                "code": "#6baa01"
		            }, {
		                "minValue": "50",
		                "maxValue": "75",
		                "code": "#f8bd19"
		            }, {
		                "minValue": "75",
		                "maxValue": "100",
		                "code": "#e44a00"
		            }]
		        }
		    },
            "events": {
                 "rendered": function(evt, arg){
                    renderSender[id] = evt.sender;
                }
            }
        }).render();
    }