const express = require('express');
const morgan = require('morgan');
const app = express();
const port = 8080;
const cors = require('cors'); 

app.use(express.json());
app.use(morgan('dev'));

const db = require('./src/config/database');

const companyRoutes = require('./src/api/routes/companyRoutes');
const listRoutes = require('./src/api/routes/listRoutes');

app.use(cors());
app.use('/companies', companyRoutes);
app.use('/list', listRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the High Performer App!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

app.use((req, res, next) => {
    res.status(404).send('404 Not Found');
});
