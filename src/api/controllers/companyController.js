const db = require('../../config/database');

exports.createCompany = async (req, res) => {
    const { company_name, description, linkedin, domains, twitter, categories, twitter_follower } = req.body;
    const query = 'INSERT INTO Companies (company_name, description, linkedin, domains, twitter, categories, twitter_follower) VALUES (?, ?, ?, ?, ?, ?, ?)';

    try {
        const [results] = await db.query(query, [company_name, description, linkedin, domains, twitter, categories, twitter_follower]);
        res.status(201).json({ message: 'Company created', companyId: results.insertId });
    } catch (error) {
        res.status(500).json({ error });
    }
};

exports.listCompanies = async (req, res) => {
    try {
        const configQuery = 'SELECT setting_value FROM Configuration WHERE setting_name = "column_order"';
        const [configRows] = await db.query(configQuery);
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

        const [companies] = await db.query(query, queryParams);

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

exports.updateColumnOrder = async (req, res) => {
    try {
        const newOrder = req.body.columnOrder;
        const selectQuery = 'SELECT * FROM Configuration WHERE setting_name = "column_order"';
        const [selectResults] = await db.query(selectQuery);
        let query;
        if (selectResults.length === 0) {
            query = 'INSERT INTO Configuration (setting_name, setting_value) VALUES ("column_order", ?)';
        } else {
            query = 'UPDATE Configuration SET setting_value = ? WHERE setting_name = "column_order"';
        }
        await db.query(query, [JSON.stringify(newOrder)]);
        res.json({ message: 'Column order updated' });
    } catch (error) {
        console.error("Error in updateColumnOrder:", error);
        res.status(500).json({ error: error.message });
    }
};




