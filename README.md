web.music.control
=================

web.music.control

This is a solution for control web-based music players with global hotkeys.

hotKey.bin/hokey.exe is a binary that starts a service 
It listens for global hotkeys like ctrl + alt + home, ctrl + alt + pgUp, ctrl + alt + pgDwn.
Also it keeps tcp connection with browser until global event occurs. 
So as son as hotKey was pressed, it sends command to browser and closes connection.

"extension" adds a button to pause/play music and also it listens for service hokey.exe.
