var services = [{
    prefix: 'new.vk.com',
    isPlaying: 'document.getElementsByClassName(\'top_audio_player_playing\').length > 0',
    toggle: 'document.getElementsByClassName(\'top_audio_player_play\')[0].click();',
    manipulateFirst: true
}, {
    prefix: 'www.mixcloud.com',
    isPlaying: 'document.getElementsByClassName(\'pause-state\').length > 0',
    toggle: 'document.getElementsByClassName(\'player-control\')[0].click();'
}, {
    prefix: 'www.silver.ru',
    isPlaying: '(!document.getElementsByTagName("audio")[0].paused)',
    play: 'document.getElementsByTagName("audio")[0].play()',
    pause: 'document.getElementsByTagName("audio")[0].pause()'
}, {
    prefix: 'www.periscope.tv',
    isPlaying: 'document.getElementsByClassName(\'is-playing\').length > 0',
    toggle: 'document.getElementsByClassName(\'PlaybackControls\')[0].click();'
}, {
    prefix: 'soundcloud.com',
    isPlaying: 'document.getElementsByClassName(\'playControl\').length > 0 && document.getElementsByClassName(\'playControl\')[0].class.indexOf(playing)>=0',
    toggle: 'document.getElementsByClassName(\'playControl\')[0].click();'
}];

function pause(tabId, service) {
    if (service.hasOwnProperty("toggle")) {
        chrome.tabs.executeScript(tabId, {code: service.toggle});
    } else {
        chrome.tabs.executeScript(tabId, {code: service.pause});
    }
}

function play(tabId, service) {
    if (service.hasOwnProperty("toggle")) {
        chrome.tabs.executeScript(tabId, {code: service.toggle});
    } else {
        chrome.tabs.executeScript(tabId, {code: service.play});
    }
}

function toggleIcon() {
    chrome.browserAction.getTitle({}, function(title) {
        if (title == "play") {
            chrome.browserAction.setIcon({path: "pause.png"});
            chrome.browserAction.setTitle({title: "pause"});
        } else {
            chrome.browserAction.setIcon({path: "play.png"});
            chrome.browserAction.setTitle({title: "play"});
        }
    });
}

function getIsPlaying(tabId, service, callBack) {
    chrome.tabs.executeScript(tabId, {code: service.isPlaying}, function(args) {
        callBack(args[0]);
    });
}

function togglePause() {
    toggleIcon();

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
                        var _firstSame = !_service.visited;
                        _service.visited = true;

                        getIsPlaying(tabId, _service, function(isPlaying) {
                            if (_service.manipulateFirst && !_firstSame) {
                                return;
                            }

                            if (isPlaying) {
                                pause(tabId, _service);
                            }

                            if (_first && !isPlaying) {
                                play(tabId, _service);
                            }
                        });
                    })();
                    first = false;
                }
            }
        }
    });
}

togglePause();
setTimeout(window.close, 100);