/**
 * Handles visual display of chord information with enhanced formatting
 */
class ChordDisplay {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.initializeDisplay();
  }

  initializeDisplay() {
    this.container.innerHTML = `
      <div class="chord-display">
        <div class="chord-symbol"></div>
        <div class="chord-quality"></div>
        <div class="chord-extensions"></div>
        <div class="chord-function"></div>
        <div class="chord-notes"></div>
      </div>
    `;
  }

  updateChord(chordObject) {
    if (!chordObject) {
      this.clearDisplay();
      return;
    }

    this.updateSymbol(chordObject.symbol);
    this.updateQuality(chordObject.quality);
    this.updateExtensions(chordObject.extensions);
    this.updateNotes(chordObject.midi.notes);
  }

  updateSymbol(symbol) {
    const element = this.container.querySelector(".chord-symbol");

    // Enhanced symbol formatting with better spacing
    const formattedSymbol = this.formatChordSymbol(symbol);
    element.innerHTML = formattedSymbol; // Use innerHTML to support HTML formatting
    element.className = "chord-symbol";
  }

  formatChordSymbol(symbol) {
    // Split the symbol into parts for better visual formatting
    let formatted = symbol;

    // Add subtle spacing around accidentals for better readability
    formatted = formatted.replace(/♯/g, '<span class="accidental">♯</span>');
    formatted = formatted.replace(/♭/g, '<span class="accidental">♭</span>');
    formatted = formatted.replace(
      /ø/g,
      '<span class="quality-symbol">ø</span>',
    );
    formatted = formatted.replace(
      /dim/g,
      '<span class="quality-symbol">dim</span>',
    );

    return formatted;
  }

  updateQuality(quality) {
    const element = this.container.querySelector(".chord-quality");

    // Format quality with proper capitalization
    const formattedQuality = this.formatQuality(quality);
    element.textContent = formattedQuality;
    element.className = `chord-quality chord-${quality}`;
  }

  formatQuality(quality) {
    const qualityMap = {
      major: "Major",
      minor: "Minor",
      dominant: "Dominant",
      "half-diminished": "Half-Diminished",
      diminished: "Diminished",
      augmented: "Augmented",
    };

    return qualityMap[quality] || quality;
  }

  updateExtensions(extensions) {
    const element = this.container.querySelector(".chord-extensions");

    if (extensions.length === 0) {
      element.innerHTML = "";
      return;
    }

    // Format extensions with better visual presentation
    const formattedExtensions = extensions
      .map((ext) => `<span class="extension">${ext}</span>`)
      .join("");

    element.innerHTML = formattedExtensions;
  }

  updateNotes(midiNotes) {
    const element = this.container.querySelector(".chord-notes");
    const noteNames = midiNotes.map((note) => this.midiToNoteName(note));

    // Remove duplicates while preserving order
    const uniqueNotes = [...new Set(noteNames)];

    // Format with better punctuation and spacing
    const formattedNotes = this.formatNotesList(uniqueNotes);
    element.innerHTML = `<span class="notes-label">Notes:</span> <span class="notes-list">${formattedNotes}</span>`;
  }

  formatNotesList(notes) {
    if (notes.length === 0) return "";
    if (notes.length === 1) return this.formatNote(notes[0]);
    if (notes.length === 2)
      return `${this.formatNote(notes[0])} & ${this.formatNote(notes[1])}`;

    // For 3+ notes: "C, E, G & B♭"
    const lastNote = notes[notes.length - 1];
    const otherNotes = notes.slice(0, -1);
    const formattedOthers = otherNotes
      .map((note) => this.formatNote(note))
      .join(", ");
    return `${formattedOthers} & ${this.formatNote(lastNote)}`;
  }

  formatNote(note) {
    // Wrap accidentals in spans for better styling
    return note
      .replace(/♯/g, '<span class="note-accidental">♯</span>')
      .replace(/♭/g, '<span class="note-accidental">♭</span>');
  }

  clearDisplay() {
    this.container
      .querySelectorAll(
        ".chord-symbol, .chord-quality, .chord-extensions, .chord-notes",
      )
      .forEach((el) => (el.innerHTML = ""));
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
}
