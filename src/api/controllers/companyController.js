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

exports.listCompanies = (req, res) => {
    let query = 'SELECT * FROM Companies';
    let conditions = [];
    let queryParams = [];

    // Search filter
    if (req.query.search) {
        conditions.push("company_name LIKE ?");
        queryParams.push(`%${req.query.search}%`);
    }

    // Category filter
    if (req.query.category) {
        conditions.push("categories LIKE ?");
        queryParams.push(`%${req.query.category}%`);
    }

    // Add WHERE clause if there are conditions
    if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    const sortOptions = req.query.sort ? JSON.parse(req.query.sort) : [];
    const orderConditions = sortOptions.map(sortOption => {
        const validSortFields = ['Domains', 'Description', 'Categories', 'LinkedIn', 'id'];
        const field = validSortFields.includes(sortOption.field) ? sortOption.field : null;
        const order = sortOption.order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        return field ? `${field} ${order}` : '';
    }).filter(condition => condition);

    if (orderConditions.length === 0) {
        const defaultOrderBy = 'id'; 
        const defaultOrderType = 'ASC';
        query += ` ORDER BY ${defaultOrderBy} ${defaultOrderType}`;
    } else {
        query += ' ORDER BY ' + orderConditions.join(', ');
    }

    console.log("Final SQL Query:", query);

    db.query(query, queryParams, (error, results) => {
        if (error) {
            console.error('Error in listCompanies query:', error);
            return res.status(500).json({ error: 'Error retrieving data' });
        }
        res.json({ companies: results });
    });
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

exports.updateColumnOrder = (req, res) => {
    const userId = req.userId; 
    const { columnOrder } = req.body;
    const query = 'UPDATE UserPreferences SET column_order = ? WHERE user_id = ?';
    db.query(query, [columnOrder, userId], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.json({ message: 'Column order updated' });
    });
};
