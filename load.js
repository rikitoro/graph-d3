$(document).ready(function(){
	$.ajax({
		url: "http://hirose.sendai-nct.ac.jp/~sue/wattmon/5min.csv",
		//url: "http://dataforjapan.org/dataset/54f270dc-817d-465a-baa9-3a221ce3b962/resource/5cdf7c23-c19d-44d0-a389-ae09403de745/download/sapporoculturalpropertylocation.csv",
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
	var h = 600;
	var barPadding = 1; // 暴徒棒の間の間隔
	
	var svg = d3.select("body")
			.append("svg")
			.attr("height",h)
			.attr("width",w);

	console.log("svg:",svg);

	svg.selectAll("rect")
		.data(dataset)
		.enter()
		.append("rect")	
		.attr( {
			x : function(d,i){ return i * (w / dataset.length);   },
			y : function(d){ return h - d[3]; -10 },
			width : w / dataset.length - barPadding,
			height : function(d){ return d[3];  },
			fill : '#6fbadd'
			} );
}
