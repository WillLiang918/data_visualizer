$("#csvfile")[0].addEventListener("change", upload, false);

function upload(evt) {
  var data = null;
  var file = evt.target.files[0];
  var reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function(event) {
     var csvData = event.target.result;
     data = $.csv.toArrays(csvData);
     if (data && data.length > 0) {
       alert('Imported -' + data.length + '- rows successfully!');
     } else {
       alert('No data to import!');
     }
  };
}

$("#graphcsv").on("click", function(){

  var file = $("#csvfile")[0].files[0];

  d3.csv(file.name, function (data) {
    console.log("Inital Data", data);
  });
});
