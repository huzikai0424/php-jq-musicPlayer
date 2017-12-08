//格式化时间
function formatSeconds(value) { 
	var result="";
	var second = parseInt(value);// 秒 
	var minute = 0;
	minute = parseInt(second/60); 
	second = parseInt(second%60); 
	if(minute<=9)
		minute="0"+minute;
	if(second<=9)
		second="0"+second;
	if(second>0)
		result=minute+":"+second;
	else
		result=minute+":"+"00";
	return result;
}//格式化歌词
function parseLyric(lrc) {
    if(lrc === '') return '';
    var lyrics = lrc.split("\n");
    var lrcObj = new Array();
    for(var i=0;i<lyrics.length;i++){
        var lyric = decodeURIComponent(lyrics[i]);
        var timeReg = /\[\d*:\d*((\.|\:)\d*)*\]/g;
        var timeRegExpArr = lyric.match(timeReg);
        if(!timeRegExpArr)continue;
        var clause = lyric.replace(timeReg,'');
        for(var k = 0,h = timeRegExpArr.length;k < h;k++) {
            var t = timeRegExpArr[k];
            var min = Number(String(t.match(/\[\d*/i)).slice(1)),
                sec = Number(String(t.match(/\:\d*/i)).slice(1));
            var time = min * 60 + sec;
            lrcObj.push([time,clause]);
        }
    }
    return lrcObj;
}
//获取歌词并且显示歌词
function getlyric(url) {
	ul=$("ul#my_lyrics");
	ul.html("<li class='is_playing'>加载歌词中...</li>");
	lyric=new Array();
		$.ajax({
		async:true,
		timeout:3000,
		url:url,
		dataType:'text',
		success:function(result){
			lyric=parseLyric(result);
			ul.html('');
			$.each(lyric,function(k){
				ul.append("<li data-no='"+k+"' data-time='"+lyric[k][0]+"' class='lrc-item'>"+lyric[k][1]+"</li>");
			});
		},
		error:function(){
			ul.html("暂无歌词...");
		}
	});
	return;
}
$(function(){
var playlist=[
	{
        "id": 459004290,
        "name": "春意红包",
        "artist": "三无MarBlue\/祖娅纳惜\/泠鸢yousa\/小缘\/洛萱\/不才",
        "pic_url": "https:\/\/p3.music.126.net\/TVOFJLTlo7o1hOPewr5NwA==\/109951162857898547.jpg?param=300z300&quality=100",
        "lyric_url": "function\/lrc.php?id=459004290",
        "time": 284
    },
    {
        "id": 477913,
        "name": "ヨスガノソラ メインテーマ -遠い空へ-",
        "artist": "三輪学",
        "pic_url": "https:\/\/p3.music.126.net\/OpgpNNPKznDDMxoBqVJy-Q==\/2464005557906815.jpg?param=300z300&quality=100",
        "lyric_url": "function\/lrc.php?id=477913",
        "time": 211
    },
    {
        "id": 139774,
        "name": "The truth that you leave",
        "artist": "Pianoboy",
        "pic_url": "https:\/\/p3.music.126.net\/9idkdzbel_-lYBP7Dv_dVQ==\/102254581395289.jpg?param=300z300&quality=100",
        "lyric_url": "function\/lrc.php?id=139774",
        "time": 223
    }
];
	var music=$("audio#music").get(0);
	var current_song;	//当前歌的id
	var pre_song;		//上一首歌的id
	var random_song;	//随机歌曲id
	var lyric_roll=false;//歌词是否滚动
	var volume=1;		 //默认音量
	var lrc_no=-1;		//歌词顺序
	var current_time=0;	//当前时间
	var playstyle=1; 	//0 顺序播放 1随机播放 2单曲循环
	var player_voich=false;
	var first_play=true;
	var theme_var={autoplay:false,themeurl:'function/'}; 
	function get_music_url(id){
		if(id){
			$.ajax({
				type:"get",
				dataType:"json",
				url:theme_var.themeurl+'get_music.php?id='+id,
				success:function(data){
					$("audio#music").attr('src',data.url);//改变url
					if((theme_var.autoplay)==false&&(first_play)){
						first_play=false;
					}
					else play();
				}
			});
		}
	}
	var play=function(){
		$("#song_play").addClass("is_playing");
		$("#song_img img").addClass("rog");
		music.play();
		
	};
	var pause=function(){
		$("#song_play").removeClass("is_playing");
		$("#song_img img").removeClass("rog");
		music.pause();
		
	}
	if(playstyle==0){
			$("#song_playstyle").attr({title:"顺序播放",class:"sequential"});
		}
		else if(playstyle==1){
			$("#song_playstyle").attr({title:"随机播放",class:"random"});
		}
		else if(playstyle==2){
			$("#song_playstyle").attr({title:"单曲循环",class:"repeat_once"});
		}
//切换歌曲
function select_song(id,bool){
	get_music_url(playlist[id-1].id);				//异步请求路径
	pre_song=current_song;
	$("#player_list_main").find(".player_songs").removeClass('blackbg');
	$(".player_songs[data-no='"+id+"']").addClass("blackbg");
	if(id!=current_song){
		current_song=id;
	}
	getlyric(playlist[id-1].lyric_url);				 //显示歌词
	endTime=playlist[id-1].time;					//结束时间
	$("p#song_title").text(playlist[id-1].name);  	 //歌曲名
	$("p#song_singer").text(playlist[id-1].artist);	 //歌手
	$("p#song_time #currentTime").text("00:00");	//开始时间
	$("p#song_time #endTime").text(formatSeconds(endTime)); //结束时间
	$("#song_img img").remove();
	$("#song_img").append('<img src="'+playlist[id-1].pic_url+'">');//歌曲图片
	$(".progress_op").css("left","0");
	$(".play_current_bar").css("width",+"0");   //进度条
	if(bool==false)
		return;
	//music.load();
	//play();
}
//生成随机数
function creat_random(current_song){
	var random_num=Math.floor(Math.random()*playlist.length+1);
	if(random_num!=current_song)
	{
		return random_num;
	}
	else
		return creat_random(current_song);
}

//歌词滚动
function lrc_rog(){
	if(lyric_roll&&lyric.length){
		var ul=$("ul#my_lyrics");
	var l=-1;
	var long=lyric.length-1;
	if(currentTime<lyric[0][0])
		l=0;
	else if(currentTime>lyric[long][0])
		l=long;
	else {
		for(var k=0;k<long+1;k++){
			if(currentTime==lyric[k][0]){
				l=k;
				break;
			}
			else if(currentTime<lyric[k][0]){
				l=k-1;
				break;
			}
		}
	}
	if(lrc_no!=l){
				$(".playing").removeClass("playing");
				$(".lrc-item[data-no='"+l+"']").addClass('playing');
				lyric_top=$(".lrc-item[data-no='"+l+"']").offset().top-ul.offset().top+ul.scrollTop()-25;
				ul.animate({scrollTop:lyric_top+'px'},300,'swing');
				lrc_no=l;
			}
	}
}
//更新时间
function updatetime(){
	var percent=(currentTime/endTime).toFixed(4)*100;
	if(percent>100)
		percent=100;
	if(current_time!=currentTime){
		$("p#song_time #currentTime").text(formatSeconds(currentTime));
		current_time=currentTime;
	}
	$(".progress_op").css("left",percent+"%");
	$(".play_current_bar").css("width",percent+"%");
}
//播放时间监听事件
$("audio#music").on("timeupdate",function(){
	currentTime=music.currentTime.toFixed(0);
	updatetime();
	lrc_rog();
});
//结束监听
$("audio#music").on("ended",function(){
	$("#song_play").removeClass("is_playing");
	$("#song_img img").removeClass("rog");
	next_play();
});

	//歌单列表按钮
	$("#player_listbtn").click(function(){
		if($("#player_list").css("display")=='none'){
			$("#player_list").fadeIn(250);
			$(this).css("background-positionX","-"+154+"px");
		}
		else {
			$("#player_list").fadeOut(250);
			$(this).css("background-positionX","-"+222+"px");
		}
	});
	$("#player_listbar_icon").click(function(){
		$("#player_list").fadeOut(250);
		$("#player_listbtn").css("background-positionX","-"+222+"px");
	});
	//歌词按钮
	$("#player_lrcbtn").click(function(){
		if($("#player_lrc").css("display")=='none'){
			lyric_roll=true;
			$("#player_lrc").fadeIn(250);
			$(this).css("background-positionX","-"+475+"px");
		}
		else{
			lyric_roll=false;
			$("#player_lrc").fadeOut(250);
			$(this).css("background-positionX","-"+452+"px");
		}
	});
	//播放器回收
	$("#player_right").click(function(){
		var player=$("#player");
		if(player.hasClass('is_open')){
			player.css("left","-"+541+"px");
			player.removeClass("is_open");
			$("#player_list").fadeOut(250);
			$(this).css("background-positionX","-"+46+"px");
			$("#player_listbtn").css("background-positionX","-"+222+"px");
		}
		else{
			player.css("left","0");
			player.addClass("is_open");
			$(this).css("background-positionX","0");
		}
	});
	//歌词关闭
	$("#player_lrc #close_btn").click(function(){
		lyric_roll=false;
		$("#player_lrc").fadeOut(250);
		$("#player_lrcbtn").css("background-positionX","-"+452+"px");
	});
	//显示歌单
	for(var i=0;i<playlist.length;i++){
		var o=playlist[i];
		$("#player_list_main").append('<div class="player_songs" data-no="'+(i+1)+'"><div class="song_name">'+(i+1)+'.'+o.name+'</div><div class="song_author">'+o.artist+'</div><div class="song_time">'+formatSeconds(o.time)+'</div></div');
	}
	//歌单点击
	$(".player_songs").click(function(){
		song_no=$(this).data('no');
		if(song_no!=current_song){
			select_song(song_no);
			current_song=song_no;
	}
		else return; //相同歌曲点击不重载
	});
	
	//初始化第一首歌
	if(playlist[0]){
		select_song(1,false);
		current_song=1;
		pre_song=Math.floor(Math.random()*playlist.length+1);
	}
	else{
		$("audio#music").attr('src','');
		$("p#song_title").text("暂无歌曲");
		$("p#song_singer").text("暂无信息");
		$("p#song_time").text("");
		$("#song_img img").attr("src","../images/default_avater.jpg");
	}
	//play按钮
	$("#song_play").click(function(){
		if($(this).hasClass('is_playing')){
			pause();
		}
		else{
			$(this).addClass("is_playing");
			play();
		}
	});
	//进度条
	$("div#song_progress").click(function(e){
		var left=$("#song_progress").offset().left;
		music.currentTime=(e.pageX-left)/541*endTime;
		
	});
	//上一首
	$("#song_prev").click(function(){
		if(playstyle==2){
			select_song(current_song);
		}
		else if(playstyle==0){
			var pre_s=current_song-1;
			if(pre_s<1){
				pre_s=playlist.length;
			}
			select_song(pre_s);
		}
		else if(playstyle==1){
			select_song(pre_song);  //待优化
		}
	});
	//下一首
	function next_play(){
		//随机
		if(playstyle==1){
			random_song=creat_random(current_song);
			select_song(random_song);
		}
		//单曲
		else if(playstyle==2){
			select_song(current_song);
		}
		//顺序
		else if(playstyle==0){
			var next_song=current_song+1;
			if(next_song>playlist.length)
				next_song=1;
			select_song(next_song);
		}
	}
	//下一首
	$("#song_next").click(function(){
		next_play();
	});
	//播放方式
	$("#song_playstyle").click(function(){
		playstyle+=1;
		if(playstyle>2)
			playstyle=0;
		if(playstyle==0){
			$(this).attr({title:"顺序播放",class:"sequential"});
			
		}
		else if(playstyle==1){
			$(this).attr({title:"随机播放",class:"random"});
			
		}
		else if(playstyle==2){
			$(this).attr({title:"单曲循环",class:"repeat_once"});
			
		} 
	});
	$("#volume_regulate,#volume_drag").mousedown(function(e){
		player_voich=true;
	}).mouseup(function(){
		player_voich=false;
	});
	$("#volume_regulate,#volume_drag").mousemove(function(e){
		if(player_voich){
			e.preventDefault();
			var player_vol=(e.pageX-$("#volume_regulate").offset().left)/71*100;
			if(player_vol>100)
				player_vol=100;
			else if(player_vol<0)
				player_vol=0;
			$("#volume_bar").css("width",player_vol+"%");
			music.volume=player_vol/100;
			volume=music.volume;
		}
	});
	$("#volume_regulate").click(function(e){
		e.preventDefault();
		player_vol=(e.pageX-$("#volume_regulate").offset().left)/71*100;
		if(player_vol>100)
			player_vol=100;
		else if(player_vol<0)
			player_vol=0;
		$("#volume_bar").css("width",player_vol+"%");
		music.volume=player_vol/100;
		volume=music.volume;
	});
	$("#volume_icon").click(function(){
		if($(this).hasClass("no_volume")){
			$(this).removeClass("no_volume");
			$("#volume_bar").css("width",volume*100+"%");
			{
				music.volume=volume;
				
			}
			
		}
		else{
			$(this).addClass("no_volume");
			$("#volume_bar").css("width",0+"%");
				music.volume=0;
				
		}
		
	});
});
