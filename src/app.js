const express = require('express');
const cors = require('cors');

const app = express();

//Middleware
app.use(cors());
app.use(express.json());

//Route

app.get('/', (req, res) => {
    res.send('RepForge backend is running.');
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/userbody', require('./routes/userbody.routes'));
app.use('/api/exercises', require('./routes/exercise.routes'));

module.exports = app;