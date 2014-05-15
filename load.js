$(document).ready(function(){
	$.ajax({
		url: "http://hirose.sendai-nct.ac.jp/~sue/wattmon/5min.csv",
		type:"GET",
		chache: false ,

		success:function(res){
			content = $(res.responseText).text();
			console.log("content:",content);
			var dataset = text2csv(content);
			make_graph(dataset);
		}
	});
});

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

	// 確認
	console.log("remove space:",text);
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
	// 確認
	console.log("replaced text:",text);
	// 行ごとの区切りが空白なので空白で配列を区切る
	data = text.split(" ");
	// 確認
	console.log("data:" , data);
	// 各行のデータの区切りはカンマなのでカンマごとに配列をさらに区切る
	for(var i=0;i<data.length;i++){
		data[i] = data[i].split(",");
	}
	// 確認
	console.log("failinged data:",data);
	// 各データを数値に変換
	for(var i=0;i<data.length;i++){
		data[i][3] = parseInt(data[i][3]);
	}
	// 確認
	console.log("numbered data:",data);

	return data;
}

function make_graph(dataset){
	var w = 1000;
	var h = 400;
	var margin = {top: 30, bottom: 50, left: 100, right: 20}
	var barPadding = 1; // 棒と棒の間の間隔
	var axisPadding = 50; // グラフと軸の間隔
	var maxNumData = 155;
	var color = {normal: "DarkSeaGreen" , highlight: 'DarkSlateGray'}
	// scale
	var xScale = d3.scale.linear()
			.domain([0, maxNumData])
			.range([margin.left, w - margin.right]);
	var yScale = d3.scale.linear()
			.domain( [0, 500] )
			.range([h - margin.bottom, margin.top]);

	// axis
	var yAxis = d3.svg.axis()
		      .scale(yScale)
		      .orient("left");
	

    // svg
	var svg = d3.select("body")
			.append("svg")
			.attr("height",h)
			.attr("width",w);

	// bar
	svg.selectAll("bar")
		.data(dataset)
		.enter()
		.append("rect")	
		.attr( {
			x : function(d,i){ return xScale(i); },
			y : function(d){ return yScale(d[3]); },
			width : function(d, i) { return xScale(i+1) - xScale(i) - barPadding },
			height : function(d){ return yScale(0) - yScale(d[3]);  },
			fill : function(d,i){ if(i % 12 == 0){
							return color.highlight;
						} else{
							return color.normal;
						}
					}
			} );

	svg.selectAll("bar_text")
		.data(dataset)
		.enter()
		.append("text")
		.text(function(d, i){ return i % 12 == 0 ? d[1].match(/\d\d:\d\d/)[0] : ""; })
		.attr( {
			x : function(d,i){ return xScale(i); } ,
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
			x2: xScale(w),
			y2: function(d) { return yScale(d) },
			strokeWidth: 2,
			stroke: "black"
		});

	svg.selectAll("line_level_text")
		.data(line_level)
		.enter()
		.append("text")
		.text( function(d) { return d + "[kW]";} )
		.attr( {
			x: xScale(-10),
			y: function(d) { return yScale(d+5) },
			fill: "black"
		} );

}
