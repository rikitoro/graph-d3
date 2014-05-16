$(document).ready(function(){
	$.ajax({
		url: "http://hirose.sendai-nct.ac.jp/~sue/wattmon/5min.csv",
		type:"GET",
		chache: false ,

		success:function(res){
			content = $(res.responseText).text();
			var datacsv = text2csv(content);
			var dataset = csv2dataset(datacsv);
			console.log(dataset);
			make_graph(dataset);
		}
	});
});

function csv2dataset(csv) {
	return _.map(csv, function(d, i) {
		return {no: i, time: d[1], watt: d[3]}
	});
}

function text2csv(text){
	/*
	データ
	謎空白 y/m/d h:m:s, #n#, value y/m/d.... LFLF
	こういう変に空白を混ぜやがったデータを整形してcsvにする
	*/
	//LF文字を削除
	var lf = String.fromCharCode(10);
	text = text.replace(lf,"");
	// 先頭の謎空白を削除してやる
	var n = text.search(/\d/);
	if( n != -1){
		text = text.slice(n);
	}

	// 日付と時刻の間が空白なので、そこをカンマに置き換える
	// #n#の前にも謎空白があるので削除
	// valueの前にも謎空白があるので削除
	// 行ごとの区切りも空白なので、そこまそのまま
	// num 今幾つめの空白か
	var num = 1;
	for(var i=0;i<text.length;i++){
		if(text.charAt(i) == " "){
			if(num != 4){
				text = text.slice(0,i-1) + "," + text.slice(i+1);
				num += 1;
			} else{
				num = 1;
			}
		}
	}
	// 行ごとの区切りが空白なので空白で配列を区切る
	data = text.split(" ");
	// 各行のデータの区切りはカンマなのでカンマごとに配列をさらに区切る
	for(var i=0;i<data.length;i++){
		data[i] = data[i].split(",");
	}
	// 各データを数値に変換
	for(var i=0;i<data.length;i++){
		data[i][3] = parseInt(data[i][3]);
	}

	return data;
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
	var tooltip =d3.select("body")
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
			tooltip.style("visibility","visible");
			tooltip.text(d.watt + "kW");
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
			y : function(d){ return yScale(d.watt); },
			width : function(d) { return xScale(d.no+1) - xScale(d.no) - barPadding },
			height : function(d){ return yScale(0) - yScale(d.watt);  },
			fill : function(d){ return barColor(d.no); }
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
