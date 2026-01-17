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

app.use('/api/test', require('./routes/test.routes'));
app.use('/api/auth', require('./routes/auth.routes'));


module.exports = app;