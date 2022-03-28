// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {

  let cell = {
    width: 100,
    height: 30
  }

  let svg = d3.select("#vis-svg-1");

  // creates a box for a patient with a given color that represents risk
  function makeCell(cellRow, cellNum, color) {
    svg.append("rect")
      .attr("x", 100 + (cell.width * cellNum))
      .attr("y", (cellRow * cell.height) + 40)
      .attr("width", cell.width)
      .attr("height", cell.height)
      .attr("fill", color)
      .attr('stroke', 'black');
    svg.append("text")
      .attr('x', 120 + (cell.width * cellNum))
      .attr('y', (cellRow * cell.height) + 60)
      .attr('font-family', 'Gill Sans')
      .style('font-size', 13)
      .text('Patient ' + (cellNum + 1));
  }

  makeCell(1, 0, "#FF0000");
  makeCell(1, 1, "#CEFF00");
  makeCell(1, 2, "#FF9600");
  makeCell(1, 3, "#9BFF00");
  makeCell(1, 4, "#FF4900");

  let margin = {
    top: 80,
    left: 50,
    right: 30,
    bottom: 15
  },
    width = 500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  let color1 = "#e41a1c";
  let color2 = "#377eb8";
  let color3 = "#FD7F20";
  let color4 = "#00FF00";


  let parseDate = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");
  // first visualization
  let svg1 = d3.select('#vis-svg-1')
    .append('svg')
    .attr('preserveAspectRatio', 'xMidYMid meet') // this will scale your visualization according to the size of its parent element and the page.
    .attr('width', '100%') // this is now required by Chrome to ensure the SVG shows up at all
    .style('background-color', '#ccc') // change the background color to light gray
    .attr('viewBox', [-50, -50, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))

  // Title of Chart
  svg1
    .append('text')
    .attr('x', margin.right)
    .attr('y', 40)
    .style('fill', 'black')
    .text('Patient 1 Vitals');

  //Read the data
  d3.csv("data/patient1.csv").then(function (data) {

    // Sort the lines by type of measurement
    const sumstat = d3.group(data, d => d.MeasureName);

    // Add X axis 
    const x = d3.scaleTime()
      .domain(d3.extent(data, function (d) { return parseDate(d.Time); }))
      .range([0, 200]);

    function toMonthName(monthNumber) {
      const date = new Date();
      date.setMonth(monthNumber - 1);

      return date.toLocaleString('en-US', {
        month: 'long',
      });
    }

    // Shows time and converts to a scale of months
    svg1.append("g")
      .attr("transform", `translate(0, ${200})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(x => toMonthName(x.getMonth() + 1)));

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, function (d) { return +d.MeasureValue; })])
      .range([200, 50]);
    svg1.append("g")
      .call(d3.axisLeft(y));

    // Color selection
    const color = d3.scaleOrdinal()
      .range(['#e41a1c', '#377eb8', '#FD7F20', '#00FF00'])

    // Draw the line
    svg1.selectAll(".line")
      .data(sumstat)
      .join("path")
      .attr("fill", "none")
      .attr("stroke", function (d) { return color(d[0]) })
      .attr("stroke-width", 1.5)
      .attr("d", function (d) {
        return d3.line()
          .x(function (d) { return x(parseDate(d.Time)); })
          .y(function (d) { return y(+d.MeasureValue); })
          (d[1])
      })

    // Creating large rectangle for Legend
    svg1.append('rect')
      .attr('x', 230)
      .attr('y', 20)
      .attr('height', 75)
      .attr('width', 200)
      .style('fill', '#D3D3D3')
      .style("stroke", "black")

    // Creating the first small red rectangle
    svg1.append('rect')
      .attr('x', 240)
      .attr('y', 30)
      .attr('height', 10)
      .attr('width', 10)
      .style('fill', color1)
      .style("stroke", "black")

    // Creating the text for the small red rectangle
    svg1.append("text")
      .attr("x", 260)
      .attr('y', 38)
      .style('font-size', '10px')
      .text("Weight");

    //Creating the second rectangle (blue)
    svg1.append('rect')
      .attr('x', 240)
      .attr('y', 45)
      .attr('height', 10)
      .attr('width', 10)
      .style('fill', color2)
      .style("stroke", "black");

    // Creating the text for the blood pressure systolic
    svg1.append("text")
      .attr("x", 260)
      .attr('y', 53)
      .style('font-size', '10px')
      .text("Blood Pressure Systolic");

    svg1.append('rect')
      .attr('x', 240)
      .attr('y', 60)
      .attr('height', 10)
      .attr('width', 10)
      .style('fill', color3)
      .style("stroke", "black")

    // Creating the text for the small red rectangle
    svg1.append("text")
      .attr("x", 260)
      .attr('y', 68)
      .style('font-size', '10px')
      .text("Blood Pressure Diastolic");

    svg1.append('rect')
      .attr('x', 240)
      .attr('y', 75)
      .attr('height', 10)
      .attr('width', 10)
      .style('fill', color4)
      .style("stroke", "black")

    // Creating the text for the small red rectangle
    svg1.append("text")
      .attr("x", 260)
      .attr('y', 83)
      .style('font-size', '10px')
      .text("Pulse");

    // Y axis label rotated
    svg1.append("text")
      .attr("x", -150)
      .attr('y', -30)
      .style('transform', 'rotate(-90deg)')
      .text("Value")
      .style('font-size', '15px')

    // Y axis label rotated
    svg1.append("text")
      .attr("x", 70)
      .attr('y', 240)
      .text("Date")
      .style('font-size', '15px')
  })

})());