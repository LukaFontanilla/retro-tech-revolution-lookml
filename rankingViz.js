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
    this.indicator.style.borderColor = borderColor;
    this.indicator.style.backgroundColor = config.background_color || "#FFFFFF";
    this.value.style.color = fontColor;
    this.value.style.fontSize = fontSize;
    this.icon.style.backgroundColor = fontColor;

    // Make both the value and icon use the same font size for proportional scaling
    this.value.parentNode.style.fontSize = fontSize;

    // Set the appropriate icon based on indicator type
    if (indicatorType === "time") {
      // Clock icon
      this.icon.style.maskImage = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm0 22c-5.514 0-10-4.486-10-10S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10zm-1-10V4h2v7h5v2h-7z\"/></svg>')";
      this.icon.style.webkitMaskImage = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm0 22c-5.514 0-10-4.486-10-10S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10zm-1-10V4h2v7h5v2h-7z\"/></svg>')";
    } else {
      // Star icon
      this.icon.style.maskImage = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M12,1.5l2.61,6.727,6.89.53-5.278,4.688,1.65,6.787L12,16.67,6.129,20.23l1.65-6.788L2.5,8.757l6.891-.53Z\"/></svg>')";
      this.icon.style.webkitMaskImage = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M12,1.5l2.61,6.727,6.89,.53-5.278,4.688,1.65,6.787L12,16.67,6.129,20.23l1.65-6.788L2.5,8.757l6.891-.53Z\"/></svg>')";
    }

    // Get the value from the data
    const value = data[0][queryResponse.fields.measure_like[0].name].value;

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
      formattedValue = value.toString();
    }

    this.value.textContent = formattedValue;

    done();
  }
});
