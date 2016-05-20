// node com a validação
// var uLang = require('uLang');
// var http = require('http');

module.exports = {
  address: function(address) {
    var response = {};

    response = googleMapRequest(address, function(mapData) {
      // console.log(mapData.results);
      response = JSON.parse(mapData);
    });
    console.log(response);

    // if(!isset($google_map['status']) || $google_map['status'] != 'OK'){
    // 	return {'error' => true};
    // }

  // global $latitude, $longitude;
  // $latitude = $google_map['results'][0]['geometry']['location']['lat'];
  // $longitude = $google_map['results'][0]['geometry']['location']['lng'];
  //
  // return array('new_value' => $address);
  }
};
function googleMapRequest(address, callback) {
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
        // console.log(response);
        callback(JSON.parse(response));
      })
      .on('error', function(e) {
        console.log(`Got error: ${e.message}`);
      });
  });
}
