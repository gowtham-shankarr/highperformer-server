require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8080;
const pool = require('./src/config/database');

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

const companyRoutes = require('./src/api/routes/companyRoutes');
const listRoutes = require('./src/api/routes/listRoutes');

app.use('/companies', companyRoutes);
app.use('/list', listRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the High Performer App!');
});

async function testDatabaseConnection() {
    try {
        const [results, fields] = await pool.query('SELECT 1 + 1 AS solution');
        console.log('The solution is: ', results[0].solution);
    } catch (error) {
        console.error('Database connection error:', error);
    }
}

testDatabaseConnection();

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.use((req, res, next) => {
    res.status(404).send('404 Not Found');
});
