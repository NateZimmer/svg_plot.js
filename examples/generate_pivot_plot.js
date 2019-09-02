// generate_plot.js
// License: MIT

var fs = require('fs');
var svg_plot = require('../svg-plot.js')
var csvString = fs.readFileSync('testPivotThermal.csv').toString();

svg_plot.plot(csvString,{
    fileName:'myPivotPlot',
    timeKey:'Time',
    pivotCSV:true,
    pivotKey:'Point',
    pivotValue:'Value',
    y2List:['heat1'],
    includeList:['activeSp','temperature','heat1'],
    title: 'Heating Example',
    y2Range:[0,3]
});



