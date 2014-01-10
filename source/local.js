var express = require('express'),
    app = express();

app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/js_vendor'));
app.use(express.static(__dirname + '/js_vendor/images'));
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/css_vendor'));
app.use(express.static(__dirname + '/data'));
app.use(express.static(__dirname + '/images'));
app.use(express.static(__dirname + '/css/fonts'));
app.use(express.static(__dirname + '/css_vendor/fonts'));
app.use(express.static(__dirname + '/css_vendor/images'));
app.use(express.static(__dirname + '/'));

app.listen(54321, function() {
  console.log('Running on http://127.0.0.1:54321');
});