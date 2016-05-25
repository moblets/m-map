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
      controller: function(
        $element,
        $scope,
        $uPlatform,
        $uMoblet,
        $uFeedLoader,
        $filter
      ) {
        $scope.load = function() {
          $scope.isLoading = true;
          $uFeedLoader.load($scope.moblet, 1, false)
            .then(function(data) {
              $scope.mapData = data;
              $scope.isLoading = false;
              $scope.mapHeight = $scope.computeFactorHeight(90);
              $scope.listHeight = $scope.computeFactorHeight(10);
              $scope.listMinifiedHeight = $scope.computeFactorHeight(10);
              $scope.listMinified = true;
              $scope.listMinifiedText = $filter('translate')("show_locations");
              $scope.findCenter();
              $scope.loadMap();
            });
        };

        $scope.zoomList = function() {
          $scope.mapHeight = $scope.computeFactorHeight(10);
          $scope.listHeight = $scope.computeFactorHeight(90);
          $scope.listMinifiedHeight = $scope.computeFactorHeight(0);
          $scope.listMinified = false;
        };

        $scope.zoomMap = function() {
          $scope.mapHeight = $scope.computeFactorHeight(90);
          $scope.listHeight = $scope.computeFactorHeight(10);
          $scope.listMinifiedHeight = $scope.computeFactorHeight(10);
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

        $scope.findCenter = function() {
          var locations = $scope.mapData.locations;

          $scope.longitudeMin = Number(locations[0].longitude);
          $scope.latitudeMin = Number(locations[0].latitude);
          $scope.longitudeMax = Number(locations[0].longitude);
          $scope.latitudeMax = Number(locations[0].latitude);

          for (var i = 0; i < locations.length; i++) {
            if (Number(locations[i].longitude) < $scope.longitudeMin) {
              $scope.longitudeMin = Number(locations[i].longitude);
            }
            if (Number(locations[i].longitude) > $scope.longitudeMax) {
              $scope.longitudeMax = Number(locations[i].longitude);
            }
            if (Number(locations[i].latitude) < $scope.latitudeMin) {
              $scope.latitudeMin = Number(locations[i].latitude);
            }
            if (Number(locations[i].latitude) > $scope.latitudeMax) {
              $scope.latitudeMax = Number(locations[i].latitude);
            }
          }
          $scope.mapData.centerLongitude = ($scope.longitudeMax + $scope.longitudeMin) / 2;
          $scope.mapData.centerLatitude = ($scope.latitudeMax + $scope.latitudeMin) / 2;
        };

        $scope.loadMap = function() {
          setTimeout(function() {
            // Wait until 'maps api' has been injected
            if (typeof google === "undefined") {
              $scope.loadMap();
            } else {
              $scope.googleMap = google;
              var mapData = $scope.mapData;
              var locations = $scope.mapData.locations;
              var mapDiv = document.getElementById("m-map-" + $scope.moblet.id);
              var infoWindow = new google.maps.InfoWindow();
              var marker;

              var mapOptions = {
                // zoom: mapData.zoom,
                mapTypeControl: false,
                streetViewControl: false,
                panControl: false,
                rotateControl: false,
                zoomControl: false,
                center: new google.maps.LatLng(
                  mapData.centerLatitude,
                  mapData.centerLongitude
                ),
                mapTypeId: google.maps.MapTypeId[
                  mapData.mapTypeId
                ]
              };

              $scope.googleMap = new google.maps.Map(mapDiv, mapOptions);

              // Add the pins
              for (var j = 0; j < locations.length; j++) {
                marker = new google.maps.Marker({
                  position: new google.maps.LatLng(
                    locations[j].latitude, locations[j].longitude),
                  map: $scope.googleMap
                });
                // Add the pins content
                google.maps.event.addListener(
                  marker,
                  'click',
                  (function(marker, j) {
                    return function() {
                      infoWindow.setContent(
                        locations[j].title +
                        "<br>" +
                        locations[j].description);
                      infoWindow.open($scope.googleMap, marker);
                    };
                  })(marker, j));
              }
              $scope.googleMap.fitBounds(new google.maps.LatLngBounds(
                //bottom left
                // $scope.longitudeMin
                // $scope.latitudeMin
                // $scope.longitudeMax
                // $scope.latitudeMax
                new google.maps.LatLng($scope.latitudeMin, $scope.longitudeMin),
                //top right
                new google.maps.LatLng($scope.latitudeMax, $scope.longitudeMax)
              ));
              return {
                latitude: mapData.centerLatitude,
                longitude: mapData.centerLongitude
              };
            }
          }, 100);
        };

        $scope.init();
      },
      controllerAs: 'mMapController'
    };
  });
