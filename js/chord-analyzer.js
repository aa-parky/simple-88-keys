/**
 * Analyzes MIDI notes to identify jazz chords
 * Uses the JSON schema defined in chord_json_schema.py
 */
class ChordAnalyzer {
  constructor() {
    this.chordPatterns = this.initializeChordPatterns();
  }

  // ADDED: Missing findRoot method
  findRoot(sortedNotes) {
    // Simple root finding - use the lowest note as root
    // In a more sophisticated implementation, this could analyze
    // intervals to determine the actual root based on chord inversions
    return sortedNotes[0];
  }

  analyzeNotes(midiNotes) {
    if (midiNotes.length < 2) {
      return null; // Need at least 2 notes for a chord
    }

    // Sort notes and find root
    const sortedNotes = [...midiNotes].sort((a, b) => a - b);
    const root = this.findRoot(sortedNotes);
    const intervals = this.calculateIntervals(sortedNotes, root);

    // Identify chord quality and extensions
    const quality = this.identifyQuality(intervals);
    const extensions = this.identifyExtensions(intervals);
    const alterations = this.identifyAlterations(intervals);

    // Generate chord object following our JSON schema
    return {
      symbol: this.generateSymbol(root, quality, extensions, alterations),
      root: this.midiToNoteName(root),
      quality: quality,
      extensions: extensions,
      alterations: alterations,
      midi: {
        notes: sortedNotes,
        root_note: root,
      },
      metadata: {
        confidence: this.calculateConfidence(intervals),
        timestamp: new Date().toISOString(),
        source: "midi_input",
      },
    };
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

  calculateIntervals(notes, root) {
    return notes.map((note) => (note - root) % 12).sort((a, b) => a - b);
  }

  identifyQuality(intervals) {
    // Major chord patterns
    if (this.matchesPattern(intervals, [0, 4, 7])) return "major";
    if (this.matchesPattern(intervals, [0, 3, 7])) return "minor";
    if (this.matchesPattern(intervals, [0, 4, 7, 10])) return "dominant";
    if (this.matchesPattern(intervals, [0, 3, 6, 10])) return "half-diminished";
    if (this.matchesPattern(intervals, [0, 3, 6, 9])) return "diminished";
    if (this.matchesPattern(intervals, [0, 4, 8])) return "augmented";

    return "major"; // Default fallback
  }

  identifyExtensions(intervals) {
    const extensions = [];
    if (intervals.includes(10) || intervals.includes(11)) extensions.push(7);
    if (intervals.includes(2) || intervals.includes(1)) extensions.push(9);
    if (intervals.includes(5) || intervals.includes(6)) extensions.push(11);
    if (intervals.includes(9) || intervals.includes(10)) extensions.push(13);
    return extensions;
  }

  identifyAlterations(intervals) {
    const alterations = [];
    if (intervals.includes(6))
      alterations.push({ degree: 5, modifier: "flat" });
    if (intervals.includes(8))
      alterations.push({ degree: 5, modifier: "sharp" });
    if (intervals.includes(1))
      alterations.push({ degree: 9, modifier: "flat" });
    if (intervals.includes(3))
      alterations.push({ degree: 9, modifier: "sharp" });
    return alterations;
  }

  matchesPattern(intervals, pattern) {
    return pattern.every((interval) => intervals.includes(interval));
  }

  generateSymbol(root, quality, extensions, alterations) {
    let symbol = this.midiToNoteName(root);

    // Add quality with proper formatting
    if (quality === "minor") symbol += "m";
    else if (quality === "diminished") symbol += "dim";
    else if (quality === "half-diminished") symbol += "ø";
    else if (quality === "augmented") symbol += "+";
    else if (quality === "major" && extensions.includes(7)) symbol += "maj";

    // Add extensions with spacing
    const extensionParts = [];
    extensions.forEach((ext) => {
      if (ext === 7) {
        if (quality === "major") {
          // Already added "maj" above
          extensionParts.push("7");
        } else {
          extensionParts.push("7");
        }
      } else {
        extensionParts.push(ext.toString());
      }
    });

    // Add extensions with space if any exist
    if (extensionParts.length > 0) {
      symbol += " " + extensionParts.join(" ");
    }

    // Add alterations with proper musical symbols and spacing
    const alterationParts = [];
    alterations.forEach((alt) => {
      const modifier = alt.modifier === "flat" ? "♭" : "♯";
      alterationParts.push(modifier + alt.degree);
    });

    // Add alterations with space if any exist
    if (alterationParts.length > 0) {
      symbol += " " + alterationParts.join(" ");
    }

    return symbol;
  }

  calculateConfidence(intervals) {
    // Simple confidence based on how well intervals match known patterns
    const knownPatterns = [
      [0, 4, 7],
      [0, 3, 7],
      [0, 4, 7, 10],
      [0, 3, 6, 10],
    ];

    for (const pattern of knownPatterns) {
      if (this.matchesPattern(intervals, pattern)) {
        return 0.9; // High confidence for exact matches
      }
    }

    return 0.6; // Lower confidence for partial matches
  }

  initializeChordPatterns() {
    // Initialize chord pattern database
    return {
      major: [0, 4, 7],
      minor: [0, 3, 7],
      dominant: [0, 4, 7, 10],
      // ... more patterns
    };
  }
}
