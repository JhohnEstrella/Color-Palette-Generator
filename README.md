# 🎨 Color Palette Generator – JavaScript Documentation

## Overview

This JavaScript file powers a **dynamic color palette generator** built using **vanilla HTML, CSS, and JavaScript**.
It allows users to generate color palettes based on color theory rules, customize palette parameters in real time, and interact with colors through copying and locking.

The system uses **HSL color space** internally to ensure predictable and visually coherent color transformations.

---

## ✨ Features

* Base color selection
* Multiple palette generation modes

  * Monochromatic
  * Analogous
  * Complementary
  * Triadic
* Real-time customization controls

  * Hue shift
  * Saturation
  * Lightness
  * Number of colors
* Copy color values to clipboard
* Lock individual colors
* Reset controls to default values
* Smooth interactive UI updates

---

## 📁 File Responsibility

This JavaScript file handles:

* DOM interaction
* Color conversion logic
* Palette generation algorithms
* User interaction logic
* State management
* Rendering of UI elements

---

## 🧱 Architecture Breakdown

### 1. DOM Elements

All necessary UI elements are cached at the top of the file for performance and readability.

```js
const baseColorInput = document.getElementById("base-color");
const paletteModeSelect = document.getElementById("palette-mode");
...
```

These include:

* Inputs (color picker, sliders, dropdowns)
* Buttons (generate, reset)
* Display elements (palette container, value labels)

---

### 2. State Management

```js
let lockedColors = new Set();
```

* Uses a `Set` to track indices of locked colors
* Prevents locked colors from being visually marked or overwritten
* Simple and efficient for lookups

---

### 3. Event Listeners

Event listeners enable **real-time updates** and user interaction.

Key behaviors:

* Changing any control immediately regenerates the palette
* Clicking colors copies HEX values
* Clicking lock icons toggles lock state
* Reset button restores defaults

Event delegation is used for palette interaction to improve performance.

---

## 🎯 Color Conversion Functions

### `hexToHSL(hex)`

Converts a HEX color string to an HSL object.

**Purpose:**

* Enables intuitive color manipulation using hue, saturation, and lightness

**Returns:**

```js
{ h: 0–360, s: 0–100, l: 0–100 }
```

---

### `hslToHex(h, s, l)`

Converts HSL values back to a HEX color string.

**Key points:**

* Normalizes and clamps values
* Ensures output is always a valid HEX color
* Used throughout palette generation

---

## 🎨 Palette Generation Modes

Each mode is implemented as a separate function for clarity and scalability.

---

### `generateMonochromatic(baseHSL, count)`

* Keeps hue constant
* Varies lightness and saturation
* Produces a clean tonal scale

**Use case:** UI themes, minimal designs

---

### `generateAnalogous(baseHSL, count)`

* Uses neighboring hues (±30°)
* Adds slight randomness for depth
* Produces harmonious palettes

**Use case:** Natural and organic designs

---

### `generateComplementary(baseHSL, count)`

* Uses opposite hues (180° apart)
* Alternates variations for balance

**Use case:** High-contrast designs, call-to-actions

---

### `generateTriadic(baseHSL, count)`

* Uses three evenly spaced hues (120° apart)
* Adjusts lightness to add hierarchy

**Use case:** Vibrant, playful interfaces

---

## ⚙️ Main Palette Logic

### `generatePalette()`

This is the **core controller function**.

Responsibilities:

1. Reads current UI values
2. Converts base color to HSL
3. Applies user adjustments
4. Selects generation mode
5. Generates color array
6. Calls `renderPalette()`

This function is triggered:

* On page load
* On any control change
* On generate button click

---

## 🖼️ Rendering Logic

### `renderPalette(colors)`

* Clears previous palette
* Creates color cards dynamically
* Applies locked state styling
* Injects lock and copy icons
* Attaches color data via `data-index`

This keeps rendering **fully dynamic** and scalable.

---

## 🧰 Utility Functions

### `copyToClipboard(hexValue, btnElement)`

* Copies HEX value using Clipboard API
* Triggers visual success feedback

---

### `showCopySuccess(element)`

* Temporarily swaps icon to a checkmark
* Provides clear visual confirmation

---

### `toggleLock(index, lockBtn)`

* Toggles lock state of a color
* Updates icon, tooltip, and styling
* Updates `lockedColors` set

---

### `resetControls()`

* Restores default values
* Clears all locked colors
* Regenerates the palette

---

## 🚀 Initialization

```js
generatePalette();
```

* Automatically generates an initial palette when the page loads
* Ensures the UI is never empty

---

## 🧠 Design Decisions

* **HSL color space** for predictable transformations
* **Event delegation** for performance
* **Pure functions** for palette logic
* **Separation of concerns** between logic and rendering

---

## 📌 Possible Future Enhancements

* Color-blind accessibility modes
* WCAG contrast checking
* Export palettes as CSS/Tailwind config
* Save palettes to localStorage
* Image-based palette extraction
