var services = [{
    prefix: 'new.vk.com',
    isPlaying: 'document.getElementsByClassName(\'top_audio_player_playing\').length > 0',
    toggle: 'document.getElementsByClassName(\'top_audio_player_play\')[0].click();',
    next: 'document.getElementsByClassName(\'top_audio_player_next\')[0].click();',
    prev: 'document.getElementsByClassName(\'top_audio_player_prev\')[0].click();',
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
    isPlaying: 'document.getElementsByClassName(\'playControl\').length > 0 && document.getElementsByClassName(\'playControl\')[0].className.indexOf(\'playing\')>=0',
    toggle: 'document.getElementsByClassName(\'playControl\')[0].click();'
}, {
    prefix: 'play.spotify.com',
    isPlaying: 'document.getElementById(\'play-pause\') && document.getElementById(\'play-pause\').className.indexOf(\'playing\')>=0',
    toggle: 'document.getElementById(\'play-pause\').click();',
    next: 'document.getElementById(\'next\').click();',
    prev: 'document.getElementById(\'previous\').click();',
    frameUrl: "play.spotify.com/apps/player"
}];

function executeOnFrame(tabId, code, frameId, callBack){
    chrome.tabs.executeScript(tabId, {code: code, frameId: frameId || 0}, function(args) {
        if (callBack) {
            callBack(args[0]);
        }
    });
}

function getFrameId(tabId, frameUrl, callBack){
    if(!frameUrl)
        return callBack(0);

    chrome.webNavigation.getAllFrames({tabId: tabId}, function(frames) {
        for (var i in frames) {
            var frame = frames[i];
            if (startsWith(frame.url, frameUrl)) {
                callBack(frame.frameId);
            }
        }
    });
}

function executeScript(tabId, code, frameUrl, callBack) {
    getFrameId(tabId, frameUrl, function(frameId){
        executeOnFrame(tabId, code, frameId, callBack);
    });
}

function pause(tabId, service) {
    if (service.hasOwnProperty("toggle")) {
        executeScript(tabId, service.toggle, service.frameUrl);
    } else {
        executeScript(tabId, service.pause, service.frameUrl);
    }
}

function next(tabId, service) {
    if (service.hasOwnProperty("next")) {
        executeScript(tabId, service.next, service.frameUrl);
    } else {
        console.log("service " + service.prefix + " does not support next");
    }
}

function prev(tabId, service) {
    if (service.hasOwnProperty("prev")) {
        executeScript(tabId, service.prev, service.frameUrl);
    } else {
        console.log("service " + service.prefix + " does not support prev");
    }
}

function play(tabId, service) {
    if (service.hasOwnProperty("toggle")) {
        executeScript(tabId, service.toggle, service.frameUrl);
    } else {
        executeScript(tabId, service.play, service.frameUrl);
    }
}

function getIsPlaying(tabId, service, callBack) {
    executeScript(tabId, service.isPlaying, service.frameUrl, callBack);
}

function startsWith(origin, subStr) {
    var flag = origin.indexOf(subStr);
    return flag >= 0 && flag <= 10;
}

function foreachTab(callback) {
    chrome.tabs.query({}, function(tabs) {
        //console.log(tabs);
        for (var i in services) {
            services[i].visited = false;
        }

        var first = true;
        for (var i in tabs) {
            var tab = tabs[i];

            for (var i in services) {
                var service = services[i];

                if (startsWith(tab.url, service.prefix)) {
                    (function() {
                        var tabId = tab.id;
                        var _service = services[i];
                        var _first = first;
                        var _firstSame = !_service.visited;
                        _service.visited = true;

                        getIsPlaying(tabId, _service, function(isPlaying) {
                            callback(tabId, _service, _first, _firstSame, isPlaying);
                        });
                    })();
                    first = false;
                }
            }
        }
    });
}

function togglePause() {
    foreachTab(function(tabId, _service, _first, _firstSame, isPlaying) {
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
}

function nextTrack() {
    foreachTab(function(tabId, _service, _first, _firstSame, isPlaying) {
        if (!isPlaying) {
            return;
        }
        next(tabId, _service);
    });
}

function prevTrack() {
    foreachTab(function(tabId, _service, _first, _firstSame, isPlaying) {
        if (!isPlaying) {
            return;
        }
        prev(tabId, _service);
    });
}

function listenForHotKeys() {
    $.ajax({
        url: "http://localhost:18711/hotkeys/",
    }).done(function(data) {
        console.log(data)
        if (data == 'pause') {
            togglePause();
        }
        if (data == 'next') {
            nextTrack();
        }
        if (data == 'prev') {
            prevTrack();
        }
        listenForHotKeys();
    }).error(function(data) {
        console.log("hotKey service error " + data.status);
        setTimeout(listenForHotKeys, 10000);
    });
}

listenForHotKeys();
