const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.RDS_HOST,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DB_NAME,
    port: process.env.RDS_PORT
});

module.exports = pool.promise();
