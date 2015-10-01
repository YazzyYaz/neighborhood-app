/*

	Author: Yaz Khoury
	Date: October 2015
	License: MIT
	Title: Application ViewModel

 */

'use strict';

// Global Variables

var map;
var marker;
var input;
var service;
var custom_icon = 'img/fs-pin.png';
var infowindow;


// Data Model for Pin Information

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

// Google Map Initialize Function

function initMap() {

	var mapOptions = {
		center: new google.maps.LatLng(40.7133, -73.9533),
		zoom: 15,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	infowindow = new google.maps.InfoWindow();
}




// View Model for the Application
function ViewModel() {
	// Variables
	var self = this;
	self.placeList = ko.observableArray([]);
	self.filter = ko.observable('');

	// We initialize the Map
	initMap();

	// Create a new Place object for our model in model.js
	placeModel.forEach(function(placeItem){
		self.placeList.push( new Place(placeItem) );
	});

	// Function for iterating our Place object to get information and use Foursquare API
	self.placeList().forEach(function(placeItem){

		// We declare a new Marker and give it the coordinates from the model
		marker = new google.maps.Marker({
			position: new google.maps.LatLng(placeItem.lat(), placeItem.lng()),
			map: map,
			animation: google.maps.Animation.DROP,
			title: placeItem.name(),
			icon: custom_icon
		});

		// Assign the marker to the Place object observable
		placeItem.marker = marker;

		// Get FourSquare URL Link
		var fourSqBase = 'https://api.foursquare.com/v2/venues/explore?ll=';
		var latLng = placeItem.lat() + ',' + placeItem.lng();
		var extraParams = "&limit=1&intent=match&query="+ placeItem.name() +"&client_id=KSGW3MB0GNYFHTMAACRTTBXE04PYNCGWUOW2AVC1ZXDN023O&client_secret=SMN0HYJY5DEAVCJBANMCX1NONZAX41VDSJEJTU23FSZSFEOD&v=20150925";
		var FSQfinal = fourSqBase + latLng + extraParams;

		// Declare Needed Variables
		var results, 
			name, 
			url, 
			rating, 
			checkinCount, 
			street, 
			cityState;

		// Request JSON string and attribute the Data to the Place Object
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

		// Toggle the Bounce animation of the Markers
		function toggleBounce() {
			if(placeItem.marker.getAnimation() !== null) {
				placeItem.marker.setAnimation(null);
			} else {
				placeItem.marker.setAnimation(google.maps.Animation.BOUNCE);
			}
		}

		// We check if the pin is called in the input, removing all the other pins
		placeItem.isVisible.subscribe(function(currentState) {
			if (currentState) {
				placeItem.marker.setMap(map);
			} else {
				placeItem.marker.setMap(null);
			}
		});
		placeItem.isVisible(true);


		// Clicking the Marker shows the infowindow
		google.maps.event.addListener(placeItem.marker, 'click', function(){

			toggleBounce();
			setTimeout(toggleBounce, 600);

			setTimeout(function(){

				// Declare Info Window variables
				var startToke,
					midToke,
					endToke; 

				// Attribute data to InfoWindow
				startToke = '<h3>' + placeItem.name + '<h3>\n<p><b>Address:</b></p>\n<p>' + placeItem.street + '</p>\n<p>' + placeItem.cityState + '</p>';

				// Check to see if url and checkins are there
				if (placeItem.url != undefined && placeItem.rating != undefined){
					midToke = '\n<p><b>Rating: ' + placeItem.rating + '</p>\n<a href=' + placeItem.url + '>' + placeItem.url + '</a>\n';
				} else {
					midToke = '\n<p><b>Rating: No Rating found using Foursquare</p>\n<p>Link not posted for this venue</p>\n';
				}

				endToke = '<p><b>Check Ins: </b>' + placeItem.checkinCount + '</p>';
				
				infowindow.setContent(startToke + midToke + endToke);
				infowindow.open(map, placeItem.marker);
			}, 200);
			
			map.panTo(placeItem.marker.position);
		});
	});

	// When list item is clicked, marker is clicked and infowindow shown
	self.show_info = function(placeItem){
		google.maps.event.trigger(placeItem.marker,'click');
	};

	// Map resizes if the window resizes. Better responsiveness
	google.maps.event.addDomListener(window, 'resize', function() {
		var center = map.getCenter();
		google.maps.event.trigger(map, 'resize');
		map.setCenter(center); 
	});

	// This function helps us filter search results in the input to display the infolist and the marker pin
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