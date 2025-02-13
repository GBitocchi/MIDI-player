import { Note } from "../types";

export class ScheduledNote {
    constructor(
      public readonly time: number,
      public readonly type: 'start' | 'stop',
      public readonly trackIndex: number,
      public readonly note: Note
    ) {}
  
    static create(params: {
      time: number;
      type: 'start' | 'stop';
      trackIndex: number;
      note: Note;
    }): ScheduledNote {
      return new ScheduledNote(
        params.time,
        params.type,
        params.trackIndex,
        params.note
      );
    }
  }