require('./m-map.scss');
var path = require('path');
var fs = require('fs');
/* eslint no-undef: [0]*/
/*
 * TODO: Inject <script src="http://maps.google.com/maps/api/js?key=AIzaSyDNzstSiq9llIK8b49En0dT-yFA5YpManU&amp;sensor=true"></script>
in the app
 */
angular.module("uMoblets")
  .directive('mMap', function() {
    function loadScript() {
      var s = document.createElement('script'); // use global document since Angular's $document is weak
      s.src = 'http://maps.google.com/maps/api/js?key=AIzaSyDNzstSiq9llIK8b49En0dT-yFA5YpManU&amp;sensor=true';
      document.body.appendChild(s);
    }
    function lazyLoadApi() {
      var deferred = $q.defer();
      $window.initialize = function() {
        deferred.resolve();
      };
      // thanks to Emil Stenström: http://friendlybit.com/js/lazy-loading-asyncronous-javascript/
      if ($window.attachEvent) {
        $window.attachEvent('onload', loadScript);
      } else {
        $window.addEventListener('load', loadScript, false);
      }
      return deferred.promise;
    }
    return {
      restrict: 'E',
      template: fs.readFileSync(path.join(__dirname, 'm-map.html'), 'utf8'),
      link: function($scope, element, attrs) { // function content is optional
        // in this example, it shows how and when the promises are resolved
        if ($window.google && $window.google.maps) {
          console.log('gmaps already loaded');
        } else {
          lazyLoadApi().then(function() {
            console.log('promise resolved');
            if ($window.google && $window.google.maps) {
              console.log('gmaps loaded');
            } else {
              console.log('gmaps not loaded');
            }
          }, function() {
            console.log('promise rejected');
          });
        }
      },
      controller: function($scope, $uPlatform, $uMoblet, $uFeedLoader) {
        $scope.load = function() {
          $scope.isLoading = true;
          $uFeedLoader.load($scope.moblet, 1, false)
            .then(function(data) {
              $scope.map = data.map;
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
