var player = require('./index');
var baudio = require('baudio');
var b = baudio({rate:44100, size: 256});
var fs = require('fs');
file = fs.readFileSync('./bach.mid', 'binary');
midi = player(44100, file);
notes = {};
tau = Math.PI * 2;

b.push(function(time){
	var e = midi(time);
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
	
	var sample = x = 0
	for(n in notes){
		if(notes[n].play) {x++; sample += Math.sin(tau * time * notes[n].f)}
		else if((new Date().getTime() - notes[n].start) / 1000  < 2) {x++;sample += Math.sin(tau * time * notes[n].f)}
	}
	
	return sample / Math.sqrt(x)
})
b.play();
b.resume();
