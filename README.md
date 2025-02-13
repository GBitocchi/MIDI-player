# MIDI-player

This system was built with open source code like tinysynth and MidiPlayerJS. Full list is in the package.json file.

# Music score format

The music score comes in a JSON format:

A list of tracks.
Each track has an instrumentName and a list of notes.
Notes need to be played at a specific time for a given duration (both in milliseconds).
Notes have a name, which indicates their frequencies.
Notes also have a velocity, which indicates how loudly they must be played.
You do not need to interpret the name and velocity in any way: they just need to be passed on to the synthesizer.

Here is a sample score that plays 2 notes using a single instrument:

``` json
[
  {
    "instrumentName": "Flute",
    "notes": [
      {
        "time": 0,
        "duration": 300,
        "name": "G5",
        "velocity": 81
      },
      {
        "time": 300,
        "duration": 400,
        "name": "A5",
        "velocity": 50
      }
    ]
  }
]
```

*You can review sample files in the public/tunes folder.*

# Synthesizer

The synthesizer can open several channels which play concurrently. Each channel plays notes:

A note keeps playing until it is stopped.
A channel can only play one note at a time: the previous note must be stopped before you can play a new one.
channel.playNote() and channel.stopNote() return immediately.
channel.playNote() returns a boolean: false indicates that the Stop button was pressed.
You must use the provided delayAsync() to wait until a later point in time. To play the score from the previous page, you could do:

``` typescript
import {delayAsync} from './util';

async function player(synthesizer) {
  const channel = synthesizer.getChannel('Flute');

  const keepPlaying = channel.playNote('G5', 81);
  await delayAsync(300);
  channel.stopNote();

  if (keepPlaying) {
    channel.playNote('A5', 50);
    await delayAsync(400);
    channel.stopNote();
  }
}
```

#  Loops

You can use async/await to call delayAsync() inside a loop.

delayAsync is not reentrant: you cannot call delayAsync again until the previous delay has elapsed.

``` typescript
import {delayAsync} from './util';

const ringtone = [
  'B5', 'G5', 'Fb5', 'Eb4', 'A4', 'D4',
  'C4', 'Cb5', 'Ab5', 'Db5', 'F4', 'Gb5'
];

const noteDuration = 200;

async function player(synthesizer) {
  const channel = synthesizer.getChannel('Marimba');

  for (const noteName of ringtone) {
    const isPlaying = channel.playNote(noteName, 100);
    if (!isPlaying) {
      break;
    }

    await delayAsync(noteDuration);

    channel.stopNote();
  }
}
```

# Instructions:
- Clone the repository
- npm install (so every library get installed)
- npm start (to execute the application)
- Now you can play the tunes specified in json format (such as Mario Bros, Zelda, Tetris, Castlevania, and more!)
