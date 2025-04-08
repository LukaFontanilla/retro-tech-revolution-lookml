// Combined Status Indicator Visualization for Looker
looker.plugins.visualizations.add({
  id: "status_indicator_glow", // Changed ID slightly to avoid conflicts if you have the old one
  label: "Status Indicator (Glow)", // Updated label
  options: {
    indicator_type: {
      type: "string",
      label: "Indicator Type",
      display: "select",
      values: [
        {"Time": "time"},
        {"Rank": "rank"}, // Defaulting to Rank (green) to match the image style initially
        {"Enemies Defeated": "enemies"}
      ],
      default: "rank" // Default to Rank (green)
    },
    indicator_background_color: { // Renamed from background_color for clarity
        type: "string",
        label: "Indicator Background Color",
        default: "#424242", // Dark grey like the image
        display_size: "half"
    },
    font_size: {
      type: "string",
      label: "Font Size",
      default: "48px" // Increased default size to be closer to image proportion
    },
    font_color: {
      type: "string",
      label: "Color (Icon, Text, Border, Glow)", // Simplified color - one color for all
      default: "#34A853", // Default to green (rank)
      display_size: "half"
    },
    // Removed separate border_color and background_color as they are derived or distinct
    border_radius: {
      type: "number",
      label: "Border Radius",
      default: 15, // Slightly more rounded
      display_size: "half"
    },
    border_width: {
      type: "number",
      label: "Border Width",
      default: 4, // Thinner solid border, glow adds visual weight
      display_size: "half"
    },
    glow_blur: {
        type: "number",
        label: "Glow Blur (px)",
        default: 10,
        display_size: "half"
    },
    glow_spread: {
        type: "number",
        label: "Glow Spread (px)",
        default: 2,
        display_size: "half"
    },
    custom_value_format: {
      type: "string",
      label: "Custom Value Format (blank for default)",
      default: "",
    }
  },

  create: function(element, config) {
    element.innerHTML = `
      <style>
        /* Basic reset/box-sizing */
        .status-indicator-glow-vis,
        .status-indicator-glow-vis * {
            box-sizing: border-box;
        }
        .status-indicator-glow-vis {
          height: 100%;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 15px; /* Add padding to ensure glow isn't cut off */
          overflow: hidden; /* Prevent potential overflow issues */
        }
        .status-indicator {
          display: flex;
          align-items: center;
          justify-content: center; /* Center content */
          gap: 15px; /* Space between icon and value */
          padding: 10px 25px; /* Adjust padding inside the box */
          border-radius: 15px; /* Default */
          border: 4px solid #34A853; /* Default */
          background-color: transparent; /* Default */
          width: 100%;
          height: 100%;
          /* Glow will be applied via JS */
        }
        .status-icon {
          background-color: #34A853; /* Default */
          mask-size: contain;
          mask-repeat: no-repeat;
          mask-position: center;
          -webkit-mask-size: contain;
          -webkit-mask-repeat: no-repeat;
          -webkit-mask-position: center;
          /* Icon will scale with font size */
          width: 1em; /* Relative to parent font-size */
          height: 1em; /* Relative to parent font-size */
          flex-shrink: 0;
           /* Glow will be applied via JS */
        }
        .status-value {
          font-size: 48px; /* Default */
          font-weight: bold;
          color: #34A853; /* Default */
          font-family: 'Arial', sans-serif; /* Example font */
          display: flex;
          align-items: center;
          line-height: 1; /* Ensure text aligns well vertically */
           /* Glow will be applied via JS */
        }
        /* Specific icon paths */
        .icon-time {
             /* Clock icon SVG */
            mask-image: url("https://i.ibb.co/XZvRzPDw/alarm.png");
            -webkit-mask-image: url("https://i.ibb.co/XZvRzPDw/alarm.png");
        }
        .icon-rank {
             /* Star icon SVG */
            mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2l3.1 6.3 6.9.9-5 4.9 1.2 6.9-6.2-3.3-6.2 3.3 1.2-6.9-5-4.9 6.9-.9z' fill='currentColor'/%3E%3C/svg%3E");
            -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2l3.1 6.3 6.9.9-5 4.9 1.2 6.9-6.2-3.3-6.2 3.3 1.2-6.9-5-4.9 6.9-.9z' fill='currentColor'/%3E%3C/svg%3E");
        }
        .icon-enemies {
            background-color: transparent;
        }

      </style>
      <div class="status-indicator-glow-vis">
        <div class="status-indicator">
          <div class="status-icon"></div>
          <div class="status-value"></div>
        </div>
      </div>
    `;
    // Select elements
    // Use more specific selectors if needed, but these should work within the vis scope
    this.container = element.querySelector('.status-indicator-glow-vis');
    this.indicator = element.querySelector('.status-indicator');
    this.icon = element.querySelector('.status-icon');
    this.value = element.querySelector('.status-value');
  },

  updateAsync: function(data, element, config, queryResponse, details, done) {
    // Clear any previous errors or states
    this.clearErrors();

    // Handle no data
    if (!data || data.length === 0 || !queryResponse.fields.measure_like[0]) {
       if (this.addError) {
            this.addError({title: "No data", message: "This chart requires one measure."});
       } else {
            console.error("No data or measure found for Status Indicator Glow");
            // Display a fallback message if addError isn't available (older Looker?)
            element.innerHTML = "<div style='padding:10px; text-align: center;'>No data</div>";
       }
      done();
      return;
    }

    // --- Configuration Processing ---
    const indicatorType = config.indicator_type || "rank"; // Default to rank

    // Determine default color based on type if main color isn't set
    let typeDefaultColor = "#34A853"; // Green for rank (default)
    if (indicatorType === "time") {
      typeDefaultColor = "#F2B01E"; // Yellow for time
    } else if (indicatorType === "enemies") {
      typeDefaultColor = "#E53935"; // Red for enemies
    }

    // Use configured color, or fall back to type-based default
    const mainColor = config.font_color || typeDefaultColor;
    const indicatorBgColor = config.indicator_background_color || "#424242"; // Dark grey default
    const fontSize = config.font_size || "48px";
    const borderRadius = `${config.border_radius || 15}px`;
    const borderWidth = `${config.border_width || 4}px`;
    const glowBlur = `${config.glow_blur || 10}px`;
    const glowSpread = `${config.glow_spread || 2}px`;


    // --- Apply Styles ---

    // Indicator Box (Border, Background, Font Size Base, Border Glow)
    this.indicator.style.backgroundColor = indicatorBgColor;
    this.indicator.style.borderColor = mainColor;
    this.indicator.style.borderWidth = borderWidth;
    this.indicator.style.borderRadius = borderRadius;
    this.indicator.style.fontSize = fontSize; // Set base font size here for icon scaling
     // Apply border glow using box-shadow
    this.indicator.style.boxShadow = `0 0 ${glowBlur} ${glowSpread} ${mainColor}`;

    // Icon (Color, Icon Type, Icon Glow)
    if(indicatorType !== "enemies") {
      this.icon.style.backgroundColor = mainColor; // Icon color itself
      // Remove previous icon class
      // Add current icon class (styles defined in CSS)
      this.icon.classList.add(`icon-${indicatorType}`);
      this.icon.classList.remove('icon-time', 'icon-rank', 'icon-enemies');
      // Apply icon glow using filter: drop-shadow
      this.icon.style.filter = `drop-shadow(0 0 ${glowBlur} ${mainColor})`; // Spread isn't directly supported in drop-shadow
    } else {
      this.icon.classList.remove('icon-time', 'icon-rank', 'icon-enemies');
      this.icon.classList.remove('status-icon')
    }

    // Value (Text Color, Text Glow)
    this.value.style.color = mainColor;
    // Font size is inherited from .status-indicator now
    this.value.style.fontSize = fontSize;
    // Apply text glow using text-shadow
    this.value.style.textShadow = `0 0 ${glowBlur} ${mainColor}`; // Spread isn't directly supported in text-shadow


    // --- Data Processing & Display ---
    let value;
    try {
      // Get the first measure value from the first row
      const measureName = queryResponse.fields.measure_like[0].name;
      value = data[0][measureName].value;
    } catch (e) {
       if (this.addError) {
            this.addError({title: "Data Error", message: "Could not retrieve value from data."});
       } else {
            console.error("Error accessing data value:", e);
       }
      value = "Error";
    }

    // Format the value
    let formattedValue = '';
    if (value === "Error" || value === undefined || value === null) {
        formattedValue = "N/A";
    } else if (config.custom_value_format) {
      // Use custom format if provided - simple replacement
      formattedValue = config.custom_value_format.replace(/\{value\}/g, value);
    } else if (indicatorType === "time" && typeof value === 'number') {
      // Format time in seconds to MM:SS.SSS format
      const totalSeconds = value;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      const milliseconds = Math.round((totalSeconds % 1) * 1000); // Use Math.round for cleaner ms

      formattedValue = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    } else {
      // For rank, enemies, or non-numeric/non-time values, just convert to string
      formattedValue = value.toString();
    }

    this.value.textContent = formattedValue;

    // Signal completion
    done();
  }
});
