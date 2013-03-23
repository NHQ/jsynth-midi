var player = require('./index');
var baudio = require('baudio');
var Time = require('since-when');
var b = baudio({rate:44100});
var fs = require('fs');
var file = fs.readFileSync('./minute_waltz.mid', 'binary');
var midi = player(44100, file);
var notes = {};
var tau = Math.PI * 2;
var TIME = 0;
var time = new Time();
var jynth = require('jynth');
var synth = new jynth();

function loop(tick, ns){
	var t = TIME += (ns/1e9);
	var e = midi(t);
	if(e.length){
		e.forEach(function(event){
			if(event.subtype == 'noteOn'){
				var f = 440 * Math.pow(2, (event.noteNumber - 49) / 12);
				notes[event.noteNumber] = {play: true, start: new Date().getTime(), f: f}
			}
			else if(event.subtype == 'noteOff'){
				notes[event.noteNumber].play = false
			}
		})
	};
	tick();
};

b.push(function(time){
	var e = midi(time);
	if(e && e.length){
		e.forEach(function(event){
			if(event.subtype == 'noteOn'){
				var f = 440 * Math.pow(2, (event.noteNumber - 49) / 12);
				if(notes[event.noteNumber] && notes[event.noteNumber].play) notes[event.noteNumber].play = false;
				notes[event.noteNumber] = {play: true, start: new Date().getTime(), f: f, v: event.velocity}
			}
			else if(event.subtype == 'noteOff'){
				notes[event.noteNumber].play = false
			}
		})
	};
	
	var sample = x = 0
	for(n in notes){
		if(notes[n].play) {
			x++; 
			sample += synth(time, 0, notes[n].f).sine(.5, notes[n].f).envelope([1/64,notes[n].v/100],[1/32,notes[n].v / 100 / 2],[1/16,notes[n].v / 100 / 2],[1/64,0]).sample
		}
//		else if((new Date().getTime() - notes[n].start) / 1000  < .2) {x++;sample += Math.sin(tau * time * notes[n].f) * (1 - (time % 1/.2))}
	}
	
	return sample / Math.sqrt(x) / 2
});

b.play();
//b.resume();
//time.every(1e9/1100, loop, false)
//b.play();
