// Load simple-keyboard CSS early
function loadCss(url) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}
loadCss("/libs/simple-keyboard/simple-keyboard.css");

// Get DOM elements used globally
const keyboardContainer = document.getElementById("keyboardContainer");
const dragHandle = keyboardContainer.querySelector(".keyboard-draggable");
const closeButton = keyboardContainer.querySelector(".keyboard-close-button");

const Keyboard = window.SimpleKeyboard.default;
const KeyboardLayouts = window.SimpleKeyboardLayouts.default;

const layout = new KeyboardLayouts().get("french");

let isShift = false;
let isCaps = false;
let currentInput = null;

// Initialize keyboard
const myKeyboard = new Keyboard({
  onChange: input => onChange(input),
  onKeyPress: button => onKeyPress(button),
  ...layout,
  display: {
    "{bksp}": "←",
    "{enter}": "⏎ Entrée",
    "{shift}": "⇧",
    "{lock}": "⇪",
    "{space}": "___"
  }
});

function onChange(input) {
  if (currentInput) currentInput.value = input;
}

function onKeyPress(button) {
  if (button === "{shift}") {
    isShift = true;
    updateLayout();
    return;
  }

  if (button === "{lock}") {
    isCaps = !isCaps;
    updateLayout();
    return;
  }

  if (button === "{enter}") {
    handleSubmit();
    return;
  }

  if (isShift) {
    isShift = false;
    updateLayout();
  }
}

function updateLayout() {
  const layoutName = (isCaps ^ isShift) ? "shift" : "default"; // XOR logic
  myKeyboard.setOptions({ layoutName });
}

function handleSubmit() {
  const value = currentInput?.value ?? "";
  console.log("Submitted:", value);
}

// Bind events to input fields with class `.input`
function bindInputEvents() {
  document.querySelectorAll(".input").forEach(input => {
    // Avoid rebinding the same input
    if (input.dataset.bound === "true") return;

    input.addEventListener("focus", event => {
      currentInput = event.target;
      myKeyboard.setInput(currentInput.value);
      keyboardContainer.style.display = "block";
    });

    input.addEventListener("input", event => {
      if (event.target === currentInput) {
        myKeyboard.setInput(event.target.value);
      }
    });

    input.dataset.bound = "true"; // Mark input as bound
  });
}

// Initial bind
bindInputEvents();

// Observe changes in #output (or change if Mustache renders elsewhere)
const outputContainer = document.getElementById("output");

if (outputContainer) {
  const observer = new MutationObserver(() => {
    bindInputEvents(); // Re-bind when new content is added
  });

  observer.observe(outputContainer, { childList: true, subtree: true });
}

// Keyboard drag handling
let isDragging = false;
let offset = { x: 0, y: 0 };

dragHandle.addEventListener("mousedown", (e) => {
  isDragging = true;
  offset.x = e.clientX - keyboardContainer.offsetLeft;
  offset.y = e.clientY - keyboardContainer.offsetTop;
  document.body.style.userSelect = "none";
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  document.body.style.userSelect = "auto";
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const containerWidth = keyboardContainer.offsetWidth;
    const containerHeight = keyboardContainer.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newLeft = e.clientX - offset.x;
    let newTop = e.clientY - offset.y;

    newLeft = Math.max(0, Math.min(viewportWidth - containerWidth, newLeft));
    newTop = Math.max(0, Math.min(viewportHeight - containerHeight, newTop));

    keyboardContainer.style.left = `${newLeft}px`;
    keyboardContainer.style.top = `${newTop}px`;
    keyboardContainer.style.bottom = "auto";
  }
});

// Mobile dragging compatibility
dragHandle.addEventListener("touchstart", (e) => {
  isDragging = true;
  const touch = e.touches[0];
  offset.x = touch.clientX - keyboardContainer.offsetLeft;
  offset.y = touch.clientY - keyboardContainer.offsetTop;
  document.body.style.userSelect = "none";
}, { passive: true });

document.addEventListener("touchend", () => {
  isDragging = false;
  document.body.style.userSelect = "auto";
}, { passive: true });

document.addEventListener("touchmove", (e) => {
  if (isDragging) {
    const touch = e.touches[0];
    const containerWidth = keyboardContainer.offsetWidth;
    const containerHeight = keyboardContainer.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newLeft = touch.clientX - offset.x;
    let newTop = touch.clientY - offset.y;

    newLeft = Math.max(0, Math.min(viewportWidth - containerWidth, newLeft));
    newTop = Math.max(0, Math.min(viewportHeight - containerHeight, newTop));

    keyboardContainer.style.left = `${newLeft}px`;
    keyboardContainer.style.top = `${newTop}px`;
    keyboardContainer.style.bottom = "auto";
  }
}, { passive: true });


closeButton.addEventListener("click", () => {
  keyboardContainer.style.display = "none";
});
