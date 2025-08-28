/**
 * Zoomed Keyboard - Displays a focused view of selected chord on keyboard
 */
class ZoomedKeyboard {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.currentChord = null;
        this.middleCMapping = 'C4'; // Default, will be updated from main app
        this.initializeKeyboard();
    }

    initializeKeyboard() {
        this.container.innerHTML = `
      <div class="zoomed-keyboard">
        <div class="zoomed-keyboard-header">
          <h4>Chord Visualization</h4>
          <div class="keyboard-info">
            <span class="chord-name"></span>
          </div>
        </div>
        <div class="zoomed-keys-container">
          <div class="zoomed-keys" id="zoomed-keys"></div>
        </div>
      </div>
    `;
    }

    updateMiddleCMapping(mapping) {
        this.middleCMapping = mapping;
        if (this.currentChord) {
            this.displayChord(this.currentChord);
        }
    }

    displayChord(chord) {
        this.currentChord = chord;

        if (!chord) {
            this.clearKeyboard();
            return;
        }

        // Update chord name display
        const chordNameEl = this.container.querySelector('.chord-name');
        chordNameEl.textContent = chord.symbol;

        // Calculate the range of keys to display (2 octaves centered around the chord)
        const chordMidiNotes = chord.midiNotes;
        const minNote = Math.min(...chordMidiNotes);
        const maxNote = Math.max(...chordMidiNotes);

        // Expand range to show context (at least 2 octaves)
        const centerNote = Math.floor((minNote + maxNote) / 2);
        const rangeStart = Math.max(21, centerNote - 12); // Don't go below A0 (MIDI 21)
        const rangeEnd = Math.min(108, centerNote + 12); // Don't go above C8 (MIDI 108)

        this.renderKeyboardRange(rangeStart, rangeEnd, chordMidiNotes);
    }

    renderKeyboardRange(startMidi, endMidi, highlightNotes = []) {
        const keysContainer = this.container.querySelector('#zoomed-keys');
        keysContainer.innerHTML = '';

        for (let midi = startMidi; midi <= endMidi; midi++) {
            const keyElement = this.createKeyElement(midi, highlightNotes.includes(midi));
            keysContainer.appendChild(keyElement);
        }
    }

    createKeyElement(midiNote, isHighlighted) {
        const noteName = this.midiToNoteName(midiNote);
        const octave = Math.floor(midiNote / 12) - 1;
        const isBlackKey = this.isBlackKey(midiNote);

        const keyEl = document.createElement('div');
        keyEl.className = `zoomed-key ${isBlackKey ? 'black-key' : 'white-key'}`;

        if (isHighlighted) {
            keyEl.classList.add('highlighted');
        }

        // Add note label for white keys or highlighted black keys
        if (!isBlackKey || isHighlighted) {
            const labelEl = document.createElement('span');
            labelEl.className = 'key-label';
            labelEl.textContent = this.formatNoteLabel(noteName, octave);
            keyEl.appendChild(labelEl);
        }

        keyEl.dataset.midi = midiNote;
        keyEl.dataset.note = noteName;

        return keyEl;
    }

    formatNoteLabel(noteName, octave) {
        // Adjust octave display based on Middle C mapping
        let displayOctave = octave;

        switch (this.middleCMapping) {
            case 'C3':
                displayOctave = octave;
                break;
            case 'C4':
                displayOctave = octave;
                break;
            case 'C5':
                displayOctave = octave;
                break;
        }

        return `${noteName}${displayOctave}`;
    }

    midiToNoteName(midiNote) {
        const noteNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
        return noteNames[midiNote % 12];
    }

    isBlackKey(midiNote) {
        const noteInOctave = midiNote % 12;
        return [1, 3, 6, 8, 10].includes(noteInOctave); // C#, D#, F#, G#, A#
    }

    clearKeyboard() {
        const chordNameEl = this.container.querySelector('.chord-name');
        const keysContainer = this.container.querySelector('#zoomed-keys');

        chordNameEl.textContent = 'Select a chord to visualize';
        keysContainer.innerHTML = `
      <div class="no-chord-message">
        <p>Choose a chord from the dropdowns above to see it visualized here.</p>
      </div>
    `;

        this.currentChord = null;
    }
}

