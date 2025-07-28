const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const urlRoutes = require('./routes/urlRoutes');
const { notFound } = require('./controllers/errorController');
const { log } = require('./utils/logger');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api', userRoutes);
app.use('/', urlRoutes);
app.use(notFound);

app.listen(PORT, () => {
    log('info', 'service', `Server started successfully on port ${PORT}`);
    console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
