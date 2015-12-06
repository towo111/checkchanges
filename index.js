#!/usr/bin/env node

var fs = require('fs');
var exec = require('child_process').exec;

if (process.argv.length < 4) {
	console.log("Usage: node checkchanges [pathToFolders] '[Command]'");
	return;
}

var command = process.argv[process.argv.length - 1];
command = command.replace("'", "");

for (var i = 2; i < process.argv.length - 1; i++) {
	console.log("Waiting for changes in '" + process.argv[i] + "'");

	fs.watch(process.argv[i], { persistent: true, recursive: true }, function(event, filename) {
		exec(command, function(error, stdout, stderr) {
			console.log("Command '" + command + "' executed (" + getDateTime() + ")");
		});
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

