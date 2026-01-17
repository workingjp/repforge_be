require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

connectDB();

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server runnig on port ${PORT}`)
}); 

app.use('/api/user', require('../src/routes/user.routes'));


// mongodb+srv://repforge:repforge123@cluster0.yydh1.mongodb.net/?appName=Cluster0

// mongodb_passord == >>  
// mongodb+srv://RepForge:<db_password>@cluster0.yydh1.mongodb.net/