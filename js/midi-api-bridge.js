/**
 * Bridge that extracts structured MIDI data from midonika's message stream
 * without modifying midonika's original functionality
 */
class MidiApiBridge {
  constructor(midonikaInstance) {
    this.midonika = midonikaInstance;
    this.subscribers = [];
    this.activeNotes = new Map(); // note -> {velocity, timestamp}
    this.setupInterception();
  }

  setupInterception() {
    // Store original message handler
    const originalAppendLog = this.midonika.appendLog;

    // Intercept messages without breaking midonika
    this.midonika.appendLog = (message) => {
      // Let midonika do its logging first
      originalAppendLog.call(this.midonika, message);

      // Extract data for chord analysis
      this.processForChordAnalysis(message);
    };
  }

  processForChordAnalysis(messageString) {
    const midiData = this.parseMessageString(messageString);
    if (midiData) {
      this.updateActiveNotes(midiData);
      this.notifySubscribers({
        ...midiData,
        activeNotes: Array.from(this.activeNotes.keys()),
      });
    }
  }

  parseMessageString(message) {
    // Parse midonika's formatted message back to structured data
    const noteOnMatch = message.match(
      /NOTE ON ch(\d+) ([A-G][#b]?\d+) \((\d+)\) vel=(\d+)/,
    );
    const noteOffMatch = message.match(
      /NOTE OFF ch(\d+) ([A-G][#b]?\d+) \((\d+)\) vel=(\d+)/,
    );

    if (noteOnMatch) {
      return {
        type: "noteOn",
        channel: parseInt(noteOnMatch[1]),
        noteName: noteOnMatch[2],
        midiNote: parseInt(noteOnMatch[3]),
        velocity: parseInt(noteOnMatch[4]),
      };
    }

    if (noteOffMatch) {
      return {
        type: "noteOff",
        channel: parseInt(noteOffMatch[1]),
        noteName: noteOffMatch[2],
        midiNote: parseInt(noteOffMatch[3]),
        velocity: parseInt(noteOffMatch[4]),
      };
    }

    return null;
  }

  updateActiveNotes(midiData) {
    if (midiData.type === "noteOn" && midiData.velocity > 0) {
      this.activeNotes.set(midiData.midiNote, {
        velocity: midiData.velocity,
        timestamp: Date.now(),
      });
    } else if (midiData.type === "noteOff" || midiData.velocity === 0) {
      this.activeNotes.delete(midiData.midiNote);
    }
  }

  subscribe(callback) {
    this.subscribers.push(callback);
  }

  notifySubscribers(data) {
    this.subscribers.forEach((callback) => callback(data));
  }
}
