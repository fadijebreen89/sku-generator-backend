const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Add this line
const db = require('./database');
const app = express();
app.use(bodyParser.json());
app.use(cors()); // Add this line

const skus = []; // Simple in-memory database

app.post('/generate', (req, res) => {
    const { category, subcategory, productName } = req.body;

    if (!category || !subcategory || !productName) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const sku = `${category.slice(0, 3).toUpperCase()}-${subcategory.slice(0, 3).toUpperCase()}-${Date.now()}`;

    // Save SKU to the database
    db.run(`
        INSERT INTO skus (sku, category, subcategory, product_name)
        VALUES (?, ?, ?, ?)
    `, [sku, category, subcategory, productName], function (err) {
        if (err) {
            console.error('Error saving SKU:', err.message);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true, sku });
    });
});

app.get('/skus', (req, res) => {
    db.all('SELECT * FROM skus ORDER BY timestamp DESC', [], (err, rows) => {
        if (err) {
            console.error('Error retrieving SKUs:', err.message);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true, skus: rows });
    });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
