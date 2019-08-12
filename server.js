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
// const client = new pg.Client(precess.end.DATABASE_URL);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

app.get('/location', searchLoc);
app.get('/weather', searchWea);
app.get('/events', searchEve)

function Location(query, data) {
    this.search_query = query; //outputs what was entered into field
    this.formatted_query = data.body.results[0].formatted_address; //outputs the formatted_query in JSON AKA the City, State, Country
    this.latitude = data.body.results[0].geometry.location.lat; //outputs the Latitude of the element in JSON
    this.longitude = data.body.results[0].geometry.location.lng; //outputs the Longitude of the element in JSON
}

function searchLoc(request, response) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODE_API_KEY}`;
    superagent.get(url)
        .then(result => {
            response.send(new Location(request.query.data, result));
        })
        .catch(error => eventError(error, response))

}

function Weather(data) {
    this.forecast = data.summary;
    this.time = new Date(data.time * 1000).toString().slice(0, 15);
}

function searchWea(request, response) {
    const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;
    superagent.get(url)
        .then(result => {
            // console.log(result.body.daily.data);
            const wea = result.body.daily.data.map(
                test => new Weather(test)
            );
            response.send(wea);
        })
        .catch(error => eventError(error, response))
}

function Event(data) {
    this.link = data.url;
    this.name = data.name.text;
    this.event_date = new Date(data.start.local).toString().slice(0, 15);
    this.summary = data.summary;
}

function searchEve(request, response) {
    const url = `https://www.eventbriteapi.com/v3/events/search?token=${process.env.EVENTBRITE_API_KEY}&location.address=${request.query.data.search_query}`;
    superagent.get(url)
        .then(result => {
            const events = result.body.events.map(data => {
                return new Event(data);
            });
            response.send(events);
        })
        .catch(error => eventError(error, response))
}

function eventError() {
    console.error(error);
    if (response) {
        response.status(500).send("Sorry, something went wrong here.");
    }
}