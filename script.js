// ========================================
// DOM ELEMENTS
// ========================================
const baseColorInput = document.getElementById("base-color");
const paletteModeSelect = document.getElementById("palette-mode");
const numColorsInput = document.getElementById("num-colors");
const hueShiftInput = document.getElementById("hue-shift");
const saturationInput = document.getElementById("saturation");
const lightnessInput = document.getElementById("lightness");
const generateBtn = document.getElementById("generate-btn");
const resetBtn = document.getElementById("reset-btn");
const paletteContainer = document.getElementById("palette-container");
const savePaletteBtn = document.getElementById("save-palette-btn");
const viewSavedBtn = document.getElementById("view-saved-btn");
const savedPanel = document.getElementById("saved-panel");
const closePanelBtn = document.getElementById("close-panel");
const savedPalettesContainer = document.getElementById("saved-palettes-container");

// Value display elements
const numColorsValue = document.getElementById("num-colors-value");
const hueShiftValue = document.getElementById("hue-shift-value");
const saturationValue = document.getElementById("saturation-value");
const lightnessValue = document.getElementById("lightness-value");

// ========================================
// STATE MANAGEMENT
// ========================================
let lockedColors = new Set(); // Track which color indices are locked
let savedPalettes = JSON.parse(localStorage.getItem('savedPalettes')) || []; // Load saved palettes from localStorage

// ========================================
// EVENT LISTENERS
// ========================================
generateBtn.addEventListener("click", () => {
    // Add spinning animation
    paletteContainer.classList.add("spinning");
    
    // Generate palette after animation completes
    setTimeout(() => {
        generatePalette();
        paletteContainer.classList.remove("spinning");
    }, 1000);
});

resetBtn.addEventListener("click", resetControls);
savePaletteBtn.addEventListener("click", savePalette);
viewSavedBtn.addEventListener("click", toggleSavedPanel);
closePanelBtn.addEventListener("click", closeSavedPanel);

// Real-time updates when controls change
baseColorInput.addEventListener("input", generatePalette);

paletteModeSelect.addEventListener("change", generatePalette);

numColorsInput.addEventListener("input", () => {
    numColorsValue.textContent = numColorsInput.value;
    generatePalette();
});

hueShiftInput.addEventListener("input", () => {
    hueShiftValue.textContent = `${hueShiftInput.value}°`;
    generatePalette();
});

saturationInput.addEventListener("input", () => {
    saturationValue.textContent = `${saturationInput.value}%`;
    generatePalette();
});

lightnessInput.addEventListener("input", () => {
    lightnessValue.textContent = `${lightnessInput.value}%`;
    generatePalette();
});

// Click handler for color boxes (copy to clipboard and lock)
paletteContainer.addEventListener("click", (e) => {
    // Handle copy button clicks
    const copyBtn = e.target.closest(".copy-btn");
    if (copyBtn) {
        const colorBox = copyBtn.closest(".color-box");
        const hexValue = colorBox.querySelector(".hex-value").textContent;
        copyToClipboard(hexValue, copyBtn);
        return;
    }

    // Handle lock button clicks
    const lockBtn = e.target.closest(".lock-btn");
    if (lockBtn) {
        const colorBox = lockBtn.closest(".color-box");
        const index = parseInt(colorBox.dataset.index);
        toggleLock(index, lockBtn);
        return;
    }

    // Handle clicking on the color area itself
    const colorEl = e.target.closest(".color");
    if (colorEl) {
        const details = colorEl.nextElementSibling;
        const hexEl = details ? details.querySelector(".hex-value") : null;
        const hexValue = hexEl ? hexEl.textContent : "";
        const copyBtnEl = details ? details.querySelector(".copy-btn") : null;
        copyToClipboard(hexValue, copyBtnEl);
    }
});

// Click handler for saved palettes
savedPalettesContainer.addEventListener("click", (e) => {
    // Handle delete button
    const deleteBtn = e.target.closest(".delete-saved-btn");
    if (deleteBtn) {
        const paletteId = parseInt(deleteBtn.dataset.id);
        deleteSavedPalette(paletteId);
        return;
    }

    // Handle load button
    const loadBtn = e.target.closest(".load-saved-btn");
    if (loadBtn) {
        const paletteId = parseInt(loadBtn.dataset.id);
        loadSavedPalette(paletteId);
        return;
    }
});

// ========================================
// COLOR CONVERSION FUNCTIONS
// ========================================

/**
 * Convert HEX color to HSL (Hue, Saturation, Lightness)
 * @param {string} hex - Hex color string (e.g., "#FF5733")
 * @returns {Object} - {h: 0-360, s: 0-100, l: 0-100}
 */
function hexToHSL(hex) {
    // Remove # if present
    hex = hex.replace("#", "");
    
    // Convert hex to RGB (0-1 range)
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;
    
    // Find min and max values
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    let h = 0;
    let s = 0;
    let l = (max + min) / 2;
    
    if (delta !== 0) {
        // Calculate saturation
        s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
        
        // Calculate hue
        switch (max) {
            case r:
                h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / delta + 2) / 6;
                break;
            case b:
                h = ((r - g) / delta + 4) / 6;
                break;
        }
    }
    
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

/**
 * Convert HSL to HEX color
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} - Hex color string (e.g., "#FF5733")
 */
function hslToHex(h, s, l) {
    // Normalize values
    h = h % 360;
    if (h < 0) h += 360;
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (h >= 0 && h < 60) {
        r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c;
    } else {
        r = c; g = 0; b = x;
    }
    
    // Convert to 0-255 range and then to hex
    const toHex = (value) => {
        const hex = Math.round((value + m) * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// ========================================
// PALETTE GENERATION MODES
// ========================================

/**
 * Ensure a generated color is unique within the colors array
 * @param {string} color - Generated hex color
 * @param {Array} existingColors - Array of existing hex colors
 * @param {number} h - Hue value to adjust
 * @param {number} s - Saturation value
 * @param {number} l - Lightness value
 * @returns {string} - Unique hex color
 */
function ensureUniqueColor(color, existingColors, h, s, l) {
    let uniqueColor = color;
    let attempts = 0;
    const maxAttempts = 100;
    
    // Check if color already exists
    while (existingColors.includes(uniqueColor) && attempts < maxAttempts) {
        // Try adjusting lightness first
        if (attempts < 50) {
            const adjustedL = l + (attempts % 2 === 0 ? attempts : -attempts);
            uniqueColor = hslToHex(h, s, adjustedL);
        } else {
            // If that fails, adjust hue slightly
            const adjustedH = h + (attempts - 50);
            uniqueColor = hslToHex(adjustedH, s, l);
        }
        attempts++;
    }
    
    return uniqueColor;
}

/**
 * Generate monochromatic palette (same hue, varying saturation/lightness)
 * @param {Object} baseHSL - Base HSL color
 * @param {number} count - Number of colors to generate
 * @returns {Array} - Array of hex colors
 */
function generateMonochromatic(baseHSL, count) {
    const colors = [];
    const { h } = baseHSL;
    
    for (let i = 0; i < count; i++) {
        // Vary lightness from dark to light
        const lightnessStep = 100 / (count + 1);
        const l = lightnessStep * (i + 1);
        
        // Keep saturation relatively high for vibrant colors
        const s = 70 - (i * 5); // Gradually decrease saturation
        
        let color = hslToHex(h, Math.max(20, s), l);
        
        // Ensure the color is unique
        if (colors.includes(color)) {
            color = ensureUniqueColor(color, colors, h, Math.max(20, s), l);
        }
        
        colors.push(color);
    }
    
    return colors;
}

/**
 * Generate analogous palette (neighboring hues on color wheel)
 * @param {Object} baseHSL - Base HSL color
 * @param {number} count - Number of colors to generate
 * @returns {Array} - Array of hex colors
 */
function generateAnalogous(baseHSL, count) {
    const colors = [];
    const { h, s, l } = baseHSL;
    
    // Spread colors ±30 degrees from base hue
    const hueRange = 60;
    const hueStep = hueRange / (count - 1);
    
    for (let i = 0; i < count; i++) {
        const hueOffset = -hueRange / 2 + (hueStep * i);
        const newHue = h + hueOffset;
        
        // Slight variation in saturation and lightness for depth
        const newS = s + (Math.random() * 20 - 10);
        const newL = l + (Math.random() * 20 - 10);
        
        let color = hslToHex(newHue, newS, newL);
        
        // Ensure the color is unique
        if (colors.includes(color)) {
            color = ensureUniqueColor(color, colors, newHue, newS, newL);
        }
        
        colors.push(color);
    }
    
    return colors;
}

/**
 * Generate complementary palette (opposite hues)
 * @param {Object} baseHSL - Base HSL color
 * @param {number} count - Number of colors to generate
 * @returns {Array} - Array of hex colors
 */
function generateComplementary(baseHSL, count) {
    const colors = [];
    const { h, s, l } = baseHSL;
    
    // Add base color
    let color = hslToHex(h, s, l);
    colors.push(color);
    
    // Add complementary color (180 degrees opposite)
    if (count > 1) {
        let compColor = hslToHex(h + 180, s, l);
        
        // Ensure complementary color is unique
        if (colors.includes(compColor)) {
            compColor = ensureUniqueColor(compColor, colors, h + 180, s, l);
        }
        
        colors.push(compColor);
    }
    
    // Fill remaining with variations
    for (let i = 2; i < count; i++) {
        const isBaseVariation = i % 2 === 0;
        const baseHue = isBaseVariation ? h : h + 180;
        
        // Vary lightness
        const lightnessOffset = (i / count) * 40 - 20;
        let varColor = hslToHex(baseHue, s - 10, l + lightnessOffset);
        
        // Ensure variation color is unique
        if (colors.includes(varColor)) {
            varColor = ensureUniqueColor(varColor, colors, baseHue, s - 10, l + lightnessOffset);
        }
        
        colors.push(varColor);
    }
    
    return colors;
}

/**
 * Generate triadic palette (three evenly spaced hues)
 * @param {Object} baseHSL - Base HSL color
 * @param {number} count - Number of colors to generate
 * @returns {Array} - Array of hex colors
 */
function generateTriadic(baseHSL, count) {
    const colors = [];
    const { h, s, l } = baseHSL;
    
    // Three main hues: base, base+120, base+240
    const mainHues = [h, h + 120, h + 240];
    
    for (let i = 0; i < count; i++) {
        const hueIndex = i % 3;
        const currentHue = mainHues[hueIndex];
        
        // Vary lightness for depth
        const lightnessVariation = Math.floor(i / 3) * 15;
        const newL = l + lightnessVariation - 15;
        
        let color = hslToHex(currentHue, s, newL);
        
        // Ensure the color is unique
        if (colors.includes(color)) {
            color = ensureUniqueColor(color, colors, currentHue, s, newL);
        }
        
        colors.push(color);
    }
    
    return colors;
}

// ========================================
// PALETTE GENERATION & RENDERING
// ========================================

/**
 * Main function to generate palette based on current settings
 */
function generatePalette() {
    const baseColor = baseColorInput.value;
    const mode = paletteModeSelect.value;
    const numColors = parseInt(numColorsInput.value);
    const hueShift = parseInt(hueShiftInput.value);
    const saturationAdjust = parseInt(saturationInput.value);
    const lightnessAdjust = parseInt(lightnessInput.value);
    
    // **SAVE LOCKED COLORS BEFORE GENERATING**
    const previousColors = {};
    const colorBoxes = paletteContainer.querySelectorAll('.color-box');
    colorBoxes.forEach((box, index) => {
        if (lockedColors.has(index)) {
            const hexValue = box.querySelector('.hex-value').textContent;
            previousColors[index] = hexValue;
        }
    });
    
    // Convert base color to HSL
    let baseHSL = hexToHSL(baseColor);
    
    // Apply adjustments
    baseHSL.h = (baseHSL.h + hueShift) % 360;
    if (baseHSL.h < 0) baseHSL.h += 360;
    
    baseHSL.s = saturationAdjust;
    baseHSL.l = lightnessAdjust;
    
    // Generate colors based on mode
    let colors = [];
    switch (mode) {
        case "monochromatic":
            colors = generateMonochromatic(baseHSL, numColors);
            break;
        case "analogous":
            colors = generateAnalogous(baseHSL, numColors);
            break;
        case "complementary":
            colors = generateComplementary(baseHSL, numColors);
            break;
        case "triadic":
            colors = generateTriadic(baseHSL, numColors);
            break;
        default:
            colors = generateMonochromatic(baseHSL, numColors);
    }
    
    // **RESTORE LOCKED COLORS**
    Object.keys(previousColors).forEach(index => {
        colors[parseInt(index)] = previousColors[index];
    });
    
    renderPalette(colors);
}

/**
 * Render the palette to the DOM
 * @param {Array} colors - Array of hex color strings
 */
function renderPalette(colors) {
    paletteContainer.innerHTML = "";
    
    colors.forEach((color, index) => {
        const colorBox = document.createElement("div");
        colorBox.className = "color-box";
        colorBox.dataset.index = index;
        
        // Check if this color is locked
        const isLocked = lockedColors.has(index);
        if (isLocked) {
            colorBox.classList.add("locked");
        }
        
        colorBox.innerHTML = `
            <div class="color" style="background-color: ${color};"></div>
            <div class="color-info">
                <span class="hex-value">${color}</span>
                <div class="icon-group">
                    <i class="fas ${isLocked ? 'fa-lock' : 'fa-lock-open'} lock-btn" title="${isLocked ? 'Unlock' : 'Lock'} color"></i>
                    <i class="far fa-copy copy-btn" title="Copy to Clipboard"></i>
                </div>
            </div>
        `;
        
        paletteContainer.appendChild(colorBox);
    });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Copy hex value to clipboard and show visual feedback
 * @param {string} hexValue - Hex color to copy
 * @param {HTMLElement} btnElement - Button element for visual feedback
 */
function copyToClipboard(hexValue, btnElement) {
    navigator.clipboard.writeText(hexValue)
        .then(() => {
            if (btnElement) {
                showCopySuccess(btnElement);
            }
        })
        .catch((err) => console.error("Failed to copy:", err));
}

/**
 * Show visual feedback when color is copied
 * @param {HTMLElement} element - Element to show feedback on
 */
function showCopySuccess(element) {
    if (!element) return;
    
    const icon = element.querySelector("i") || element;
    
    // Store original classes
    const originalClasses = icon.className;
    
    // Change to check icon
    icon.className = "fas fa-check";
    icon.style.color = "#48bb78";
    
    // Revert after 1.5 seconds
    setTimeout(() => {
        icon.className = originalClasses;
        icon.style.color = "";
    }, 1500);
}

/**
 * Toggle lock state for a color
 * @param {number} index - Index of the color to lock/unlock
 * @param {HTMLElement} lockBtn - Lock button element
 */
function toggleLock(index, lockBtn) {
    if (lockedColors.has(index)) {
        lockedColors.delete(index);
        lockBtn.classList.remove("fa-lock");
        lockBtn.classList.add("fa-lock-open");
        lockBtn.title = "Lock color";
        lockBtn.closest(".color-box").classList.remove("locked");
    } else {
        lockedColors.add(index);
        lockBtn.classList.remove("fa-lock-open");
        lockBtn.classList.add("fa-lock");
        lockBtn.title = "Unlock color";
        lockBtn.closest(".color-box").classList.add("locked");
    }
}

/**
 * Reset all controls to default values
 */
function resetControls() {
    baseColorInput.value = "#F63049";
    paletteModeSelect.value = "monochromatic";
    numColorsInput.value = "5";
    hueShiftInput.value = "0";
    saturationInput.value = "50";
    lightnessInput.value = "50";
    
    // Update display values
    numColorsValue.textContent = "5";
    hueShiftValue.textContent = "0°";
    saturationValue.textContent = "50%";
    lightnessValue.textContent = "50%";
    
    // Clear locked colors
    lockedColors.clear();
    
    // Regenerate palette
    generatePalette();
}

// ========================================
// SAVE & LOAD PALETTES
// ========================================

/**
 * Save current palette to localStorage
 */
function savePalette() {
    const colorBoxes = paletteContainer.querySelectorAll('.color-box');
    const colors = Array.from(colorBoxes).map(box => {
        return box.querySelector('.hex-value').textContent;
    });
    
    if (colors.length === 0) {
        alert('No palette to save!');
        return;
    }
    
    const palette = {
        id: Date.now(),
        colors: colors,
        date: new Date().toLocaleString()
    };
    
    savedPalettes.unshift(palette); // Add to beginning of array
    localStorage.setItem('savedPalettes', JSON.stringify(savedPalettes));
    
    // Show success feedback
    showSaveSuccess();
    
    // Update saved palettes display
    renderSavedPalettes();
}

/**
 * Show visual feedback when palette is saved
 */
function showSaveSuccess() {
    const originalText = savePaletteBtn.innerHTML;
    savePaletteBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
    savePaletteBtn.style.background = 'linear-gradient(45deg, #48bb78, #38a169)';
    
    setTimeout(() => {
        savePaletteBtn.innerHTML = originalText;
        savePaletteBtn.style.background = '';
    }, 1500);
}

/**
 * Render saved palettes in the side panel
 */
function renderSavedPalettes() {
    savedPalettesContainer.innerHTML = '';
    
    if (savedPalettes.length === 0) {
        savedPalettesContainer.innerHTML = '<p class="no-palettes">No saved palettes yet. Create and save your favorite color combinations!</p>';
        return;
    }
    
    savedPalettes.forEach((palette) => {
        const paletteCard = document.createElement('div');
        paletteCard.className = 'saved-palette-card';
        
        const colorsHTML = palette.colors.map(color => 
            `<div class="saved-color" style="background-color: ${color};" title="${color}"></div>`
        ).join('');
        
        paletteCard.innerHTML = `
            <div class="saved-palette-colors">
                ${colorsHTML}
            </div>
            <div class="saved-palette-info">
                <span class="saved-date">${palette.date}</span>
                <div class="saved-actions">
                    <button class="load-saved-btn" data-id="${palette.id}" title="Load this palette">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="delete-saved-btn" data-id="${palette.id}" title="Delete this palette">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        savedPalettesContainer.appendChild(paletteCard);
    });
}

/**
 * Load a saved palette
 * @param {number} paletteId - ID of the palette to load
 */
function loadSavedPalette(paletteId) {
    const palette = savedPalettes.find(p => p.id === paletteId);
    if (!palette) return;
    
    renderPalette(palette.colors);
    closeSavedPanel();
}

/**
 * Delete a saved palette
 * @param {number} paletteId - ID of the palette to delete
 */
function deleteSavedPalette(paletteId) {
    showDeleteConfirmation(paletteId);
}

/**
 * Show custom delete confirmation popup
 * @param {number} paletteId - ID of the palette to delete
 */
function showDeleteConfirmation(paletteId) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'delete-overlay';
    
    // Create popup
    const popup = document.createElement('div');
    popup.className = 'delete-popup';
    popup.innerHTML = `
        <h3>Delete Palette?</h3>
        <p>Are you sure you want to delete this palette? This action cannot be undone.</p>
        <div class="popup-buttons">
            <button class="popup-cancel-btn">Cancel</button>
            <button class="popup-confirm-btn">Delete</button>
        </div>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Animate in
    setTimeout(() => overlay.classList.add('show'), 10);
    
    // Handle cancel
    popup.querySelector('.popup-cancel-btn').addEventListener('click', () => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
    });
    
    // Handle confirm
    popup.querySelector('.popup-confirm-btn').addEventListener('click', () => {
        savedPalettes = savedPalettes.filter(p => p.id !== paletteId);
        localStorage.setItem('savedPalettes', JSON.stringify(savedPalettes));
        renderSavedPalettes();
        
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
    });
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 300);
        }
    });
}


/**
 * Toggle saved palettes panel
 */
function toggleSavedPanel() {
    savedPanel.classList.toggle('open');
    if (savedPanel.classList.contains('open')) {
        renderSavedPalettes();
    }
}

/**
 * Close saved palettes panel
 */
function closeSavedPanel() {
    savedPanel.classList.remove('open');
}

// ========================================
// INITIALIZATION
// ========================================

// Generate initial palette on page load
generatePalette();