<?php
	@$id=$_POST['mid']?$_POST['mid']:"";
	@$type=$_POST['select']?$_POST['select']:"";
  @$format=$_POST['format']? true : false;
 
  const THEME_URL = "function/"; //跟js里的路径保持一致
	require("function/Meting.php");
	use Metowolfs\Meting;
	$API = new Meting('netease');

	function get_playlist($id,$type){
    global $API;
	if($type==1)
        $data=$API->format(true)->playlist((int)$id);
    else if($type==2)
        $data=$API->format(true)->album((int)$id);
    else return false;
    if($data)
        $result=json_decode($data,true);
    else 
        return false;
	$json=array();
    for($i=0;$i<count($result);$i++){
        $new_artist="";
        for($j=0;$j<count($result[$i]['artist']);$j++){
            if($j==0)
                $new_artist=$result[$i]['artist'][$j];
            else
                $new_artist=$new_artist."/".$result[$i]['artist'][$j];
        }
		$new_pic=json_decode($API->pic($result[$i]['pic_id']),true);
		$json[$i]['id']=$result[$i]['id'];
		$json[$i]['name']=$result[$i]['name'];
		$json[$i]['artist']=$new_artist;
		$json[$i]['pic_url']=str_replace("http://","https://",$new_pic['url']);
		$json[$i]['lyric_url']=THEME_URL."lrc.php?id=".$result[$i]['lyric_id'];
		$json[$i]['time']=$result[$i]['time'];
		}
	   return $json;
}
 ?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>歌单获取</title>
</head>
<body style="max-width: 860px;margin:50px auto;">

<form action="getPlaylist.php" method="post">
  <select id="music-type" name="select">
      <option value="">选择类型</option>
      <option value="1">歌单</option>
      <option value="2">专辑</option>
  </select> 
   
  <input type="text" name="mid" id="mid" value="" placeholder="歌单或专辑ID" required="">
  <br>
  <input type="checkbox" name="format" checked="checked" value="1"/>格式化
   <br>
  <input class="button" id="button" name="submit" type="submit" value="获取" onclick="checkType()">
</form>
<textarea name="list" id="list" cols="30" rows="10" style="margin-top:20px;min-width: 880px;min-height: 500px;">
  <?php 
  if($id&&$type){
    if($format)
    echo json_encode(get_playlist($id,$type),JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT);
  else
    print_r(get_playlist($id,$type)); 
  }
  else{
    echo "请先获取歌单";
  }
  
  ?>
</textarea>
<div>
  <button onclick="getClipboardText()">复制到剪切板</button>
</div>
<script>
function getClipboardText(){
 var obj=document.getElementById("list");
 obj.select();
 document.execCommand("Copy");
 alert("已经复制到剪切板");
}
function checkType(){
  var value=document.getElementById('music-type').value;
  if(value==''){
    alert("别忘记选格式");
    return;
  }
}
</script>
</body>
</html>