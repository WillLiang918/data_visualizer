$("#csvfile")[0].addEventListener("change", upload, false);

function upload(evt) {
  var data = null;
  var file = evt.target.files[0];
  var reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function(event) {
    var csvData = event.target.result;
    data = $.csv.toArrays(csvData);
    // if (data && data.length > 0) {
    //  alert('Imported -' + data.length + '- rows successfully!');
    // } else {
    //  alert('No data to import!');
    // }

    data[0].forEach( function(label) {

      for (var i = 0; i < 4; i++) {
        var option = document.createElement("option");
        option.text = label;
        option.value = label;
        $(".col")[i].appendChild(option);
      }
    });
  };

  $("#graphcsv").on("click", function(){

    $("svg").remove();

    var outerWidth = 500;
    var outerHeight = 500;
    var margin = {left: 60, top: 5, right: 5, bottom: 60 };
    var innerWidth = outerWidth - margin.left - margin.right;
    var innerHeight = outerHeight - margin.top - margin.bottom;
    var rMin = 1;
    var rMax = 5;
    var parsedData = [];
    var xAxisLabelText = $(".xColumn")[0].value + " (" +
                         $('input[name=xScale]:checked').val() + ")";
    var xAxisLabelOffset = 48;
    var yAxisLabelText = $(".yColumn")[0].value + " (" +
                         $('input[name=yScale]:checked').val() + ")";
    var yAxisLabelOffset = 48;

    var svg = d3.select("body").append("svg").
      attr("width", outerWidth)
      .attr("height", outerHeight);

    var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xAxisG = g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + innerHeight + ")");
    var yAxisG = g.append("g")
      .attr("class", "y axis");

    var xAxisLabel = xAxisG.append("text")
      .style("text-anchor", "middle")
      .attr("x", innerWidth / 2)
      .attr("y", xAxisLabelOffset)
      .attr("class", "label")
      .text(xAxisLabelText);
    var yAxisLabel = yAxisG.append("text")
      .style("text-anchor", "middle")
      .attr("transform", "translate(-" + yAxisLabelOffset + "," + (innerHeight / 2) + ") rotate(-90)")
      .attr("class", "label")
      .text(yAxisLabelText);

    var xScale = $('input[name=xScale]:checked').val() == "linear" ?
                  d3.scale.linear().range([0, innerWidth]) :
                  d3.scale.log().range([0, innerWidth]);

    var yScale = $('input[name=yScale]:checked').val() == "linear" ?
                  d3.scale.linear().range([innerWidth, 0]) :
                  d3.scale.log().range([innerWidth, 0]);

    var rScale = d3.scale.sqrt().range([rMin, rMax]);

    for (var i = 1; i < data.length; i++){
      parsedData.push({
        name: data[i][data[0].indexOf($(".name")[0].value)],
        xColumn: data[i][data[0].indexOf($(".xColumn")[0].value)],
        yColumn: data[i][data[0].indexOf($(".yColumn")[0].value)],
        rColumn: data[i][data[0].indexOf($(".rColumn")[0].value)],
      });
    }

    var xAxis = d3.svg.axis().scale(xScale).orient("bottom")
      .ticks(5)
      .tickFormat(d3.format("s"))
      .outerTickSize(0);
    var yAxis = d3.svg.axis().scale(yScale).orient("left")
      .ticks(5)
      .tickFormat(d3.format("s"))
      .outerTickSize(0);

    function render(data) {
      xScale.domain(d3.extent(data, function(d) { return +d.xColumn; }));
      yScale.domain(d3.extent(data, function(d) { return +d.yColumn; }));

      xAxisG.call(xAxis);
      yAxisG.call(yAxis);

      var circles = g.selectAll("circle").data(data);
      circles.enter().append("circle");

      var tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);

      circles
        .attr("cx", function (d) { return xScale(+d.xColumn); })
        .attr("cy", function (d) { return yScale(+d.yColumn); })
        .attr("r", 5)
        .attr("class", function(d) { return d.name; })
        .on("mouseover", function(d) {
          tooltip.transition()
            .duration(200)
            .style("opacity", 0.9);
          tooltip.html("Name: " + d.name + "<br/>" +
                      $(".xColumn")[0].value + ": " + d.xColumn.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") + "<br/>" +
                      $(".yColumn")[0].value + ": " + d.yColumn.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,"))
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
