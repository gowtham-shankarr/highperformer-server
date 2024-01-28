const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// CRUD
router.post('/', companyController.createCompany);
router.get('/', companyController.listCompanies);
router.get('/:id', companyController.getCompany);
router.put('/:id', companyController.updateCompany);
router.delete('/:id', companyController.deleteCompany);

// column order
router.post('/column-order', companyController.updateColumnOrder);

module.exports = router;
