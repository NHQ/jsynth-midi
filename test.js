var player = require('./index');
var baudio = require('../baudio');
var b = baudio({rate:8000, size: 256});
var fs = require('fs');
file = fs.readFileSync('./hardmony.mid', 'binary');
midi = player(44100, file);
notes = {};
tau = Math.PI * 2;

b.push(function(time){
	var e = midi(time);
	if(e.length){
		e.forEach(function(event){
			if(event.subtype == 'noteOn'){
				var f = 440 * Math.pow(2, (event.noteNumber - 49) / 12);
			console.log(event.channel, f)
				notes[f] = {play: true, start: new Date().getTime()}
			}
			if(event.subtype == 'noteOff'){
				var f = 440 * Math.pow(2, (event.noteNumber - 49) / 12);
				notes[f] = {play: false}
			}
		})
	};
	
	var sample = 0;
	for(n in notes){
		if(notes[n].play) sample += Math.sin(tau * time * Number(n))
		else if((new Date().getTime() - notes[n].start) < 1 / 8) sample += Math.sin(tau * time * Number(n))
	}
	
	return sample
})
b.play();