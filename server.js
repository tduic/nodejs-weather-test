const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

const apiKey = process.env.OPENWEATHER_API_KEY;

app.use(express.static('public'));
app.use(bodyParser.urlencoded( {extended: true } ));
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
  res.render('index', {weather: null, error: null});
});

app.post('/', function (req, res) {
  let city = req.body.city;
  let url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=imperial&appid=${apiKey}`

  request(url, function (err, response, body) {
    if(err){
      res.render('index', {weather: null, error: 'Error, please try again'});
    } else {
      let weather = null;
      try {
        weather = JSON.parse(body);
      } catch (parseErr) {
        // Not JSON (e.g. an HTML error page from a proxy): fall through to the error page.
      }
      if(weather == null || weather.main == undefined){
        res.render('index', {weather: null, error: 'Error, please try again'});
      } else {
        let weatherText = `It's ${weather.main.temp} degrees in ${weather.name}!`;
        res.render('index', {weather: weatherText, error: null});
      }
    }
  });
})

// Only listen when run directly (`node server.js`), so tests can import the app.
if (require.main === module) {
  app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
  });
}

module.exports = app;
