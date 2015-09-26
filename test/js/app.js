'use strict';

// Documentation can be found at https://developers.google.com/maps/documentation/javascript/examples/places-searchbox?hl=en
var map;
var infowindow;

function initMap() {
	var mapOptions = {
		center: new google.maps.LatLng(40.5472,12.282715),
		zoom: 6,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

	var input = document.getElementById('keyterm');
	var searchBox = new google.maps.places.SearchBox(input);


	// Bias the SearchBox results towards current map's viewport.
	map.addListener('bounds_changed', function() {
		searchBox.setBounds(map.getBounds());
	});
	


	var markers = [];

	searchBox.addListener('places_changed', function() {
		var places = searchBox.getPlaces();
		console.log(places);
		var lat = places[0].geometry.location.lat();
		var lng = places[0].geometry.location.lng();
		console.log(lat, lng);

		var location = {lat: lat, lng: lng};

		infowindow = new google.maps.InfoWindow();

		// var topPlace = [];
		var service = new google.maps.places.PlacesService(map);
		service.nearbySearch({
			location: location,
			radius: 500,
			types: ['store']
		}, callback);

		if (places.length == 0) {
			return;
		}
		

		

		// Clear out the old markers.
		markers.forEach(function(marker) {
			marker.setMap(null);
		});
		
		markers = [];

		// For each place, get the icon, name and location.
		var bounds = new google.maps.LatLngBounds();
		//console.log(bounds);
		
		
		
		places.forEach(function(place) {
			// var lat = place.geometry.location.lat();
			// var lng = place.geometry.location.lng();
			// var name = place.name;
			// var fourSqBase = 'https://api.foursquare.com/v2/venues/search?ll=';
			// var latLng = lat + ',' + lng;
			// var extraParams = "&limit=20&section=topPicks&day=any&time=any&locale=en&client_id=KSGW3MB0GNYFHTMAACRTTBXE04PYNCGWUOW2AVC1ZXDN023O&client_secret=SMN0HYJY5DEAVCJBANMCX1NONZAX41VDSJEJTU23FSZSFEOD&v=20150925";
			// var FSQfinal = fourSqBase + latLng + extraParams;

			// $.getJSON(FSQfinal, function(data) {
			// 	topPlace = data.response.groups.items;
			// 	for (var i = 0; i < topPlace.length; i++) {
			// 		createMarkers(topPlace[i].venue);
			// 	}
			// });


			var icon = {
				url: place.icon,
				size: new google.maps.Size(71, 71),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(17, 34),
				scaledSize: new google.maps.Size(25, 25)
			};

			// Create a marker for each place.
			markers.push(new google.maps.Marker({
				map: map,
				icon: icon,
				title: place.name,
				position: place.geometry.location
			}));

			if (place.geometry.viewport) {
				// Only geocodes have viewport.
				bounds.union(place.geometry.viewport);
			} else {
				bounds.extend(place.geometry.location);
			}
		});
		map.fitBounds(bounds);
	});
	// Add event listener to know if there's a window resize and adapt
	google.maps.event.addDomListener(window, 'resize', function() {
		var center = map.getCenter();
		google.maps.event.trigger(map, 'resize');
		map.setCenter(center); 
	});
}

function callback(results, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		for (var i = 0; i < results.length; i++) {
			var place = results[i];
			createMarker(results[i]);
		}
	}
}

function createMarker(place) {
	var placeLoc = place.geometry.location;
	var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location
	});

	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(place.name);
		infowindow.open(map, this);
	});
}

google.maps.event.addDomListener(window, 'load', initMap);