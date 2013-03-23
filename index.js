var parse = require('midi-file-parser');

module.exports = function(sampleRate, file){

	try{
		var midi = parse(file);
	}
	catch(err){throw new Error('Error parsing Midi File')}
	
	var header = midi.header, tracks = midi.tracks;
	
	if(header.formatType > 1){
		throw new Error('Midi format ' + header.formatType + ' is not supported.')
	};
	
	sampleRate = sampleRate || 44100
	
	var bpm = msPerBeat = ticksPerBeat = tps = samplesPerTick = TIME = spt = 0

	var tpb = header.ticksPerBeat
	
	function initClock(BPM){
		bpm = BPM || 120
		msPerBeat = (bpm / 60) * 1e6
		tps = (bpm * tpb) / 60
		samplesPerTick = sampleRate / tps
		spt = sampleRate / tps
	}
	
	initClock();
	
	var TRACKS = [];
	
	for(x in tracks){ // get absolute times for events
		var track = tracks[x];
		var absolute = 0
		var t = track.map(function(event){
			event.absolute = absolute += event.deltaTime;
			return event
		});
		TRACKS.push(t)
	};

	var ticks, events = [];
	
	var bucket = Math.ceil(spt);
	
	return function(time, trackNum){ // pass optional trackNum to return events for only that track
		
		if(--bucket) return null;
		
		else{
			
		  bucket = Math.ceil(spt);
		
			ticks = time * tps;
				
			events.splice(0);
		
			for(x in TRACKS){ 
				var t = TRACKS[x], shift = 0;
				for(e in t){
					var event = t[e];
					if (event.absolute < ticks){
						if(!(event.type == 'channel')){						
							shift++
							if(event.subtype == 'setTempo'){
								var bpm = 60000000 / event.microsecondsPerBeat;
	  						initClock(bpm);
							}
							t[e] = null
						}
						else{
							shift++
							events.push(event);	
							t[e] = null
						}
					}
					else {
						break;
					}
				};
				for(; shift; shift--){
					t.shift()
				}
			}

			return events		
	
		}
	}
}
