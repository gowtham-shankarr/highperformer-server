const db = require('../../config/database');

exports.createCompany = (req, res) => {
    const { company_name, description, linkedin, domains, twitter, categories, twitter_follower } = req.body;
    const query = 'INSERT INTO Companies (company_name, description, linkedin, domains, twitter, categories, twitter_follower) VALUES (?, ?, ?, ?, ?, ?, ?)';

    db.query(query, [company_name, description, linkedin, domains, twitter, categories, twitter_follower], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.status(201).json({ message: 'Company created', companyId: results.insertId });
    });
};

// exports.listCompanies = (req, res) => {
//     let query = 'SELECT * FROM Companies';
//     let conditions = [];
//     let queryParams = [];
//     const validColumns = ['id', 'company_name', 'description', 'linkedin', 'domains', 'twitter', 'categories', 'twitter_follower'];

//     const filters = req.query.filters ? JSON.parse(req.query.filters) : [];

//     filters.forEach(filter => {
//         const column = filter.column;
//         const condition = filter.condition;
//         const value = filter.value;
        
//         if (!validColumns.includes(column)) {
//             return;
//         }

//         switch (condition) {
//             case 'contains':
//                 conditions.push(`${column} LIKE ?`);
//                 queryParams.push(`%${value}%`);
//                 break;
//             case 'not contains':
//                 conditions.push(`${column} NOT LIKE ?`);
//                 queryParams.push(`%${value}%`);
//                 break;
//             case 'starts with':
//                 conditions.push(`${column} LIKE ?`);
//                 queryParams.push(`${value}%`);
//                 break;
//             case 'ends with':
//                 conditions.push(`${column} LIKE ?`);
//                 queryParams.push(`%${value}`);
//                 break;
//             case 'is':
//                 conditions.push(`${column} = ?`);
//                 queryParams.push(value);
//                 break;
//             case 'is not':
//                 conditions.push(`${column} <> ?`);
//                 queryParams.push(value);
//                 break;
//             case 'empty':
//                 conditions.push(`${column} = '' OR ${column} IS NULL`);
//                 break;
//             case 'not empty':
//                 conditions.push(`${column} <> '' AND ${column} IS NOT NULL`);
//                 break;
//         }
//     });

//     // Search filter
//     if (req.query.search) {
//         conditions.push("company_name LIKE ?");
//         queryParams.push(`%${req.query.search}%`);
//     }

//     // Category filter
//     if (req.query.category) {
//         conditions.push("categories LIKE ?");
//         queryParams.push(`%${req.query.category}%`);
//     }

//     // Add WHERE clause if there are conditions
//     if (conditions.length) {
//         query += ' WHERE ' + conditions.join(' AND ');
//     }

//     const sortOptions = req.query.sort ? JSON.parse(req.query.sort) : [];
//     const orderConditions = sortOptions.map(sortOption => {
//         const validSortFields = ['Domains', 'Description', 'Categories', 'LinkedIn', 'id'];
//         const field = validSortFields.includes(sortOption.field) ? sortOption.field : null;
//         const order = sortOption.order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
//         return field ? `${field} ${order}` : '';
//     }).filter(condition => condition);

//     if (orderConditions.length === 0) {
//         const defaultOrderBy = 'id'; 
//         const defaultOrderType = 'ASC';
//         query += ` ORDER BY ${defaultOrderBy} ${defaultOrderType}`;
//     } else {
//         query += ' ORDER BY ' + orderConditions.join(', ');
//     }

//     console.log("Final SQL Query:", query);

//     db.query(query, queryParams, (error, results) => {
//         if (error) {
//             console.error('Error in listCompanies query:', error);
//             return res.status(500).json({ error: 'Error retrieving data' });
//         }
//         res.json({ companies: results });
//     });

//     db.query('SELECT setting_value FROM Configuration WHERE setting_name = "column_order"', (error, configResults) => {
//         if (error) {
//             console.error('Error fetching configuration:', error);
//             return res.status(500).json({ error: 'Error fetching configuration' });
//         }

//         const columnOrder = JSON.parse(configResults[0].setting_value);
//         const orderedResults = results.map(company => {
//             const orderedCompany = {};
//             columnOrder.forEach(column => {
//                 orderedCompany[column] = company[column];
//             });
//             return orderedCompany;
//         });

//         res.json({ companies: orderedResults });
//     });

// };

exports.listCompanies = async (req, res) => {
    try {
        const configQuery = 'SELECT setting_value FROM Configuration WHERE setting_name = "column_order"';
        const [configRows] = await db.promise().query(configQuery);
        const columnOrder = configRows.length > 0 ? JSON.parse(configRows[0].setting_value) : [];

        let query = 'SELECT * FROM Companies';
        let conditions = [];
        let queryParams = [];
        const validColumns = ['id', 'company_name', 'description', 'linkedin', 'domains', 'twitter', 'categories', 'twitter_follower'];

        const filters = req.query.filters ? JSON.parse(req.query.filters) : [];
        filters.forEach(filter => {
            if (validColumns.includes(filter.column)) {
                switch (filter.condition) {
                    case 'contains':
                        conditions.push(`${filter.column} LIKE ?`);
                        queryParams.push(`%${filter.value}%`);
                        break;
                    case 'not contains':
                        conditions.push(`${filter.column} NOT LIKE ?`);
                        queryParams.push(`%${filter.value}%`);
                        break;
                    case 'starts with':
                        conditions.push(`${filter.column} LIKE ?`);
                        queryParams.push(`${filter.value}%`);
                        break;
                    case 'ends with':
                        conditions.push(`${filter.column} LIKE ?`);
                        queryParams.push(`%${filter.value}`);
                        break;
                    case 'is':
                        conditions.push(`${filter.column} = ?`);
                        queryParams.push(filter.value);
                        break;
                    case 'is not':
                        conditions.push(`${filter.column} <> ?`);
                        queryParams.push(filter.value);
                        break;
                    case 'empty':
                        conditions.push(`(${filter.column} = '' OR ${filter.column} IS NULL)`);
                        break;
                    case 'not empty':
                        conditions.push(`(${filter.column} <> '' AND ${filter.column} IS NOT NULL)`);
                        break;
                }
            }
        });

        if (conditions.length) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        if (req.query.search) {
            const searchConditions = validColumns.map(column => `${column} LIKE ?`);
            const searchQueryPart = searchConditions.join(' OR ');
            if (conditions.length) {
                query += ` AND (${searchQueryPart})`;
            } else {
                query += ` WHERE (${searchQueryPart})`;
            }
            queryParams.push(...Array(validColumns.length).fill(`%${req.query.search}%`));
        }

        const sortOptions = req.query.sort ? JSON.parse(req.query.sort) : [];
        const orderConditions = sortOptions.map(sortOption => {
            if (validColumns.includes(sortOption.field)) {
                const order = sortOption.order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
                return `${sortOption.field} ${order}`;
            }
            return '';
        }).filter(condition => condition);

        if (orderConditions.length) {
            query += ' ORDER BY ' + orderConditions.join(', ');
        }

        console.log("Final SQL Query:", query);

        const [companies] = await db.promise().query(query, queryParams);

        const orderedResults = companies.map(company => {
            if (columnOrder.length) {
                const orderedCompany = {};
                columnOrder.forEach(column => {
                    orderedCompany[column] = company[column];
                });
                return orderedCompany;
            }
            return company; 
        });
        res.json({ companies: orderedResults });
    } catch (error) {
        console.error('Error in listCompanies:', error);
        res.status(500).json({ error: 'Error retrieving data' });
    }
};


exports.getCompany = (req, res) => {
    const companyId = req.params.id;
    const query = 'SELECT * FROM Companies WHERE id = ?';

    db.query(query, [companyId], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.json(results[0]);
    });
};

exports.updateCompany = (req, res) => {
    const companyId = req.params.id;
    const { company_name, description, linkedin, domains, twitter, categories, twitter_follower } = req.body;
    const query = 'UPDATE Companies SET company_name = ?, description = ?, linkedin = ?, domains = ?, twitter = ?, categories = ?, twitter_follower = ? WHERE id = ?';
    console.log('getCompany called with ID:', req.params.id);

    db.query(query, [company_name, description, linkedin, domains, twitter, categories, twitter_follower, companyId], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.json({ message: 'Company updated' });
    });
};

exports.deleteCompany = (req, res) => {
    const companyId = req.params.id;
    const query = 'DELETE FROM Companies WHERE id = ?';

    db.query(query, [companyId], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.json({ message: 'Company deleted' });
    });
};


// Assuming 'db' is your database connection object and it's already set up
exports.updateColumnOrder = (req, res) => {
    // console.log('Received column order:', req.body.columnOrder);
    console.log('Request body:', req.body);
    const newOrder = req.body.columnOrder;
    db.query('SELECT * FROM Configuration WHERE setting_name = "column_order"', (selectError, selectResults) => {
        if (selectError) {
            return res.status(500).json({ error: selectError.message });
        }
        let query;
        if (selectResults.length === 0) {
            // Insert new setting if it doesn't exist
            query = 'INSERT INTO Configuration (setting_name, setting_value) VALUES ("column_order", ?)';
        } else {
            // Update existing setting
            query = 'UPDATE Configuration SET setting_value = ? WHERE setting_name = "column_order"';
        }

        db.query(query, [JSON.stringify(newOrder)], (updateError, updateResults) => {
            if (updateError) {
                return res.status(500).json({ error: updateError.message });
            }
            res.json({ message: 'Column order updated', results: updateResults });
        });
    });
};

