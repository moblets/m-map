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
        $filter,
        $ionicScrollDelegate,
        $uAlert
      ) {
        $scope.load = function() {
          $scope.isLoading = true;
          $uFeedLoader.load($scope.moblet, 1, false)
            .then(function(data) {
              $scope.mapData = data;
              $scope.isLoading = false;
              $scope.mapHeight = $scope.computeFactorHeight(90);
              $scope.listHeight = $scope.computeFactorHeight(0);
              $scope.zoomMapButtonHeight = $scope.computeFactorHeight(0);
              $scope.zoomListButtonHeight = $scope.computeFactorHeight(10);
              $ionicScrollDelegate.$getByHandle('listMapScroll').resize();
              $scope.findCenter();
              $scope.loadMap();
            });
        };

        $scope.zoomList = function() {
          $scope.mapHeight = $scope.computeFactorHeight(0);
          $scope.listHeight = $scope.computeFactorHeight(90);
          $scope.zoomMapButtonHeight = $scope.computeFactorHeight(10);
          $scope.zoomListButtonHeight = $scope.computeFactorHeight(0);
          $ionicScrollDelegate.$getByHandle('listMapScroll').resize();
        };

        $scope.zoomMap = function() {
          $scope.mapHeight = $scope.computeFactorHeight(90);
          $scope.listHeight = $scope.computeFactorHeight(0);
          $scope.zoomMapButtonHeight = $scope.computeFactorHeight(0);
          $scope.zoomListButtonHeight = $scope.computeFactorHeight(10);
          $ionicScrollDelegate.$getByHandle('listMapScroll').resize();
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

        $scope.openLocation = function(key) {
          console.log(key);
          console.log($scope.mapData.locations[key]);
          $uAlert.dialog(
            $filter('translate')("open_in_map_app_title"),
            $filter('translate')("open_in_map_app_message"),
            [
              $filter('translate')("cancel"),
              $filter('translate')("confirm")
            ]
          )
            .then(function(success) {
              if (success) {
                window.location.href = "map://-23,-45";
              }
            });
        };

        $scope.findCenter = function() {
          var locations = $scope.mapData.locations;

          var longitudeMin = Number(locations[0].longitude);
          var latitudeMin = Number(locations[0].latitude);
          var longitudeMax = Number(locations[0].longitude);
          var latitudeMax = Number(locations[0].latitude);

          for (var i = 0; i < locations.length; i++) {
            if (Number(locations[i].longitude) < longitudeMin) {
              longitudeMin = Number(locations[i].longitude);
            }
            if (Number(locations[i].longitude) > longitudeMax) {
              longitudeMax = Number(locations[i].longitude);
            }
            if (Number(locations[i].latitude) < latitudeMin) {
              latitudeMin = Number(locations[i].latitude);
            }
            if (Number(locations[i].latitude) > latitudeMax) {
              latitudeMax = Number(locations[i].latitude);
            }
          }
          $scope.longitudeMin = longitudeMin;
          $scope.latitudeMin = latitudeMin;
          $scope.longitudeMax = longitudeMax;
          $scope.latitudeMax = latitudeMax;
          $scope.mapData.centerLongitude = (longitudeMax + longitudeMin) / 2;
          $scope.mapData.centerLatitude = (latitudeMax + latitudeMin) / 2;
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

              /**
               * TODO blue point of user location
               */
              var mapOptions = {
                zoom: mapData.zoom,
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

              if (navigator.geolocation) {
                browserSupportFlag = true;
                navigator.geolocation.getCurrentPosition(function(position) {
                  initialLocation = new google.maps.LatLng(
                    position.coords.latitude, position.coords.longitude
                  );
                  var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                  };
                  marker = new google.maps.Marker({
                    position: pos,
                    map: $scope.googleMap,
                    icon: {
                      url: 'https://i.imgur.com/SwPjYT1.png',
                      size: new google.maps.Size(16, 16)
                    }
                  });
                  infoWindow.setPosition(pos);
                  infoWindow.setContent('Location found.');
                }, function() {
                  handleNoGeolocation(browserSupportFlag);
                });
              } else {
                browserSupportFlag = false;
                handleNoGeolocation(browserSupportFlag);
              }

              // Auto set the map zoom using the extreme points
              $scope.googleMap.fitBounds(new google.maps.LatLngBounds(
                new google.maps.LatLng($scope.latitudeMin, $scope.longitudeMin),
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
