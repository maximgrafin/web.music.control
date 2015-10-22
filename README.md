web.music.control
=================

web.music.control

This is a solution for control web-based music players with global hotkeys.
<br />
hotKey.bin/hokey.exe is a binary that starts a service 
<br />
It listens for global hotkeys: <b>ctrl + alt + home</b>, <b>ctrl + alt + pgUp</b>, <b>ctrl + alt + pgDwn</b>, <b>media play/pause</b>
<br />
Also it keeps tcp connection with browser until global event occurs. 
<br />
So as soon as hotKey was pressed, it sends command to browser and closes connection.
<br />
<br />
"extension" adds a button to pause/play music and also it listens for service hokey.exe.
<br />
To add extension:
<br />
0. download current extension
<br />
1. open chromium-based browser
<br />
2. Go to settings -> tools -> extensions
<br />
3. check "Developer mode"
<br />
4. click "Load unpacked extension..." button and choose extension folder
<br />
5. start <b>hotKey.bin/install.bat</b>. It adds hokey.exe to startup folder and starts service.
