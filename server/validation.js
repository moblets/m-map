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
    var searchType = '';
    var searchTerm = '';

    // If LatLng is not filled, use the address to search the location
    if (location.latlng === '' ||
        location.latlng === undefined ||
        location.latlng === null) {
      searchType = 'address';
      searchTerm = encodeURIComponent(location.address);
    // If it's filled, check if the LatLng exists
    } else {
      searchType = 'latlng';
      searchTerm = encodeURIComponent(location.latlng);
    }
    // "Rua James Watt, 84 - são paulo - sp"
    getGoogleMapsData(searchTerm, searchType, function(mapData) {
      // console.log(mapData);
      if (mapData.status === 'OK') {
        valid = true;
        response = {
          data: {
            latitude: mapData.results[0].geometry.location.lat,
            longitude: mapData.results[0].geometry.location.lng
          }
        };
      } else {
        valid = false;
        response.errors = {};
        response.errors[searchType] = 'error_' + searchType;
      }
      callback(valid, response);
    });
  }
};

/**
 * Get Google Maps data for a given address
 * @param  {String}   searchTerm  The term to be searched
 * @param  {String}   searchType  The type of the search (address or latlng)
 * @param  {Function} callback callback function that will receive the Google
 * Maps response as an Object
 */
function getGoogleMapsData(searchTerm, searchType, callback) {
  var http = require('http');
  var response = '';
  var host = 'http://maps.googleapis.com/maps/api/geocode/json' +
  '?sensor=false&' + searchType + '=' + searchTerm;

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
