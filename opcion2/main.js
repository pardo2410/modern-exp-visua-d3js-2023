// CHART START
// 1. aquí hay que poner el código que genera la gráfica
// const width = window.innerWidth;
// const height = window.innerHeight;
const width = 800;
const height = 700;
const margin = {
    top:10,
    right:10,
    bottom:60,
    left:40,
};

const svg = d3.select('div#chart').append('svg').attr('width',width).attr('height',height);
const elementGroup = svg.append('g').attr('class','elementGroup').attr('transform',`translate(${margin.left},${margin.top})`);

const axisGroup = svg.append('g').attr('class','axisGroup');
const xAxisGroup = axisGroup.append('g').attr('class','xAxisGroup').attr('transform',`translate(${margin.left},${height-margin.bottom})`);
const yAxisGroup = axisGroup.append('g').attr('class','yAxisGroup').attr('transform',`translate(${margin.left},${margin.top})`);

const title = svg.append('text').attr('class','titles').text('Parejas Leonardo Di Caprio').attr('transform',`translate(${margin.left + 250}, ${20})`);


const x = d3.scaleBand().range([0, width-margin.left-margin.right]).padding(0.1);
const yLine = d3.scaleLinear().range([height-margin.bottom-margin.top, 0]);
const yBar = d3.scaleLinear().range([height-margin.bottom-margin.top, 0]);


const xAxis = d3.axisBottom().scale(x);
const yAxisLine = d3.axisLeft().scale(yLine);
const yAxisBar = d3.axisLeft().scale(yBar);

// data:
d3.csv('data.csv').then(data =>{
    // 2. aquí hay que poner el código que requiere datos para generar la gráfica
    data.map(d =>{
        d.year = +d.year;
        d.name = d.name.replace(' ','_');
        d.age = +d.age;
    });

    const diCaprioBirthYear = 1974;
    const age = year => year - diCaprioBirthYear;
    const today = new Date().getFullYear();

    const dataDiCaprio = [];  
    for (let year = diCaprioBirthYear; year <= today; year++) {
        dataDiCaprio.push({ year: year, age: age(year) });
    };

    
    x.domain(data.map(d => d.year));
    yLine.domain([d3.min(dataDiCaprio.map(d => d.age)), d3.max(dataDiCaprio.map(d => d.age))]).nice();
    yBar.domain([d3.min(dataDiCaprio.map(d => d.age)), d3.max(dataDiCaprio.map(d => d.age))]).nice();
    
    
    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxisLine);
    yAxisGroup.call(yAxisBar);
    
    // 3. función que actualiza el gráfico
    // data blinding
    const elements = elementGroup.selectAll('rect').data(data)
        elements.enter()
        .append('rect')
        .attr('class', d => `${d.name} bar`)
        .attr('x', d => x(d.year))
        .attr('y', d => yBar(d.age))
        .attr('height', d => height-margin.top-margin.bottom-yBar(d.age))
        .attr('width', x.bandwidth())
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut);

    function handleMouseOver(d) {
        d3.select('#name').text(`${d.name} tenía ${d.age} años y Leonardo Di Caprio ${(dataDiCaprio.find(item => item.year === d.year)).age} años en el ${d.year}`);
        elementGroup.selectAll(`.${d.name.replace(' ', '_')}.bar`).style('opacity', 0.5); // Cambiar opacidad de todas las barras con el mismo nombre
    };

    function handleMouseOut() {
        d3.select('#name').text('');
        elementGroup.selectAll('.bar').style('opacity', 1); // Restaurar opacidad de todas las barras
    };

    elementGroup.datum(data)
        .append('path')
        .attr('id', 'linea')
        .attr("d", d3.line()
            .x(d => x(d.year))
            .y(d => yLine(age(d.year))));

    elementGroup.append( "line" )
        .attr("x1", 0)
        .attr("x2", width-margin.left-margin.right)
        .attr("y1", yBar(25))   
        .attr("y2", yBar(25))
        .attr('stroke', '#241468')
        .attr("stroke-width", 4)
        .attr("stroke-dasharray", "5,5");


    console.log(data);
    console.log(dataDiCaprio);
})