// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {

  let cell = {
    width: 100,
    widthAndStroke: 100.6,
    height: 30
  }

  let svg = d3.select("#vis-svg-1");

  // creates a box for a patient with a given color that represents risk
  var highlightedRect = d3.select(null);

  var dict = [1, 1, 1, 1];
  var curPatient = 0;
  var curPath = '';
  const selectedLines = ["weight", "blood_pressure_systolic", "blood_pressure_diastolic", "pulse"];

  function updateChart() {
    d3.csv(curPath).then(lineChart).then(makeTitle(curPatient));
  }

  function makeCell(cellRow, cellNum, color, path) {
    svg.append("rect")
      .attr("x", 110 + (cell.widthAndStroke * cellNum))
      .attr("y", (cellRow * cell.height) + 40)
      .attr("width", cell.width)
      .attr("height", cell.height)
      .attr("fill", color)
      .attr('stroke', 'black')
      .on('click', function () {
        curPath = path;
        curPatient = cellNum + 1;
        d3.csv(path).then(lineChart).then(makeTitle(curPatient));
        highlightedRect.attr("stroke", "black")
          .attr('stroke-width', 1);
        highlightedRect = d3.select(this);
        highlightedRect.attr("stroke", "#0066ff")
          .attr('stroke-width', 3);
      });
    svg.append("text")
      .attr('x', 120 + (cell.widthAndStroke * cellNum))
      .attr('y', (cellRow * cell.height) + 60)
      .attr('font-family', 'Gill Sans')
      .style('font-size', 13)
      .text('Patient ' + (cellNum + 1))

    /* .on('click', function () {
      d3.csv(path).then(lineChart).then(makeTitle(cellNum + 1));
    }); */
  }

  // Creates a range of colors given the two colors and how many colors in between
function interpolateColors(color1, color2, steps) {
  var stepFactor = 1 / (steps - 1),
  interpolatedColorArray = [];
  
  color1 = color1.match(/\d+/g).map(Number);
  color2 = color2.match(/\d+/g).map(Number);
  
  for(var i = 0; i < steps; i++) {
    interpolatedColorArray.push(interpolateColor(color1, color2, stepFactor * i));
  }
  
  return interpolatedColorArray;
}

  // gives the level of severity of the patient's condition based on out of bounds values
  // Severity is based on two factors within the last two months: 
  //    - how extreme the average of the values are 
  //         - Average of all the values within the last two months (including current month)
  //    - how many out of bounds vitals there are
  //         - Systolic Blood Pressure:
  //              - Good = <120
  //              - Kinda Bad = >120 & <140
  //              - Really Bad = >140 & <180
  //              - Emergency = >180
  //         - Diasolic Blood Pressure:
  //              - Good = <80
  //              - Kinda Bad = >80 & <90
  //              - Really Bad = >90 & <110
  //              - Emergency = >110

  function determineRisk(paths) {
    var colorArray = interpolateColors('rgb(255,0,0)', 'rgb(0,255,0)', 8);
    var colorData = d3.csv(curPath);


  }

  var ptArray = {0: "data/patient1.csv", 1: "data/patient2.csv", 2: "data/patient3.csv", 3:"data/patient4.csv", 4:"data/patient5.csv"};

  // change paths for each patient
  for (var key in ptArray) {
    // makeCell(1, key, determineRisk(ptArray[key]), ptArray[key]);
  }

  d3.csv("data/patient1.csv", function(data) {
    for (var d in data) {
      var today = new Date();
      if (today.getMonth() == 0) {
        console.log(parseDate(data.Time));
        if (parseDate(d.Time).getMonth() == 0 || parseDate(d.Time).getMonth() == 11) {
          return d;
        }
      } else {
        if (parseDate(d.Time).getMonth() == today.getMonth() || parseDate(d.Time).getMonth() == today.getMonth() - 1) {
          return d;
        }
      }
    }
    console.log(parseDate(data.Time));
  });

  // change paths for each patient
  makeCell(1, 0, "#FF0000", "data/patient1.csv");
  makeCell(1, 1, "#CEFF00", "data/patient2.csv");
  makeCell(1, 2, "#9BFF00", "data/patient3.csv");
  makeCell(1, 3, "#FF9600", "data/patient4.csv");
  makeCell(1, 4, "#CEFF00", "data/patient5.csv");


  let margin = {
    top: 80,
    left: 50,
    right: 30,
    bottom: 15
  },
    width = 500 - margin.left - margin.right,
    height = 325 - margin.top - margin.bottom;

  let color1 = "#0095CE";
  let color2 = "#C60095";
  let color3 = "#FF8980";
  let color4 = "#888888";


  let parseDate = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");
  // first visualization
  let svg1 = d3.select('#vis-svg-1')
    .append('svg')
    .attr('preserveAspectRatio', 'xMidYMid meet') // this will scale your visualization according to the size of its parent element and the page.
    .attr('width', '100%') // this is now required by Chrome to ensure the SVG shows up at all
    .style('background-color', '#ccc') // change the background color to light gray
    .attr('viewBox', [-50, -50, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))

  //Read the data
  // d3.csv("data/patient1.csv").then(lineChart)

  function lineChart(data) {

    // Sort the lines by type of measurement
    const sumstat = d3.group(data, d => d.MeasureName);

    // Add X axis 
    const x = d3.scaleTime()
      .domain(d3.extent(data, function (d) { return parseDate(d.Time); }))
      .range([0, 300]);


    months = d3.extent(data, function (d) { return parseDate(d.Time); });
    numMonths = (months[1].getMonth() - months[0].getMonth() + (months[1].getFullYear() - months[0].getFullYear()) * 12) + 1;

    function toYear(yearNumber) {
      const date = new Date();
      date.setFullYear(yearNumber);

      return date.toLocaleString('en-US', {
        year: 'numeric',
      });
    }
    function toMonthName(monthNumber) {
      const date = new Date();
      date.setMonth(monthNumber - 1);

      return date.toLocaleString('en-US', {
        month: 'long',
      });
    }

    function toDay(dayNumber) {
      const date = new Date();
      date.setDate(dayNumber);
      return date.toLocaleString('en-US', {
        day: 'numeric',
      });
    }

    function displayUnit(name) {
      if (name == "weight") {
        return " lbs";
      }
      else if (name == 'blood_pressure_systolic') {
        return " mmHg";
      }
      else if (name == 'blood_pressure_diastolic') {
        return " mmHg";
      }
      else if (name == 'pulse') {
        return " bpm";
      }

    }

    // Shows time and converts to a scale of months
    svg1.append("g")
      .attr("transform", `translate(0, ${200})`)
      .call(d3.axisBottom(x)
        .ticks(numMonths)
        .tickFormat(x => toMonthName(x.getMonth() + 1)))
      .attr('font-size', 5);

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, function (d) { return +d.MeasureValue + 20; })])
      .range([200, 50]);
    svg1.append("g")
      .call(d3.axisLeft(y))
      .attr('font-size', 5);;

    // Color selection
    const color = d3.scaleOrdinal()
      .range([color1, color2, color3, color4])

    // Draw the line
    svg1.selectAll(".line")
      .data(sumstat)
      .join("path")
      .attr("fill", "none")
      .attr("stroke", function (d) { return color(d[0]) })
      .attr("stroke-width", 1)
      .attr("d", function (d) {
        return d3.line()
          .x(function (d) {
            if (selectedLines.includes(d.MeasureName) && dict[selectedLines.findIndex(x => x === d.MeasureName)]) {
              return x(parseDate(d.Time));
            }
            else {
              return 0;
            }
          })
          .y(function (d) {
            if (selectedLines.includes(d.MeasureName) && dict[selectedLines.findIndex(x => x === d.MeasureName)]) {
              return y(+d.MeasureValue);
            }
            else {
              return 0;
            }
          })
          (d[1])
      })

    // Data dots
    svg1
      .append("g")
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("r", function (d) {
        if (selectedLines.includes(d.MeasureName) && dict[selectedLines.findIndex(x => x === d.MeasureName)]) {
          return 1.1;
        }
        else {
          return 0;
        }
      })
      .attr("fill", function (d) {
        if (d.MeasureName == 'weight') {
          return color1;
        }
        else if (d.MeasureName == 'blood_pressure_systolic') {
          return color2;
        }
        else if (d.MeasureName == 'blood_pressure_diastolic') {
          return color3;
        }
        else if (d.MeasureName == 'pulse') {
          return color4;
        }
      })
      .attr("cx", function (d) { return x(parseDate(d.Time)) })
      .attr("cy", function (d) { return y(d.MeasureValue) })
      .on("mouseover", function (event, d) {
        div.transition()
          .duration(200)
          .style("opacity", .9);
        div.html(toMonthName(parseDate(d.Time).getMonth() + 1)
        + "&nbsp" + toDay(parseDate(d.Time).getDate())
        + "," + "&nbsp" + toYear(parseDate(d.Time).getFullYear())
        + "<br/>" + Math.round(d.MeasureValue * 100) / 100
        + displayUnit(d.MeasureName))
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function (d) {
        div.transition()
          .duration(500)
          .style("opacity", 0);
      });

    // creating a div for the tooltip
    var div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);


    // Y axis label rotated
    svg1.append("text")
      .attr("x", -150)
      .attr('y', -30)
      .style('transform', 'rotate(-90deg)')
      .text("Value")
      .style('font-size', '15px')

    // Y axis label rotated
    svg1.append("text")
      .attr("x", 130)
      .attr('y', 230)
      .text("Date")
      .style('font-size', '15px')
  }

  function makeTitle(patient) {
    // CLEARS ENTIRE GRAPH
    svg1.selectAll("*").remove();
    // Title of Chart
    svg1.append('rect')
      .attr('x', margin.right - 10)
      .attr('y', 16)
      .attr('height', 25)
      .attr('width', 140)
      .style('fill', '#D3D3D3')
      .style("stroke", "black")
    svg1
      .append('text')
      .attr('x', margin.right)
      .attr('y', 35)
      .style('fill', 'black')
      .text('Patient ' + patient + ' Vitals');
  }

  // Creating gradient scale for risk

  var colors = ['rgb(0,255,0)', 'rgb(255,165,0)', 'rgb(255,0,0)'];

  var svg2 = d3.select('#vis-svg-1');

  var grad = svg2.append('defs')
    .append('linearGradient')
    .attr('id', 'grad')
    .attr('x1', '0%')
    .attr('x2', '100%')
    .attr('y1', '0%')
    .attr('y2', '0%');

  grad.selectAll('stop')
    .data(colors)
    .enter()
    .append('stop')
    .style('stop-color', function (d) { return d; })
    .attr('offset', function (d, i) {
      return 100 * (i / (colors.length - 1)) + '%';
    })

  // Controls where the gradient is located on the page
  let riskgrad = {
    x: 650,
    y: 70
  }

  svg2.append('rect')
    .attr('x', riskgrad.x)
    .attr('y', riskgrad.y)
    .attr('width', 150)
    .attr('height', 30)
    .attr('stroke', 'black')
    .style('fill', 'url(#grad)');

  svg2.append("text")
    .attr('x', riskgrad.x - 10)
    .attr('y', riskgrad.y - 5)
    .attr('font-family', 'Gill Sans')
    .style('font-size', 13)
    .text('Low Risk');
  svg2.append("text")
    .attr('x', riskgrad.x + 110)
    .attr('y', riskgrad.y - 5)
    .attr('font-family', 'Gill Sans')
    .style('font-size', 13)
    .text('High Risk');


  // Controls where the legend is located on the page
  let legend = {
    x: 750,
    y: 200
  }

  const greyColor = '#D3D3D3';

  // Creating large rectangle for Legend
  svg2.append('rect')
    .attr('x', legend.x)
    .attr('y', legend.y)
    .attr('height', 75)
    .attr('width', 200)
    .style('fill', greyColor)
    .style("stroke", "black")

  // Creating the first small red rectangle
  selected1 = true;
  svg2.append('rect')
    .attr('x', legend.x + 10)
    .attr('y', legend.y + 10)
    .attr('height', 10)
    .attr('width', 10)
    .style('fill', color1)
    .style("stroke", "black")
    .on('click', function (d) {
      dict[0] = 1 - dict[0];
      updateChart();
      d3.select(this).style('fill', function () {
        if (selected1) {
          selected1 = !selected1;
          return greyColor;
        }
        else {
          selected1 = !selected1;
          return color1;
        }
      });
    });

  // Creating the text for the small red rectangle
  svg2.append("text")
    .attr("x", legend.x + 30)
    .attr('y', legend.y + 18)
    .style('font-size', '10px')
    .text("Weight");

  //Creating the second rectangle (blue)
  selected2 = true;
  svg2.append('rect')
    .attr('x', legend.x + 10)
    .attr('y', legend.y + 25)
    .attr('height', 10)
    .attr('width', 10)
    .style('fill', color2)
    .style("stroke", "black")
    .on('click', function (d) {
      dict[1] = 1 - dict[1];
      updateChart();
      d3.select(this).style('fill', function () {
        if (selected2) {
          selected2 = !selected2;
          return greyColor;
        }
        else {
          selected2 = !selected2;
          return color2;
        }
      });
    });
  // Creating the text for the blood pressure systolic
  svg2.append("text")
    .attr("x", legend.x + 30)
    .attr('y', legend.y + 33)
    .style('font-size', '10px')
    .text("Blood Pressure Systolic");

  selected3 = true;
  svg2.append('rect')
    .attr('x', legend.x + 10)
    .attr('y', legend.y + 40)
    .attr('height', 10)
    .attr('width', 10)
    .style('fill', color3)
    .style("stroke", "black")
    .on('click', function (d) {
      dict[2] = 1 - dict[2];
      updateChart();
      d3.select(this).style('fill', function () {
        if (selected3) {
          selected3 = !selected3;
          return greyColor;
        }
        else {
          selected3 = !selected3;
          return color3;
        }
      });
    });

  // Creating the text for the small red rectangle
  svg2.append("text")
    .attr("x", legend.x + 30)
    .attr('y', legend.y + 48)
    .style('font-size', '10px')
    .text("Blood Pressure Diastolic");

  selected4 = true;
  svg2.append('rect')
    .attr('x', legend.x + 10)
    .attr('y', legend.y + 55)
    .attr('height', 10)
    .attr('width', 10)
    .style('fill', color4)
    .style("stroke", "black")
    .on('click', function (d) {
      dict[3] = 1 - dict[3];
      updateChart();
      d3.select(this).style('fill', function () {
        if (selected4) {
          selected4 = !selected4;
          return greyColor;
        }
        else {
          selected4 = !selected4;
          return color4;
        }
      });
    });

  // Creating the text for the small red rectangle
  svg2.append("text")
    .attr("x", legend.x + 30)
    .attr('y', legend.y + 63)
    .style('font-size', '10px')
    .text("Pulse");

  svg2.append("text")
    .attr('x', 100)
    .attr('y', 65)
    .attr('font-family', 'Gill Sans')
    .style('font-size', 18)
    .text('Select Patient');
})());