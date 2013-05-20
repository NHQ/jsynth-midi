var sampleRate = 48000
var bpm = 120;
var numer = 4;
var bps = bpm / 60; 
var spb = sampleRate / bps; 
var secpb = 60 / bpm;
var d = spb * 4 / 4;
var player = require('./index');
var baudio = require('../baudio');
var Time = require('since-when');
var b = baudio({rate:sampleRate, size: 256 * 2 * 2, duration: (sampleRate * 16 * 60) + 's'});
var fs = require('fs');
var file = fs.readFileSync('./rach.mid', 'binary');
var midi = player(sampleRate, file);
var notes = {};
var tau = Math.PI * 2;
var TIME = 0;
var time = new Time();
var jynth = require('jynth');
var synth = new jynth();
var jdelay = require('jdelay');
var amod = require('amod');
var delay = jdelay(sampleRate / 16, 1, .5, 48000);
var delay2 = jdelay(d, 0, .332, 48000);
//var m = require('midi');
//var output = new m.output();
//output.openPort(0);

b.push(function(time){
	var e = midi(time *1.05);
	if(e && e.length){
		e.forEach(function(event){
			if(event.subtype == 'noteOn'){
				//output.sendMessage([144, event.noteNumber, event.velocity])
				var f = 440 * Math.pow(2, (event.noteNumber - 49) / 12);
				if(notes[event.noteNumber] && notes[event.noteNumber].play) notes[event.noteNumber].play = false;
				notes[event.noteNumber] = {play: true, start: new Date().getTime(), f: f, v: event.velocity}
			}
			else if(event.subtype == 'noteOff'){
			//output.sendMessage([128, event.noteNumber, event.velocity])
				delete notes[event.noteNumber]
			}
			else if(event.subtype == 'setTempo'){
				bpm = 60000000 / event.microsecondsPerBeat;
				bps = bpm / 60; 
				spb = sampleRate / bps; 
				d = spb;
				secpb = 60 / bpm;
			}
			else if(event.subtype == 'timeSignature'){
				numer = event.numerator;
			}
		})
	};
	delete e
	var sample = x = 0;
	for(n in notes){
		var hammer = false
		, v = notes[n].v / 100;
		x++;
		if(notes[n].f < 1100) hammer = true;
		sample += 
		synth(time, 0, notes[n].f)
		.sine(hammer ? .72 * v : .52 * v, notes[n].f)
		.sine(hammer ? .72 * v / 3: .52 * v / 3, notes[n].f)
		.triangle(hammer ? .72 * v / 9 : .52 * v / 9, notes[n].f)
		.envelope(
			[1/64, v],
			[((hammer?2/3: 2/4)) * v , v/3],
			[((hammer?2/12: 2/8)) * v , v / 5],
			[1/(hammer?2:1) , 0]
			)
		.amod(.1, .05, bpm/4)
		.sample
	}
	if(x) sample = (sample / Math.sqrt(x))
//	return sample
	return delay(sample, Math.floor(sampleRate * bpm / 100))
	return delay(sample, amod(sampleRate / 16, amod(66, 35, time, 2), time, 3))
  return delay2(delay(sample, amod(sampleRate / 16, amod(50, 35, time, 2), time, 3)), spb)
});

b.play();
//b.record('rachMaster.take2.wav');
//time.every(1e9/1100, loop, false)
//b.play();
