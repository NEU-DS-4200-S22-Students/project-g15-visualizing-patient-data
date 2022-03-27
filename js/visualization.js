let margin = {
  top: 80,
  left: 50,
  right: 30,
  bottom: 15
},
  width = 500 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

let parseDate = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");
  // first visualization
  let svg1 = d3.select('#vis1')
    .append('svg')
    .attr('preserveAspectRatio', 'xMidYMid meet') // this will scale your visualization according to the size of its parent element and the page.
    .attr('width', '100%') // this is now required by Chrome to ensure the SVG shows up at all
    .style('background-color', '#ccc') // change the background color to light gray
    .attr('viewBox', [-50, -50, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))

  // Title of Chart
  svg1
    .append('text')
    .attr('x', margin.right )
    .attr('y', 0)
    .style('fill', 'black')
    .text('NBA vs. NHL Revenue from 2006 - 2020');

  //Read the data
  d3.csv("data/patient1.csv").then( function(data) {

  // Sort the lines by organization/type
  const sumstat = d3.group(data, d => d.MeasureName); 

  // Add X axis 
  const x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return parseDate(d.Time); }))
    .range([ 0, width ])
    
  // Shows all the years and converts them to XXXX rather than X,XXX.
  svg1.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d")));

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return +d.MeasureValue; })])
    .range([ height, 0 ]);
  svg1.append("g")
    .call(d3.axisLeft(y));

  // Color selection
  const color = d3.scaleOrdinal()
    .range(['#e41a1c','#377eb8', '#FD7F20', '#00FF00'])

  // Draw the line
  svg1.selectAll(".line")
      .data(sumstat)
      .join("path")
        .attr("fill", "none")
        .attr("stroke", function(d){ return color(d[0]) })
        .attr("stroke-width", 1.5)
        .attr("d", function(d){
          return d3.line()
            .x(function(d) { return x(parseDate(d.Time)); })
            .y(function(d) { return y(+d.MeasureValue); })
            (d[1])
        })

  // Creating large rectangle for Legend
  svg1.append('rect')
        .attr('x', 50)
        .attr('y', 50)
        .attr('height', 50)
        .attr('width', 200)
        .style('fill', '#D3D3D3')
        .style("stroke", "black")

  // Creating the first small red rectangle
  svg1.append('rect')
        .attr('x', 60)
        .attr('y', 60)
        .attr('height', 10)
        .attr('width', 10)
        .style('fill', '#e41a1c')
        .style("stroke", "black")
  
  // Creating the text for the small red rectangle
  svg1.append("text")
    .attr("x", 80)
    .attr('y', 68)
    .style('font-size', '10px')
    .text("National Hockey League");

  //Creating the second rectangle (blue)
  svg1.append('rect')
        .attr('x', 60)
        .attr('y', 80)
        .attr('height', 10)
        .attr('width', 10)
        .style('fill', '#377eb8')
        .style("stroke", "black");

  // Creating the text for the NBA

  svg1.append("text")
    .attr("x", 80)
    .attr('y', 88)
    .style('font-size', '10px')
    .text("National Basketball Association");

  // Y axis label rotated
  svg1.append("text")
    .attr("x", -300)
    .attr('y', -30)
    .style('transform', 'rotate(-90deg)')
    .text("Value")
    .style('font-size', '15px')
  

  // Y axis label rotated
  svg1.append("text")
    .attr("x", 190)
    .attr('y', 440)
    .text("Date")
    .style('font-size', '15px')
  })