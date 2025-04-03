// -------------------- Theme Switcher --------------------
const themeSwitch = document.getElementById("theme-switch");
const themeLabel = document.getElementById("theme-label");

const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
const currentTheme = localStorage.getItem("theme");

if (currentTheme === "dark" || (!currentTheme && prefersDarkScheme.matches)) {
  document.documentElement.setAttribute("data-theme", "dark");
  themeSwitch.checked = true;
  themeLabel.textContent = "Dark Mode";
} else {
  document.documentElement.setAttribute("data-theme", "light");
  themeSwitch.checked = false;
  themeLabel.textContent = "Light Mode";
}

themeSwitch.addEventListener("change", function () {
  if (this.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    themeLabel.textContent = "Dark Mode";
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
    themeLabel.textContent = "Light Mode";
  }
});

// -------------------- Palette Generation --------------------
function generatePalette() {
  let bgColor = document.getElementById("bgColorInput").value;
  let actionColor = document.getElementById("actionColorInput").value;
  const selectedMode = document.querySelector('input[name="paletteMode"]:checked').value;

  if (!isValidHex(bgColor) || !isValidHex(actionColor)) {
    alert("Please enter valid hex colors (e.g. #F4F4F4)");
    return;
  }

  // Normalize hex values to 6 digits
  bgColor = normalizeHex(bgColor);
  actionColor = normalizeHex(actionColor);

  // Update input fields
  document.getElementById("bgColorInput").value = bgColor;
  document.getElementById("bgColorPicker").value = bgColor;
  document.getElementById("actionColorInput").value = actionColor;
  document.getElementById("actionColorPicker").value = actionColor;

  // Clear previous palette sections
  const paletteSectionsContainer = document.getElementById("paletteSections");
  paletteSectionsContainer.innerHTML = "";

  // Generate palettes based on selected mode
  if (selectedMode === "light" || selectedMode === "both") {
    generateModeSpecificPalette(bgColor, actionColor, "light", paletteSectionsContainer);
  }
  if (selectedMode === "dark" || selectedMode === "both") {
    generateModeSpecificPalette(bgColor, actionColor, "dark", paletteSectionsContainer);
  }
}

function generateModeSpecificPalette(bgColor, actionColor, mode, container) {
  // Create section container
  const sectionContainer = document.createElement("div");
  sectionContainer.className = "container";

  // Mode title
  const modeTitle = document.createElement("div");
  modeTitle.className = `palette-mode-label ${mode}-mode`;
  modeTitle.textContent = mode === "light" ? "Light Mode Palette" : "Dark Mode Palette";
  sectionContainer.appendChild(modeTitle);

  // Generate mode colors
  const colors = generateModeColors(bgColor, actionColor, mode);

  // Create sections for Background, Action, Text, and Accent colors
  const sections = [
    { title: "Background Colors", className: "backgroundColors", colors: colors.backgroundColors },
    { title: "Action Colors", className: "actionColors", colors: colors.actionColors },
    { title: "Text Colors", className: "textColors", colors: colors.textColors },
    { title: "Accent Colors", className: "accentColors", colors: colors.accentColors },
  ];

  sections.forEach(sec => {
    const secTitle = document.createElement("h2");
    secTitle.className = "section-title";
    secTitle.textContent = sec.title;
    sectionContainer.appendChild(secTitle);

    const secContainer = document.createElement("div");
    secContainer.className = sec.className + " palette-container";
    populateColorCards(sec.colors, secContainer);
    sectionContainer.appendChild(secContainer);
  });

  container.appendChild(sectionContainer);
}

function generateModeColors(baseColor, accentColor, mode) {
  if (mode === "dark") {
    const bgLuminance = getLuminance(baseColor);
    if (bgLuminance > 0.5) {
      baseColor = invertLuminance(baseColor);
    }
    const accentLuminance = getLuminance(accentColor);
    if (accentLuminance < 0.4) {
      accentColor = adjustLuminance(accentColor, 0.6);
    }
  } else {
    const bgLuminance = getLuminance(baseColor);
    if (bgLuminance < 0.5) {
      baseColor = invertLuminance(baseColor);
    }
  }

  return {
    backgroundColors: [
      { name: "Primary Background", value: baseColor },
      { name: "Secondary Background", value: mode === "light" ? lighten(baseColor, 15) : darken(baseColor, 15) },
      { name: "Tertiary Background", value: mode === "light" ? darken(baseColor, 5) : lighten(baseColor, 5) },
      { name: "Surface Color", value: mode === "light" ? lighten(baseColor, 25) : darken(baseColor, 25) },
      { name: "Border Color", value: mode === "light" ? darken(baseColor, 15) : lighten(baseColor, 20) },
    ],
    actionColors: [
      { name: "Primary Action", value: accentColor },
      { name: "Secondary Action", value: adjust(accentColor, 30) },
      { name: "Action Hover", value: mode === "light" ? darken(accentColor, 10) : lighten(accentColor, 10) },
      { name: "Action Pressed", value: mode === "light" ? darken(accentColor, 20) : lighten(accentColor, 20) },
      { name: "Action Disabled", value: desaturate(accentColor, 50) },
    ],
    textColors: [
      { name: "Primary Text", value: mode === "light" ? "#212529" : "#f8f9fa" },
      { name: "Secondary Text", value: mode === "light" ? "#6c757d" : "#adb5bd" },
      { name: "Tertiary Text", value: mode === "light" ? "#8d959e" : "#868e96" },
      { name: "On Action Text", value: getContrastColor(accentColor) },
      { name: "On Surface Text", value: getContrastColor(mode === "light" ? lighten(baseColor, 25) : darken(baseColor, 25)) },
    ],
    accentColors: [
      { name: "Success", value: mode === "light" ? "#28a745" : "#40c057" },
      { name: "Info", value: mode === "light" ? "#17a2b8" : "#15aabf" },
      { name: "Warning", value: mode === "light" ? "#ffc107" : "#fab005" },
      { name: "Error", value: mode === "light" ? "#dc3545" : "#fa5252" },
      { name: "Complement", value: complementaryColor(accentColor) },
    ],
  };
}

function populateColorCards(colors, container) {
  colors.forEach((color) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "color-card";
    cardDiv.onclick = () => copyToClipboard(color.value);

    const displayDiv = document.createElement("div");
    displayDiv.className = "color-display";
    displayDiv.style.backgroundColor = color.value;
    displayDiv.style.color = getContrastColor(color.value);
    displayDiv.textContent = color.value;

    const infoDiv = document.createElement("div");
    infoDiv.className = "color-info";

    const nameDiv = document.createElement("div");
    nameDiv.className = "color-name";
    nameDiv.textContent = color.name;

    const hexSpan = document.createElement("span");
    hexSpan.className = "color-hex";
    hexSpan.textContent = color.value;

    infoDiv.appendChild(nameDiv);
    infoDiv.appendChild(hexSpan);
    cardDiv.appendChild(displayDiv);
    cardDiv.appendChild(infoDiv);
    container.appendChild(cardDiv);
  });
}

// -------------------- Save Palette --------------------
document.getElementById("save-btn").addEventListener("click", () => {
  const colors = getColorPalette();
  const json = JSON.stringify(colors, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "color-palette.json";
  link.click();
});

// -------------------- Load Palette --------------------
// The load button triggers a click on the hidden file input (id "load-file")
document.getElementById("load-btn").addEventListener("click", () => {
  document.getElementById("load-file").click();
});

// Listen for file selection on the file input
document.getElementById("load-file").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const loadedData = JSON.parse(e.target.result);
      // Update theme input colors if saved under "theme"
      if (loadedData.theme) {
        if (loadedData.theme.bgColor) {
          document.getElementById("bgColorInput").value = loadedData.theme.bgColor;
          document.getElementById("bgColorPicker").value = loadedData.theme.bgColor;
        }
        if (loadedData.theme.actionColor) {
          document.getElementById("actionColorInput").value = loadedData.theme.actionColor;
          document.getElementById("actionColorPicker").value = loadedData.theme.actionColor;
        }
      }
      renderPaletteFromJSON(loadedData);
    } catch (err) {
      alert("Failed to load palette. Please ensure the file is a valid JSON palette file.");
      console.error(err);
    }
  };
  reader.readAsText(file);
});

// Render palette sections from loaded JSON data
function renderPaletteFromJSON(paletteData) {
  const container = document.getElementById("paletteSections");
  container.innerHTML = "";
  for (const mode in paletteData) {
    if (mode === "theme") continue;
    const sectionContainer = document.createElement("div");
    sectionContainer.className = "container";
    const modeTitle = document.createElement("div");
    modeTitle.className = "palette-mode-label";
    modeTitle.textContent = mode === "light" ? "Light Mode Palette" : "Dark Mode Palette";
    sectionContainer.appendChild(modeTitle);

    // Mapping for category display titles
    const categories = {
      background: "Background Colors",
      action: "Action Colors",
      accent: "Accent Colors",
      text: "Text Colors",
    };

    for (const cat in categories) {
      if (paletteData[mode][cat]) {
        const catTitle = document.createElement("h2");
        catTitle.className = "section-title";
        catTitle.textContent = categories[cat];
        sectionContainer.appendChild(catTitle);

        const catContainer = document.createElement("div");
        catContainer.className = cat + " palette-container";

        // Convert the object of colors to an array
        const colorArray = Object.entries(paletteData[mode][cat]).map(
          ([key, value]) => ({ name: key.replace(/-/g, " "), value: value })
        );
        populateColorCards(colorArray, catContainer);
        sectionContainer.appendChild(catContainer);
      }
    }
    container.appendChild(sectionContainer);
  }
}

// -------------------- Extract Palette Data --------------------
function getColorPalette() {
  const paletteSections = document.querySelectorAll("#paletteSections .container");
  const colorPalette = {};
  // Save the theme’s base colors
  const bgColor = document.getElementById("bgColorInput").value;
  const actionColor = document.getElementById("actionColorInput").value;
  colorPalette["theme"] = { bgColor, actionColor };

  paletteSections.forEach((section) => {
    const modeTitle = section.querySelector(".palette-mode-label");
    const mode = modeTitle && modeTitle.textContent.toLowerCase().includes("dark") ? "dark" : "light";

    if (!colorPalette[mode]) {
      colorPalette[mode] = {};
    }
    const colorCategories = { background: {}, action: {}, accent: {}, text: {} };
    const categoryMap = {
      backgroundColors: "background",
      actionColors: "action",
      accentColors: "accent",
      textColors: "text",
    };

    Object.keys(categoryMap).forEach((category) => {
      const categoryContainer = section.querySelector(`.${category}`);
      if (categoryContainer) {
        const colorCards = categoryContainer.querySelectorAll(".color-card");
        colorCards.forEach((card) => {
          const colorName = card.querySelector(".color-name")
            ? card.querySelector(".color-name").textContent.trim().toLowerCase().replace(/\s+/g, "-")
            : "";
          const colorHex = card.querySelector(".color-hex")
            ? card.querySelector(".color-hex").textContent.trim()
            : "";
          if (colorName && colorHex) {
            colorCategories[categoryMap[category]][colorName] = colorHex;
          }
        });
      }
    });
    Object.keys(colorCategories).forEach((cat) => {
      if (Object.keys(colorCategories[cat]).length > 0) {
        colorPalette[mode][cat] = colorCategories[cat];
      }
    });
  });
  return colorPalette;
}

// -------------------- Color Manipulation Functions --------------------
function normalizeHex(color) {
  if (color.length === 4) {
    return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }
  return color.toUpperCase();
}

function lighten(color, percent) {
  return shadeColor(color, percent);
}

function darken(color, percent) {
  return shadeColor(color, -percent);
}

function shadeColor(color, percent) {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.max(0, Math.min(255, Math.round((R * (100 + percent)) / 100)));
  G = Math.max(0, Math.min(255, Math.round((G * (100 + percent)) / 100)));
  B = Math.max(0, Math.min(255, Math.round((B * (100 + percent)) / 100)));

  return `#${R.toString(16).padStart(2, "0")}${G.toString(16).padStart(2, "0")}${B.toString(16).padStart(2, "0")}`;
}

function complementaryColor(color) {
  let R = 255 - parseInt(color.substring(1, 3), 16);
  let G = 255 - parseInt(color.substring(3, 5), 16);
  let B = 255 - parseInt(color.substring(5, 7), 16);
  return `#${R.toString(16).padStart(2, "0")}${G.toString(16).padStart(2, "0")}${B.toString(16).padStart(2, "0")}`;
}

function adjust(color, angle) {
  const hsl = hexToHSL(color);
  hsl.h = (hsl.h + angle) % 360;
  return hslToHex(hsl);
}

function hexToHSL(hex) {
  hex = hex.replace(/^#/, "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(hsl) {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = (x) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function desaturate(color, percent) {
  const hsl = hexToHSL(color);
  hsl.s = Math.max(0, hsl.s - percent);
  return hslToHex(hsl);
}

function getLuminance(hex) {
  const rgb = hexToRgb(hex);
  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
}

function hexToRgb(hex) {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return { r, g, b };
}

function invertLuminance(hex) {
  const hsl = hexToHSL(hex);
  hsl.l = 100 - hsl.l;
  return hslToHex(hsl);
}

function adjustLuminance(hex, targetLuminance) {
  const hsl = hexToHSL(hex);
  hsl.l = targetLuminance * 100;
  return hslToHex(hsl);
}

function getContrastColor(hex) {
  const luminance = getLuminance(hex);
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

function isValidHex(color) {
  return /^#([0-9A-F]{3}){1,2}$/i.test(color);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const toast = document.getElementById("copyToast");
    toast.textContent = `Copied: ${text}`;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2000);
  }).catch((err) => {
    console.error("Failed to copy: ", err);
    alert("Failed to copy to clipboard");
  });
}

// -------------------- DOMContentLoaded --------------------
document.addEventListener("DOMContentLoaded", function () {
  // Connect color pickers and inputs
  document.getElementById("bgColorPicker").addEventListener("input", function () {
    document.getElementById("bgColorInput").value = this.value;
  });
  document.getElementById("bgColorInput").addEventListener("input", function () {
    if (isValidHex(this.value)) {
      document.getElementById("bgColorPicker").value = normalizeHex(this.value);
    }
  });
  document.getElementById("actionColorPicker").addEventListener("input", function () {
    document.getElementById("actionColorInput").value = this.value;
  });
  document.getElementById("actionColorInput").addEventListener("input", function () {
    if (isValidHex(this.value)) {
      document.getElementById("actionColorPicker").value = normalizeHex(this.value);
    }
  });
  // Generate the initial palette
  generatePalette();
});
