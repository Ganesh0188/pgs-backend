const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const app = express();
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/hostels', require('./routes/hostel-routes/hostelRoutes'));
app.use('/api/images', require('./routes/hostel-routes/imageRoutes'));
app.use('/api/rooms', require('./routes/hostel-routes/roomRoutes'));
app.use('/api/residents', require('./routes/hostel-routes/residentRoutes'));
app.use('/api/users', require('./routes/user-routes/userRoutes'));
app.use('/api/owners',require('./routes/hostel-routes/ownerRoutes'));
// app.use('/api/management', require('./routes/hostel-routes/hostelManagementRoutes'));
// app.use('/api/resident-dashboard', require('./routes/hostel-routes/residentDashboardRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: err.message || 'Something went wrong!'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
