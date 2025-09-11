require('dotenv').config();
const app = require('./app');

const port = process.env.PORT || 4000;
app.listen(port, (err) => {
  if (err) return console.error('Error:', err);
  console.log(`Server running on port ${port}`);
});


