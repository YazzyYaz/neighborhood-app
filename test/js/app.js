'use strict';
var map;
var input;
var service;
var initialHood = "New York City";
var markers = [];
var newLoc;
var top_bar = $('#right-panel');
var custom_icon = 'img/fs.png';
var infowindow;

function initMap() {
	var mapOptions = {
		zoom: 14,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	infowindow = new google.maps.InfoWindow();
}

function getHood(hood){
	var request = {
		query: hood
	};
	service = new google.maps.places.PlacesService(map);
	service.textSearch(request, callback);
}

function callback(results, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		getHoodInfo(results[0]);
	}
}

function createMarker(place){
	var ven_lat = place.location.lat;
	var ven_lng = place.location.lng;
	var name = place.name;
	var position = new google.maps.LatLng(ven_lat, ven_lng);

	var marker = new google.maps.Marker({
		map: map,
		position: position,
		icon: custom_icon
	});

	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(name);
		infowindow.open(map, this);
	});
	var head_name = '<label class="text-left">' + name + '</label>';
	top_bar.append(head_name);
}

function getHoodInfo(place) {
	var lat = place.geometry.location.lat();
	var lng = place.geometry.location.lng();
	var name = place.name;

	newLoc = new google.maps.LatLng(lat, lng);
	map.setCenter(newLoc);

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

	var fourSqBase = 'https://api.foursquare.com/v2/venues/search?ll=';
	var latLng = lat + ',' + lng;
	var extraParams = "&limit=20&section=topPicks&day=any&time=any&locale=en&client_id=KSGW3MB0GNYFHTMAACRTTBXE04PYNCGWUOW2AVC1ZXDN023O&client_secret=SMN0HYJY5DEAVCJBANMCX1NONZAX41VDSJEJTU23FSZSFEOD&v=20150925";
	var FSQfinal = fourSqBase + latLng + extraParams;

	$.getJSON(FSQfinal, function(data) {
		console.log(data);
		var venue_array = data.response.venues;
		for (var i = 0; i < venue_array.length; i++){
			createMarker(venue_array[i]);
		}
	});
}

function removeHoodMarker() {
	for (var i in markers){
		markers[i].setMap(null);
		markers[i] = null;
	}
	while (markers.length > 0) {
		markers.pop();
	}
}

function ViewModel() {
	var self = this;

	self.newHood = ko.observable(initialHood);
	// self.inputTerm = ko.observable('');
	console.log(self.newHood);

	initMap();

	// Check Hood
	self.checkHood = ko.computed(function() {
		if (self.newHood != '') {
			// if (markers.length != 0) {
			// 	removeMarkers();
			// }
			removeHoodMarker();
			getHood(self.newHood());
			// self.inputTerm('');
		}
	});
}

// initialize the view model binding
ko.applyBindings(new ViewModel);