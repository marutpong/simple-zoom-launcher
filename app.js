const util = require('util');
const exec = util.promisify(require('child_process').exec);
var opn = require('opn');
var SerialPort = require('serialport');
var Readline = SerialPort.parsers.Readline;
var parser = new Readline();

const config = {
	comport: 'COM3',
	baudRate: 9600
}

function joinMeetingLocally (meetingId, userName) {
  var command = 'zoommtg://zoom.us/join?action=join'
  command += '&confno=' + encodeURI(meetingId)
  command += '&uname=' + encodeURI(userName)
  command += '&zc=0'
  command += ''
  opn(command)
}

var port = new SerialPort(config.comport, {
	baudRate: config.baudRate
});

function serialWrite(data) {
	port.write(data, function(err) {
	    if (err) {
	      return console.log('Error on write: ', err.message);
	    }
    });
}

port.on('open', function() {
	console.log('Opened port:' + config.comport)
	port.pipe(parser);
});

// open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message);
})

parser.on('data', function(data) {

	console.log(data);

	try {
		var dataObj = JSON.parse(data);
	} catch (err) {
	    console.log(err)
	}

	if (dataObj && dataObj.type=='join' && dataObj.meetingId) {
		joinMeetingLocally(dataObj.meetingId, (dataObj.user || ''))
	}

});

