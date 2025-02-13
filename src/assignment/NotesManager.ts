import { Note, Track } from '../types';
import { ScheduledNote } from './ScheduledNote';
import { PlayerError, PlayerLogger } from './utils/playerLogger';

export class NotesManager {
  private notes: ScheduledNote[] = [];

  constructor(tracks: Track[]) {
    this.notes = this.initializeNotes(tracks);
  }

  private initializeNotes(tracks: Track[]): ScheduledNote[] {
    const notes: ScheduledNote[] = [];

    tracks.forEach((track, trackIndex) => {
      this.validateTrack(track);
      
      track.notes.forEach(note => {
        this.validateNote(note);
        
        // Create start note
        notes.push(ScheduledNote.create({
          time: note.time,
          type: 'start',
          trackIndex,
          note
        }));

        // Create stop note
        notes.push(ScheduledNote.create({
          time: note.time + note.duration,
          type: 'stop',
          trackIndex,
          note
        }));
      });
    });

    PlayerLogger.debug(`Initialized ${this.notes.length} notes`);

    return notes.sort((a, b) => a.time - b.time);
  }

  public getNotesAfterTime(timestamp: number): ScheduledNote[] {
    return this.notes.filter(note => note.time >= timestamp);
  }

  private validateNote = (note: any) => {
    if (!note.name || note.time === null || note.duration === null || note.velocity === null) {
      throw new PlayerError('Invalid note format');
    }
  };
  
  private validateTrack = (track: any) => {
    if (track.instrumentName === null || !Array.isArray(track.notes)) {
      throw new PlayerError('Invalid track format');
    }
  };
}