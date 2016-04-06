var services = [{
    prefix: 'new.vk.com',
    isPlaying: 'document.getElementsByClassName(\'top_audio_player_playing\').length > 0',
    toggle: 'document.getElementsByClassName(\'top_audio_player_play\')[0].click();'
}];

function togglePause() {
    chrome.tabs.query({}, function(tabs) {
        console.log(tabs);
        var first = true;
        for (var i in tabs) {
            var tab = tabs[i];

            for (var i in services) {
                var service = services[i];

                var flag = tab.url.indexOf(service.prefix);
                if (flag >= 0 && flag <= 10) {
                    (function() {
                        var tabId = tab.id;
                        var _service = services[i];
                        var _first = first;

                        chrome.tabs.executeScript(tabId, {code: _service.isPlaying}, function(isPlaying) {
                            if (_first || isPlaying) {
                                chrome.tabs.executeScript(tabId, {code: _service.toggle});
                            }
                        });
                    })();
                    first = false;
                }
            }

            var flag = tab.url.indexOf('music.yandex.ru');
            if (flag >= 0 && flag < 10) {
                var toggleCommand = 'var e = document.getElementsByClassName(\'b-jambox__play\')[0]; if(e) e.click();';
                var pauseCommand = 'var e = document.getElementsByClassName(\'b-jambox__play\')[0]; if(e && e.className && e.className.indexOf(\'b-jambox__playing\')>=0) e.click();';

                var cmd = {code: first ? toggleCommand : pauseCommand};
                first = false;
                chrome.tabs.executeScript(tab.id, cmd);
            }

            var flag = tab.url.indexOf('vk.com');
            if (flag >= 0 && flag <= 10) {
                var toggleCommand = 'var e=document.getElementById(\'head_play_btn\');if(e)e.click();';
                var pauseCommand = 'var e=document.getElementById(\'head_play_btn\');if(e && e.className && e.className.indexOf(\'playing\')>=0)e.click();';

                var cmd = {code: first ? toggleCommand : pauseCommand};
                first = false;

                chrome.tabs.executeScript(tab.id, cmd);
            }

            //var flag = tab.url.indexOf('new.vk.com');
            //if (flag >= 0 && flag <= 10) {
            //    var toggleCommand = 'var e=document.getElementsByClassName(\'top_audio_player_play\')[0];if(e) e.click();';
            //    var pauseCommand = 'var h=document.getElementByClass(\'top_audio_player_playing\')[0];if(h) {var e=document.getElementsByClassName(\'top_audio_player_play\')[0];if(e) e.click();}';
            //
            //    var cmd = {code: first ? toggleCommand : pauseCommand};
            //    first = false;
            //
            //    chrome.tabs.executeScript(tab.id, cmd);
            //}

            var flag = tab.url.indexOf('8tracks.com');
            if (flag >= 0 && flag <= 10) {
                var toggleCommand = 'var e=document.getElementById(\'player_play_button\');if(e)e.click();';
                var pauseCommand = 'var e=document.getElementById(\'player_play_button\');if(e && e.style && e.style.display && e.style.display==\'none\')e.click();';

                var cmd = {code: first ? toggleCommand : pauseCommand};
                first = false;

                chrome.tabs.executeScript(tab.id, cmd);
            }

            var flag = tab.url.indexOf('soundcloud.com');
            if (flag >= 0 && flag < 10) {
                var toggleCommand = 'var es=document.getElementsByClassName(\'playControl\');if(es && es[0]) es[0].click();';
                var pauseCommand = 'var es=document.getElementsByClassName(\'playControl\');if(es && es[0] && es[0].className && es[0].className.indexOf(\'playing\')>=0) es[0].click();';

                var cmd = {code: first ? toggleCommand : pauseCommand};
                first = false;

                chrome.tabs.executeScript(tab.id, cmd);
            }

            var flag = tab.url.indexOf('play.google.com/music/listen');
            if (flag >= 0 && flag < 10) {
                var toggleCommand = 'var es=document.getElementsByClassName(\'material-player-middle\');if(es && es[0] && es[0].children && es[0].children[2]) es[0].children[2].click();';
                var pauseCommand = ' var es=document.getElementsByClassName(\'material-player-middle\');if(es && es[0] && es[0].children && es[0].children[2] && es[0].children[2].className && es[0].children[2].className.indexOf(\'playing\')>=0) es[0].children[2].click();';

                var cmd = {code: first ? toggleCommand : pauseCommand};
                first = false;

                chrome.tabs.executeScript(tab.id, cmd);
            }
        }
    });
}

togglePause();
//window.close();