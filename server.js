// server.js
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

app.get('/studio', (req, res) => res.status(200).send('OK'));
app.get('/', (req, res) => res.send('Temporary health server running'));
app.listen(port, '0.0.0.0', () => {
  console.log(`Temp server listening on 0.0.0.0:${port}`);
});
