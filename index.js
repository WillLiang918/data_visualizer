$("#csvfile")[0].addEventListener("change", upload, false);
$("#sampledata").on("click", function(){
  upload("sampleData");
});

function upload(evt) {
  var data = [[]];
  var outerWidth = 500;
  var outerHeight = 500;
  var xAxisLabelOffset = 48;
  var yAxisLabelOffset = 48;
  var titleLabelOffset = 10;
  var margin = {left: 60, top: (20 + titleLabelOffset), right: 5, bottom: (60) };
  var innerWidth = outerWidth - margin.left - margin.right;
  var innerHeight = outerHeight - margin.top - margin.bottom;
  var rMin = 1;
  var rMax = 5;

  if (evt === "sampleData") {
    d3.csv("population.csv", function (sampleData) {
      data = [[]];
      for (var key in sampleData[0]) {
        data[0].push(key);
      }
      sampleData.forEach(function(row){
        var parsedRow = [];
        for (var key in row) { parsedRow.push(row[key]); }
        data.push(parsedRow);
      });
      createLabels();
    });
  } else {
    var file = evt.target.files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(event) {
      var csvData = event.target.result;
      data = $.csv.toArrays(csvData);
      createLabels();
    };
  }

  function createLabels() {
    data[0].forEach( function(label) {
      for (var i = 0; i < 4; i++) {
        var option = document.createElement("option");
        option.text = label;
        option.value = label;
        $(".col")[i].appendChild(option);
      }
    });
  }

  $("#graphcsv").on("click", function(){

    $("svg").remove();

    var parsedData = [];
    var xColumnName = $(".xColumnName")[0].value;
    var xColumn = $(".xColumn")[0].value;
    var rColumn = $(".rColumn")[0].value;
    var yColumn = $(".yColumn")[0].value;
    var yColumnName = $(".yColumnName")[0].value;
    var labelArugmentName = $(".label-arugment-name")[0].value;
    var labelArugment = $(".label-arugment")[0].value;

    var xAxisLabelText = (xColumnName === "") ? xColumn : xColumnName;
    var yAxisLabelText = (yColumnName === "") ? yColumn : yColumnName;
    var labelArugmentText = (labelArugmentName === "") ?
                          (labelArugment == "default" ? "Index" : labelArugment) :
                          labelArugmentName;
    var titleLabelText = yAxisLabelText + " vs " + xAxisLabelText;

    var svg = d3.select("body").append("svg")
      .attr("width", outerWidth)
      .attr("height", outerHeight);

    var titleG = svg.append("g")
      .attr("transform", "translate(" + (margin.left / 2) + "," + titleLabelOffset + ")")
      .attr("class", "label");

    var titleLabel = titleG.append("text")
      .style("text-anchor", "middle")
      .attr("x", outerWidth / 2)
      .attr("y", titleLabelOffset)
      .attr("class", "label titleLabel")
      .text(titleLabelText);

    var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xAxisG = g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (innerHeight) + ")");
    var yAxisG = g.append("g")
      .attr("class", "y axis");

    var xAxisLabel = xAxisG.append("text")
      .style("text-anchor", "middle")
      .attr("x", innerWidth / 2)
      .attr("y", xAxisLabelOffset)
      .attr("class", "label")
      .text(xAxisLabelText + $('input[name=xScale]:checked').val());

    var yAxisLabel = yAxisG.append("text")
      .style("text-anchor", "middle")
      .attr("transform", "translate(-" + yAxisLabelOffset + "," + (innerHeight / 2) + ") rotate(-90)")
      .attr("class", "label")
      .text(yAxisLabelText + $('input[name=yScale]:checked').val());

    var xScale = $('input[name=xScale]:checked').val() === "" ?
                  d3.scale.linear().range([0, innerWidth]) :
                  d3.scale.log().range([0, innerWidth]);

    var yScale = $('input[name=yScale]:checked').val() === "" ?
                  d3.scale.linear().range([(innerHeight), 0]) :
                  d3.scale.log().range([(innerHeight), 0]);

    var rScale = d3.scale.sqrt().range([rMin, rMax]);

    for (var i = 1; i < data.length; i++){
      parsedData.push({
        label: (labelArugment == "default") ? i :
                data[i][data[0].indexOf(labelArugment)],
        xColumn: data[i][data[0].indexOf(xColumn)],
        yColumn: data[i][data[0].indexOf(yColumn)],
        rColumn: data[i][data[0].indexOf(rColumn)],
      });
    }

    var xAxis = d3.svg.axis().scale(xScale).orient("bottom")
      .ticks(5)
      .tickFormat(d3.format("s"))
      .outerTickSize(1);
    var yAxis = d3.svg.axis().scale(yScale).orient("left")
      .ticks(5)
      .tickFormat(d3.format("s"))
      .outerTickSize(1);

    function render(data) {
      xScale.domain(d3.extent(data, function(d) { return +d.xColumn; }));
      yScale.domain(d3.extent(data, function(d) { return +d.yColumn; }));
      rScale.domain(d3.extent(data, function(d) { return +d.rColumn; }));

      if ($('input[name=xScale]:checked').val() === "") { xAxisG.call(xAxis); }
      if ($('input[name=yScale]:checked').val() === "") { yAxisG.call(yAxis); }

      var circles = g.selectAll("circle").data(data);
      circles.enter().append("circle");

      var tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);

      circles
        .attr("cx", function (d) { return xScale(+d.xColumn); })
        .attr("cy", function (d) { return yScale(+d.yColumn); })
        .attr("r", (
          $(".rColumn")[0].value == "default" ? 2 : function (d) { return rScale(+d.rColumn); }
        ))
        .attr("class", function(d) { return d.name; })
        .on("mouseover", function(d) {
          tooltip.transition()
            .duration(200)
            .style("opacity", 0.9);
          tooltip.html(labelArugmentText + ": " + d.label + "<br/>" +
                      xAxisLabelText + ": " + d.xColumn.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "<br/>" +
                      yAxisLabelText + ": " + d.yColumn.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
      });
      circles.exit().remove();
    }

    render(parsedData);
  });
}
