
d3.csv("data.csv", function(csvdata){
	var dataset = [];
	for(var i=0; i<csvdata.length; i++){
		console.log("i",i);
		console.log("data",csvdata[i]['data']);
		dataset.push(csvdata[i]['data'])
	};
	make_graph(dataset);
});

function make_graph(dataset){
	var svg = d3.select("body")
					.append("svg")
					.attr("height",300);

	svg.selectAll("rect")
			.data(dataset)
			.enter()
			.append("rect")
			.attr({
				x : function(d,i){ console.log("x"); return i * 30; },
				y : function(d){ return 300 - d; },
				width : 15,
				height: function(d){ return d;},
				fill : '#6fbadd'
			});
}

