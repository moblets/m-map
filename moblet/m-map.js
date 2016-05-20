require('./m-map.scss');
var path = require('path');
var fs = require('fs');
/* eslint no-undef: [0]*/
angular.module("uMoblets")
  .directive('mMap', function() {
    return {
      restrict: 'E',
      template: fs.readFileSync(path.join(__dirname, 'm-map.html'), 'utf8'),
      link: function() {},
      controller: function($scope, $uPlatform, $uMoblet, $uFeedLoader) {
        $scope.load = function() {
          $scope.isLoading = true;
          $uFeedLoader.load($scope.moblet, 1, false)
            .then(function(data) {
              $scope.map = {
                address: "Rua James Watt, 84 - 04576-050",
                description: "Fab",
                enable_control: "1",
                imageHeight: 100,
                imageUrl: "http://maps.google.com/maps/api/staticmap?center=-23.6118517,-46.6947361&zoom=17&size=100x100&maptype=mobile&markers=color:blue%7Clabel:M%7C-23.6118517,-46.6947361&sensor=true",
                imageWidth: 100,
                latitude: "-23.6118517",
                longitude: "-46.6947361",
                zoom: "17"
              }
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
          var latLng = new google.maps.LatLng(
            $scope.map.latitude, $scope.map.longitude);

          var mapOptions = {
            center: latLng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };

          $scope.googleMap = new google.maps.Map(
            document.getElementById("umap_" + $scope.moblet.id), mapOptions);

          google.maps.event.addListenerOnce(
            $scope.googleMap, 'idle', function() {
              var marker = new google.maps.Marker({
                map: $scope.googleMap,
                animation: google.maps.Animation.DROP,
                position: latLng
              });

              var infoWindow = new google.maps.InfoWindow({
                content: $scope.map.address + "<br>" + $scope.map.description
              });

              google.maps.event.addListener(marker, 'click', function() {
                infoWindow.open($scope.googleMap, marker);
              });
            });

          return true;
        };

        $scope.init();
      },
      controllerAs: 'uMapController'
    };
  });
