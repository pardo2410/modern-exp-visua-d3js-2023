// CHART IBEX START 
// Define chart dimensions and margins
const width = 1000;
const height = 600;
const margin = {
    top:10,
    right:10,
    bottom:40,
    left:40,
};

// Create SVG elements
const svgLine = d3.select('div#lineChart').append('svg').attr('width',width).attr('height',height);
const svgBar = d3.select('div#barChart').append('svg').attr('width',width).attr('height',height);


// Create scales and axes
const elementGroupLine = svgLine.append('g').attr('class','elementGroupLine').attr('transform',`translate(${margin.left},${margin.top})`);
const elementGroupBar = svgBar.append('g').attr('class', 'elementGroupBar').attr('transform', `translate(${margin.left},${margin.top})`);

const axisGroupLine = svgLine.append('g').attr('class','axisGroupLine');
const axisGroupBar = svgBar.append('g').attr('class','axisGroupBar');
const xAxisGroupLine = axisGroupLine.append('g').attr('class','xAxisGroupLine').attr('transform',`translate(${margin.left},${height-margin.bottom})`);
const yAxisGroupLine = axisGroupLine.append('g').attr('class','yAxisGroupLine').attr('transform',`translate(${margin.left},${margin.top})`);
const xAxisGroupBar = axisGroupBar.append('g').attr('class','xAxisGroupBar').attr('transform',`translate(${margin.left},${height-margin.bottom})`);
const yAxisGroupBar= axisGroupBar.append('g').attr('class','yAxisGroupBar').attr('transform',`translate(${margin.left},${margin.top})`);

const x = d3.scaleTime().range([0,width-margin.left-margin.right]);
const y = d3.scaleLinear().range([height-margin.bottom-margin.top,0]);
const xBar = d3.scaleBand().range([0, width - margin.left - margin.right]).padding(0.1);
const yBar = d3.scaleLinear().range([height - margin.bottom - margin.top, 0]);

const xAxisLine = d3.axisBottom().scale(x);
const yAxisLine = d3.axisLeft().scale(y);
const xAxisBar = d3.axisBottom().scale(xBar).tickFormat(d3.timeFormat("%d/%m/%Y"));
const yAxisBar = d3.axisLeft().scale(yBar).tickFormat(d3.format(".2s"));

const transformarTiempo = d3.timeParse("%d/%m/%Y");


// Titles
const tipGroup = elementGroupBar.append('g').attr('class','tipGroup hide').attr('transform',`translate(${-20},${-20})`);
const tipLine =tipGroup.append('text');
titleLine = svgLine.append('text').attr('class','titles').text(`IBEX Close`).attr('transform',`translate(${margin.left + 400}, ${20})`);

const tipGroup1 = elementGroupLine.append('g').attr('class','tipGroup hide').attr('transform',`translate(${-20},${-20})`);
const tipBar =tipGroup.append('text');
titleBar = svgBar.append('text').attr('class','titles').text(`IBEX Volume`).attr('transform',`translate(${margin.left + 400}, ${20})`);


// Load data and initialize charts
d3.csv('ibex.csv').then(data =>{
    data.map(d =>{
        d.open = +d.open
        d.high = +d.high
        d.low = +d.low
        d.close = +d.close
        d.volume = +d.volume
        d.date = transformarTiempo(d.date);
    });
    
    // Month Selector
    const monthSelector = d3.select('div#monthSelector').append('select'); 
    // Extract unique months from the dataset
    const uniqueMonths = [...new Set(data.map(d => d.date.getMonth()))];
    console.log(uniqueMonths)

    // Populate the month selector
    uniqueMonths.forEach(month => {
        monthSelector.append('option').attr('value', month).text(d3.timeFormat('%B')(new Date(0, month)));
    });

    // Listen for changes in the month selector and update charts
    monthSelector.on('change', function() {
        const selectedMonth = +this.value;
        const filteredData = data.filter(d => d.date.getMonth() === selectedMonth);
        update(filteredData);
    });
  
    //Year Selector
    const yearSelector = d3.select('div#yearSelector').append('select');
    
    // Extract unique years from the dataset
    const uniqueYear = [...new Set(data.map(d => d.date.getFullYear()))];
    
    // Populate the year selector
    uniqueYear.forEach(year => {
        yearSelector.append('option').attr('value', year).text(year);
    });
    
    // Listen for changes in the year selector and update charts
    yearSelector.on('change', function() {
        const selectedYear = +this.value;
        const filteredData = data.filter(d => d.date.getFullYear() === selectedYear);
        update(filteredData);
    });

    update(data);
});


// update:
function update(data) {
    // Actualizar los dominios de los escaladores x y y
    x.domain(d3.extent(data.map(d => d.date)));
    y.domain(d3.extent(data.map(d => d.close)));

    // Actualizar los dominios de los escaladores xBar y yBar
    xBar.domain(data.map(d => d.date));
    yBar.domain([0, d3.max(data, d => d.volume)]);

    //Llama los ejes
    xAxisGroupLine.call(xAxisLine);
    yAxisGroupLine.call(yAxisLine);
    xAxisGroupBar.call(xAxisBar);
    yAxisGroupBar.call(yAxisBar);

    // Crear grafica de linea
    const elementsLine = elementGroupLine.selectAll('path')
        .data([data], d => d.date);

    elementsLine.enter().append('path')
        .attr('class', 'line')
        .attr('id', 'linea')
        .attr('d', d3.line()
            .x(d => x(d.date))
            .y(d => y(d.close)))
        .merge(elementsLine)
        .transition()
        .duration(500)
        .attr('d', d3.line()
            .x(d => x(d.date))
            .y(d => y(d.close)));

    elementsLine.exit().remove();


    // Crear la grafica de barras
    const elementsBars = elementGroupBar.selectAll('rect').data(data)
    elementsBars.enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xBar(d.date))
        .attr('y', d => yBar(d.volume))
        .attr('width', xBar.bandwidth())
        .attr('height', d => height - margin.bottom - margin.top - yBar(d.volume));

    elementsBars.attr('x', d => xBar(d.date))
        .attr('y', d => yBar(d.volume))
        .attr('width', xBar.bandwidth())
        .attr('height', d => height - margin.bottom - margin.top - yBar(d.volume))
        .transition()
        .duration(500);
    
        elementsBars.exit().remove();
};
