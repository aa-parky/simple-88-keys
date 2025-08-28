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
      <div class="tonika-zoomed-keyboard">
        <div class="tonika-zoomed-keys-container">
          <div class="tonika-zoomed-keys white-keys" id="zoomed-white-keys"></div>
          <div class="tonika-zoomed-keys black-keys" id="zoomed-black-keys"></div>
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

        const chordMidiNotes = chord.midiNotes;
        const minNote = Math.min(...chordMidiNotes);
        const maxNote = Math.max(...chordMidiNotes);

        const centerNote = Math.floor((minNote + maxNote) / 2);
        const rangeStart = Math.max(21, centerNote - 12);
        const rangeEnd = Math.min(108, centerNote + 12);

        this.renderKeyboardRange(rangeStart, rangeEnd, chordMidiNotes);
    }

    renderKeyboardRange(startMidi, endMidi, highlightNotes = []) {
        const whiteContainer = this.container.querySelector('#zoomed-white-keys');
        const blackContainer = this.container.querySelector('#zoomed-black-keys');
        whiteContainer.innerHTML = '';
        blackContainer.innerHTML = '';

        // First render all white keys
        let whiteKeyCount = 0;
        for (let midi = startMidi; midi <= endMidi; midi++) {
            const isBlack = this.isBlackKey(midi);
            if (!isBlack) {
                const el = this.createKeyElement(midi, highlightNotes.includes(midi), isBlack);
                whiteContainer.appendChild(el);
                whiteKeyCount++;
            }
        }

        // Calculate total width for positioning
        const totalWidth = whiteKeyCount * 40; // 40px per white key
        blackContainer.style.width = totalWidth + 'px';

        // Then render black keys with correct positioning
        for (let midi = startMidi; midi <= endMidi; midi++) {
            const isBlack = this.isBlackKey(midi);
            if (isBlack) {
                const el = this.createKeyElement(midi, highlightNotes.includes(midi), isBlack);

                // Calculate position based on white key before it
                const prevWhiteKey = this.findPreviousWhiteKey(midi, startMidi);
                const position = this.getBlackKeyPosition(midi, prevWhiteKey, startMidi);
                el.style.left = position + 'px';

                blackContainer.appendChild(el);
            }
        }
    }

    findPreviousWhiteKey(midiNote, startMidi) {
        let prev = midiNote - 1;
        while (prev >= startMidi && this.isBlackKey(prev)) {
            prev--;
        }
        return prev;
    }

    getBlackKeyPosition(midiNote, prevWhiteKey, startMidi) {
        // Find how many white keys from the start to the previous white key
        let whiteKeysBefore = 0;
        for (let i = startMidi; i <= prevWhiteKey; i++) {
            if (!this.isBlackKey(i)) {
                whiteKeysBefore++;
            }
        }

        // Calculate position (each white key is 40px wide)
        const noteInOctave = midiNote % 12;
        let offset = 26; // Default right side of white key

        // Fine-tune position based on which black key it is
        switch (noteInOctave) {
            case 1: offset = 26; break; // C#
            case 3: offset = 26; break; // D#
            case 6: offset = 26; break; // F#
            case 8: offset = 26; break; // G#
            case 10: offset = 26; break; // A#
        }

        return (whiteKeysBefore * 40) - offset;
    }

    createKeyElement(midiNote, isHighlighted, isBlackKey) {
        const noteName = this.midiToNoteName(midiNote);
        const octave = Math.floor(midiNote / 12) - 1;

        const keyEl = document.createElement('div');
        keyEl.className = `tonika-key ${isBlackKey ? 'black' : 'white'}`;

        if (isHighlighted) {
            keyEl.classList.add('highlighted');
        }

        if (!isBlackKey || isHighlighted) {
            const labelEl = document.createElement('span');
            labelEl.className = 'tonika-key-label';
            labelEl.textContent = this.formatNoteLabel(noteName, octave);
            keyEl.appendChild(labelEl);
        }

        keyEl.dataset.midi = midiNote;
        keyEl.dataset.note = noteName;

        return keyEl;
    }

    formatNoteLabel(noteName, octave) {
        let displayOctave = octave;
        switch (this.middleCMapping) {
            case 'C3': displayOctave = octave; break;
            case 'C4': displayOctave = octave; break;
            case 'C5': displayOctave = octave; break;
        }
        return `${noteName}${displayOctave}`;
    }

    midiToNoteName(midiNote) {
        const noteNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
        return noteNames[midiNote % 12];
    }

    isBlackKey(midiNote) {
        return [1, 3, 6, 8, 10].includes(midiNote % 12);
    }

    clearKeyboard() {
        const whiteContainer = this.container.querySelector('#zoomed-white-keys');
        const blackContainer = this.container.querySelector('#zoomed-black-keys');
        whiteContainer.innerHTML = '';
        blackContainer.innerHTML = `<div class="tonika-no-chord-message">
          <p>Choose a chord from the dropdowns above to see it visualized here.</p>
        </div>`;
        this.currentChord = null;
    }
}