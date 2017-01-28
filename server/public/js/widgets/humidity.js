function wg_humididy(id, renderSender) {
        return new FusionCharts({
            type: 'hlineargauge',
            renderAt: id,
            id: "hlg-"+id,
            width: '320',
            height: '170',
            dataFormat: 'json',
            dataSource: {
                "chart": {
                    "theme": "fint",
		  			"lowerLimit": "0",
		            "upperLimit": "100",
		            "numberSuffix": "%",
		            "chartBottomMargin": "40",
		            "valueFontSize": "11",
		            "valueFontBold": "0",
		            "showValue": "0",
		            "gaugeFillMix": "{light-10},{light-20},{light-70},{dark-70}",
		            "gaugeFillRatio": "40,20,40"
                },
                "colorRange": {
		            "color": [{
			                "minValue": "0",
			                "maxValue": "30",
			                "label": "Seco",
			            }, {
			                "minValue": "30",
			                "maxValue": "60",
			                "label": "Optima",
			            }, {
			                "minValue": "60",
			                "maxValue": "99",
			                "label": "Alto",
			            }, {
			                "minValue": "99",
			                "maxValue": "100",
			                "label": "Punto de rocío",
			            }]
			    },
                "pointers": {
		            "pointer": [{
		                "value": "0"
		            }]
		        },
                
            },
            "events": {
                 "rendered": function(evt, arg){
                    renderSender[id] = evt.sender;
                }
            }
        }).render();
    }