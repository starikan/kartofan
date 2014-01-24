var express = require('express'),
    request = require('request').defaults({ encoding: null }),
    http = require('http'),
    fs = require('fs'),

    app = express();

app.use(express.static(__dirname + './js'));
app.use(express.static(__dirname + './js_vendor'));
app.use(express.static(__dirname + './js_vendor/images'));
app.use(express.static(__dirname + './css'));
app.use(express.static(__dirname + './css_vendor'));
app.use(express.static(__dirname + './data'));
app.use(express.static(__dirname + './images'));
app.use(express.static(__dirname + './css/fonts'));
app.use(express.static(__dirname + './css_vendor/fonts'));
app.use(express.static(__dirname + './css_vendor/images'));
app.use(express.static(__dirname + './'));

app.get('/cache', function(req, res){

    if(req.param("url") && req.param("callback") && req.param("y") && req.param("x") && req.param("z") && req.param("base")) {

        var mimetypeArr = ["image/gif", "image/jpeg", "image/jpg", "image/png", "image/tiff"];

        var url = unescape(req.param("url")),
            callback = req.param("callback") || "",

            x = req.param("x"),
            y = req.param("y"),
            z = req.param("z"),
            base = req.param("base");                    

        fs.mkdir(base, function(err){});
        fs.mkdir(base+"/x"+x, function(err){});
        fs.mkdir(base+"/x"+x+"/y"+y, function(err){});

        request.get(url, function (error, response, body) {

            if (!error && response.statusCode == 200) {
                
                var mimetype = response.headers["content-type"];

                if (mimetypeArr.indexOf(mimetype) != -1){

                    data = "data:" + mimetype + ";base64," + new Buffer(body).toString('base64');

                    res.writeHead(200, {'Content-Type': 'application/javascript; charset=UTF-8'});
                    res.end(callback + "(" + JSON.stringify(data) + ");");

                    var fileName = base+"/x"+x+"/y"+y+"/z"+z+"."+mimetype.replace("image/", "");
                    console.log(fileName);

                    try{
                        fs.writeFileSync(fileName, new Buffer(body));
                    }
                    catch(e){}

                }

            }
        })
    }

 });

app.get('/ozi2tiles', function(req, res){

 });

app.listen(3000, function() {
  console.log('Running on http://127.0.0.1:3000');
 });