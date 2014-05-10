
var dataset = [ 10 , 30 ,49 , 12 , 22 ];

var svg = d3.select("body")
				.append("svg")
				.attr("height",300);

svg.selectAll("rect")
		.data(dataset)
		.enter()
		.append("rect")
		.attr({
			x : function(d,i){ return i * 30; },
			y : function(d){ return 300 - d; },
			width : 15,
			height: function(d){ return d;},
			fill : '#6fbadd'
		});
