// First Visualization: Time Indicator (Yellow)
const timeIndicatorOptions = {
  chart: {
    type: 'bar',
    height: 80,
    backgroundColor: 'transparent',
    margin: [0, 0, 0, 0],
    spacing: [0, 0, 0, 0]
  },
  title: {
    text: null
  },
  credits: {
    enabled: false
  },
  tooltip: {
    enabled: false
  },
  legend: {
    enabled: false
  },
  xAxis: {
    visible: false
  },
  yAxis: {
    visible: false
  },
  plotOptions: {
    series: {
      animation: false,
      states: {
        hover: {
          enabled: false
        }
      }
    }
  },
  series: [{
    data: [],
    showInLegend: false,
    enableMouseTracking: false
  }]
};

// Second Visualization: Star Rank Indicator (Green)
const starRankOptions = {
  chart: {
    type: 'bar',
    height: 80,
    backgroundColor: 'transparent',
    margin: [0, 0, 0, 0],
    spacing: [0, 0, 0, 0]
  },
  title: {
    text: null
  },
  credits: {
    enabled: false
  },
  tooltip: {
    enabled: false
  },
  legend: {
    enabled: false
  },
  xAxis: {
    visible: false
  },
  yAxis: {
    visible: false
  },
  plotOptions: {
    series: {
      animation: false,
      states: {
        hover: {
          enabled: false
        }
      }
    }
  },
  series: [{
    data: [],
    showInLegend: false,
    enableMouseTracking: false
  }]
};

// Looker Custom Visualization for Time Indicator
looker.plugins.visualizations.add({
  id: "time_indicator",
  label: "Time Indicator",
  options: {
    font_size: {
      type: "string",
      label: "Font Size",
      default: "28px"
    },
    font_color: {
      type: "string",
      label: "Font Color",
      default: "#F2B01E"
    },
    background_color: {
      type: "string",
      label: "Background Color",
      default: "#FFFFFF"
    },
    border_color: {
      type: "string",
      label: "Border Color",
      default: "#F2B01E"
    },
    border_radius: {
      type: "number",
      label: "Border Radius",
      default: 10
    },
    icon: {
      type: "string",
      label: "Icon Type",
      default: "clock"
    }
  },
  
  create: function(element, config) {
    element.innerHTML = `
      <style>
        .time-indicator-container {
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .time-indicator {
          display: flex;
          align-items: center;
          padding: 10px 20px;
          border-radius: 10px;
          border: 2px solid #F2B01E;
          background-color: white;
        }
        .time-icon {
          margin-right: 15px;
          width: 24px;
          height: 24px;
          background-color: #F2B01E;
          mask-size: contain;
          mask-repeat: no-repeat;
          mask-position: center;
          -webkit-mask-size: contain;
          -webkit-mask-repeat: no-repeat;
          -webkit-mask-position: center;
        }
        .time-value {
          font-size: 28px;
          font-weight: bold;
          color: #F2B01E;
          font-family: Arial, sans-serif;
        }
      </style>
      <div class="time-indicator-container">
        <div class="time-indicator">
          <div class="time-icon"></div>
          <div class="time-value"></div>
        </div>
      </div>
    `;
    
    this.container = element.querySelector('.time-indicator-container');
    this.indicator = element.querySelector('.time-indicator');
    this.icon = element.querySelector('.time-icon');
    this.value = element.querySelector('.time-value');
  },
  
  updateAsync: function(data, element, config, queryResponse, details, done) {
    if (!data || data.length === 0) {
      this.value.textContent = "No data";
      done();
      return;
    }
    
    // Apply configuration options
    this.indicator.style.borderRadius = `${config.border_radius || 10}px`;
    this.indicator.style.borderColor = config.border_color || "#F2B01E";
    this.indicator.style.backgroundColor = config.background_color || "#FFFFFF";
    this.value.style.color = config.font_color || "#F2B01E";
    this.value.style.fontSize = config.font_size || "28px";
    this.icon.style.backgroundColor = config.font_color || "#F2B01E";
    
    // Set the icon
    const iconType = config.icon || "clock";
    if (iconType === "clock") {
      this.icon.style.maskImage = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm0 22c-5.514 0-10-4.486-10-10S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10zm-1-10V4h2v7h5v2h-7z\"/></svg>')";
      this.icon.style.webkitMaskImage = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm0 22c-5.514 0-10-4.486-10-10S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10zm-1-10V4h2v7h5v2h-7z\"/></svg>')";
    }
    
    // Get the time value from the data
    const time = data[0][queryResponse.fields.measure_like[0].name].value;
    
    // Format time in seconds to MM:SS.000 format
    let formattedTime = '';
    if (typeof time === 'number') {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      const milliseconds = Math.floor((time % 1) * 1000);
      
      formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    } else {
      formattedTime = time.toString();
    }
    
    this.value.textContent = formattedTime;
    
    done();
  }
});

// Looker Custom Visualization for Star Rank Indicator
looker.plugins.visualizations.add({
  id: "star_rank_indicator",
  label: "Star Rank Indicator",
  options: {
    font_size: {
      type: "string",
      label: "Font Size",
      default: "28px"
    },
    font_color: {
      type: "string",
      label: "Font Color",
      default: "#4CAF50" // Green
    },
    background_color: {
      type: "string",
      label: "Background Color",
      default: "#FFFFFF"
    },
    border_color: {
      type: "string",
      label: "Border Color",
      default: "#4CAF50" // Green
    },
    border_radius: {
      type: "number",
      label: "Border Radius",
      default: 10
    }
  },
  
  create: function(element, config) {
    element.innerHTML = `
      <style>
        .star-rank-container {
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .star-rank {
          display: flex;
          align-items: center;
          padding: 10px 20px;
          border-radius: 10px;
          border: 2px solid #4CAF50;
          background-color: white;
        }
        .star-icon {
          margin-right: 15px;
          width: 24px;
          height: 24px;
          background-color: #4CAF50;
          mask-size: contain;
          mask-repeat: no-repeat;
          mask-position: center;
          -webkit-mask-size: contain;
          -webkit-mask-repeat: no-repeat;
          -webkit-mask-position: center;
          mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,1.5l2.61,6.727,6.89.53-5.278,4.688,1.65,6.787L12,16.67,6.129,20.23l1.65-6.788L2.5,8.757l6.891-.53Z"/></svg>');
          -webkit-mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,1.5l2.61,6.727,6.89.53-5.278,4.688,1.65,6.787L12,16.67,6.129,20.23l1.65-6.788L2.5,8.757l6.891-.53Z"/></svg>');
        }
        .rank-value {
          font-size: 28px;
          font-weight: bold;
          color: #4CAF50;
          font-family: Arial, sans-serif;
        }
      </style>
      <div class="star-rank-container">
        <div class="star-rank">
          <div class="star-icon"></div>
          <div class="rank-value"></div>
        </div>
      </div>
    `;
    
    this.container = element.querySelector('.star-rank-container');
    this.indicator = element.querySelector('.star-rank');
    this.icon = element.querySelector('.star-icon');
    this.value = element.querySelector('.rank-value');
  },
  
  updateAsync: function(data, element, config, queryResponse, details, done) {
    if (!data || data.length === 0) {
      this.value.textContent = "No data";
      done();
      return;
    }
    
    // Apply configuration options
    this.indicator.style.borderRadius = `${config.border_radius || 10}px`;
    this.indicator.style.borderColor = config.border_color || "#4CAF50";
    this.indicator.style.backgroundColor = config.background_color || "#FFFFFF";
    this.value.style.color = config.font_color || "#4CAF50";
    this.value.style.fontSize = config.font_size || "28px";
    this.icon.style.backgroundColor = config.font_color || "#4CAF50";
    
    // Get the rank value from the data
    const rank = data[0][queryResponse.fields.measure_like[0].name].value;
    
    this.value.textContent = rank;
    
    done();
  }
});
