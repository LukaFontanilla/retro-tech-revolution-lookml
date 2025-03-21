// Combined Status Indicator Visualization for Looker
looker.plugins.visualizations.add({
  id: "status_indicator",
  label: "Status Indicator",
  options: {
    indicator_type: {
      type: "string",
      label: "Indicator Type",
      display: "select",
      values: [
        {"Time": "time"},
        {"Rank": "rank"},
        {"Enemies Defeated": "enemies"}
      ],
      default: "time"
    },
    font_size: {
      type: "string",
      label: "Font Size",
      default: "28px"
    },
    font_color: {
      type: "string",
      label: "Font Color",
      default: "#F2B01E", // Default to yellow (time)
      display_size: "half"
    },
    background_color: {
      type: "string",
      label: "Background Color",
      default: "#FFFFFF",
      display_size: "half"
    },
    border_color: {
      type: "string",
      label: "Border Color",
      default: "#F2B01E", // Default to yellow (time)
      display_size: "half"
    },
    border_radius: {
      type: "number",
      label: "Border Radius",
      default: 10,
      display_size: "half"
    },
    border_width: {
      type: "number",
      label: "Border Width",
      default: 10,
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
        .status-indicator-container {
          height: 100%;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 8px;
          box-sizing: border-box;
        }
        .status-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px 20px;
          border-radius: 10px;
          border: 2px solid #F2B01E;
          background-color: white;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
        }
        .status-icon {
          margin-right: 15px;
          background-color: #F2B01E;
          mask-size: contain;
          mask-repeat: no-repeat;
          mask-position: center;
          -webkit-mask-size: contain;
          -webkit-mask-repeat: no-repeat;
          -webkit-mask-position: center;
          /* Icon will scale with font size */
          width: 1em;
          height: 1em;
          flex-shrink: 0;
        }
        .status-value {
          font-size: 28px;
          font-weight: bold;
          color: #F2B01E;
          font-family: Arial, sans-serif;
          display: flex;
          align-items: center;
        }
      </style>
      <div class="status-indicator-container">
        <div class="status-indicator">
          <div class="status-icon"></div>
          <div class="status-value"></div>
        </div>
      </div>
    `;

    this.container = element.querySelector('.status-indicator-container');
    this.indicator = element.querySelector('.status-indicator');
    this.icon = element.querySelector('.status-icon');
    this.value = element.querySelector('.status-value');
  },

  updateAsync: function(data, element, config, queryResponse, details, done) {
    if (!data || data.length === 0) {
      this.value.textContent = "No data";
      done();
      return;
    }

    // Determine indicator type and set colors appropriately
    const indicatorType = config.indicator_type || "time";

    // Set default colors based on indicator type
    let defaultColor = "#F2B01E"; // Yellow for time

    if (indicatorType === "rank") {
      defaultColor = "#4CAF50"; // Green for rank
    } else if (indicatorType === "enemies") {
      defaultColor = "#E53935"; // Red for enemies defeated
    }

    // Apply configuration options with appropriate defaults
    const fontColor = config.font_color || defaultColor;
    const borderColor = config.border_color || defaultColor;
    const fontSize = config.font_size || "28px";

    this.indicator.style.borderRadius = `${config.border_radius || 10}px`;
    this.indicator.style.borderWidth = `${config.border_width || 10}px`;
    this.indicator.style.borderColor = borderColor;
    this.indicator.style.backgroundColor = config.background_color || "#FFFFFF";
    this.value.style.color = fontColor;
    this.value.style.fontSize = fontSize;
    this.icon.style.backgroundColor = fontColor;

    // Make both the value and icon use the same font size for proportional scaling
    this.indicator.style.fontSize = fontSize;

    // Clock icon SVG - simpler version
    const clockIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-1-13v5h5v2h-7V7h2z"/></svg>`;

    // Star icon SVG - simpler version
    const starIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2l3.1 6.3 6.9.9-5 4.9 1.2 6.9-6.2-3.3-6.2 3.3 1.2-6.9-5-4.9 6.9-.9z"/></svg>`;

    // Robot icon SVG
    const robotIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 14h-1c0-3.9-3.1-7-7-7h-4c-3.9 0-7 3.1-7 7h-1c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v1c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-1h1c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2zm-15 0c0-2.8 2.2-5 5-5h4c2.8 0 5 2.2 5 5v2h-14v-2zm-2 4h18v2h-18v-2zm7-14c-1.7 0-3 1.3-3 3h2c0-.6.4-1 1-1s1 .4 1 1h2c0-1.7-1.3-3-3-3zm6 3c0-1.7-1.3-3-3-3v2c.6 0 1 .4 1 1h2z"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/></svg>`;

    // Set the appropriate icon based on indicator type
    let iconSvg;
    if (indicatorType === "time") {
      iconSvg = clockIcon;
    } else if (indicatorType === "rank") {
      iconSvg = starIcon;
    } else if (indicatorType === "enemies") {
      iconSvg = robotIcon;
    }

    // Set the icon as a data URL
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(iconSvg)}`;
    this.icon.style.maskImage = `url('${dataUrl}')`;
    this.icon.style.webkitMaskImage = `url('${dataUrl}')`;

    // Get the value from the data
    let value;
    try {
      value = data[0][queryResponse.fields.measure_like[0].name].value;
    } catch (e) {
      console.error("Error accessing data value:", e);
      value = "Error";
    }

    // Format the value based on indicator type
    let formattedValue = '';

    if (config.custom_value_format) {
      // Use custom format if provided
      formattedValue = config.custom_value_format.replace(/\{value\}/g, value);
    } else if (indicatorType === "time" && typeof value === 'number') {
      // Format time in seconds to MM:SS.SSS format
      const minutes = Math.floor(value / 60);
      const seconds = Math.floor(value % 60);
      const milliseconds = Math.floor((value % 1) * 1000);

      formattedValue = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    } else {
      // For rank or non-numeric values, just convert to string
      formattedValue = value !== undefined ? value.toString() : "N/A";
    }

    this.value.textContent = formattedValue;

    done();
  }
});
