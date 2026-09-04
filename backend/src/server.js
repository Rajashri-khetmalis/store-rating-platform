require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const storeRoutes = require('./routes/stores');
const ratingRoutes = require('./routes/ratings');
const ownerRoutes = require('./routes/owner');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Store Rating API is running.' }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/owner', ownerRoutes);

app.use((req, res) => res.status(404).json({ message: 'Endpoint not found.' }));

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
