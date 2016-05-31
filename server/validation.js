// node com a validação
// var uLang = require('uLang');
// var http = require('http');

module.exports = {
  /**
   * Validate a given address as a valid Google Maps address
   * @param  {String} address The address
   * @return {Object}         Object with a boolean key called 'valid'. If
   * valid is true, another object called data is included. If not valid, an
   * object called errors is included.
   */
  address: function(address) {
    var response = {};
    // "Rua James Watt, 84 - são paulo - sp"
    getGoogleMapsData(address, function(mapData) {
      // console.log(mapData);
      if (mapData.status === 'OK') {
        response = {
          valid: true,
          data: {
            latitude: mapData.results[0].geometry.location.lat,
            longitude: mapData.results[0].geometry.location.lng
          }
        };
      } else {
        response = {
          valid: false,
          errors: {
            address: 'error_address'
          }
        };
      }
    });
    return response;
  }
};

/**
 * Get Google Maps data for a given address
 * @param  {String}   address  The address
 * @param  {Function} callback callback function that will receive the Google
 * Maps response as an Object
 */
function getGoogleMapsData(address, callback) {
  var http = require('http');
  var response = '';
  var host = 'http://maps.googleapis.com/maps/api/geocode/json' +
  '?sensor=false&address=' +
  encodeURIComponent(address);

  http.get(host, function(res) {
    res
      .on("data", function(chunk) {
        response += chunk;
      })
      .on('end', function() {
        callback(JSON.parse(response));
      })
      .on('error', function(e) {
        console.log(`Got error: ${e.message}`);
      });
  });
}
