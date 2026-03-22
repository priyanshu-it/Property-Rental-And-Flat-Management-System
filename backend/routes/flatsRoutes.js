const express = require('express');
const router = express.Router();

const flatsController = require('../controllers/flatsController');
const authenticateToken = require('../middleware/auth');

// PUBLIC ROUTES
router.get('/all', flatsController.getAllFlats);

// PRIVATE ROUTES (Require authentication)
router.get('/myflats', authenticateToken, flatsController.getMyFlats);
router.post('/add', authenticateToken, flatsController.addFlat);
router.put('/:id', authenticateToken, flatsController.updateFlat);
router.put('/flats/:id', authenticateToken, flatsController.updateFlat); // flat id
router.delete('/:id', authenticateToken, flatsController.deleteFlat);

// Update contact info for a flat (can be public or private, based on your needs)
router.put('/updateContact/:id', flatsController.updateFlatContact);

module.exports = router;