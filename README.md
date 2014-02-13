### jsynth-midi

require it

pass it a midi file 

it returns a function(time)

call that function over and over again, passing the time

it will sometimes return midi events

look for event.subType == noteOn || noteOff

in those objects you will find event.noteNumber and event.velocity properties

### known bug
tempo changes may cause a problem, but so far only very complex midi files has those.

want to fix bug soon tho.




