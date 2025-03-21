looker.plugins.visualizations.add(
  { create: function(element, config) {
      element.innerHTML = ` <div id="container" style=" width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; padding: 20px; box-sizing: border-box; "> <div id="content" style=" border: 2px solid #ffc107; border-radius: 10px; padding: 20px; background-color: #fff; box-shadow: 0 4px 8px rgba(0,0,0,0.1); text-align: center; "> <span id="value" style=" font-size: 2em; color: #333; display: block; "></span> </div> </div> `;
    },
    updateAsync: function(data, element, config, queryResponse, details, doneRendering) {
      this.clearErrors();
      if (!queryResponse || !queryResponse.fields || !queryResponse.fields.dimensions || queryResponse.fields.dimensions.length === 0) {
        this.addError({title: "Missing Dimensions", message: "This visualization requires at least one dimension."}); return;
      }
      const firstDimension = queryResponse.fields.dimensions[0].name;
      const value = data && data.length > 0 && data[0][firstDimension] ? LookerCharts.Utils.htmlForCell(data[0][firstDimension]) : "No Data";
      const container = element.querySelector("#container");
      const content = element.querySelector("#content");
      const valueSpan = element.querySelector("#value"); valueSpan.innerHTML = value;
      // Apply configuration options
      content.style.borderWidth = config.borderWidth ? config.borderWidth + "px" : "2px";
      content.style.borderColor = config.borderColor || "#ffc107";
      content.style.borderRadius = config.borderRadius ? config.borderRadius + "px" : "10px";
      valueSpan.style.fontSize = config.fontSize ? config.fontSize + "em" : "2em";
      valueSpan.style.color = config.fontColor || "#333";
      container.style.backgroundColor = config.backgroundColor || "transparent";
      content.style.backgroundColor = config.contentBackgroundColor || "#fff";
      content.style.padding = config.contentPadding ? config.contentPadding + "px" : "20px";
      doneRendering();
    },
    options: {
      fontSize: {
        type: "number",
        label: "Font Size (em)",
        default: 2,
        section: "Style",
        order: 1
      },
      fontColor: { type: "string", label: "Font Color", display: "color", default: "#333", section: "Style", order: 2 }, borderWidth: { type: "number", label: "Border Width (px)", default: 2, section: "Border", order: 1 }, borderColor: { type: "string", label: "Border Color", display: "color", default: "#ffc107", section: "Border", order: 2 }, borderRadius: { type: "number", label: "Border Radius (px)", default: 10, section: "Border", order: 3 }, backgroundColor: { type: "string", label: "Background Color", display: "color", default: "transparent", section: "Container", order: 1 }, contentBackgroundColor: { type: "string", label: "Content Background Color", display: "color", default: "#fff", section: "Content", order: 1 }, contentPadding: { type: "number", label: "Content Padding (px)", default: 20, section: "Content", order: 2 } } });
