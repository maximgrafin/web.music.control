function togglePause() {
	chrome.tabs.query({}, function (tabs) {
		var first = true;
		for (var i in tabs) {
			var tab = tabs[i];

			var flag = tab.url.indexOf('music.yandex.ru');
			if (flag >= 0 && flag < 10) {
				var toggleCommand = 'var e = document.getElementsByClassName(\'b-jambox__play\')[0]; if(e) e.click();';
				var pauseCommand = 'var e = document.getElementsByClassName(\'b-jambox__play\')[0]; if(e && e.className && e.className.indexOf(\'b-jambox__playing\')>=0) e.click();';

				var cmd = { code: first ? toggleCommand : pauseCommand };
				first = false;
				chrome.tabs.executeScript(tab.id, cmd);
			}

			var flag = tab.url.indexOf('vk.com');
			if (flag >= 0 && flag < 10) {
				var toggleCommand = 'var e=document.getElementById(\'head_play_btn\');if(e)e.click();';
				var pauseCommand = 'var e=document.getElementById(\'head_play_btn\');if(e && e.className && e.className.indexOf(\'playing\')>=0)e.click();';

				var cmd = { code: first ? toggleCommand : pauseCommand };
				first = false;

				chrome.tabs.executeScript(tab.id, cmd);
			}

			var flag = tab.url.indexOf('8tracks.com');
			if (flag >= 0 && flag < 10) {
				var toggleCommand = 'var e=document.getElementById(\'player_play_button\');if(e)e.click();';
				var pauseCommand = 'var e=document.getElementById(\'player_play_button\');if(e && e.style && e.style.display && e.style.display==\'none\')e.click();';

				var cmd = { code: first ? toggleCommand : pauseCommand };
				first = false;

				chrome.tabs.executeScript(tab.id, cmd);
			}

			var flag = tab.url.indexOf('soundcloud.com');
			if (flag >= 0 && flag < 10) {
				var toggleCommand = 'var es=document.getElementsByClassName(\'playControl\');if(es && es[0]) es[0].click();';
				var pauseCommand = 'var es=document.getElementsByClassName(\'playControl\');if(es && es[0] && es[0].className && es[0].className.indexOf(\'playing\')>=0) es[0].click();';

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
				var command = 'var m = document.getElementById(\'head_music\'); if(m && m.className.indexOf(\'over\')<0) m.click(); var e = document.getElementsByClassName(\'next\'); if(e.length>0) e[0].click()';
				var cmd = { code: command };
				chrome.tabs.executeScript(tab.id, cmd);
				return;
			}

			var flag = tab.url.indexOf('8tracks.com');
			if (flag >= 0 && flag < 10) {
				var command = 'var e = document.getElementById(\'player_skip_button\'); if(e) e.click()';
				var cmd = { code: command };
				chrome.tabs.executeScript(tab.id, cmd);
				return;
			}

			var flag = tab.url.indexOf('soundcloud.com');
			if (flag >= 0 && flag < 10) {
				var command = 'var es=document.getElementsByClassName(\'skipControl__next\');if(es && es[0]) es[0].click();';
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
				var command = 'var m = document.getElementById(\'head_music\'); if(m && m.className.indexOf(\'over\')<0) m.click(); var e = document.getElementsByClassName(\'prev\'); if(e.length>0) e[0].click()';
				var cmd = { code: command };
				chrome.tabs.executeScript(tab.id, cmd);
				return;
			}

			var flag = tab.url.indexOf('8tracks.com');
			if (flag >= 0 && flag < 10)
				return;

			var flag = tab.url.indexOf('soundcloud.com');
			if (flag >= 0 && flag < 10) {
				var command = 'var es=document.getElementsByClassName(\'skipControl__previous\');if(es && es[0]) es[0].click();';
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
