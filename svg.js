var outerWidth = 500;
var outerHeight = 500;
var innerWidth = outerWidth - 30 - 30;
var innerHeight = outerHeight - 30 - 30;
var rMin = 1;
var rMax = 5;
var yColumn = "gdp";
var xColumn = "population";
var rColumn = "area";

var svg = d3.select("body").append("svg")
  .attr("width", outerWidth)
  .attr("height", outerHeight);

var g = svg.append("g")
  .attr("transform", "translate(30, 30)");

var xScale = d3.scale.log().range([0, innerWidth]);
var yScale = d3.scale.log().range([innerHeight, 0]);
// var xScale = d3.scale.linear().range([0, innerWidth]);
// var yScale = d3.scale.linear().range([outerHeight, 0]);
var rScale = d3.scale.sqrt().range([rMin, rMax]);

function render(data) {

  // xScale.domain(d3.extent(data, function (d){ return d[xColumn]; }));
  // yScale.domain(d3.extent(data, function (d){ return d[yColumn]; }));

  xScale.domain([
    d3.min(data, function(year) {
      return d3.min(year.values, function(states) { return states[xColumn]; });
    }),
    d3.max(data, function(year) {
      return d3.max(year.values, function(states) { return states[xColumn]; });
    })
  ]);

  yScale.domain([
    d3.min(data, function(year) {
      return d3.min(year.values, function(states) { return states[yColumn]; });
    }),
    d3.max(data, function(year) {
      return d3.max(year.values, function(states) { return states[yColumn]; });
    })
  ]);

  rScale.domain([ 0, d3.max(data[0].values, function(state) { return state[rColumn]; })]);

  var dataset = [];
  data.forEach(function(year){
     year.values.forEach(function(something){
      dataset.push(something);
    });
  });

  var circles = g.selectAll("circle").data(dataset);
  circles.enter().append("circle");

  circles
    .attr("cx", function (d){ return xScale(+d[xColumn]); })
    .attr("cy", function (d){ return yScale(+d[yColumn]); })
    .attr("r", function (d){ return rScale( +( d[rColumn] / d[yColumn] ) ); })
    .attr("r", 2)
    .attr("class", function (d) { return d.year + " " + d.label; });
    // .on('mouseover', function(d){
    //   d3.select(this)
    //   .attr("fill", "orange")
    //   .attr("class", "hover")
    //   .html(d.POPESTIMATE2009);
    // })
    // .on('mouseout', function(d){
    //   d3.select(this).attr("fill", "black");
    // });

  circles.exit().remove();
}

function type(d){
  d[xColumn] = +d[xColumn];
  d[yColumn] = +d[yColumn];
  return d;
}

d3.csv("population.csv", type, function (data) {
  console.log("Inital Data", data);

  var labelVar = "NAME";
  var populationByYear = d3.keys(data[0]).slice(2, 12);
  var gdpByYear = d3.keys(data[0]).slice(12, data.length);

  var seriesData = populationByYear.map( function (name) {
    var year = name.slice(11, name.length);
    return {
      year: year,
      values: data.map( function (d){
        return { year: "year" + year,
                 label: d[labelVar],
                 area: +d.LANDAREA,
                 population: +d[name],
                 gdp: +d["GDP" + year],
               };
      })
    };
  });

  console.log("seriesData", seriesData);

  render(seriesData);

  var people = rScale.domain()[1];
  var pixels = Math.PI * rMax * rMax;
  console.log((people / pixels) + " people per pixel.");
});
