function togglePause(justUpdate) {
	chrome.tabs.query({}, function (tabs) {
		var first = true;
		for (var i in tabs) {
			var tab = tabs[i];

			var flag = tab.url.indexOf('music.yandex.ru');
			if (flag >= 0 && flag < 10) {
				var toggleCommand = (justUpdate ? '' : 'document.getElementsByClassName(\'b-jambox__play\')[0].click();')
					+ 'document.getElementsByClassName(\'b-jambox__play\')[0].className.indexOf(\'b-jambox__playing\')>=0';

				var pauseCommand = (justUpdate ? '' : 'var e = document.getElementsByClassName(\'b-jambox__play\')[0]; if(e.className.indexOf(\'b-jambox__playing\')>=0)e.click();')
					+ 'document.getElementsByClassName(\'b-jambox__play\')[0].className.indexOf(\'b-jambox__playing\')>=0';

				var cmd = { code: first ? toggleCommand : pauseCommand };
				first = false;
				chrome.tabs.executeScript(tab.id, cmd);
			}

			var flag = tab.url.indexOf('vk.com');
			if (flag >= 0 && flag < 10) {
				var toggleCommand = (justUpdate ? '' : 'var e=document.getElementById(\'head_play_btn\');if(e)e.click();')
					+ 'var result=false; var e=document.getElementById(\'head_play_btn\');if(e && e.className && e.className.indexOf(\'playing\')>=0) result=true; result';

				var pauseCommand = (justUpdate ? '' : 'var e=document.getElementById(\'head_play_btn\');if(e && e.className && e.className.indexOf(\'playing\')>=0)e.click();')
					+ 'var result=false; var e=document.getElementById(\'head_play_btn\');if(e && e.className && e.className.indexOf(\'playing\')>=0) result=true; result';

				var cmd = { code: first ? toggleCommand : pauseCommand };
				first = false;

				chrome.tabs.executeScript(tab.id, cmd);
			}
		}
	});
}

function nextTrack() {
	chrome.tabs.query({}, function (tabs) {
		for (var i in tabs) {
			var tab = tabs[i];
			var yandexFlag = tab.url.indexOf('music.yandex.ru');
			if (yandexFlag >= 0 && yandexFlag < 10) {
				var command = 'var e = document.getElementsByClassName(\'b-jambox__next\'); if(e.length>0) e[0].click()';
				var cmd = { code: command };
				chrome.tabs.executeScript(tab.id, cmd);
				return;
			}

			var flag = tab.url.indexOf('vk.com');
			if (flag >= 0 && flag < 10) {
				var command = 'var m = document.getElementsByClassName(\'head_music_text\'); if(m && m.length>0 ) m[0].click(); var e = document.getElementsByClassName(\'next\'); if(e.length>0) e[0].click()';
				var cmd = { code: command };
				chrome.tabs.executeScript(tab.id, cmd);
				return;
			}
		}
		window.close();
	})
}

function prevTrack() {
	chrome.tabs.query({}, function (tabs) {
		for (var i in tabs) {
			var tab = tabs[i];
			var yandexFlag = tab.url.indexOf('music.yandex.ru');
			if (yandexFlag >= 0 && yandexFlag < 10) {
				var command = 'var e = document.getElementsByClassName(\'b-jambox__prev\'); if(e.length>0) e[0].click()';
				var cmd = { code: command };
				chrome.tabs.executeScript(tab.id, cmd);
				return;
			}

			var flag = tab.url.indexOf('vk.com');
			if (flag >= 0 && flag < 10) {
				var command = 'var m = document.getElementsByClassName(\'head_music_text\'); if(m && m.length>0 ) m[0].click(); var e = document.getElementsByClassName(\'prev\'); if(e.length>0) e[0].click()';
				var cmd = { code: command };
				chrome.tabs.executeScript(tab.id, cmd);
				return;
			}
		}
		window.close();
	})
}

function listenForHotKeys() {
	$.ajax({
		url: "http://localhost:18711/hotkeys/",
	}).done(function (data) {
		console.log(data)
		if (data == 'pause')
			togglePause();
		if (data == 'next')
			nextTrack();
		if (data == 'prev')
			prevTrack();
		listenForHotKeys();
	}).error(function (data) {
		console.log("hotKey service error " + data.status);
		setTimeout(listenForHotKeys, 60000);
	});
}

listenForHotKeys();
