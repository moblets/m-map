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
        $uInjector.inject("http://maps.google.com/maps/api/js?key=AIzaSyDNzstSiq9llIK8b49En0dT-yFA5YpManU&amp;sensor=true");
      },
      controller: function($scope, $uPlatform, $uMoblet, $uFeedLoader) {
        $scope.load = function() {
          $scope.isLoading = true;
          $uFeedLoader.load($scope.moblet, 1, false)
            .then(function(data) {
              $scope.mapData = data;
              $scope.isLoading = false;
              $scope.loadMap();
            });
        };

        $scope.init = function() {
          $scope.isLoading = false;
          $scope.moblet = $uMoblet.load();
          $scope.load();
        };

        $scope.computeMapStyle = function() {
          var tabs = document.querySelectorAll(".with-tabs").length > 0;
          var banner = document.querySelectorAll(".with-banner").length > 0;

          var descount = 44;
          if ($uPlatform.isIOS() && $uPlatform.isWebView()) {
            descount += 20;
          }
          if (banner) {
            descount += 53;
          }
          if (tabs) {
            descount += 53;
          }

          return {
            height: (window.innerHeight - descount - 100) + 'px'
          };
        };

        $scope.loadMap = function() {
          setTimeout(function() {
            // Wait until 'maps api' has been injected
            if (typeof google === "undefined") {
              $scope.loadMap();
            } else {
              var mapData = $scope.mapData;
              var locations = mapData.locations;
              var center = getCenter(locations);

              var mapOptions = {
                zoom: mapData.zoom,
                center: new google.maps.LatLng(
                  options.center.latitude,
                  options.center.longitude
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

              var getCenter = function(locations) {
                var longitude = 0;
                var latitude = 0;
                for (var i = 0; i < locations.length; i++) {
                  longitude += locations[i].longitude;
                  latitude += locations[i].latitude;
                }
                latitude = latitude / locations.length;
                longitude = longitude / locations.length;
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
