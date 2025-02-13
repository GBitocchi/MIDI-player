import { delayAsync, buildTimer } from '../util';
import { PlayerInterface } from './playerInterface';
import { NotesManager } from './NotesManager';
import { PlayerLogger, PlayerError } from './utils/playerLogger';
import { Synthesizer } from '../synthesizer/Synthesizer';
import { Track } from '../types';
import { Channel } from '../synthesizer/Channel';
import { ScheduledNote } from './ScheduledNote';

/**
 * @param synthesizer {Synthesizer}
 * @param tracks {Track[]}
 * @returns {PlayerInterface}
 */
export function player(synthesizer: Synthesizer, tracks: Track[]): PlayerInterface {
  let channels : Map<number, Channel>; // Map index to channel
  let notesManager : NotesManager;
  let timer: (() => number);
  let currentTime: number = 0;
  let previousTime: number = 0; // We need this variable because of the skipToTimestamp function.
  let noteIndex: number = 0;
  let isPlaying: boolean = false;
  let songNotes: ScheduledNote[] = [];
  let notesToPlay: ScheduledNote[] = [];

  /**
   * Sets up audio channels for each track
   * @throws PlayerError if channel setup fails
   */
  const setupChannels = () => {
    channels = new Map();
    tracks.forEach((track: any, index: number) => {
      try {
        const channel = synthesizer.getChannel(track.instrumentName);
        channels.set(index, channel);
      } catch (error) {
        PlayerLogger.error(`Failed to setup channel for track ${index}`, error as Error);
        throw new PlayerError(`Failed to initialize channel ${index}`);
      }
    });
  };

  /**
   * Cleans up player state
   */
  const cleanup = () => {
    previousTime = noteIndex = currentTime = 0;
    songNotes = notesToPlay = [];
    isPlaying = false;
    stopAllNotes();
    channels.clear();
  };

  /**
   * Stops all currently playing notes
   */
  const stopAllNotes = () => {
    channels.forEach(channel => {
      channel.stopNote();
    });
  };

  /**
   * Gets the total duration of all tracks
   * @returns {number} Total duration in milliseconds
   */
  const getTotalTrackDuration = () => {
    // The last note is a stop note, so we subtract 2 to get the total duration.
    return songNotes[songNotes.length - 2].time;
  };

  const play = async () => {
    try {
      isPlaying = true;
      // While there are notes to play, we continue to play them.
      while (noteIndex < notesToPlay.length) {
        const nextNote = notesToPlay[noteIndex];
        if (currentTime >= nextNote.time) {
          // Get the channel for the next note.
          const nextChannel = channels.get(nextNote.trackIndex);
          if (nextNote.type === 'start') {
            // Play the note on the specified channel.
            const keepPlaying = nextChannel!.playNote(nextNote.note.name, nextNote.note.velocity);
            // Check whether the stop button was pressed.
            if (!keepPlaying) {
              cleanup();
              return;
            }
          } else {
            // Stop the note on the specified channel.
            nextChannel!.stopNote();
          }
          noteIndex++;
        } else {
          // Wait for the next note to occur.
          await delayAsync(nextNote.time - currentTime);
        }
        const elapsedTime = timer();
        // We subtract the previous time from the elapsed time to get the time since the last note.
        currentTime += elapsedTime - previousTime;
        previousTime = elapsedTime;
      }
    } catch (error) {
      PlayerLogger.error('Error during playback', error as Error);
      throw error;
    } finally {
      cleanup();
    }
  };

  const getTime = () => {
    return currentTime;
  };

  const skipToTimestamp = (timestamp: number) => {
    // Check if the player is playing.
    if(!isPlaying){
      PlayerLogger.error('Player is not playing');
      return;
    }
    // Negative timestamp validation
    if (timestamp < 0) {
      PlayerLogger.error('Negative timestamp value for skipToTimestamp');
      return;
    }
    // Timestamp greater than total track duration validation
    if(timestamp > getTotalTrackDuration()){
      PlayerLogger.error('Timestamp value is greater than the total track duration for skipToTimestamp');
      return;
    }
    // Stop all notes before skipping to the new timestamp.
    stopAllNotes();
    // Reset the note index and timer.
    previousTime = noteIndex = 0;
    // Filter the notes to play to only include notes after the new timestamp.
    notesToPlay = notesManager.getNotesAfterTime(timestamp);
    // Reset the timer.
    timer = buildTimer();
    // Set the current time to the new timestamp.
    currentTime = timestamp;
  };

  try {
    notesManager = new NotesManager(tracks);
    // Get the notes after time 0
    songNotes = notesManager.getNotesAfterTime(0);

    notesToPlay = songNotes;

    setupChannels();

    timer = buildTimer();
  } catch (error) {
    PlayerLogger.error('Failed to initialize NotesManager', error as Error);
    throw error;
  }

  return {
    play,
    getTime,
    skipToTimestamp
  };
}