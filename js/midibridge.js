/**
 * midibridge.js
 *
 * Handles MIDI input device selection and key highlighting
 */

let currentInput = null;

function handleMIDIMessage(event) {
  const [status, note, velocity] = event.data;

  const isNoteOn = (status & 0xf0) === 0x90 && velocity > 0;
  const isNoteOff =
    (status & 0xf0) === 0x80 || ((status & 0xf0) === 0x90 && velocity === 0);

  if (isNoteOn) {
    window.PianoInterface?.noteOn(note);
  } else if (isNoteOff) {
    window.PianoInterface?.noteOff(note);
  }
}

function populateDeviceDropdown(midiAccess) {
  const selector = document.getElementById("midiDeviceSelector");
  selector.innerHTML = ""; // clear

  for (const input of midiAccess.inputs.values()) {
    const option = document.createElement("option");
    option.value = input.id;
    option.textContent = input.name;
    selector.appendChild(option);
  }

  // Automatically select first input
  if (midiAccess.inputs.size > 0) {
    const firstId = [...midiAccess.inputs.values()][0].id;
    selector.value = firstId;
    setCurrentInput(midiAccess, firstId);
  }

  selector.addEventListener("change", (e) => {
    setCurrentInput(midiAccess, e.target.value);
  });
}

function setCurrentInput(midiAccess, inputId) {
  if (currentInput) {
    currentInput.onmidimessage = null; // detach old one
  }
  currentInput = midiAccess.inputs.get(inputId);
  if (currentInput) {
    currentInput.onmidimessage = handleMIDIMessage;
    console.log(`🎹 Listening to MIDI input: ${currentInput.name}`);
  }
}

function setupMIDIBridge() {
  if (!navigator.requestMIDIAccess) {
    console.warn("Web MIDI API not supported");
    return;
  }

  navigator.requestMIDIAccess().then((midiAccess) => {
    populateDeviceDropdown(midiAccess);

    // React to new devices being plugged in
    midiAccess.onstatechange = () => {
      populateDeviceDropdown(midiAccess);
    };
  });
}

setupMIDIBridge();
