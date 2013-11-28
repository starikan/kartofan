String.prototype.format = function() {
    var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined'
            ? args[number]
            : match
        ;
     });
 };

// isArray shim
if (! Array.isArray) {
    Array.isArray = function(obj) {
        return Object.prototype.toString.call(obj) === "[object Array]";
    };
 }

 L.CRS.EPSG3857.Ext = L.extend({}, L.CRS, {

    code: 'EPSG:3857.Ext',

    projection: {
        MAX_LATITUDE: 85.0511287798,
        dX: 0,
        dY: 0,

        project: function(latlng) { // (LatLng) -> Point
            var d = L.LatLng.DEG_TO_RAD,
                max = this.MAX_LATITUDE,
                lat = Math.max(Math.min(max, latlng.lat), -max),

                lat = lat + this.dY;
            lng = latlng.lng + this.dX;

            x = lng * d,
            y = lat * d;


            y = Math.log(Math.tan((Math.PI / 4) + (y / 2)));
            return new L.Point(x, y);
        },

        unproject: function(point) { // (Point, Boolean) -> LatLng
            var d = L.LatLng.RAD_TO_DEG,
                lng = (point.x) * d,
                lat = (2 * Math.atan(Math.exp(point.y)) - (Math.PI / 2)) * d;

            lat = lat - this.dY;
            lng = lng - this.dX;

            return new L.LatLng(lat, lng);
        }
    },
    transformation: new L.Transformation(0.5 / Math.PI, 0.5, -0.5 / Math.PI, 0.5),
 });