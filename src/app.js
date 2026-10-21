const path = require('path');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;