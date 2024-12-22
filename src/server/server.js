const express = require('express');
const path = require('path');
const app = express();
const port = 8888;

// Statische bestanden serveren
app.use(express.static(path.join(__dirname, '../client')));

// Data directory expliciet serveren
app.use('/data', express.static(path.join(__dirname, '../../data')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(port, '192.168.2.251', () => {
    console.log(`Server running at http://192.168.2.251:${port}`);
}); 