// controllers/flatsController.js
const pool = require('../db');

// Get all flats with user information
exports.getAllFlats = async (req, res) => {
  try {
    const [flats] = await pool.execute(
      `SELECT flats.*, users.username 
       FROM flats LEFT JOIN users ON flats.user_id = users.id`
    );
    res.json(flats);
  } catch (error) {
    console.error('getAllFlats error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// Get flats owned by logged-in user
exports.getMyFlats = async (req, res) => {
  try {
    const [flats] = await pool.execute('SELECT * FROM flats WHERE user_id = ?', [req.user.id]);
    res.json(flats);
  } catch (error) {
    console.error('getMyFlats error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// Add a new flat
exports.addFlat = async (req, res) => {
  const { name, price, description, location, contact, ownername, status, bath_no, area } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    await pool.execute(
      `INSERT INTO flats (user_id, name, price, description, location, contact, ownername, status, bath_no, area)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, price || 0, description || '', location || '', contact || '', ownername || '', status || 'available', bath_no || '', area || '']
    );
    res.status(201).json({ message: 'Flat added' });
  } catch (error) {
    console.error('addFlat error:', error);
    res.status(500).json({ error: error.message || 'Database error' });
  }
};

// Update a flat (only by owner)
exports.updateFlat = async (req, res) => {
  const { id } = req.params;
  const { name, price, description, location, status, bath_no, area } = req.body;

  try {
    const [flats] = await pool.execute(
      'SELECT * FROM flats WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    if (flats.length === 0)
      return res.status(403).json({ error: 'Not authorized' });

    await pool.execute(
      `UPDATE flats
       SET name = ?, price = ?, description = ?, location = ?, status = ?, bath_no = ?, area = ?
       WHERE id = ?`,
      [name, price, description, location, status, bath_no, area, id]
    );

    res.json({ message: 'Flat updated' });
  } catch (error) {
    console.error('updateFlat error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// Update contact info for a flat
exports.updateFlatContact = async (req, res) => {
  const { id } = req.params;
  const { user_email, last_contact } = req.body;

  if (!user_email || !last_contact) {
    return res.status(400).json({ error: 'Email and contact date are required' });
  }

  try {
    const [flat] = await pool.execute('SELECT * FROM flats WHERE id = ?', [id]);
    if (flat.length === 0) return res.status(404).json({ error: 'Flat not found' });

    await pool.execute(
      `UPDATE flats SET user_email = ?, last_contact = ? WHERE id = ?`,
      [user_email, last_contact, id]
    );

    res.json({
      message: 'Contact info updated successfully',
      updated: { user_email, last_contact }
    });
  } catch (error) {
    console.error('updateFlatContact error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};

// Delete a flat (only by owner)
exports.deleteFlat = async (req, res) => {
  const { id } = req.params;

  try {
    const [flats] = await pool.execute('SELECT * FROM flats WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (flats.length === 0) return res.status(403).json({ error: 'Not authorized' });

    await pool.execute('DELETE FROM flats WHERE id = ?', [id]);
    res.json({ message: 'Flat deleted' });
  } catch (error) {
    console.error('deleteFlat error:', error);
    res.status(500).json({ error: 'Database error' });
  }
};