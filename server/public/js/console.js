window.onload = function() {

    var messages = [];
    var socket = io.connect('http://'+document.domain+':3300');
    var content = document.getElementById("content-console");

    socket.on('pushData', function (data) {
            var params = window.location.pathname.split("/");

            if(params[2] && params[3]){
                var node = params[2];
                var sensor = params[3];
                if(node == data.node && data.name ==  sensor){
                    renderConsole(data);
                }
            } else if(params[2]){
                var node = params[2];
                if(node == data.node){
                    renderConsole(data);
                }
            } else{
                renderConsole(data);
            }            
        
    });

    function renderConsole(data){
        var textItem = "<u>"+data.intoDate+"</u> -- <b>"+data.node+"["+data.name+"]"+"</b>"+":";
            textItem = textItem+ "<span style='float:right;margin-right:8px'>"+data.data+"</span>";
            messages.push(textItem);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html += messages[i] + '<br />';
            }
            content.innerHTML = html;
    }

};