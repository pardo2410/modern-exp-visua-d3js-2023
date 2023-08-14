// CHART START
// 1. aquí hay que poner el código que genera la gráfica
const width = 800;
const height = 600;
const margin = {
    top:100,
    right:10,
    bottom:40,
    left:60
};

let years;
let winners;
let originalData;
let title;


const svg = d3.select('div#chart').append('svg').attr('width',width).attr('height',height);

const elementGroup = svg.append('g').attr('class','elementGroup').attr('transform',`translate(${margin.left},${margin.top})`);
const axisGroup = svg.append('g').attr('class', 'axisGroup');

const xAxisGroup = axisGroup.append('g').attr('class', 'xAxisGroup').attr('transform', `translate(${margin.left},${height-margin.bottom})`);
const yAxisGroup = axisGroup.append('g').attr('class', 'yAxisGroup').attr('transform', `translate(${margin.left},${margin.top})`);
const tipGroup = elementGroup.append('g').attr('class','tipGroup hide').attr('transform',`translate(${-20},${-20})`);
const tip =tipGroup.append('text');

const x = d3.scaleBand().range([0,width-margin.left-margin.right]).padding(0.1);
const y = d3.scaleLinear().range([height-margin.bottom-margin.top,0]);

const xAxis = d3.axisBottom().scale(x);
const yAxis = d3.axisLeft().scale(y);


// data:
d3.csv("data.csv").then(data => {
    // 2. aquí hay que poner el código que requiere datos para generar la gráfica
    // update:
    data.map(d =>{
        d.Year = +d.Year;
    });
    years = data.map(d=> d.Year);
    originalData = data;

    update(data);
    slider();
})


// Función para unir los dos arrays por la clave "key" y "Winner"
function mergeData(nest, originalData) {
    return nest.map(obj1 => {
      var winner = obj1.key;
      var winnerData = originalData.find(obj2 => obj2.Winner === winner);
      return { ...obj1, ...winnerData };
    });
  }
  

// update:
function update(data) {
    // 3. función que actualiza el gráfico
    // data binding:
    var nest = d3.nest().key(d => d.Winner).rollup(p => p.length).entries(data);
    // Unir los dos arrays 
    var mergedData = mergeData(nest, originalData);

    x.domain(nest.map(d => d.key));
    y.domain([0, d3.max(nest.map(d => d.value))]);
    


    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);

    
    const elements = elementGroup.selectAll('rect').data(nest);
    title = svg.append('text').attr('class','titles').text(`FIFA World Cup Winners (${d3.min(years)} - ${d3.max(years)})`).attr('transform',`translate(${margin.left + 200}, ${20})`);

    elements.enter()
        .append('rect')
        .attr('x', d => x(d.key))
        .attr('y', d => y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', d =>  height-margin.top-margin.bottom-y(d.value))
        .attr('fill',"#69b3a2")
        .on('mouseover', show)
        .on('mouseout', hide);
        
    elements.attr('x', d => x(d.key))
        .attr('y', d => y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', d =>  height-margin.top-margin.bottom-y(d.value))
        .transition()
        .duration(500);
    
        elements.exit().remove();
 
    console.log(nest);
    console.log(years);
    console.log(originalData)
    console.log(mergedData);
}

function show(d,i,a){
    tipGroup.classed('show', true);
    tip.text(`${d.key}: ${d.value} cups`);
}

function hide(d,i,a){
    tipGroup.classed('show', false);
}

// treat data:
function filterDataByYear(selectedYear) { 
    // 4. función que filtra los datos dependiendo del año que le pasemos (year) 
    const data = originalData.filter(d => d.Year <= selectedYear);
    update(data);
    d3.select('p#value-time').text(`Selected year: ${selectedYear}`);
}

// CHART END

// slider:
function slider() {    
    // esta función genera un slider:
    var sliderTime = d3
        .sliderBottom()
        .min(d3.min(years))  // rango años
        .max(d3.max(years))
        .step(4)  // cada cuánto aumenta el slider (4 años)
        .width(580)  // ancho de nuestro slider en px
        .ticks(years.length)  
        .default(years[years.length -1])  // punto inicio del marcador
        .on('onchange', val => {
            // 5. AQUÍ SÓLO HAY QUE CAMBIAR ESTO:
            // hay que filtrar los datos según el valor que marquemos en el slider y luego actualizar la gráfica con update
            filterDataByYear(val);
        });

        // contenedor del slider
        var gTime = d3 
            .select('div#slider-time')  // div donde lo insertamos
            .append('svg')
            .attr('width', width)
            .attr('height', 100)
            .append('g')
            .attr('transform',`translate(${margin.left + 40}, ${20})`);
    
        gTime.call(sliderTime);  // invocamos el slider en el contenedor

        d3.select('p#value-time').text(`Selected year: ${sliderTime.value()}`);  // actualiza el año que se representa
}