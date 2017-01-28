function wg_vane(id, renderSender) {
	var element = document.getElementById(id);
    var direction = document.createElement('div');
    direction.id = "direction-"+id;
    element.appendChild(direction);

	 renderSender[id] = {
	 	feedData: function(value){
	 		var data = value.substring(value.indexOf("=")+1);
			document.getElementById(direction.id).style.transform ='rotate('+data+'deg)';
	 	}
	 };

	direction.style.backgroundImage = "url('/js/widgets/asserts/compass_rose.png')";
    direction.style.width = "120px";
    direction.style.height = "115px";
    direction.style.position = "relative";
    direction.style.top = "42px";
     
    element.style.backgroundImage = "url('/js/widgets/asserts/bg_vane.png')";
    element.style.width = "200px";
    element.style.height = "200px";

 }