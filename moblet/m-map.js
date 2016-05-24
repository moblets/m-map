require('./m-map.scss');
var path = require('path');
var fs = require('fs');
/* eslint no-undef: [0]*/
angular.module("uMoblets")
  .directive('mMap', function($uInjector) {
    return {
      restrict: 'E',
      template: fs.readFileSync(path.join(__dirname, 'm-map.html'), 'utf8'),
      link: function() {
        $uInjector.inject("http://maps.google.com/maps/api/js" +
          "?key=AIzaSyDNzstSiq9llIK8b49En0dT-yFA5YpManU&amp;sensor=true");
      },
      controller: function($element, $scope, $uPlatform, $uMoblet, $uFeedLoader) {
        $scope.load = function() {
          $scope.isLoading = true;
          $uFeedLoader.load($scope.moblet, 1, false)
            .then(function(data) {
              $scope.mapData = data;
              $scope.isLoading = false;
              $scope.mapHeight = $scope.listHeight = $scope.computeFactorHeight(50);
              $scope.loadMap();
            });
        };

        $scope.zoomList = function() {
          $scope.mapHeight = $scope.computeFactorHeight(10);
          $scope.listHeight = $scope.computeFactorHeight(90);
          $scope.listMinified = false;
        };

        $scope.zoomMap = function() {
          $scope.mapHeight = $scope.computeFactorHeight(90);
          $scope.listHeight = $scope.computeFactorHeight(10);
          $scope.listMinified = true;
        };

        $scope.init = function() {
          $scope.isLoading = false;
          $scope.moblet = $uMoblet.load();
          $scope.load();
        };

        $scope.computeFactorHeight = function(factor) {
          var element = document.querySelector("m-map #wraper");
          var h = Number(element.style["min-height"].replace("px", ""));
          return h / (100 / factor) + "px";
        };

        $scope.loadMap = function() {
          setTimeout(function() {
            // Wait until 'maps api' has been injected
            if (typeof google === "undefined") {
              $scope.loadMap();
            } else {
              var mapData = $scope.mapData;
              var locations = mapData.locations;

              var longitude = 0;
              var latitude = 0;
              console.log('locations', locations);

              for (var i = 0; i < locations.length; i++) {
                console.log('locations[i]', locations[i]);
                longitude += Number(locations[i].longitude);
                latitude += Number(locations[i].latitude);
              }
              latitude /= locations.length;
              longitude /= locations.length;

              console.log('latitude', latitude);
              console.log('longitude', longitude);

              var mapOptions = {
                zoom: mapData.zoom,
                center: new google.maps.LatLng(
                  latitude,
                  longitude
                ),
                mapTypeId: google.maps.MapTypeId[
                  mapData.mapTypeId
                ]
              };

              $scope.googleMap = new google.maps.Map(
                document.getElementById("m-map-" + $scope.moblet.id),
                mapOptions);

              var infoWindow = new google.maps.InfoWindow();
              var marker;
              var i;

              for (i = 0; i < locations.length; i++) {
                marker = new google.maps.Marker({
                  position: new google.maps.LatLng(
                    locations[i].latitude, locations[i].longitude),
                  map: $scope.googleMap
                });

                google.maps.event.addListener(
                  marker,
                  'click',
                  (function(marker, i) {
                    return function() {
                      infoWindow.setContent(
                        locations[i].title +
                        "<br>" +
                        locations[i].description);
                      infoWindow.open($scope.googleMap, marker);
                    }
                  })(marker, i));
              }
              return {
                latitude: latitude,
                longitude: longitude
              };
            }
          }, 100);
        };

        $scope.init();
      },
      controllerAs: 'uMapController'
    };
  });
