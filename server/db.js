// db.js
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Database connection configuration
const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:zanyraccoon881@localhost:5432/acme_reservation_planner',
});

// Connect to the database
const connectToDb = async () => {
    try {
        await client.connect();
        console.log('Connected to the database successfully.');
    } catch (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    }
};

// Function to create tables
const createTables = async () => {
    const query = `
        DROP TABLE IF EXISTS reservations CASCADE;
        DROP TABLE IF EXISTS customers CASCADE;
        DROP TABLE IF EXISTS restaurants CASCADE;

        CREATE EXTENSION IF NOT EXISTS "pgcrypto";

        CREATE TABLE IF NOT EXISTS customers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS restaurants (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS reservations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            date DATE NOT NULL,
            party_count INTEGER NOT NULL,
            restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
            customer_id UUID REFERENCES customers(id) NOT NULL
        );
    `;
    try {
        await client.query(query); 
        console.log('Tables created successfully.');
    } catch (err) {
        console.error('Error creating tables:', err);
        throw err;
    }
};

// Function to fetch all customers
const fetchCustomers = async () => {
    try {
        const result = await client.query('SELECT * FROM customers;');
        return result.rows;
    } catch (err) {
        console.error('Error fetching customers:', err);
        throw err;
    }
};

// Function to fetch all restaurants
const fetchRestaurants = async () => {
    try {
        const result = await client.query('SELECT * FROM restaurants');
        return result.rows;
    } catch (err) {
        console.error('Error fetching restaurants:', err);
        throw err;
    }
};

// Function to fetch all reservations
const fetchReservation = async () => {
    try {
        const result = await client.query('SELECT * FROM reservations');
        return result.rows;
    } catch (err) {
        console.error('Error fetching reservations:', err);
        throw err;
    }
};

// Function to create a new customer
const createCustomer = async (name) => {
    try {
        const result = await client.query(
            'INSERT INTO customers (name) VALUES ($1) RETURNING *',
            [name]
        );
        return result.rows[0];
    } catch (err) {
        console.error('Error creating customer:', err);
        throw err;
    }
};

// Function to create a new restaurant
const createRestaurant = async (name) => {
    try {
        const result = await client.query(
            'INSERT INTO restaurants (name) VALUES ($1) RETURNING *',
            [name]
        );
        return result.rows[0];
    } catch (err) {
        console.error('Error creating restaurant:', err);
        throw err;
    }
};

// Function to create a new reservation
const createReservation = async (date, party_count, restaurant_id, customer_id) => {
    try {
        const result = await client.query(
            'INSERT INTO reservations (date, party_count, restaurant_id, customer_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [date, party_count, restaurant_id, customer_id]
        );
        return result.rows[0];
    } catch (err) {
        console.error('Error creating reservation:', err);
        throw err;
    }
};

// Function to delete a reservation
const destroyReservation = async (id) => {
    try {
        const result = await client.query(
            'DELETE FROM reservations WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    } catch (err) {
        console.error('Error deleting reservation:', err);
        throw err;
    }
};

module.exports = {
    client,
    connectToDb,
    createTables,
    fetchCustomers,
    fetchRestaurants,
    createCustomer,
    createRestaurant,
    createReservation,
    destroyReservation,
    fetchReservation,
};
