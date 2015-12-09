#!/usr/bin/env node

var fs = require('fs');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

if (process.argv.length < 4) {
	console.log("Usage: node checkchanges [pathToFolders] '[Command]'");
	return;
}

var requests = 0;
var requestTime = 0;

var command = process.argv[process.argv.length - 1];
command = command.replace("'", "");

// Applescript refreshes Safari with localhost in URL.
var code = '\
    tell application "Safari"\n\
	set winlist to every window\n\
	repeat with win in winlist\n\
		set tablist to every tab of win\n\
		repeat with t in tablist\n\
			if "localhost" is in (URL of t as string) then\n\
				tell t to do javascript "window.location.reload()"\n\
			end if\n\
		end repeat\n\
	end repeat\n\
    end tell\n\
    ';

for (var i = 2; i < process.argv.length - 1; i++) {
	console.log("Waiting for changes in '" + process.argv[i] + "'");

	fs.watch(process.argv[i], { persistent: true, recursive: true }, function(event, filename) {
		var now = new Date().getTime();

		if (requests == 0) {
			requests = 1;
			requestTime = now;
			executeCommands(command, code);
		} else if (now - requestTime > 2000) {  // New request came at least 2 secs later.
			requests = 2;
		}
	});
}

function executeCommands(command, applescript) {
	console.log("Execute command '" + command + "' (" + getDateTime() + ")");
	exec(command, function(error, stdout, stderr) {
		console.log(">> Done executing command");
		spawn("osascript", ["-e", applescript]);

		if (requests == 2) {
			executeCommands(command, applescript);
			requests = 1;
		} else {
			requests = 0;
		}
	});
	
}

function getDateTime() {
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
}

