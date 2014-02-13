var parse = require('midi-file-parser');
var Time = require('since-when');

module.exports = function(file){
var ttime = Time();
	try{
		var midi = parse(file);
	}
	catch(err){throw new Error('Error parsing Midi File')}
	
	var header = midi.header, tracks = midi.tracks;
	
	if(header.formatType > 1){
		throw new Error('Midi format ' + header.formatType + ' is not supported.')
	};
	
	var sampleRate = 44100 // deprecated
	
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
		tracks[x] = track.map(function(event){
			event.absolute = absolute += event.deltaTime;
			return event
		})
	};
	
	var trackMaster = [], tt;
	for(tt in tracks){
		trackMaster[tt] = {
			index : 0,
			nextEvent : tracks[tt].length ? tracks[tt][0].absolute : Infinity,
		}
	};
	
	var ticks, events = [], tick = 0;
	
	var bucket = spt;
	
	return function(time, trackNum){ // pass optional trackNum to return events for only that track
		bucket--
		if(false || bucket>0) return null;
		
		else{
		  bucket = spt;
//			console.log(time, ttime.sinceBegin())
			tick = Math.floor(time * tps);
				
			events.splice(0);
		
			for(var i = 0; i < trackMaster.length; i++){
				while(trackMaster[i].nextEvent<=tick){
					events.push(tracks[i][trackMaster[i].index]);
					trackMaster[i].index++;
					trackMaster[i].nextEvent = tracks[i][trackMaster[i].index] ?
																		 tracks[i][trackMaster[i].index].absolute :
																		 Infinity
				}
			};
			
			events = events.map(function(evt){
				if(evt.type == 'channel') return evt;
				else {
					if(evt.subtype == 'setTempo'){
						bpm = 60000000 / evt.microsecondsPerBeat;
						initClock(bpm);
            console.log(bpm, tps, tick)
            return evt
					}
					else if(evt.subtype == 'timeSignature'){
						return evt
					}
					else return false
				}
			}).filter(Boolean)
			
/*	
			for(x in tracks){ 
				var t = tracks[x], shift = 0;
				for(e in t){
					var event = t[e]
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
//						console.log(ticks, event.absolute)
						break;
					}
				};
				for(; shift; shift--){
					t.shift()
				}
			}
*/

			return events		
	
		}
	}
}
