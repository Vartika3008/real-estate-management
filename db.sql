CREATE TABLE Localities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE Properties (
    id SERIAL PRIMARY KEY,
    property_name VARCHAR(255) NOT NULL,
    locality_id INTEGER NOT NULL REFERENCES Localities(id),
    owner_name VARCHAR(255) NOT NULL
);
