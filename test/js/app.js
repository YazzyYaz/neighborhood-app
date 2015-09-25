$(document).ready(function () {   
   ko.applyBindings(viewModel);
});



ko.bindingHandlers.map = {

    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var mapObj = ko.utils.unwrapObservable(valueAccessor());
        var latLng = new google.maps.LatLng(
            ko.utils.unwrapObservable(mapObj.lat),
            ko.utils.unwrapObservable(mapObj.lng));
        var mapOptions = { center: latLng,
                          zoom: 5, 
                          mapTypeId: google.maps.MapTypeId.ROADMAP};

        mapObj.googleMap = new google.maps.Map(element, mapOptions);
    }
};

function ViewModel() {
	var self = this;

    self.myMap = ko.observable({
        lat: ko.observable(55),
        lng: ko.observable(11)});
};

var viewModel = new ViewModel();