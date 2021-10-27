// svg-plot.js
// license: MIT

//References: 
// 
// Multi-Axis: https://bl.ocks.org/d3noob/814a2bcb3e7d8d8db74f36f77c8e6b7f


const D3Node = require('d3-node');
var fs = require('fs');
var path = require('path');
var styleStr = fs.readFileSync(path.resolve(__dirname, 'plot.css')).toString();
var d3n = new D3Node({styles:styleStr });
var d3 = d3n.d3;

var args = {fileName:'',timeKey:''}
var optArgs = {pivotCSV:false,pivotKey:'',pivotValue:'',y2List:[],ignoreList:[],includeList:null,y1Curve:d3.curveLinear,y2Curve:d3.curveStepAfter,title:null,y2Range:null}

function extentNested(data,accessor,y2List){
    var min = Infinity;
    var min2 = Infinity;
    var max = -Infinity;
    var max2 = -Infinity;
    for(var point of data){
        var lMin = d3.min(point.values,accessor);
        var lMax = d3.max(point.values,accessor);
        if(!y2List.includes(point.key)){
            max = Math.max(lMax,max);
            min = Math.min(lMin,min);
        }else{
            max2 = Math.max(lMax,max2);
            min2 = Math.min(lMin,min2);
        }
    }
    return {range1:[min,max],range2:[min2,max2]};
}

var ticks = 7; // Amount of ticks/grids on x & y axis 

function plot(csvData,options){
    var foundError = false;

    // Load req args 
    for(var prop in args){
        if(options[prop]== null){
            console.log('You must specify options.' + prop);
            foundError=true;
        }else{
            args[prop] = options[prop];
        }
    }
    if(foundError){
        throw('Missing required args, see log');
    }

    // Load optional args 
    for(var prop in optArgs){
        if(options[prop] != null){
            optArgs[prop] = options[prop];
        }
    }

    var margin = {top: 30, right: 30, bottom: 70, left: 50},
        width = 500 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    var x = d3.scaleLinear().range([0, width]);  
    var y = d3.scaleLinear().range([height, 0]);
    var y2 = d3.scaleLinear().range([height, 0]);
    y2.domain([0,1]);

    var dataGen = d3.line().x(function(d) { return x(d.t); }).y(function(d) { return y(d.val); });

    var svg = d3n.createSVG(width + margin.left + margin.right,height + margin.top + margin.bottom).append("g").attr("transform","translate(" + margin.left + "," + margin.top + ")");
    var data = d3.csvParse(csvData);

    var yMax = -1e-100;
    var yMin = 1e100;
    var ObjArray = [];

    // Ensure timeKey is present
    if(data.columns.includes(args.timeKey) == false)
    {
        throw("Time key not found in header or incorrectly specified");
    }

    if(!optArgs.pivotCSV){
        for(var col of data.columns){
            if(col != args.timeKey){
                var Obj = {key: col, values:[]};
                Obj.values = data.map( (a)=>{
                    return {t: parseFloat(a[args.timeKey]), val: parseFloat(a[col])};
                });
                var arrMax = d3.max(Obj.values, d=>d.val);
                var arrMin = d3.min(Obj.values, d=>d.val);;
                yMax = yMax< arrMax ? arrMax :yMax;
                yMin = yMin > arrMin ? arrMin : yMin;
                ObjArray.push(Obj);
            }
        }
        x.domain([0, d3.max(data, function(d) { return parseFloat(d[args.timeKey]); })]);
        optArgs.pivotValue='val';
    }else{
        ObjArray = d3.nest().key((d)=>{return d[optArgs.pivotKey]}).entries(data)
        dataGen = d3.line().x((d)=>{ return x(parseFloat(d[args.timeKey])); }).y((d)=>{ return y(parseFloat(d[optArgs.pivotValue]));}).curve(optArgs.y1Curve);
        dataGen2 = d3.line().x((d)=>{ return x(parseFloat(d[args.timeKey])); }).y((d)=>{ return y2(parseFloat(d[optArgs.pivotValue]));}).curve(optArgs.y2Curve);
        var xRange = d3.extent(data, (d)=>{return parseFloat(d[args.timeKey])});
        x.domain(xRange);
    }


    // Handle includeList
    if(optArgs.includeList != undefined){
        for(var i = 0; i < ObjArray.length; i++){
            var include = optArgs.includeList.includes(ObjArray[i].key);
            if(!include){
                ObjArray.splice(i,1);
                i--;
            }
        }
    }

    // Handle ignore list
    for(var i = 0; i < ObjArray.length; i++){
        if(optArgs.ignoreList.includes(ObjArray[i].key)){
            ObjArray.splice(i,1);
            i--;
        }
    }

    var ranges = extentNested(ObjArray,(d)=>{return parseFloat(d[optArgs.pivotValue])}, optArgs.y2List);
    y.domain(ranges.range1);
    if(optArgs.y2Range == null){
        y2.domain(ranges.range2);
    }else{
        y2.domain(optArgs.y2Range);
    }
    
    // gridlines in x axis function
    function make_x_gridlines() {		
        return d3.axisBottom(x)
            .ticks(ticks)
    }

    // gridlines in y axis function
    function make_y_gridlines() {		
        return d3.axisLeft(y)
            .ticks(ticks)
    }


    var color = d3.scaleOrdinal(d3.schemeCategory10);
    legendSpace = width/ObjArray.length; 


    svg.append("g")			
    .attr("class", "grid")
    .attr("transform", "translate(0," + height + ")")
    .call(make_x_gridlines()
        .tickSize(-height)
        .tickFormat("")
    ).style("stroke-dasharray", ("1, 2"))  // <== This line here!!

    // add the Y gridlines
    svg.append("g")			
    .attr("class", "grid")
    .call(make_y_gridlines()
        .tickSize(-width)
        .tickFormat("")
    ).style("stroke-dasharray", ("1, 2"))  // <== This line here!!


    ObjArray.forEach(function(d,i) { 
        var dataVals = null;
        if(optArgs.y2List.length == 0){
            dataVals = dataGen(d.values);
        }else{
            if(optArgs.y2List.includes(d.key)){
                dataVals = dataGen2(d.values);
            }else{
                dataVals = dataGen(d.values);
            }
        }

        svg.append("path")
        .attr("class", "line")
        .style("stroke", function() { 
            return d.color = color(d.key); })
        .attr("id", 'tag'+d.key.replace(/\s+/g, '')) 
        .attr("d", dataVals);

        svg.append("text")
        .attr("x", (legendSpace/2)+i*legendSpace)  
        .attr("y", height + (margin.bottom/2)+ 5)
        .attr("class", "legend")    
        .style("fill", function() { 
            return d.color = color(d.key); }) 
        .text(d.key); 
    });

    svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

    svg.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y));

    if(optArgs.y2List.length != 0){
        svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate( " + width + ", 0 )")
        .call(d3.axisRight(y2).ticks(5));
    }

    if(optArgs.title != undefined){
        svg.append("text")
		.attr("x", (width / 2))				
		.attr("y", 0 - (margin.top / 2))	
		.attr("text-anchor", "middle")		
		.style("font-size", "14px") 		
		.text(optArgs.title);	
    }

    fs.writeFileSync(args.fileName + '.svg', d3n.svgString());
}

module.exports.plot = plot;