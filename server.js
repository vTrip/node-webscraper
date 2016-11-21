var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var phantom = require('phantom');

app.get('/text', function(req, res){

  //All the web scraping magic will happen here
  // var url = "https://raw.githubusercontent.com/hroptatyr/dateutils/tzmaps/iata.tzmap";
  var url = "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat";

  request(url, function(error, response, html){
        // First we'll check to make sure no errors occurred when making the request
        if(!error){
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
            var $ = cheerio.load(html);
            var body = $.text();
            var start = 0;
            var json = {
              items: []
            }
            var string = "";
            var array = [];
            for (var i = 0; i < body.length; i++) {
              if (body[i] != '\n') {
                string = string.concat(body[i]);
              } else {
                array.push(string);
                string = "";
              }
            }

            var json = {
              "items": []
            }

            array.forEach(function(string) {
              var array = string.split(',');

              var object = {
                name: array[1],
                city: array[2],
                country: array[3],
                iata: array[4],
                icao: array[5],
                latitude: array[6],
                longitude: array[7],
                timezone: array[array.length-1]
              }

              json.items.push(object);
            });

            fs.writeFile('locations.json', JSON.stringify(json, null, 4), function(err){

                console.log('File successfully written! - Check your project directory for the output.json file');

            });
        }
    })
})


app.get('/nba', function(req, res){

  //All the web scraping magic will happen here
  var url = "http://au.global.nba.com/scores/";

  phantom.create(function (ph) {
    ph.createPage(function (page) {
      page.open(url, function (status) {
        page.evaluate(function () {
          return document.getElementsByClassName('td.team-abbrv');
        }, function (result) {
          console.log(result);
          ph.exit();
        });
      });
    });
  });
})

app.get('/scrape', function(req, res){

  //All the web scraping magic will happen here
  var url = "https://en.wikipedia.org/wiki/List_of_airports_by_IATA_code:_" + req.query.letter;

  request(url, function(error, response, html){
        // First we'll check to make sure no errors occurred when making the request
        if(!error){
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
            var $ = cheerio.load(html);

            var leaders = $('table.wikitable td');

            var array = {
              items: []
            };

            for (var i = 0; i < leaders.length; i+=4) {
              var airport = {
                iata: $(leaders[i]).text(),
                icao: $(leaders[i+1]).text(),
                airport_name: $(leaders[i+2]).text(),
                location: $(leaders[i+3]).text(),
                // time: $(leaders[i+4]).text(),
                // dst: $(leaders[i+5]).text()
              }
              array.items.push(airport);
            }

            fs.writeFile('output_' + req.query.letter + '.json', JSON.stringify(array, null, 4), function(err){

                console.log('File successfully written! - Check your project directory for the output.json file');

            });
        }
    })
});


app.listen('8081')

console.log('Magic happens on port 8081');

exports = module.exports = app;
