'use strict';

require('dotenv').config();
const express = require('express');
const app = express();
// const client = require('pg');
const cors = require('cors');
const superagent = require("superagent");
const PORT = process.env.PORT || 3000;

app.use(cors());

// container for .env variables
const client = new pg.Client(precess.end.DATABASE_URL);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

app.get('/location', (request, response) => {
    searchLoc(request.query.data) //pulls what was input into field
        .then(location => {
            response.send(location) //responds with text entered into field
        })
});

// function constructor
function Location(query, data) {
    this.search_query = query; //outputs what was entered into field
    this.formatted_query = data.body.results[0].formatted_address; //outputs the formatted_query in JSON AKA the City, State, Country
    this.latitude = data.body.results[0].geometry.location.lat; //outputs the Latitude of the element in JSON
    this.longitude = data.body.results[0].geometry.location.lng; //outputs the Longitude of the element in JSON
}

function searchLoc(query) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`; // defines the URL for the JSON of Maps, passes in what was put intot he field and my API key
    return superagent.get(url)
        .then(res => {
            let test = new Location(query, res);
            console.log(url);
            return test;
        })
}

app.get('/weather', (request, response) => {
    try {
        searchWea(request.query.data)
            .then(weather => {
                console.log("Weather: ", weather);
                response.send(weather);
            })
            // const jsonData = require("./data/darksky.json");
            // const objVal = Object.values(jsonData.daily.data);
            // const var1 = objVal.map(data => new Weather(data));
    } catch (error) {
        console.log('There was an error loading the weather data')
        response.status(500).send("Server error", error);
    }
})

function Weather(data) {
    this.forecast = data.summary;
    this.time = new Date(data.time * 1000).toString().slice(0, 15);
}

function searchWea(query) {
    const url = 'https://api.darksky.net/forecast/${}';
    return superagent.get(url)
        .then(res => {
            let test = new Weather(query, res);
            console.log(url);
            return test;
        })
}