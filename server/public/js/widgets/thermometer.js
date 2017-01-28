function wg_thermometer(id, renderSender) {
        return new FusionCharts({
            type: 'thermometer',
            renderAt: id,
            id: "thm-"+id,
            width: '240',
            height: '310',
            dataFormat: 'json',
            dataSource: {
                "chart": {
                    "lowerLimit": "-10",
                    "upperLimit": "42",
                    "decimals": "1",
                    "numberSuffix": "°C",
                    "showhovereffect": "1",
                    "thmFillColor": "#008ee4",
                    "showGaugeBorder": "1",
                    "gaugeBorderColor": "#008ee4",
                    "gaugeBorderThickness": "2",
                    "gaugeBorderAlpha": "30",
                    "thmOriginX": "100",
                    "chartBottomMargin": "20",
                    "valueFontColor": "#000000",
                    "theme": "fint"
                },
                "value": "0",
                
            },
            "events": {
                 "rendered": function(evt, arg){
                    renderSender[id] = evt.sender;
                }
            }
        }).render();
    }