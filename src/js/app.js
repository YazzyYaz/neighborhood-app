'use strict';


var map;
var input;
var service;
var initialHood = "Brooklyn";
var markers = [];
var fsMarkers = [];
var newLoc;
var top_bar = $('#right-panel');
var custom_icon = 'img/fs.png';
var infowindow;

var MapMarkerSet = function(marker, name, category, position) {
	this.marker = marker,
	this.name = name,
	this.category = category,
	this.position = position
};

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
	var category = place.categories[0].name;
	var contact = place.contact.formattedPhone;
	var url = place.url;

	var marker = new google.maps.Marker({
		map: map,
		position: position,
		icon: custom_icon,
		title: name
	});
	var startingToken = '<div><p><span>' + name + '</span></p><p><span>' + category + '</span></p>';
	var midToken;
	var endingToken;

	if (url != undefined) {
		midToken = '<p><span>' + url + '</span></p>';
	} else {
		midToken = '';
	}

	if (contact != undefined){
		endingToken = '<p><span>' + contact + '</span></p></div>';
	} else {
		endingToken = '</div>'
	}
	
	fsMarkers.push(new MapMarkerSet(marker, name.toLowerCase(), category.toLowerCase(), position));

	google.maps.event.addListener(marker, 'click', function() {
		infowindow.setContent(startingToken + midToken + endingToken);
		infowindow.open(map, this);
	});

	var head_name = '<a><label class="text-left">' + name + '</label></a>';
	var head_link = 
	top_bar.append(head_name);
	console.log(fsMarkers);
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
		var venue_array = data.response.venues;
		for (var i = 0; i < venue_array.length; i++){
			createMarker(venue_array[i]);
		}
	}).error(function() {
			alert("Foursquare Data couldn't be loaded!")
		});;
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

function removeFSMarkers() {
	for (var i in fsMarkers) {
		fsMarkers[i].marker.setMap(null);
		fsMarkers[i].marker = null;
	}
	while (fsMarkers.length > 0) {
		fsMarkers.pop();
	}
}

function ViewModel() {
	var self = this;
	self.newHood = ko.observable(initialHood);
	// self.inputTerm = ko.observable('');
	self.topList = ko.observableArray(fsMarkers);
	initMap();

	// Check Hood
	self.checkHood = ko.computed(function() {
		if (self.newHood != '') {
			if (fsMarkers.length != 0) {
				removeFSMarkers();
			}
			removeHoodMarker();
			getHood(self.newHood());
		}
	});

	google.maps.event.addDomListener(window, 'resize', function() {
		var center = map.getCenter();
		google.maps.event.trigger(map, 'resize');
		map.setCenter(center); 
	});
	console.log(self.topList);

}

// initialize the view model binding
ko.applyBindings(new ViewModel);