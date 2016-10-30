var services = [{
    prefix: 'vk.com',
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
    prefix: 'www.youtube.com',
    isPlaying: 'document.getElementsByClassName(\'html5-video-player\').length > 0 && document.getElementsByClassName(\'html5-video-player\')[0].className.indexOf(\'playing-mode\')>=0',
    toggle: 'document.getElementsByClassName(\'ytp-play-button\')[0].click();'
}, {
    prefix: 'play.spotify.com',
    isPlaying: 'document.getElementById(\'play-pause\') && document.getElementById(\'play-pause\').className.indexOf(\'playing\')>=0',
    toggle: 'document.getElementById(\'play-pause\').click();',
    next: 'document.getElementById(\'next\').click();',
    prev: 'document.getElementById(\'previous\').click();',
    frameUrl: "play.spotify.com/apps/player"
}];

function executeOnFrame(tabId, code, frameId, callBack) {
    chrome.tabs.executeScript(tabId, {code: code, frameId: frameId || 0}, function(args) {
        if (callBack) {
            callBack(args[0]);
        }
    });
}

function getFrameId(tabId, frameUrl, callBack) {
    if (!frameUrl) {
        return callBack(0);
    }

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
    getFrameId(tabId, frameUrl, function(frameId) {
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

function play(tabId, service) {
    if (service.hasOwnProperty("toggle")) {
        executeScript(tabId, service.toggle, service.frameUrl);
    } else {
        executeScript(tabId, service.play, service.frameUrl);
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