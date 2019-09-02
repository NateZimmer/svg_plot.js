// generate_plot.js
// License: MIT

var fs = require('fs');
var svg_plot = require('../svg-plot.js')
var csvString = fs.readFileSync('testThermal.csv').toString();

svg_plot.plot(csvString,{
    fileName:'myPlot',
    timeKey:'Time'
});



