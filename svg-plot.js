// svg-plot.js
// license: MIT

const D3Node = require('d3-node');
var fs = require('fs');
var path = require('path');
var styleStr = fs.readFileSync(path.resolve(__dirname, 'plot.css')).toString();
var d3n = new D3Node({styles:styleStr });
var d3 = d3n.d3;


function plot(csvData,outputFileName,timeKey,options){

    var margin = {top: 30, right: 20, bottom: 70, left: 50},
        width = 500 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    var x = d3.scaleLinear().range([0, width]);  
    var y = d3.scaleLinear().range([height, 0]);

    var dataGen = d3.line().x(function(d) { return x(d.t); }).y(function(d) { return y(d.val); });

    var svg = d3n.createSVG(width + margin.left + margin.right,height + margin.top + margin.bottom).append("g").attr("transform","translate(" + margin.left + "," + margin.top + ")");
    var data = d3.csvParse(csvData);

    var yMax = -1e-100;
    var yMin = 1e100;
    var ObjArray = [];
    for(var col of data.columns){
        if(col != timeKey){
            var Obj = {key: col, values:[]};
            Obj.values = data.map( (a)=>{
                return {t: parseFloat(a[timeKey]), val: parseFloat(a[col])};
            });
            var arrMax = d3.max(Obj.values, d=>d.val);
            var arrMin = d3.min(Obj.values, d=>d.val);;
            yMax = yMax< arrMax ? arrMax :yMax;
            yMin = yMin > arrMin ? arrMin : yMin;
            ObjArray.push(Obj);
        }
    }

    x.domain([0, d3.max(data, function(d) { return parseFloat(d.Time); })]);
    y.domain([yMin - Math.abs(yMin*0.05) ,yMax + Math.abs(yMax*0.05)]);

    var color = d3.scaleOrdinal(d3.schemeCategory10);
    legendSpace = width/ObjArray.length; 
    ObjArray.forEach(function(d,i) { 

        svg.append("path")
        .attr("class", "line")
        .style("stroke", function() { 
            return d.color = color(d.key); })
        .attr("id", 'tag'+d.key.replace(/\s+/g, '')) 
        .attr("d", dataGen(d.values));

        svg.append("text")
        .attr("x", (legendSpace/2)+i*legendSpace)  
        .attr("y", height + (margin.bottom/2)+ 5)
        .attr("class", "legend")    
        .style("fill", function() { 
            return d.color = color(d.key); }) 
        .text(d.key); 

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y));

    });

    fs.writeFileSync(outputFileName + '.svg', d3n.svgString());
}

module.exports.plot = plot;