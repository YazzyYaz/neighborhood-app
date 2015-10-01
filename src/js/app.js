'use strict';

// Global Variables
var map;
var marker;
var input;
var service;
var custom_icon = 'img/fs.png';
var infowindow;


// Model
var placeModel = [
	{
		name: "Verboten Club",
		lat: 40.722095,
		lng: -73.959059
	},
	{
		name: "Williamsburg Bagel",
		lat: 40.707487,
		lng: -73.961136
	},
	{
		name: "Motorino Pizza",
		lat: 40.710550,
		lng: -73.963350
	},
	{
		name: "Brisket Town",
		lat: 40.711475,
		lng: -73.962951
	},
	{
		name: "OddFellows Ice Cream Co.",
		lat: 40.718039,
		lng: -73.963732
	},
	{
		name: "Knitting Factory",
		lat: 40.714219,
		lng: -73.955833
	},
	{
		name: "Brooklyn Brewery",
		lat: 40.721645,
		lng: -73.957258
	},
	{
		name: "Brooklyn Industries",
		lat: 40.718588,
		lng: -73.957256
	},
	{
		name: "Loosie Rouge",
		lat: 40.710998,
		lng: -73.964860
	}
];

var Place = function(data){
	this.name = ko.observable(data.name);
	this.lat = ko.observable(data.lat);
	this.lng = ko.observable(data.lng);
	this.marker = ko.observable();
	this.rating = ko.observable();
	this.checkinCount = ko.observable();
	this.street = ko.observable();
	this.cityState = ko.observable();
	this.url = ko.observable();
	this.isVisible = ko.observable(false);
}




// Map initialize function
function initMap() {
	var mapOptions = {
		center: new google.maps.LatLng(40.7133, -73.9533),
		zoom: 14,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	infowindow = new google.maps.InfoWindow();
}




// View Model
function ViewModel() {
	var self = this;
	self.placeList = ko.observableArray([]);
	self.filter = ko.observable('');
	initMap();

	/*Creates new Place objects for each item in initialPlaces*/
	placeModel.forEach(function(placeItem){
		self.placeList.push( new Place(placeItem) );
	});

	self.placeList().forEach(function(placeItem){

		marker = new google.maps.Marker({
			position: new google.maps.LatLng(placeItem.lat(), placeItem.lng()),
			map: map,
			animation: google.maps.Animation.DROP,
			title: placeItem.name(),
			icon: custom_icon
		});
		placeItem.marker = marker;

		// Get FourSquare URL Link
		var fourSqBase = 'https://api.foursquare.com/v2/venues/explore?ll=';
		var latLng = placeItem.lat() + ',' + placeItem.lng();
		var extraParams = "&limit=1&intent=match&query="+ placeItem.name() +"&client_id=KSGW3MB0GNYFHTMAACRTTBXE04PYNCGWUOW2AVC1ZXDN023O&client_secret=SMN0HYJY5DEAVCJBANMCX1NONZAX41VDSJEJTU23FSZSFEOD&v=20150925";
		var FSQfinal = fourSqBase + latLng + extraParams;


		var results, name, url, rating, checkinCount, street, cityState;
		$.getJSON(FSQfinal, function(data){
			results = data.response.groups[0].items[0].venue;
			placeItem.name = results.name;
			placeItem.url = results.url;
			placeItem.rating = results.rating;
			placeItem.checkinCount = results.stats.checkinsCount;
			placeItem.street = results.location.formattedAddress[0];
			placeItem.cityState = results.location.formattedAddress[1];
		}).error(function(e){
			console.log("FourSquare data couldn't be loaded!");
		});

		/*Toggles the bounce animation on the marker*/
		function toggleBounce() {
			if(placeItem.marker.getAnimation() !== null) {
				placeItem.marker.setAnimation(null);
			} else {
				placeItem.marker.setAnimation(google.maps.Animation.BOUNCE);
			}
		}

		placeItem.isVisible.subscribe(function(currentState) {
			if (currentState) {
				placeItem.marker.setMap(map);
			} else {
				placeItem.marker.setMap(null);
			}
		});
		placeItem.isVisible(true);

		


		/*When the marker is clicked, animate the marker and show infowindow*/
		google.maps.event.addListener(placeItem.marker, 'click', function(){
			toggleBounce();
			setTimeout(toggleBounce, 600);
			setTimeout(function(){
				infowindow.setContent('<h3>' + placeItem.name + '</h3>\n<p><b>Rating: </b>' + placeItem.rating + '</p>\n<p><b>Check Ins: </b>' + placeItem.checkinCount + '</p>\n<a href=' + placeItem.url + '>' + placeItem.url + '</a>\n<p><b>Address:</b></p>\n<p>' + placeItem.street + '</p>\n<p>' + placeItem.cityState + '</p>');
				infowindow.open(map, placeItem.marker);
			}, 200);
			map.panTo(placeItem.marker.position);
		});
	});

	// When list item is clicked, marker is clicked and infowindow shown
	self.show_info = function(placeItem){
		google.maps.event.trigger(placeItem.marker,'click');
	};

	google.maps.event.addDomListener(window, 'resize', function() {
		var center = map.getCenter();
		google.maps.event.trigger(map, 'resize');
		map.setCenter(center); 
	});

	self.filterPins = ko.dependentObservable(function () {
		var search  = self.filter().toLowerCase();
		return ko.utils.arrayFilter(self.placeList(), function (pin) {
			var doesMatch = pin.marker.title.toLowerCase().indexOf(search) >= 0;
			pin.isVisible(doesMatch);
			return doesMatch;
		});
	});

}

// Initialize View Model Binding
ko.applyBindings(new ViewModel);