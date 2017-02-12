jQuery(document).ready(function($) {
	
	var $playctrl=$('.play-ctrl');
	var $presong=$('.pre-song');
	var $nextsong=$('.next-song');
	var $sequence=$('.sequence');
	var $songinfoname=$('.song-info-name');
	var $songinfosinger=$('.song-info-singer');
	var $handle=$('.handle');
	var $turtntablecover=$('.turtntable-cover');
	var $volumeicon=$('.volume-icon');
	var $volumebarhandle=$('.volume-bar-handle');
	var $volumebarline=$('.volume-bar-line');
	var $turtntabledisk=$('.turtntable-disk');
	var $progressbarhandle=$('.progress-bar-handle');
	var $progressbarline=$('.progress-bar-line');
	var $progresscurrenttime=$('.progress-currenttime');
	var $progressbartotaltime=$('.progress-bar-totaltime');
	var $lyricicon=$('.lyric-icon')
	var $lyric=$('.lyric');
	var $musicpalyerturtntablecontainer=$('.music-palyer-turtntable-container');
	var $audiocontainer=$('.audio-container');
	var $lyriccontainer=$('.lyric-container');
	var $playlistbody=$('.play-list-body');
	var $playlisticon=$('.play-list-icon');
	var $playlist=$('.play-list');
	var $playlistcloseicon =$('.play-list-close-icon');
	var $playlistclosetitle=$('.play-list-close-title');
	var $rankinglistbody=$('.ranking-list-body');
	var $channelicon=$('.channel-icon');
	var $rankinglist=$('.ranking-list');
	var $rankinglistcloseicon=$('.ranking-list-close-icon');
	var $rankinglistclosetitle=$('.ranking-list-close-title');
	var $searchicon=$('.search-icon');
	var $search=$('.search');
	var $searchinput=$('.search-input');
	var $searchresult=$('.search-result');
	var $audio=$('.audio');
	var audio=$('.audio')[0];
	var sequence_num=0; //播放顺序按钮点击的次数
	var song_info={};//歌曲信息
	var song_arr=[];//播放歌曲数组
	var current_song_index=0;//当前歌曲下标
	var get_song_arr=false;//是否获取歌曲列表
	var get_song=false;//是否已经获取歌曲
	var play_mode='order-play';//播放顺序的模式
	var audio_volume=0;//音量大小
	var volume_on=true;//音量是否开
	var audio_play=true;//音频是否播放
	var setInterval_clock;//计时标志
	var lyric_show= true;//各词是否显示
	var lyricTimeArr = [];//各词时间数组
	var currentTiemSec = 0;//当前时间
	var ranking_song_arr=[];//排行榜歌曲数组
	var branking_type=[1,2,11,12,16,21,22,23,24,25];//排行榜类型
	var search_show=false;//搜索条是否显示
	var search_song_arr=[];//搜索得到歌曲的数组
	var $dragvolume = $volumebarhandle.draggabilly({
        axis: 'x',
        containment: true
    });
    var $dragprogress = $progressbarhandle.draggabilly({
        axis: 'x',
        containment: true
    });



    // 获取屏幕大小并根据实际情况自适应
	var height = window.screen.availHeight;
	var width = window.screen.availWidth;
	console.log(height);
	console.log(width);
	if(width>550)
	{
		// console.log(width);
		var width="360px";
		var height="640px";
		$('.ranking-list-close').css({
			position: 'absolute',
			width: '100%',
		});
		$('.wrapper').css({height:height,width:width,margin:'100px'});
	}
	else {
		$('.wrapper').css({height:height,width:width});
	}





    function music(){
		this.getReady();
		this.events();

    }
    music.prototype={
	    // 音乐初始化,第一次打开取热歌排行榜前10的歌曲，以后打开直接从内存中获取。
	    // 播放歌曲数组永久保存在浏览器中
		getReady:function() {
			if(localStorage.songArr == undefined) { //如果songArr没定义,初始化
				this.getBillboard(2,10);
				localStorage.songArr = JSON.stringify(song_arr);
			}
			else {
				song_arr = JSON.parse(localStorage.songArr);
				get_song_arr = true;
			}
			console.log(song_arr);
		},
		// song_id：歌曲ID，返回歌曲信息对象
	    loadMusic:function(song_id,image_url) { 
	    	var loadmusic_command='http://music.baidu.com/data/music/fmlink?rate=320&songIds='+song_id+'&callback=?';
	    	$.getJSON(loadmusic_command,
				function (data) {
					console.log(data);
					song_info.singer = data.data.songList[0].artistName;
					song_info.song_name = data.data.songList[0].songName;
					$songinfoname.text(song_info.singer);
					$songinfosinger.text(song_info.song_name);
					console.log(song_info.singer);
					console.log(song_info.song_name);
					audio.src=data.data.songList[0].songLink;
					// audio.load();
					console.log('loadMusic');
					//返回的信息！！！！！
					audio.play();
					get_song = true;
				}); 
	    	// 搜索得到歌曲中的对象中没有图片，这里采用默认图片
			if (!image_url) {
				image_url="images/timg4.jpg";
			}
			$turtntabledisk.css('background-image','url(\'' + image_url + '\')');
			
			
			console.log(image_url);
			this.getLyric(song_id);	
	    },
	    // 获取歌词
	    getLyric:function (song_id) {
			var self = this;	    	
	    	var  getLyric_command='http://tingapi.ting.baidu.com/v1/restserver/ting?songid='+song_id+'&callback=?&format=json&method=baidu.ting.song.lry';
	    	$.getJSON(getLyric_command,
				function (data) {
					console.log(data);
					// 歌词清除
					$('.lyric-container>p').remove();
	            	lyricTimeArr = [];
					self.lyricFormat(data.lrcContent);
				});
	    },
	    // type:排行榜类型  size：获取数量,返回排行榜
		getBillboard:function(type,size){
			var getbillboard_command='http://tingapi.ting.baidu.com/v1/restserver/ting?type='+type+'&size='+size+
			'&callback=?&_t=1468380543284&format=json&method=baidu.ting.billboard.billList';
			$.getJSON(getbillboard_command,
			function (data) {
				console.log(data);
				song_arr=data.song_list;
				get_song_arr = true;
				console.log(song_arr);
				// song_arr = data.song_list;
			});	 
		},
		// 前一首
		perSong:function() {
			get_song=false;
			if (play_mode=='order-play') {
				current_song_index--;
				if(current_song_index < 0){
					current_song_index=song_arr.length-1;
				}
			}
			else{
				current_song_index=this.getIndex();
			}
			
			this.loadMusic(song_arr[current_song_index].song_id,song_arr[current_song_index].pic_small); 
		},
		// 下一首
		nextSong:function() {
			if (play_mode=='order-play'){
				get_song=false;
				current_song_index++;
				if(current_song_index >= song_arr.length){
					current_song_index=0;
				}
			}
			else {
				current_song_index=this.getIndex();
			}
			
			
			this.loadMusic(song_arr[current_song_index].song_id,song_arr[current_song_index].pic_small);
		},
			// 根据播放模式获取播放歌曲
		getIndex:function(argument) {
			if (play_mode=='random-play') {
				current_song_index=Math.floor(Math.random()*song_arr.length);
				return current_song_index;
			}
			else if (play_mode=='single-cycle') {
				return current_song_index;
			}
		},
		// 将秒数转化为0:00格式
	    timeFormat:function (num) {
		    var fullSec = parseInt(num);
		    var min = parseInt(fullSec / 60) + '';
		    var sec = (fullSec % 60);
		    if (sec < 10) {
		        sec = '0' + sec;
		    } else {
		        sec = sec + '';
		    }
		    var timeStr = min + ':' + sec;
		    return timeStr;
		},
			// 将歌词处理成单句
		lyricFormat:function(str) {
			var html = '';
	   		var lyricArr = str.split('\n');
	    	for (var i = 0; i < lyricArr.length; i++) {
	        var lyric = lyricArr[i].slice(10, 48);
	        if (!lyric) {
	            lyric = '-';
	        };
	        html += '<p class=' + '\"lyric' + i + '\">' + lyric + '</p>';
	        this.lyricTimeFormat(lyricArr[i]);
	    	}
	   	 	$lyriccontainer.append(html);
			// $('.lyric-container').text();
		},
		// 将歌词时间保存的到数组中
		lyricTimeFormat:function  (str) {
			var min = parseFloat(str.slice(1, 3));
		    var sec = Math.round(min * 60 + parseFloat(str.slice(4, 9)));
		    lyricTimeArr.push(sec);
		},
			// 移动歌词
		lyricBoxMove:function  (num) {
			for (var i = 1; i <lyricTimeArr.length; i++) {
		        if (num === lyricTimeArr[i]) {
		            var top = 200 - i * 40 + 'px';
		            var lightClass = '.lyric' + i;
		            $(lightClass).siblings().removeClass('light-lyric');
		            $(lightClass).addClass('light-lyric');
		            $lyriccontainer.animate({
		                top: top
		            }, 300);
		        }
	    	}
		},
		// 显示当前播放的歌曲列表
		getPlayList:function (song_arr) {
			var list_html='';
			for (var i = 0; i < song_arr.length; i++) {
				list_html +='<li>'+'<span  class='+'\"joinli'+i+'\">'+song_arr[i].title+'-'+song_arr[i].artist_name+'</span>'+
				'<i class='+'\"icon-guanbi remove'+i+'\">'+'</i>'+'</li>';
			}
			// 清除li在添加li
			$('.play-list-body>li').remove();
			$playlistbody.append(list_html);
			// 显示当前播放的歌曲
			var  str='.joinli'+ current_song_index;
			$(str).addClass('clicked');
			// 显示歌曲数量
			var close_title='播放列表（'+song_arr.length+'）';
			$playlistclosetitle.text(close_title);
			// 将歌曲数组保存到浏览器中
			localStorage.songArr = JSON.stringify(song_arr);

		},
		// 搜索歌曲
		searchSongs:function (key_word) {
			var searchSongs_command='http://tingapi.ting.baidu.com/v1/restserver/ting?query='+key_word+'&callback=?&format=json&method=baidu.ting.search.catalogSug';
			$.getJSON(searchSongs_command,
				function (data) {
					console.log(data);
					var search_html='';
					if (data.error_code === 22000) {
						search_song_arr=data.song;
						for(var i = 0, length1 = search_song_arr.length; i < length1; i++){
							
							search_html +='<p class='+'\"search'+i+'\">'+search_song_arr[i].songname+'-'+search_song_arr[i].artistname+'</p>';
						}
						
					}
					else {
						search_html ='<p>人家找遍全宇宙，找不到啦！=.=</p>';
					}
					$('.search-result>p').remove();
					$searchresult.append(search_html);
				});
		},
		events:function(){
			var self = this;
				// 暂停 播放
			$playctrl.click(function(event) {
				if(get_song_arr)
				{
					self.loadMusic(song_arr[current_song_index].song_id,song_arr[current_song_index].pic_small);
					get_song_arr=false;
				}
				if(get_song)
				{
					if(audio_play==false)
					{
						
						audio.play();

					}
					else if(audio_play==true)
					{

						audio.pause();

					}
				}
			});
				// 音频暂停事件
			$audio.on('pause',function(event) {
				event.preventDefault();
				$handle.removeClass('play');

				$turtntablecover.css('animation-play-state', 'paused');
				$playctrl.removeClass('icon-zanting').addClass('icon-bofang');

				audio_play=false;
				// 清除时间循环时间标志
				clearInterval(setInterval_clock);
			});
				// 音频播放事件
			$audio.on('play',function(event) {
				event.preventDefault();
				$handle.addClass('play');
				$turtntablecover.addClass('active');
				$turtntablecover.css('animation-play-state', 'running');
				$playctrl.removeClass('icon-bofang').addClass('icon-zanting');
				audio_play=true;
				// 进度条实时更新				
		        setInterval_clock = setInterval(function() {
		        	var totaltime= audio.duration; 
		            var currentTime = audio.currentTime;
		            var currentWidth = parseInt(currentTime / totaltime * 200) + 'px';
		            $progresscurrenttime.text(self.timeFormat(currentTime));
		            $progressbarline.width(currentWidth);
		            console.log(totaltime);
		            $progressbarhandle.css('left', currentWidth) ;
		            if(totaltime)
		            {$progressbartotaltime.text(self.timeFormat(totaltime))};
		        }, 500);		       
			});
			// 前一首
			$presong.click(function(event) {
				audio.pause();
				self.perSong();
			});
			// 下一首
			$nextsong.click(function(event) {
				audio.pause();
				self.nextSong();
			});
			// 音频结束
			$audio.on('ended', function(event) {
				audio.pause();
				self.nextSong();
				/* Act on the event */
			});
			// 播放顺序选取
			$sequence.click(function(event) {
				sequence_num++;
				sequence_num=sequence_num%3;
				switch (sequence_num) {
					case 0:{
						$(this).removeClass('icon-ttpodicon').addClass('icon-shunxubofang');
						play_mode='order-play';
						break;
					}
					case 1:{
						$(this).removeClass('icon-shunxubofang').addClass('icon-suijibofangzhongzuo');
						play_mode='random-play';
						break;
					}
						
					case 2:{
						$(this).removeClass('icon-suijibofangzhongzuo').addClass('icon-ttpodicon');
						play_mode='single-cycle';
						break;
					}
					default:
						break;
				}
			});
			// 点击音量图标事件
			$volumeicon.click(function(event) {
				if (volume_on==true) {
					audio_volume=audio.volume;
					$volumebarhandle.css('left','-100px');
					audio.volume=0;
				}
				else {

					audio.volume=audio_volume;
					var temp=audio_volume*100-100;
					var volumebar_handle_left=temp+'px';
					$volumebarhandle.css('left',volumebar_handle_left);

				}
			});
			// 音量变化事件
			$audio.on('volumechange', function(event) {
				event.preventDefault();
				var volume_bar_line_width=audio.volume*100+'px';
				$volumebarline.css('width',volume_bar_line_width);
				if (audio.volume==0) {
					$volumeicon.removeClass('icon-yinliang2').addClass('icon-yinliangwu');
					volume_on=false;
		        console.log('width');
				}
				else {
					$volumeicon.removeClass('icon-yinliangwu').addClass('icon-yinliang2');
					volume_on=true;
				}
			});
			// 音量拖动事件
			$dragvolume.on('dragMove', function(event) {
				event.preventDefault();
				var draggie = $(this).data('draggabilly');
		        var width =Math.floor(100 + draggie.position.x) ;
		        console.log(width);
		        if (width > 0) {
		            audio.volume = width / 100;
		        } else {
		            audio.volume = 0;
		        }
			});
			// 进度条拖动事件
			$dragprogress.on('dragMove', function(event) {
				event.preventDefault();
				var draggie = $(this).data('draggabilly');
				var temp=Math.round(draggie.position.x);
		        var width = temp + 'px';
		        if(temp>0 && temp<201)
		       { $progressbarline.css('width', width);}
		        console.log(width);
			});
		    // 进度条拖动开始事件
			$dragprogress.on('dragStart', function() {
		        audio.pause();
		    });
		    // 进度条拖动结束事件
		    $dragprogress.on('dragEnd', function() {
		        audio.play();
		        var draggie = $(this).data('draggabilly');
		        audio.currentTime = draggie.position.x / 200 *audio.duration;
		    });
		    // 歌词图标点击事件
		    $lyricicon.click(function(event) {
				if (lyric_show==true) {
					$(this).css('color', '#F60505');
					$musicpalyerturtntablecontainer.fadeOut(600);
					$lyric.fadeIn(200);
					lyric_show=false;
				}
				else {
					$(this).css('color', '#fff');
					$musicpalyerturtntablecontainer.fadeIn(600);
					$lyric.fadeOut(200);
					lyric_show=true;
				}
			});
			// 获取音乐时间
			$audio.on('timeupdate', function() {
		        if (currentTiemSec != Math.round(audio.currentTime)) {
		            currentTiemSec = Math.round(audio.currentTime);
		            self.lyricBoxMove(currentTiemSec);
		        }
		    });
		    // 点击当前歌曲列表的图标
		    $playlisticon.click(function(event) {
				// if (get_song_arr) {
					$playlist.slideDown(400);
					self.getPlayList(song_arr);
			
				// }	
			});
			// 点击当前歌曲列表中的歌曲事件
			$playlistbody.on('click', 'span', function(event) {
				event.preventDefault();
				/* Act on the event */
				// $(this).parent().siblings().removeClass('clicked');
				$('span[class *=clicked]').removeClass('clicked');
				$(this).addClass('clicked');
				var class_str=$(this).attr('class').slice(6);
				var arr_index=parseInt(class_str);
				current_song_index=arr_index;
				self.loadMusic(song_arr[current_song_index].song_id,song_arr[current_song_index].pic_small);
			});
			// 点击关闭歌曲列表图标
			$playlistcloseicon.click(function(event) {
				/* Act on the event */
				$playlist.fadeOut(200);
				// $('.play-list-body>li').remove();
			});
				// 播放列表点击歌曲删除
			$playlistbody.on('click', 'i', function(event) {
				event.preventDefault();
				var close_index=parseInt($(this).attr('class').slice(18));
				console.log(close_index);
				song_arr.splice(close_index,1);
				self.getPlayList(song_arr);
			});
			// 点击显示排行榜
			$channelicon.click(function(event) {
				$rankinglist.fadeIn(400);
			});
			// 点击关闭排行榜
			$rankinglistcloseicon.click(function(event) {
				$rankinglist.slideUp(400);
			});
			// 点击排行榜展开歌曲
			$rankinglistbody.on('click', 'div[class *=ranking-list-body]', function(event) {
				event.preventDefault();
				var branking_html='';
				var div_class=$(this).attr('class');
				var div_index=parseInt(div_class.slice(18));
				console.log(div_index);
				var getbillboard_command='http://tingapi.ting.baidu.com/v1/restserver/ting?type='+branking_type[div_index]+'&size='+100+
				'&callback=?&_t=1468380543284&format=json&method=baidu.ting.billboard.billList';
				$.getJSON(getbillboard_command,
				function (data) {
					ranking_song_arr=data.song_list;
					console.log(data);
					for(var i = 0, length1= data.song_list.length; i < length1; i++){
						branking_html +='<p class='+'\"branking-p-'+i+'\">'+data.song_list[i].title+'-'+data.song_list[i].artist_name+'</p>';
						// console.log(data.song_list[i].title);
						// console.log(data.song_list[i].artist_name);
					}
					$('.ranking-list-body>p').remove();
					var div_select='.'+div_class;
					$(div_select).after(branking_html);
				
				});
			});
			// 点击排行榜收起歌曲
			$rankinglistclosetitle.click(function(event) {
				$('.ranking-list-body>p').remove();
			});
			// 点击排行榜列表中的歌曲
			$rankinglistbody.on('click', 'p', function(event) {
				event.preventDefault();
				var  ranking_index=parseInt($(this).attr('class').slice(11));
				console.log(ranking_index);
				song_arr.push(ranking_song_arr[ranking_index]);
				current_song_index=song_arr.length-1;
				self.loadMusic(song_arr[current_song_index].song_id,song_arr[current_song_index].pic_small);
				$('p[class *=clicked]').removeClass('clicked');
				$(this).addClass('clicked');
				self.getPlayList(song_arr);		
			});
			// 点击搜索图标
			$searchicon.click(function(event) {
				if (!search_show) {
					$search.show().animate({width: "70%"}, 400);
					search_show=true;
					$(this).css('color', '#FC0606');
				}
				else {
					$search.hide(200).val();
					search_show=false;
					$('.search-result>p').remove();
					$(this).css('color', '#fff');
				}
			});
			// 搜索栏中输入事件
			$searchinput.on('keydown', function(event) {
				if (event.which == 13) {
					// statement
					var input_value=$(this).val();
					self.searchSongs(input_value);
				}
			});
			// 点击搜索中的歌曲
			$searchresult.on('click', 'p', function(event) {
				event.preventDefault();
				var search_song_index=parseInt($(this).attr('class').slice(6));
				// 搜索获得歌曲的对象中的song_id用songid表示，所以这里转化为同一形式
				search_song_arr[search_song_index].song_id=search_song_arr[search_song_index].songid;
				search_song_arr[search_song_index].title=search_song_arr[search_song_index].songname;
				search_song_arr[search_song_index].artist_name=search_song_arr[search_song_index].artistname;
				song_arr.push(search_song_arr[search_song_index]);
				current_song_index=song_arr.length-1;
				self.loadMusic(song_arr[current_song_index].song_id,song_arr[current_song_index].pic_small);
				$('p[class *=clicked]').removeClass('clicked');
				$(this).addClass('clicked');
				self.getPlayList(song_arr);
				console.log(search_song_index);
			});
		}		
    }
    var musicStar= new music();



});