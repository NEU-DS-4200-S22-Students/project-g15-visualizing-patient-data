// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {

  // dimensions of a cell that represents a patient
  let cell = {
    width: 100,
    widthAndStroke: 100.6,
    height: 30
  }
  // selecting the svg
  let svg = d3.select("#vis-svg-1");
  // shows which patient is selected
  var highlightedRect = d3.select(null);
  // represents which vital is currently being shown
  var dict = [1, 0, 0, 0];
  // patient currently selected
  var curPatient = 1;
  // current path of the data file
  var curPath = 'data/patient1.csv';
  const selectedLines = ["weight", "blood_pressure_systolic", "blood_pressure_diastolic", "pulse"];
  let margin = {
    top: 80,
    left: 50,
    right: 30,
    bottom: 15
  },
    width = 500 - margin.left - margin.right,
    height = 325 - margin.top - margin.bottom;

  // first visualization
  let svg1 = d3.select('#vis-svg-1')
    .append('svg')
    .attr('preserveAspectRatio', 'xMidYMid meet') // this will scale your visualization according to the size of its parent element and the page.
    .attr('width', '100%') // this is now required by Chrome to ensure the SVG shows up at all
    .style('background-color', '#ccc') // change the background color to light gray
    .attr('viewBox', [-50, -50, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))

  // risk colors
  let color1 = "#008960";
  let color2 = "#C60095";
  let color3 = "#FF8980";
  let color4 = "#888888";
  // formats date correctly
  let parseDate = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");

  // refreshes the chart, for when a user clicks on something
  function updateChart() {
    d3.csv(curPath).then(lineChart).then(makeTitle(curPatient));
  }

  // creates a new cell in the table to represent a new patient
  function makeCell(cellRow, cellNum, color, path) {
    svg.append("rect")
      .attr("x", 110 + (cell.widthAndStroke * cellNum))
      .attr("y", (cellRow * cell.height) + 40)
      .attr("width", cell.width)
      .attr("height", cell.height)
      .attr("fill", color)
      .attr('stroke', 'black')
      .attr("id", cellNum)
      .on('click', function () {
        clickCell(path, cellNum, this);
      });
    svg.append("text")
      .attr('x', 120 + (cell.widthAndStroke * cellNum))
      .attr('y', (cellRow * cell.height) + 60)
      .attr('font-family', 'Times New Roman')
      .style('font-size', 13)
      .text('Patient ' + (cellNum + 1))
      .on('click', function () {
        clickCell(path, cellNum, d3.select("rect[id='" + cellNum + "']").nodes()[0]);
      });

    // updates selection the the table
    function clickCell(path, cellNum, obj) {
      curPath = path;
      curPatient = cellNum + 1;
      d3.csv(path).then(lineChart).then(makeTitle(curPatient));
      highlightedRect.attr("stroke", "black")
        .attr('stroke-width', 1);
      highlightedRect = d3.select(obj);
      highlightedRect.attr("stroke", "#0066ff")
        .attr('stroke-width', 3);
    }

    // starting the page with patient 1 selected
    clickCell("data/patient1.csv", 0, d3.select("rect[id='0']").nodes()[0]);
  }

  // adding 5 patients and their data
  makeCell(1, 0, "#A6D96A", "data/patient1.csv");
  makeCell(1, 1, "#FCD8B6", "data/patient2.csv");
  makeCell(1, 2, "#DFF9C1", "data/patient3.csv");
  makeCell(1, 3, "#FE7B4E", "data/patient4.csv");
  makeCell(1, 4, "#C7FFA6", "data/patient5.csv");

  // creates the line chart depenging on the selected vital
  function lineChart(data) {

    // Sort the lines by type of measurement
    const sumstat = d3.group(data, d => d.MeasureName);

    // Add X axis 
    const x = d3.scaleTime()
      .domain(d3.extent(data, function (d) { return parseDate(d.Time); }))
      .range([0, 300]);

    // getting the number of months to help with scaling
    months = d3.extent(data, function (d) { return parseDate(d.Time); });
    numMonths = (months[1].getMonth() - months[0].getMonth() + (months[1].getFullYear() - months[0].getFullYear()) * 12) + 1;

    // converts a number to a year
    function toYear(yearNumber) {
      const date = new Date();
      date.setFullYear(yearNumber);

      return date.toLocaleString('en-US', {
        year: 'numeric',
      });
    }

    // converts a number to its corresponding month
    function toMonthName(monthNumber) {
      const date = new Date();
      date.setMonth(monthNumber - 1);

      return date.toLocaleString('en-US', {
        month: 'long',
      });
    }

    // converts number to a day
    function toDay(dayNumber) {
      const date = new Date();
      date.setDate(dayNumber);
      return date.toLocaleString('en-US', {
        day: 'numeric',
      });
    }

    // returns the units for a given vital measurement type
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
      .attr("x", function () {
        if (dict[0] == 1) {
          return -160;
        }
        else if (dict[1] == 1 && dict[2] == 1) {
          return -190;
        }
        else if (dict[3] == 1) {
          return -158;
        }
      })
      .attr('y', -30)
      .attr('font-family', 'Times New Roman')
      .style('transform', 'rotate(-90deg)')
      .text(function () {
        if (dict[0] == 1) {
          return "Weight (lbs)";
        }
        else if (dict[1] == 1 && dict[2] == 1) {
          return "Blood Pressure (mmHg)";
        }
        else if (dict[3] == 1) {
          return "Pulse (bpm)";
        }
      })
      .style('font-size', '12px');

    // Y axis label rotated
    svg1.append("text")
      .attr("x", 110)
      .attr('y', 230)
      .text("Date (Month)")
      .attr('font-family', 'Times New Roman')
      .style('font-size', '13px');
  }

  // Creates the graph title according to the patient selected
  function makeTitle(patient) {
    if (curPatient != 0) {
      // CLEARS ENTIRE GRAPH
      svg1.selectAll("*").remove();
      // Title of Chart
      svg1.append('rect')
        .attr('x', margin.right - 30)
        .attr('y', 16)
        .attr('height', 25)
        .attr('width', 140)
        .style('fill', '#D3D3D3')
        .style("stroke", "black")
      svg1
        .append('text')
        .attr('x', margin.right - 20)
        .attr('y', 35)
        .attr('font-family', 'Times New Roman')
        .style('fill', 'black')
        .text('Patient ' + patient + ' Vitals');
    }
  }

  // Creating gradient scale for risk
  var colors = ['rgb(26,150,65)', 'rgb(166,217,106)', 'rgb(255,255,191)', 'rgb(253,174,97)', 'rgb(215,25,28)'];
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
    x: 750,
    y: 70
  }

  // Creating the gradient and adding labels
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
    .attr('font-family', 'Times New Roman')
    .style('font-size', 13)
    .text('Low Risk');
  svg2.append("text")
    .attr('x', riskgrad.x + 110)
    .attr('y', riskgrad.y - 5)
    .attr('font-family', 'Times New Roman')
    .style('font-size', 13)
    .text('High Risk');


  // Controls where the legend is located on the page
  let legend = {
    x: 750,
    y: 200
  }

  // deafult color
  const greyColor = '#D3D3D3';
  // current selected vital
  var curVital = 1;

  // updates the graph and legend according to a selected vital
  function selectVital(num) {
    if (num == 1 && curVital != 1) {
      enforceOneSelection(curVital);
      curVital = 1;
      dict[0] = 1 - dict[0];
      updateChart();
      changeColor1.call('start');
    }
    else if (num == 2 && curVital != 2) {
      enforceOneSelection(curVital);
      curVital = 2;
      dict[1] = 1 - dict[1];
      dict[2] = 1 - dict[2];
      updateChart();
      changeColor2.call('start');
      changeColor3.call('start');
    }
    else if (num == 3 && curVital != 3) {
      enforceOneSelection(curVital);
      curVital = 3;
      dict[3] = 1 - dict[3];
      updateChart();
      changeColor4.call('start');
    }
  }

  // a user cannot select more than one vital at a time
  function enforceOneSelection(num) {
    if (num == 1) {
      dict[0] = 1 - dict[0];
      updateChart();
      changeColor1.call('start', rect1);
    }
    else if (num == 2) {
      dict[1] = 1 - dict[1];
      dict[2] = 1 - dict[2];
      updateChart();
      changeColor2.call('start');
      changeColor3.call('start');
    }
    else if (num == 3) {
      dict[3] = 1 - dict[3];
      updateChart();
      changeColor4.call('start');
    }
  }

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
  let rect1 = svg2.append('rect')
    .attr('x', legend.x + 10)
    .attr('y', legend.y + 10)
    .attr('height', 10)
    .attr('width', 10)
    .style('fill', color1)
    .style("stroke", '#0066ff')
    .style('stroke-width', 2)
    .on('click', function () {
      selectVital(1);
    });

  // dispatch for updating the legend
  const changeColor1 = d3.dispatch('start');

  changeColor1.on('start', function () {
    if (selected1) {
      selected1 = !selected1;
      rect1.style('stroke', 'black');
      rect1.style('stroke-width', 1);
    }
    else {
      selected1 = !selected1;
      rect1.style('stroke', '#0066ff');
      rect1.style('stroke-width', 2);
    };
  });

  // Creating the text for the small red rectangle
  svg2.append("text")
    .attr("x", legend.x + 30)
    .attr('y', legend.y + 18)
    .attr('font-family', 'Times New Roman')
    .style('font-size', '10px')
    .text("Weight")
    .on('click', function () {
      selectVital(1);
    });

  //Creating the second rectangle (blue)
  selected2 = false;
  let rect2 = svg2.append('rect')
    .attr('x', legend.x + 10)
    .attr('y', legend.y + 25)
    .attr('height', 10)
    .attr('width', 10)
    .style('fill', color2)
    .style("stroke", "black")
    .on('click', function () {
      selectVital(2);
    });

  // dispatch for updating the legend
  const changeColor2 = d3.dispatch('start');

  changeColor2.on('start', function () {
    if (selected2) {
      selected2 = !selected2;
      rect2.style('stroke', 'black');
      rect2.style('stroke-width', 1);
    }
    else {
      selected2 = !selected2;
      rect2.style('stroke', '#0066ff');
      rect2.style('stroke-width', 2);
    };
  });

  // Creating the text for the blood pressure systolic
  svg2.append("text")
    .attr("x", legend.x + 30)
    .attr('y', legend.y + 33)
    .attr('font-family', 'Times New Roman')
    .style('font-size', '10px')
    .text("Blood Pressure Systolic")
    .on('click', function () {
      selectVital(2);
    });

  selected3 = false;
  let rect3 = svg2.append('rect')
    .attr('x', legend.x + 10)
    .attr('y', legend.y + 40)
    .attr('height', 10)
    .attr('width', 10)
    .style('fill', color3)
    .style("stroke", "black")
    .on('click', function () {
      selectVital(2);
    });

  // dispatch for updating the legend
  const changeColor3 = d3.dispatch('start');

  changeColor3.on('start', function () {
    if (selected3) {
      selected3 = !selected3;
      rect3.style('stroke', 'black');
      rect3.style('stroke-width', 1);
    }
    else {
      selected3 = !selected3;
      rect3.style('stroke', '#0066ff');
      rect3.style('stroke-width', 2);
    };
  });

  // Creating the text for the small red rectangle
  svg2.append("text")
    .attr("x", legend.x + 30)
    .attr('y', legend.y + 48)
    .attr('font-family', 'Times New Roman')
    .style('font-size', '10px')
    .text("Blood Pressure Diastolic")
    .on('click', function () {
      selectVital(2);
    });

  selected4 = false;
  let rect4 = svg2.append('rect')
    .attr('x', legend.x + 10)
    .attr('y', legend.y + 55)
    .attr('height', 10)
    .attr('width', 10)
    .style('fill', color4)
    .style("stroke", "black")
    .on('click', function () {
      selectVital(3);
    });

  // dispatch for updating the legend
  const changeColor4 = d3.dispatch('start');

  changeColor4.on('start', function () {
    if (selected4) {
      selected4 = !selected4;
      rect4.style('stroke', 'black');
      rect4.style('stroke-width', 1);
    }
    else {
      selected4 = !selected4;
      rect4.style('stroke', '#0066ff');
      rect4.style('stroke-width', 2);
    };
  });

  // Creating the text for the small red rectangle
  svg2.append("text")
    .attr("x", legend.x + 30)
    .attr('y', legend.y + 63)
    .attr('font-family', 'Times New Roman')
    .style('font-size', '10px')
    .text("Pulse")
    .on('click', function () {
      selectVital(3);
    });

  // Title for patient table
  svg2.append("text")
    .attr('x', 110)
    .attr('y', 65)
    .attr('font-family', 'Times New Roman')
    .style('font-size', 18)
    .text('Select Patient');

  // Title for legned
  svg2.append("text")
    .attr('x', 750)
    .attr('y', 195)
    .attr('font-family', 'Times New Roman')
    .style('font-size', 18)
    .text('Select Vital');
})());