var express = require('express'),
    app = express(),
    
    database = {
        "clarence": {
            attractiveness: 9000,
            club: "Butt-Bumping Club",
            pet: 'Platypus'
        },
        "santina": {
            attractiveness: 9001,
            club: "Hot People Club",
            pet: "Wolf"
        }
    };

app.use(express.static('./website/public'));

// Serves the website's `index.html` file
app.get('/', function (req, res) {
    res.sendfile('./website/index.html');
});

// Serves the website's "database" data
app.get('/:name', function (req, res) {
    var name = req.params.name,
        information = database[name];

    res.json(information || { error: 'No person found in the database' });
});

app.listen(3000);
console.log('Server listening on port 3000');
