/**
 * Chord Selector - Provides dropdown-based chord selection functionality
 */
class ChordSelector {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.chordData = this.initializeChordData();
        this.onChordSelected = null; // Callback function
        this.initializeUI();
    }

    initializeChordData() {
        return {
            rootNotes: [
                { value: 'C', label: 'C' },
                { value: 'C#', label: 'C♯/D♭' },
                { value: 'D', label: 'D' },
                { value: 'D#', label: 'D♯/E♭' },
                { value: 'E', label: 'E' },
                { value: 'F', label: 'F' },
                { value: 'F#', label: 'F♯/G♭' },
                { value: 'G', label: 'G' },
                { value: 'G#', label: 'G♯/A♭' },
                { value: 'A', label: 'A' },
                { value: 'A#', label: 'A♯/B♭' },
                { value: 'B', label: 'B' }
            ],
            chordQualities: [
                { value: 'major', label: 'Major', symbol: '', intervals: [0, 4, 7] },
                { value: 'minor', label: 'Minor', symbol: 'm', intervals: [0, 3, 7] },
                { value: 'major7', label: 'Major 7th', symbol: 'maj7', intervals: [0, 4, 7, 11] },
                { value: 'minor7', label: 'Minor 7th', symbol: 'm7', intervals: [0, 3, 7, 10] },
                { value: 'dominant7', label: 'Dominant 7th', symbol: '7', intervals: [0, 4, 7, 10] },
                { value: 'diminished', label: 'Diminished', symbol: 'dim', intervals: [0, 3, 6] },
                { value: 'diminished7', label: 'Diminished 7th', symbol: 'dim7', intervals: [0, 3, 6, 9] },
                { value: 'halfdiminished', label: 'Half-Diminished', symbol: 'm7♭5', intervals: [0, 3, 6, 10] },
                { value: 'augmented', label: 'Augmented', symbol: 'aug', intervals: [0, 4, 8] },
                { value: 'augmented7', label: 'Augmented 7th', symbol: 'aug7', intervals: [0, 4, 8, 10] },
                { value: 'sus2', label: 'Suspended 2nd', symbol: 'sus2', intervals: [0, 2, 7] },
                { value: 'sus4', label: 'Suspended 4th', symbol: 'sus4', intervals: [0, 5, 7] },
                { value: 'major6', label: 'Major 6th', symbol: '6', intervals: [0, 4, 7, 9] },
                { value: 'minor6', label: 'Minor 6th', symbol: 'm6', intervals: [0, 3, 7, 9] }
            ]
        };
    }

    initializeUI() {
        this.container.innerHTML = `
      <div class="chord-selector">
        <h3>Chord Selection</h3>
        <div class="chord-selector-controls">
          <div class="dropdown-group">
            <label for="root-note-select">Root Note:</label>
            <select id="root-note-select" class="chord-dropdown">
              <option value="">Select root note...</option>
            </select>
          </div>
          <div class="dropdown-group">
            <label for="chord-quality-select">Chord Quality:</label>
            <select id="chord-quality-select" class="chord-dropdown">
              <option value="">Select chord quality...</option>
            </select>
          </div>
        </div>
        <div class="selected-chord-info" style="display: none;">
          <div class="selected-chord-symbol"></div>
          <div class="selected-chord-notes"></div>
          <button class="clear-selected-chord">Clear selected chord</button>
        </div>
      </div>
    `;

        this.populateDropdowns();
        this.attachEventListeners();
    }

    populateDropdowns() {
        const rootSelect = this.container.querySelector('#root-note-select');
        const qualitySelect = this.container.querySelector('#chord-quality-select');

        // Populate root notes
        this.chordData.rootNotes.forEach(note => {
            const option = document.createElement('option');
            option.value = note.value;
            option.textContent = note.label;
            rootSelect.appendChild(option);
        });

        // Populate chord qualities
        this.chordData.chordQualities.forEach(quality => {
            const option = document.createElement('option');
            option.value = quality.value;
            option.textContent = quality.label;
            qualitySelect.appendChild(option);
        });
    }

    attachEventListeners() {
        const rootSelect = this.container.querySelector('#root-note-select');
        const qualitySelect = this.container.querySelector('#chord-quality-select');
        const clearSelectedBtn = this.container.querySelector('.clear-selected-chord');

        rootSelect.addEventListener('change', () => this.updateSelectedChord());
        qualitySelect.addEventListener('change', () => this.updateSelectedChord());

        if (clearSelectedBtn) {
            clearSelectedBtn.addEventListener('click', () => this.clearSelection());
        }
    }

    updateSelectedChord() {
        const rootSelect = this.container.querySelector('#root-note-select');
        const qualitySelect = this.container.querySelector('#chord-quality-select');

        const rootNote = rootSelect.value;
        const chordQuality = qualitySelect.value;

        if (rootNote && chordQuality) {
            const chord = this.buildChord(rootNote, chordQuality);
            this.displaySelectedChord(chord);

            if (this.onChordSelected) {
                this.onChordSelected(chord);
            }
        } else {
            this.clearSelectedChordDisplay();
        }
    }

    buildChord(rootNote, qualityValue) {
        const quality = this.chordData.chordQualities.find(q => q.value === qualityValue);
        const rootMidi = this.noteToMidi(rootNote, 4); // Default to octave 4

        return {
            root: rootNote,
            quality: qualityValue,
            symbol: rootNote + quality.symbol,
            intervals: quality.intervals,
            midiNotes: quality.intervals.map(interval => rootMidi + interval),
            noteNames: quality.intervals.map(interval => this.midiToNoteName(rootMidi + interval))
        };
    }

    noteToMidi(noteName, octave) {
        const noteMap = {
            'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
            'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
        };
        return (octave + 1) * 12 + noteMap[noteName];
    }

    midiToNoteName(midiNote) {
        const noteNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
        return noteNames[midiNote % 12];
    }

    displaySelectedChord(chord) {
        const symbolEl = this.container.querySelector('.selected-chord-symbol');
        const notesEl = this.container.querySelector('.selected-chord-notes');
        const infoSection = this.container.querySelector('.selected-chord-info');

        // Show the info section
        infoSection.style.display = 'flex';

        // Format the chord symbol with proper formatting
        symbolEl.textContent = chord.symbol;

        // Format notes with better display
        const formattedNotes = chord.noteNames.join(', ');
        notesEl.textContent = `Notes: ${formattedNotes}`;

        // Add a class to indicate a chord is selected
        this.container.querySelector('.chord-selector').classList.add('has-chord');
    }

    clearSelectedChordDisplay() {
        const symbolEl = this.container.querySelector('.selected-chord-symbol');
        const notesEl = this.container.querySelector('.selected-chord-notes');
        const infoSection = this.container.querySelector('.selected-chord-info');

        // Hide the info section
        infoSection.style.display = 'none';

        symbolEl.textContent = '';
        notesEl.textContent = '';

        // Remove the class that indicates a chord is selected
        this.container.querySelector('.chord-selector').classList.remove('has-chord');
    }

    clearSelection() {
        const rootSelect = this.container.querySelector('#root-note-select');
        const qualitySelect = this.container.querySelector('#chord-quality-select');

        rootSelect.value = '';
        qualitySelect.value = '';

        this.clearSelectedChordDisplay();

        if (this.onChordSelected) {
            this.onChordSelected(null);
        }
    }

    // Method to set callback for chord selection
    setChordSelectedCallback(callback) {
        this.onChordSelected = callback;
    }
}

