$(document).ready(function(){
	$.ajax({
		url: "http://hirose.sendai-nct.ac.jp/~sue/wattmon/5min.csv",
		type:"GET",
		chache: false ,

		success:function(res){
			var content = $(res.responseText).text();
			var dataset = text2dataset(content);
			make_graph(dataset);
		}
	});
});

function csv2dataset(csv) {
	return _.map(csv, function(d, i) {
		return {no: i, time: d[1], watt: d[3]}
	});
}

function text2dataset(text){
	/*
	データ
	謎空白 y/m/d h:m:s, #n#, value y/m/d.... LFLF
	こういう変に空白を混ぜやがったデータを整形してdatasetにする
	*/

	// 先頭末尾のスペースとLF文字を削除
	var lf = String.fromCharCode(10);
	var trimedText = text.replace(/^(\s|lf)+|(\s|lf)+$/g, "");
	// カンマ,スペースで分割　["y/m/d", "h:m:s", "#n#", "value", ...]
	textList = trimedText.split(/\s*\,\s*|\s/);
	// 時刻の部分だけ取り出す　["h:m:s", "h:m:s", ...]
	timeList = _.filter(textList, function(d, i) { return i % 4 == 1});
	// watt値のところだけ取り出す　[value0, value1, ...]
	wattList = _.map(_.filter(textList, function(d, i) { return i % 4 == 3}), 
		function(d) { return parseInt(d)});
	// 時刻とwattのリストをZip [["h:m:s", value0], ["h:m:s", value1], ...]
	timeWattList = _.zip(timeList, wattList);
	// make_graphが読める形式に変換　[{no: 0, time: "h:m:s", watt: value0}, ...]
	dataset = _.map(timeWattList, function(d, i) { 
		return {no: i, time: d[0], watt: _.isNumber(d[1]) ? d[1] : 0 };
	});
	return dataset;
}

function make_graph(dataset){
	var pane = { width: 1000, height: 400};
	var margin = {top: 30, bottom: 30, left: 80, right: 20}
	var barPadding = 1; // 棒と棒の間の間隔
	var maxNumData = 155;
	var color = {normal: "DarkSeaGreen" , highlight: 'DarkSlateGray'}
	function barColor(no) {
		return no % 12 == 0 ? color.highlight : color.normal;
	}

	// scale
	var xScale = d3.scale.linear()
			.domain([0, maxNumData])
			.range([margin.left, pane.width - margin.right]);
	var yScale = d3.scale.linear()
			.domain( [0, 500] )
			.range([pane.height - margin.bottom, margin.top]);
	
    // svg
	var svg = d3.select("body")
			.append("svg")
			.attr( {
				height: pane.height,
				width: pane.width
			});

	// tooltip
	var tooltip = d3.select("body")
			.append("div")
			.style("position", "absolute")
			.style("z-index","10")
			.style("visibility" , "hidden")
			.text(" ");

	// bar
	svg.selectAll("bar")
		.data(dataset)
		.enter()
		.append("rect")
		.on("mouseover", function(d) {
			tooltip.style("visibility","visible")
				.style("top", yScale(d.watt+80) + "px")
				.style("left", xScale(d.no-10) + "px")
				.html( "<dl><dd>" + d.time + "</dd><dd>" + d.watt + " [kW]</dd></dl>");
			d3.select(this)
				.attr({ 
					fill: "red"
				})
		})
		.on("mouseout", function(d) {
			tooltip.style("visibility","hidden");
			d3.select(this)
				.attr({ 
					fill: function(d){ return barColor(d.no); }	
				})
		})
		.attr( {
			x : function(d){ return xScale(d.no); },
			y : yScale(0),
			width : function(d) { return xScale(d.no+1) - xScale(d.no) - barPadding },
			height : 0,
			fill : function(d){ return barColor(d.no); }
		})
		.transition()
		.duration(300)
		.delay( function(d,i){ return i * 3; })
		.attr( {
			y : function(d){ return yScale(d.watt)},
			height : function(d){ return yScale(0) - yScale(d.watt);  }
		});


	svg.selectAll("bar_text")
		.data(dataset)
		.enter()
		.append("text")
		.text(function(d){ return d.no % 12 == 0 ? d.time.match(/\d\d:\d\d/)[0] : ""; })
		.attr( {
			x : function(d){ return xScale(d.no); } ,
			y : yScale(-20),
			fill : color.highlight
		} );

	// line_level
	var line_level = [0, 100, 200, 300, 400, 500];

	svg.selectAll("line_level")
		.data(line_level)
		.enter()
		.append("line")
		.attr( {
			x1: xScale(-10),
			y1: function(d) { return yScale(d) },
			x2: xScale(maxNumData),
			y2: function(d) { return yScale(d) },
			'stroke-width': 1,
			'stroke': "black"
		});

	svg.selectAll("line_level_text")
		.data(line_level)
		.enter()
		.append("text")
		.text( function(d) { return d + " [kW]";} )
		.attr( {
			x: xScale(-10),
			y: function(d) { return yScale(d+5) },
			fill: "black"
		} );

}
