DROP TABLE IF EXISTS locations, weather, events, movies, yelps;

CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    search_query TEXT,
    formatted_query TEXT,
    latitude DECIMAL,
    longitude DECIMAL
);

CREATE TABLE IF NOT EXISTS weather (
    id SERIAL PRIMARY KEY,
    forecast TEXT,
    time VARCHAR(255),
    created_at BIGINT,
    location_id INTEGER NOT NULL REFERENCES locations(id)
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    link TEXT, 
    name TEXT,
    event_date VARCHAR(255),
    summary TEXT,
    created_at BIGINT,
    location_id INTEGER NOT NULL REFERENCES locations(id)
);

CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
    title TEXT, 
    overview TEXT,
    average_votes DECIMAL,
    total_votes INTEGER,
    image_url TEXT,
    popularity DECIMAL,
    released_on TEXT,
    created_at BIGINT,
    location_id INTEGER NOT NULL REFERENCES locations(id)
);

CREATE TABLE IF NOT EXISTS yelps (
    id SERIAL PRIMARY KEY,
    name TEXT, 
    image_url TEXT,
    price TEXT,
    rating DECIMAL,
    url TEXT,
    created_at BIGINT,
    location_id INTEGER NOT NULL REFERENCES locations(id)
);