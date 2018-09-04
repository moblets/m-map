/* eslint no-undef: [0]*/
module.exports = {
  title: "mMap",
  style: "m-map.less",
  template: 'm-map.html',
  i18n: {
    pt: "lang/pt-BR.json",
    en: "lang/en-US.json"
  },
  link: function() {
    console.log('REGISTERED API KEY:(' + $scope.mapData.userApiKey + ')');

    $mInjector.inject('https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js');
    $mInjector.inject('https://maps.google.com/maps/api/js?key=' + $scope.mapData.userApiKey + '&amp;sensor=true');
  },
  controller: function(
    $scope,
    $rootScope,
    $stateParams,
    $filter,
    $ionicScrollDelegate,
    $timeout,
    $mDataLoader,
    $mAlert,
    $mFrameSize,
    $mWebview,
    $mPlatform
  ) {
    /**
     * Find the center of the map based on the locations.
     * Get the 4 most extree points and fix it's center
     */
    var findCenter = function() {
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

    var markerListener = function(infoWindow, marker, location) {
      return function() {
        infoWindow.setContent(
          '<div class="marker">' +
          '<h1>' + location.title + '</h1>' +
          '<p>' + location.address + '</p>' +
          '</div>');
        infoWindow.open($scope.googleMap, marker);
      };
    };
    /**
     * Add the markers to the map
     * @param  {Array} locations Array of objects with each location detail
     */
    var addMarkers = function(locations) {
      // Add the pins
      var markers = [];
      for (var j = 0; j < locations.length; j++) {
        var infoWindow = new google.maps.InfoWindow();
        var marker = new google.maps.Marker(
          {
            position: new google.maps.LatLng(
              locations[j].latitude,
              locations[j].longitude
            ),
            map: $scope.googleMap,
            animation: google.maps.Animation.DROP
          }
        );
        markers.push(marker);
        // Add the pins content
        google.maps.event.addListener(
          marker,
          'click',
          markerListener(infoWindow, marker, locations[j])
        );
      }
      var markerCluster = new MarkerClusterer($scope.googleMap, markers,
         {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'}
         );
    };

    /**
     * Find the user current location
     */
    var findUserLocation = function() {
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
            animation: google.maps.Animation.DROP,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#46AEE2',
              fillOpacity: 0.9,
              strokeColor: '#4778BB',
              strokeWeight: 2,
              scale: 8
            }
          });
        }, function() {
          browserSupportFlag = false;
          // handleNoGeolocation(browserSupportFlag);
        });
      } else {
        browserSupportFlag = false;
        // handleNoGeolocation(browserSupportFlag);
      }
    };

    /**
     * Uses "u-make-frame-min-size" to split the screen in percentage
     * @param  {Integer} factor The percentage of the screen the element
     * should use
     * @return {String}        The height in pixels with "px" in the end
     */
    var screenHeightLessButton = function(variant) {
      var height = parseInt($mFrameSize.height(), 10);
      return (height - 44) + (variant || 0) + "px";
    };

    var loadMap = function() {
      $timeout(function() {
        // Wait until 'maps api' has been injected
        if (typeof google === "undefined" && typeof markerclusterer === "undefined") {
          loadMap();
        } else {
          // Find and set user location
          findUserLocation();

          $scope.googleMap = google;
          var mapData = $scope.mapData;
          var locations = mapData.locations;
          var mapDiv = document.getElementById('m-map-' + $scope.moblet.instance.id);

          var mapTypeId = mapData.mapTypeId || 'ROADMAP';

          // Set the map options
          var mapOptions = {
            mapTypeControl: mapData.mapTypeControl,
            streetViewControl: mapData.streetViewControl,
            panControl: mapData.panControl,
            rotateControl: mapData.rotateControl,
            zoomControl: mapData.zoomControl,
            center: new google.maps.LatLng(
              mapData.centerLatitude,
              mapData.centerLongitude
            ),
            mapTypeId: google.maps.MapTypeId[mapTypeId]
          };

          $scope.googleMap = new google.maps.Map(mapDiv, mapOptions);
          addMarkers(locations);

          // Auto set the map zoom using the extreme points
          $scope.googleMap.fitBounds(new google.maps.LatLngBounds(
            new google.maps.LatLng($scope.latitudeMin, $scope.longitudeMin),
            new google.maps.LatLng($scope.latitudeMax, $scope.longitudeMax)
          ));

          // Remove the Moblets loader after the map finish loading
          $scope.googleMap.addListener('idle', function() {
            $timeout(function() {
              $scope.moblet.isLoading = false;

              var zoomButtons = document
                .getElementsByClassName('zoom-button');
              for (var z = 0; z < zoomButtons.length; z++) {
                zoomButtons[z].className += ' animate';
              }
              document
                .getElementById('m-map-' + $scope.moblet.instance.id)
                .className = 'animate';
              document
                .getElementById('m-map-list')
                .className += ' animate';
            }, 1);
          });
        }
      }, 100);
    };

    var init = function() {
      $scope.moblet.isLoading = true;
      dataLoadOptions = {
        cache: false
      };
      $mDataLoader.load($scope.moblet, dataLoadOptions)
        .then(function(data) {
          if (_.isEmpty(data)) {
            $scope.moblet.noContent = true;
            $scope.moblet.isLoading = false;
          } else {
            $scope.moblet.noContent = false;
          // Put the data from the feed in the $scope object
            $scope.mapData = data;
          // Split the screen in two portions. The show list button is 49px
          // and the map will take the remaining portion of the screen.
          // The list and the "show map" botton are set to 0.
            $scope.contentHeight = screenHeightLessButton(49);
            $scope.mapHeight = screenHeightLessButton();
            $scope.listHeight = 0;
            $scope.zoomListButtonHeight = "49px";

          // Set the Ionic scroll javascript to the list of locations
          // You need to set 'delegate-handle="listMapScroll"' on the
          // HTML
            // $ionicScrollDelegate.$getByHandle('listMapScroll').resize();

            findCenter();
            loadMap();
          }
        });
    };

    /*
     * Focus and expand the list of locations
     */
    $scope.zoomList = function() {
      $scope.listZooned = true;
      $scope.mapHeight = 0;
      $scope.listHeight = "auto";
      // $scope.zoomMapButtonHeight = "49px";
      // $scope.zoomListButtonHeight = 0;
      // $ionicScrollDelegate.$getByHandle('listMapScroll').resize();
    };

    /**
     * Focus and expand the map
     */
    $scope.zoomMap = function() {
      $scope.listZooned = false;
      $scope.mapHeight = screenHeightLessButton();
      $timeout(function() {
        $scope.listHeight = 0;
      }, 500);
      // $scope.zoomMapButtonHeight = 0;
      // $scope.zoomListButtonHeight = "49px";
      // $ionicScrollDelegate.$getByHandle('listMapScroll').resize();
    };

    $scope.zoomToogle = function() {
      if ($scope.listZooned) {
        $scope.zoomMap();
      } else {
        $scope.zoomList();
      }
    };

    $scope.iOsStandalone = $mPlatform.isIOS() && window.navigator.standalone;

    $scope.getExternalMapLink = function(key) {
      var address = $scope.mapData.locations[key].address;
      var latitude = $scope.mapData.locations[key].latitude;
      var longitude = $scope.mapData.locations[key].longitude;

      return 'https://www.google.com.br/maps/place/' +
        address + '/@' + latitude + ',' + longitude;
    };

    $scope.openLocation = function(key) {
      $mAlert.dialog(
        $filter('translate')("open_in_map_app_title"),
        $filter('translate')("open_in_map_app_message"),
        [
          $filter('translate')("cancel"),
          $filter('translate')("confirm")
        ]
      )
        .then(function(success) {
          if (success) {
            var mapUrl = $scope.getExternalMapLink(key);
            mapUrl = encodeURI(mapUrl);
            $mWebview
              .open(0, mapUrl, "_system", undefined, "", "", "", "", false);
          }
        });
    };

    $rootScope.$on('$uFrameInteractions:ulist:refresh', function() {
      $timeout(function() {
        init();
      }, 10);
    });
    var frameEvent = '$uFrameInteractions:refreshPage:moblet_refresh:';
    frameEvent += $stateParams.pageId;
    $rootScope.$on(frameEvent, function() {
      $timeout(function() {
        init();
      }, 10);
    });

    init();
  }
};
