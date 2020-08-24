let map;
let directionsDisplay;
let directionsService = new google.maps.DirectionsService();

function initialize() {	
	directionsDisplay = new google.maps.DirectionsRenderer();
	let latlng = new google.maps.LatLng(-23.577114, -46.650285);
	
    let options = {
        zoom: 5,
		center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("map"), options);
	directionsDisplay.setMap(map);
	directionsDisplay.setPanel(document.getElementById("route"));
	
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function (position) {

			pontoPadrao = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			map.setCenter(pontoPadrao);
			
			let geocoder = new google.maps.Geocoder();
			
			geocoder.geocode({
				"location": new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
            },
            function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					$("#txtEnderecoPartida").val(results[0].formatted_address);
				}
            });
		});
	}
}

initialize();

$("form").submit(function(event) {
	event.preventDefault();
	
	let request = {
		origin: new google.maps.LatLng(-23.577114, -46.650285),
		destination: new google.maps.LatLng(-23.588248, -46.644366),
		waypoints: [{location: 'Albino Rodrigues Costa, São Paulo'}],
		travelMode: google.maps.TravelMode.DRIVING
	};
	
	directionsService.route(request, function(result, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(result);
		}
	});
});