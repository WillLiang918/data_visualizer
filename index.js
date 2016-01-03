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

    var outerWidth = 500;
    var outerHeight = 500;
    var innerWidth = outerWidth - 30 - 30;
    var innerHeight = outerHeight - 30 - 30;
    var rMin = 1;
    var rMax = 5;
    var parsedData = [];

    var svg = d3.select("body").append("svg").
      attr("width", outerWidth)
      .attr("height", outerHeight);

    var g = svg.append("g")
      .attr("transform", "translate(30, 30)");

    var xScale = d3.scale.linear().range([0, innerWidth]);
    var yScale = d3.scale.linear().range([innerHeight, 0]);
    var rScale = d3.scale.sqrt().range([rMin, rMax]);

    for (var i = 1; i < data.length; i++){
      parsedData.push({
        name: data[i][data[0].indexOf($(".name")[0].value)],
        xColumn: data[i][data[0].indexOf($(".xColumn")[0].value)],
        yColumn: data[i][data[0].indexOf($(".yColumn")[0].value)],
        rColumn: data[i][data[0].indexOf($(".rColumn")[0].value)],
      });
    }

    function render(data) {
      xScale.domain(d3.extent(data, function(d) { return +d.xColumn; }));

      yScale.domain(d3.extent(data, function(d) { return +d.yColumn; }));

      var circles = g.selectAll("circle").data(data);
      circles.enter().append("circle");

      circles
        .attr("cx", function (d) { return xScale(+d.xColumn); })
        .attr("cy", function (d) { return yScale(+d.yColumn); })
        .attr("r", 5)
        .attr("class", function(d) { return d.name; });

      circles.exit().remove();

      debugger

    }

    render(parsedData);
  });


}
