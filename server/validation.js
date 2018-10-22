// node com a validação
// var uLang = require('uLang');
// var http = require('http');

module.exports = {
  /**
   * Validate a given address as a valid Google Maps address
   * @param {Object}   location Object with one of the "locations" array data.
   * @param {Function} callback The callback that will be called when the
   * validation finishes. The callback parameters are a Boolean, that responds
   * if it's valid and an Object with the response data
   */
  locations: function(location, callback) {
    var valid = false;
    var response = {};

    // If LatLng is not filled, use the address to search the location
    if (location.latlng === '' ||
        location.latlng === undefined ||
        location.latlng === null) {
      // "Rua James Watt, 84 - são paulo - sp"
      getGoogleMapsData(location.address, function(mapData) {
        // console.log(mapData);

        if ('lat' in mapData && 'lon' in mapData) {
          valid = true;
          response = {
              data: {
                  latitude: mapData.lat,
                  longitude: mapData.lon
              }
          };
        } else {
          valid = false;
          response.errors = {};
          response.errors.address = 'error_address';
        }
        callback(valid, response);
      });

    // If it's filled, check if the LatLng exists
    } else {
      var latLng = location.latlng.split(',');
      valid = true;
      response = {
        data: {
          latitude: latLng[0],
          longitude: latLng[1]
        }
      };
      callback(valid, response);
    }
  }
};

/**
 * Get Google Maps data for a given address
 * @param  {String}   address  The address to be searched
 * @param  {Function} callback callback function that will receive the Google
 * Maps response as an Object
 */
// function getGoogleMapsData(address, callback) {
//   var https = require('https');
//   var response = '';
//   var host = 'https://maps.googleapis.com/maps/api/geocode/json' +
//   '?key=AIzaSyAElFflv-vOQH-qdFMYcpeM-rIZqviBzQg&sensor=false&address=' + address;

//   https.get(host, function(res) {
//     res
//       .on("data", function(chunk) {
//         response += chunk;
//       })
//       .on('end', function() {
//         callback(JSON.parse(response));
//       })
//       .on('error', function(e) {
//         console.log(`Got error: ${e.message}`);
//       });
//   });
// }

function getGoogleMapsData(address, callback) {
  var https = require('https');
  var response = '';
  const querystring = require('querystring');

  var options = {
      hostname: 'nominatim.openstreetmap.org',
      port: 443,
      path: '/search?&format=json&limit=1&' + querystring.stringify({
          q: address
      }),
      method: 'GET',
      headers: {
          'referer': 'https://fabricadeaplicativos.com.br/'
      }
  };

  https.get(options, function (res) {
      res
          .on("data", function (chunk) {
              response += chunk;
          })
          .on('end', function () {
            try {
              response = JSON.parse(response);
              if (Array.isArray(response) && response.length > 0)
                response = response[0];
            } catch(e) {
              console.error('Error in object paser. ' + e.message);
              console.error(response);
              response = { error: 'Error in object paser. ' + e.message};
            }

            callback(response);
          })
          .on('error', function (e) {
              console.log(`Got error: ${e.message}`);
              callback({
                  error: e.message
              });
          });
  });
}
