$(document).ready(function(){
	$.ajax({
		//url: "http://hirose.sendai-nct.ac.jp/~sue/wattmon/5min.csv",
		url: "http://dataforjapan.org/dataset/54f270dc-817d-465a-baa9-3a221ce3b962/resource/5cdf7c23-c19d-44d0-a389-ae09403de745/download/sapporoculturalpropertylocation.csv",
		type:"GET",
		chache: false ,

		success:function(res){
			content = $(res.responseText).text();
			console.log(content);
		}
	});
});
