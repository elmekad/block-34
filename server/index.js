// index.js
const express = require('express');
const {
    connectToDb,
    createTables,
    fetchCustomers,
    fetchRestaurants,
    fetchReservation,
    createCustomer,
    createRestaurant,
    createReservation,
    destroyReservation,
} = require('./db');

const app = express();
app.use(express.json());

// Connect to the database and initialize tables
const initApp = async () => {
    try {
        await connectToDb();
        await createTables();
        await createCustomer('John Doe');
        await createCustomer('Jane Doe');
        await createCustomer('John');
        await createRestaurant('McDonald');
        await createRestaurant('KFC');
        await createRestaurant('Burger King');
        await createRestaurant('Wendys');
        const customers = await fetchCustomers();
        const restaurants = await fetchRestaurants();

        await createReservation('2022-06-01', 1,restaurants[0].id, 
           customers[0].id, 
            );
        console.log('Database initialized successfully.');

        // Start the server only after the database is ready
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to initialize the application:', err);
        process.exit(1);
    }
};

initApp();

// RESTful API routes

// GET /api/customers - Returns an array of customers
app.get('/api/customers', async (req, res, next) => {
    try {
        const customers = await fetchCustomers();
        res.json(customers);
    } catch (err) {
        next(err);
    }
});

// GET /api/restaurants - Returns an array of restaurants
app.get('/api/restaurants', async (req, res, next) => {
    try {
        const restaurants = await fetchRestaurants();
        res.json(restaurants);
    } catch (err) {
        next(err);
    }
});

// GET /api/reservations - Returns an array of reservations
app.get('/api/reservations', async (req, res, next) => {
    try {
        const reservations = await fetchReservation();
        res.json(reservations);
    } catch (err) {
        next(err);
    }
});

// POST /api/customers - Creates a new customer
app.post('/api/customers', async (req, res, next) => {
    const { name } = req.body;
    try {
        const customer = await createCustomer(name);
        res.status(201).json(customer);
    } catch (err) {
        next(err);
    }
});

// POST /api/restaurants - Creates a new restaurant
app.post('/api/restaurants', async (req, res, next) => {
    const { name } = req.body;
    try {
        const restaurant = await createRestaurant(name);
        res.status(201).json(restaurant);
    } catch (err) {
        next(err);
    }
});

// POST /api/customers/:id/reservations - Creates a new reservation
app.post('/api/customers/:id/reservations', async (req, res, next) => {
    const { date, party_count, restaurant_id } = req.body;
    const { id } = req.params; // customer_id

    try {
        const reservation = await createReservation(date, party_count, restaurant_id, id);
        res.status(201).json(reservation);
    } catch (err) {
        next(err);
    }
});

// DELETE /api/reservations/:id - Deletes a reservation
app.delete('/api/reservations/:id', async (req, res, next) => {
    const { id } = req.params;

    try {
        const deletedReservation = await destroyReservation(id);
        if (!deletedReservation) {
            return res.status(404).json({ error: 'Reservation not found' });
        }
        res.status(204).end();
    } catch (err) {
        next(err);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
});
