const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'new_password',
    database: 'highperformer'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the MySQL server:', err);
        return;
    }
    console.log('Connected to the MySQL server.');
});

module.exports = db;
