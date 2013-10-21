var tabs = chrome.tabs;

var vkButtonID='head_play_btn';
var vkButtonPlayClass='playing';

function toggleMusic(justUpdate){
	chrome.tabs.query({}, function(tabs){
		var first=true;
		for(var i in tabs){
			var tab = tabs[i];

			var flag = tab.url.indexOf('music.yandex.ru');
			if(flag>=0 && flag<10)
			{
				var toggleCommand = (justUpdate ? '' : 'document.getElementsByClassName(\'b-jambox__play\')[0].click();') 
					+ 'document.getElementsByClassName(\'b-jambox__play\')[0].className.indexOf(\'b-jambox__playing\')>=0';

				var pauseCommand = (justUpdate ? '' : 'var e = document.getElementsByClassName(\'b-jambox__play\')[0]; if(e.className.indexOf(\'b-jambox__playing\')>=0)e.click();') 
					+ 'document.getElementsByClassName(\'b-jambox__play\')[0].className.indexOf(\'b-jambox__playing\')>=0';

				var cmd = { code: first ? toggleCommand : pauseCommand };                                 
				first=false;
				chrome.tabs.executeScript(tab.id, cmd);
			}

			var flag = tab.url.indexOf('vk.com');
			if(flag>=0 && flag<10)
			{
				var toggleCommand = (justUpdate ? '' : 'var e=document.getElementById(\''+vkButtonID+'\');if(e)e.click();') 
					+ 'var result=false; var e=document.getElementById(\''+vkButtonID+'\');if(e && e.className && e.className.indexOf(\'playing\')>=0) result=true; result';

				var pauseCommand = (justUpdate ? '' : 'var e=document.getElementById(\''+vkButtonID+'\');if(e && e.className && e.className.indexOf(\'playing\')>=0)e.click();') 
					+ 'var result=false; var e=document.getElementById(\''+vkButtonID+'\');if(e && e.className && e.className.indexOf(\'playing\')>=0) result=true; result';

				var cmd = { code: first ? toggleCommand : pauseCommand };                                 
				first=false;

				chrome.tabs.executeScript(tab.id, cmd);
			}
		}
		window.close();
	});
};
toggleMusic();




