# svg-plot.js

svg-plot.js is a simple library to programatically create svg plots from csv formatted data. This is designed for regression testing where a visual component of data is desired. 

**Install:**

```console
nmp install svg-plot
```

**Usage:**

```js
var fs = require('fs');
var svg_plot = require('svg-plot.js')
var csvString = fs.readFileSync('testThermal.csv').toString();
svg_plot.plot(csvString,'myPlot','Time');
// Generates myPlot.svg
```

**Usage Output:** `myPlot.svg`

Note, this will render on github but may not on npm's registery. See [examples/myPlot.svg](examples/myPlot.svg) for reference.

<p align='center'>
    <img src='examples/myPlot.svg'>
</p>

**CSV Format** `testThermal.csv`

```csv
Time,On,Temperature,Setpoint
0,63,60,70
10,68,59.97222222222222,70
20,68,60.01396604938272,70
30,68,60.05559392146776,70
40,68,60.097106160574796,70
...
```

### About: 

This library is a wrapper around d3-node which is a wrapper around d3. 
