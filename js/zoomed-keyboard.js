/**
 * Zoomed Keyboard - Displays a focused view of selected chord on keyboard
 */
class ZoomedKeyboard {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.currentChord = null;
    this.middleCMapping = "C4"; // Default, will be updated from main app
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
    const whiteContainer = this.container.querySelector("#zoomed-white-keys");
    const blackContainer = this.container.querySelector("#zoomed-black-keys");
    whiteContainer.innerHTML = "";
    blackContainer.innerHTML = "";

    // Constants for key dimensions
    const WHITE_KEY_WIDTH = 38;

    // First pass: Render white keys and track their positions
    const whiteKeyElements = [];

    for (let midi = startMidi; midi <= endMidi; midi++) {
      if (!this.isBlackKey(midi)) {
        const el = this.createKeyElement(
          midi,
          highlightNotes.includes(midi),
          false,
        );
        whiteContainer.appendChild(el);

        whiteKeyElements.push({
          midi: midi,
          element: el,
          index: whiteKeyElements.length,
        });
      }
    }

    // Set the width of the container
    const totalWidth = whiteKeyElements.length * WHITE_KEY_WIDTH;
    blackContainer.style.width = `${totalWidth}px`;

    // Second pass: Render black keys with exact positioning
    for (let i = 0; i < whiteKeyElements.length - 1; i++) {
      const currentWhiteKey = whiteKeyElements[i];
      const nextWhiteKey = whiteKeyElements[i + 1];

      // Check if there should be a black key between these white keys
      if (nextWhiteKey.midi - currentWhiteKey.midi === 2) {
        // There's a black key between these white keys
        const blackKeyMidi = currentWhiteKey.midi + 1;

        if (blackKeyMidi >= startMidi && blackKeyMidi <= endMidi) {
          const el = this.createKeyElement(
            blackKeyMidi,
            highlightNotes.includes(blackKeyMidi),
            true,
          );

          // Position exactly between the two white keys
          const position = i * WHITE_KEY_WIDTH + WHITE_KEY_WIDTH * 0.68;
          el.style.left = `${position}px`;

          blackContainer.appendChild(el);
        }
      }
    }
  }

  createKeyElement(midiNote, isHighlighted, isBlackKey) {
    const noteName = this.midiToNoteName(midiNote);
    const octave = Math.floor(midiNote / 12) - 1;

    const keyEl = document.createElement("div");
    keyEl.className = `tonika-key ${isBlackKey ? "black" : "white"}`;

    if (isHighlighted) {
      keyEl.classList.add("highlighted");
    }

    // Always add labels for both white and black keys
    const labelEl = document.createElement("span");
    labelEl.className = "tonika-key-label";
    labelEl.textContent = this.formatNoteLabel(noteName, octave);
    keyEl.appendChild(labelEl);

    keyEl.dataset.midi = midiNote;
    keyEl.dataset.note = noteName;

    return keyEl;
  }

  formatNoteLabel(noteName, octave) {
    let displayOctave = octave;
    switch (this.middleCMapping) {
      case "C3":
        displayOctave = octave;
        break;
      case "C4":
        displayOctave = octave;
        break;
      case "C5":
        displayOctave = octave;
        break;
    }
    return `${noteName}${displayOctave}`;
  }

  midiToNoteName(midiNote) {
    const noteNames = [
      "C",
      "C♯",
      "D",
      "D♯",
      "E",
      "F",
      "F♯",
      "G",
      "G♯",
      "A",
      "A♯",
      "B",
    ];
    return noteNames[midiNote % 12];
  }

  isBlackKey(midiNote) {
    return [1, 3, 6, 8, 10].includes(midiNote % 12);
  }

  clearKeyboard() {
    const whiteContainer = this.container.querySelector("#zoomed-white-keys");
    const blackContainer = this.container.querySelector("#zoomed-black-keys");
    whiteContainer.innerHTML = "";
    blackContainer.innerHTML = `<div class="tonika-no-chord-message">
          <p>Choose a chord from the dropdowns above to see it visualized here.</p>
        </div>`;
    this.currentChord = null;
  }
}
