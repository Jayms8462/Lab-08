'use strict';

require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');

const PORT = process.env.PORT || 3000;

app.use(cors());
//create a route with a method of get and a path of location
app.get('/location', (request, response) => {
    try {
        let locationData = getData(request.query.data);
        response.send(locationData);
    } catch (error) {
        console.log('There was an error!');
    }
});

app.get('/weather', (request, response) => {
    try {
        const jsonData = require("./data/darksky.json");
        const objVal = Object.values(jsonData.daily.data);
        const var1 = objVal.map(data => new Weather(data));
        response.send(var1);
    } catch (error) {
        console.log('There was an error loading the weather data')
    }
})

function error(err, response) {
    console.error(err);
    if (response) {
        response.status(500).send("Sorry, Try Again Later");
    }
}
//function to be invoked by the get() 

function getData(locationName) {
    let jsonData = require('./data/geo.json');
    let location = new Location(locationName, jsonData);
    return location;
}

// function constructor
function Location(query, jsonData) {
    this.sear_query = query;
    this.formatted_query = jsonData.results[0].formatted_address, this.latitude = jsonData.results[0].geometry.location.lat, this.longitude = jsonData.results[0].geometry.location.lng
}

function Weather(data) {
    this.forecast = data.summary;
    this.time = new Date(data.time * 1000).toString().slice(0, 15);
}

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))