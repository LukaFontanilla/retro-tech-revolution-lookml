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
        default: "#0a0a20", // Updated to match retro gaming theme
        display_size: "half"
    },
    font_size: {
      type: "string",
      label: "Font Size",
      default: "3rem" // Scalable font sizing
    },
    font_color: {
      type: "string",
      label: "Color (Icon, Text, Border, Glow)",
      default: "", // Default empty to cascade to types
      display_size: "half"
    },
    // Removed separate border_color and background_color as they are derived or distinct
    border_radius: {
      type: "number",
      label: "Border Radius",
      default: 12, // Match modern styling
      display_size: "half"
    },
    border_width: {
      type: "number",
      label: "Border Width",
      default: 3, // Refined solid border weight
      display_size: "half"
    },
    glow_blur: {
        type: "number",
        label: "Glow Blur (px)",
        default: 15, // Enhanced for neon effect
        display_size: "half"
    },
    glow_spread: {
        type: "number",
        label: "Glow Spread (px)",
        default: 1, // Softened spread
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
          padding: 8px; /* Minimized padding to maximize real estate */
          overflow: hidden; /* Prevent potential overflow issues */
          background-color: transparent;
        }
        .status-indicator {
          display: flex;
          align-items: center;
          justify-content: center; /* Center content */
          gap: 15px; /* Space between icon and value */
          padding: 10px 20px; /* Refined padding */
          border-radius: 12px;
          border-style: solid;
          width: 100%;
          height: 100%;
          font-family: 'VT323', 'Outfit', 'Google Sans', sans-serif; /* Integrated brand fonts */
          transition: all 0.3s ease; /* Fluid adjustments */
        }
        .status-icon {
          mask-size: contain;
          mask-repeat: no-repeat;
          mask-position: center;
          -webkit-mask-size: contain;
          -webkit-mask-repeat: no-repeat;
          -webkit-mask-position: center;
          /* Icon will scale with font size */
          width: 0.9em;
          height: 0.9em;
          flex-shrink: 0;
        }
        .status-value {
          font-weight: 700;
          display: flex;
          align-items: center;
          line-height: 1; /* Ensure text aligns well vertically */
          letter-spacing: 1px;
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
            display: none; /* Hide icon wrapper entirely for enemies */
        }

      </style>
      <div class="status-indicator-glow-vis">
        <div class="status-indicator">
          <div class="status-icon"></div>
          <div class="status-value"></div>
        </div>
      </div>
    `;
    this.container = element.querySelector('.status-indicator-glow-vis');
    this.indicator = element.querySelector('.status-indicator');
    this.icon = element.querySelector('.status-icon');
    this.value = element.querySelector('.status-value');
  },

  updateAsync: function(data, element, config, queryResponse, details, done) {
    this.clearErrors();

    if (!data || data.length === 0 || !queryResponse.fields.measure_like[0]) {
       if (this.addError) {
            this.addError({title: "No data", message: "This chart requires one measure."});
       } else {
            console.error("No data or measure found for Status Indicator Glow");
            element.innerHTML = "<div style='padding:10px; text-align: center;'>No data</div>";
       }
      return done();
    }

    const indicatorType = config.indicator_type || "rank";

    // Determine default color based on type if main color isn't set, using theme specs
    let typeDefaultColor = "#34A853";
    if (indicatorType === "time") {
      typeDefaultColor = "#FFC107"; // Neon Amber/Yellow
    } else if (indicatorType === "rank") {
      typeDefaultColor = "#2ECC71"; // Neon Green
    } else if (indicatorType === "enemies") {
      typeDefaultColor = "#E74C3C"; // Neon Red
    }

    const mainColor = config.font_color || typeDefaultColor;
    const indicatorBgColor = config.indicator_background_color || "#0a0a20";
    const fontSize = config.font_size || "3rem";
    const borderRadius = `${config.border_radius || 12}px`;
    const borderWidth = `${config.border_width || 3}px`;
    const glowBlur = `${config.glow_blur || 15}px`;
    const glowSpread = `${config.glow_spread || 1}px`;


    // Apply Styles
    this.indicator.style.backgroundColor = indicatorBgColor;
    this.indicator.style.borderColor = mainColor;
    this.indicator.style.borderWidth = borderWidth;
    this.indicator.style.borderRadius = borderRadius;
    this.indicator.style.fontSize = fontSize;

    // Outer neon glow
    this.indicator.style.boxShadow = `0 0 ${glowBlur} ${glowSpread} ${mainColor}, inset 0 0 10px rgba(0,0,0,0.5)`;

    // Reset Icon
    this.icon.style.display = '';
    this.icon.classList.remove('icon-time', 'icon-rank', 'icon-enemies');

    if (indicatorType !== "enemies") {
      this.icon.style.backgroundColor = mainColor;
      this.icon.classList.add(`icon-${indicatorType}`);
      this.icon.style.filter = `drop-shadow(0 0 ${glowBlur} ${mainColor})`;
    } else {
      this.icon.classList.add('icon-enemies');
      this.icon.style.display = 'none'; // Ensure it collapses
    }

    this.value.style.color = mainColor;
    this.value.style.fontSize = fontSize;
    this.value.style.textShadow = `0 0 ${glowBlur} ${mainColor}`;


    // Data Processing & Display
    let value;
    try {
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
      // Use custom format if provided
      formattedValue = config.custom_value_format.replace(/\{value\}/g, value);
    } else if (indicatorType === "time" && typeof value === 'number') {
      const totalSeconds = value;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      const milliseconds = Math.round((totalSeconds % 1) * 1000);

      formattedValue = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    } else {
      formattedValue = value.toString();
    }

    this.value.textContent = formattedValue;
    done();
  }
});
