'use strict';

// Documentation can be found at https://developers.google.com/maps/documentation/javascript/examples/places-searchbox?hl=en
var map;
var infowindow;

function initMap() {
	var mapOptions = {
		center: new google.maps.LatLng(40.7133,-73.9533),
		zoom: 12,
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

		var location = {lat: lat, lng: lng};

		infowindow = new google.maps.InfoWindow();


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


		places.forEach(function(place) {
			var lat = place.geometry.location.lat();
			var lng = place.geometry.location.lng();
			var fourSqBase = 'https://api.foursquare.com/v2/venues/search?ll=';
			var latLng = lat + ',' + lng;
			var extraParams = "&limit=20&section=topPicks&day=any&time=any&locale=en&client_id=KSGW3MB0GNYFHTMAACRTTBXE04PYNCGWUOW2AVC1ZXDN023O&client_secret=SMN0HYJY5DEAVCJBANMCX1NONZAX41VDSJEJTU23FSZSFEOD&v=20150925";
			var FSQfinal = fourSqBase + latLng + extraParams;

			$.getJSON(FSQfinal, function(data) {
				
				var venue_array = data.response.venues;
				for (var i = 0; i < venue_array.length; i++){
					createMarker(venue_array[i]);
				}
			});


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
	var lat = place.location.lat;
	var lng = place.location.lng;
	var name = place.name;
	var position = new google.maps.LatLng(lat, lng);

	var marker = new google.maps.Marker({
		map: map,
		position: position
	});

	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(name);
		infowindow.open(map, this);
	});
}

google.maps.event.addDomListener(window, 'load', initMap);