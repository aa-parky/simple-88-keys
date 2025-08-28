/**
 * Handles visual display of chord information
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
    element.textContent = symbol;
    element.className = "chord-symbol";
  }

  updateQuality(quality) {
    const element = this.container.querySelector(".chord-quality");
    element.textContent = quality;
    element.className = `chord-quality chord-${quality}`;
  }

  updateExtensions(extensions) {
    const element = this.container.querySelector(".chord-extensions");
    element.innerHTML = extensions
      .map((ext) => `<span class="extension">${ext}</span>`)
      .join("");
  }

  updateNotes(midiNotes) {
    const element = this.container.querySelector(".chord-notes");
    const noteNames = midiNotes.map((note) => this.midiToNoteName(note));
    element.textContent = `Notes: ${noteNames.join(", ")}`;
  }

  clearDisplay() {
    this.container
      .querySelectorAll(
        ".chord-symbol, .chord-quality, .chord-extensions, .chord-notes",
      )
      .forEach((el) => (el.textContent = ""));
  }

  midiToNoteName(midiNote) {
    const noteNames = [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B",
    ];
    return noteNames[midiNote % 12];
  }
}
