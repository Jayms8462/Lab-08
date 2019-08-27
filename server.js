'use strict';
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const { Client } = require('pg');
require('dotenv').config();

app.use(cors());

// container for .env variables
app.use(express.urlencoded({ extended: true }));
const client = new Client(process.env.DATABASE_URL);
client.connect();


app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

app.get('/location', searchLoc);
app.get('/weather', searchWea);
app.get('/events', searchEve)

function Location(query, data) {
  this.search_query = query; //outputs what was entered into field
  this.formatted_query = data.body.results[0].formatted_address; //outputs the formatted_query in JSON AKA the City, State, Country
  this.latitude = data.body.results[0].geometry.location.lat; //outputs the Latitude of the element in JSON
  this.longitude = data.body.results[0].geometry.location.lng; //outputs the Longitude of the element in JSON
  const SQL = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING id;`;
  const values = [
    this.search_query,
    this.formatted_query,
    this.latitude,
    this.longitude
  ];
  loadDB(SQL, values);
}

function loadDB(SQL, values){
  return client.query(SQL, values)
    .then(response => {
      return response.rows[0].id;
    })
}
function getLocation(request, response){
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${request.query.data}&key=${process.env.GEOCODE_API_KEY}`;
  superagent.get(url)
    .then(result => {
      response.send(new Location(request.query.data, result));
    })
    .catch(error => handleError(error, response))
}

function searchLoc(request, response) {
  let SQL = `SELECT * FROM locations WHERE search_query LIKE '${request.query.data}';`;
  client.query(SQL)
    .then(data => {
      if (data.rowCount <= 0){
        getLocation(request, response)
      }
      else {
        response.send(data.rows[0]);
      }
    })
}

function Weather(data, request) {
  this.forecast = data.summary;
  this.time = new Date(data.time * 1000).toString().slice(0, 15);
  this.location_id = request.id;
  this.created_at = new Date().getTime();
  let SQL = `INSERT INTO weather (forecast, time, location_id, created_at) VALUES ($1, $2, $3, $4) RETURNING id;`;
  let values = [
    this.forecast,
    this.time,
    this.location_id,
    this.created_at
  ];
  loadDB(SQL, values);
}

function getWeather(request, response) {
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;
  superagent.get(url)
    .then(result => {
      const wea = result.body.daily.data.map(
        test => new Weather(test, request.query.data)
      );
      response.send(wea);
    })
    .catch(error => handleError(error, response))
}

function searchWea(request, response) {
  let SQL = `SELECT * FROM locations WHERE search_query LIKE '${request.query.data.id}';`;
  client.query(SQL)
    .then(data => {
      if (data.rowCount <= 0){
        getWeather(request, response)
      }
      else {
        response.send(data.rows[0]);
      }
    })
}

function Event(request, response, data) {
  this.link = data.url;
  this.name = data.name.text;
  this.event_date = new Date(data.start.local).toString().slice(0, 15);
  this.summary = data.summary;
  this.created_at = new Date().getTime(),
  this.location_id = request.query.data.id
  const SQL = `INSERT INTO events (link, name, event_date, summary, created_at, location_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`;
  const values = [
    this.link,
    this.name,
    this.event_date,
    this.summary,
    this.created_at,
    this.location_id
  ];
  loadDB(SQL, values)
}

function searchEve(request, response) {
  let SQL = `SELECT * FROM events WHERE id=${request.query.data.id};`;
  client.query(SQL)
    .then(data => {
      if (data.rowCount <= 0){
        getEvents(request, response)
      }
      else {
        response.send(data.rows[0]);
      }
    })
}

function getEvents(request, response) {
  const url = `https://www.eventbriteapi.com/v3/events/search?token=${process.env.EVENTBRITE_API_KEY}&location.address=${request.query.data.search_query}`;
  superagent.get(url)
    .then(result => {
      const events = result.body.events.map(data => {
        return new Event(request, response, data);
      });
      response.send(events);
    })
    .catch(error => handleError(error, response))
}

function handleError(error, response) {
  console.error(error);
  if (response) {
    response.status(500).send('Sorry, something went wrong here.');
  }
}
