/**
 * Looker Custom Markdown Visualization
 * Displays markdown content from the first dimension column and first value
 * Requires marked.js library for markdown parsing
 */

looker.plugins.visualizations.add({
  id: "markdown_viz",
  label: "Markdown",

  options: {
    // Font styling options
    font_family: {
      type: "string",
      label: "Font Family",
      default: "Helvetica, Arial, sans-serif",
      section: "Typography",
      order: 1
    },
    font_size: {
      type: "number",
      label: "Base Font Size (px)",
      default: 14,
      section: "Typography",
      order: 2
    },
    heading_scale: {
      type: "number",
      label: "Heading Scale",
      default: 1.2,
      display: "range",
      min: 1,
      max: 2,
      step: 0.1,
      section: "Typography",
      order: 3
    },
    line_height: {
      type: "number",
      label: "Line Height",
      default: 1.5,
      display: "range",
      min: 1,
      max: 2,
      step: 0.1,
      section: "Typography",
      order: 4
    },

    // Container styling
    container_padding: {
      type: "number",
      label: "Container Padding (px)",
      default: 16,
      section: "Container",
      order: 1
    },
    text_alignment: {
      type: "string",
      label: "Text Alignment",
      display: "select",
      values: [
        {"Left": "left"},
        {"Center": "center"},
        {"Right": "right"},
        {"Justify": "justify"}
      ],
      default: "left",
      section: "Container",
      order: 2
    },
    content_max_width: {
      type: "number",
      label: "Content Max Width (px, 0 = unrestricted)",
      default: 0,
      section: "Container",
      order: 3
    },

    // Colors
    text_color: {
      type: "string",
      label: "Text Color",
      display: "color",
      default: "#2E2E2E",
      section: "Colors",
      order: 1
    },
    link_color: {
      type: "string",
      label: "Link Color",
      display: "color",
      default: "#2196F3",
      section: "Colors",
      order: 2
    },
    background_color: {
      type: "string",
      label: "Background Color",
      display: "color",
      default: "#FFFFFF",
      section: "Colors",
      order: 3
    },

    // Advanced styling
    custom_css: {
      type: "string",
      label: "Custom CSS",
      display: "text",
      default: "",
      section: "Advanced",
      order: 1
    },
    enable_syntax_highlighting: {
      type: "boolean",
      label: "Enable Syntax Highlighting",
      default: true,
      section: "Advanced",
      order: 2
    }
  },

  // Create a container element
  create: function(element, config) {
    // Load Marked.js from CDN
    if (!window.marked) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
      script.async = true;
      document.head.appendChild(script);
    }

    // Optional: Load Prism.js for syntax highlighting if enabled
    this.syntaxHighlightingLoaded = false;

    // Create container elements
    this.container = element.appendChild(document.createElement("div"));
    this.container.className = "markdown-visualization";

    // Create style element for custom styling
    this.styleElement = document.createElement("style");
    document.head.appendChild(this.styleElement);
  },

  // Update on data or settings change
  updateAsync: function(data, element, config, queryResponse, details, done) {
    // Clear any errors from previous updates
    this.clearErrors();

    // Check if we have data
    if (!data || data.length === 0) {
      this.addError({ title: "No Data", message: "This visualization requires a query result with at least one row." });
      return done();
    }

    // Check if we have at least one dimension and one measure/dimension
    if (!queryResponse.fields.dimensions || queryResponse.fields.dimensions.length === 0) {
      this.addError({ title: "Dimension Required", message: "This visualization requires at least one dimension." });
      return done();
    }

    // Get the first dimension field name
    var dimensionFieldName = queryResponse.fields.dimensions[0].name;

    // Check if we have a value field (could be a measure or a second dimension)
    var valueFieldName;
    if (queryResponse.fields.measures && queryResponse.fields.measures.length > 0) {
      valueFieldName = queryResponse.fields.measures[0].name;
    } else if (queryResponse.fields.dimensions.length > 1) {
      valueFieldName = queryResponse.fields.dimensions[1].name;
    } else {
      this.addError({ title: "Value Field Required", message: "This visualization requires a measure or a second dimension for the Markdown content." });
      return done();
    }

    // Get the dimensions and markdown content from the first row
    var firstRow = data[0];
    var dimensionValue = firstRow[dimensionFieldName].value;
    var markdownContent = LookerCharts.Utils.textForCell(firstRow[valueFieldName]);

    // Wait for Marked.js to load
    var renderMarkdown = () => {
      if (!window.marked) {
        setTimeout(renderMarkdown, 100);
        return;
      }

      // Configure marked options
      marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: true,
        headerPrefix: 'markdown-viz-heading-'
      });

      // Load syntax highlighting if needed and not already loaded
      if (config.enable_syntax_highlighting && !this.syntaxHighlightingLoaded) {
        var prismCss = document.createElement('link');
        prismCss.rel = 'stylesheet';
        prismCss.href = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism.min.css';
        document.head.appendChild(prismCss);

        var prismScript = document.createElement('script');
        prismScript.src = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js';
        prismScript.async = true;
        document.head.appendChild(prismScript);

        this.syntaxHighlightingLoaded = true;
      }

      // Apply the configuration styling
      this.applyStyles(config);

      // Render markdown to HTML
      this.container.innerHTML = marked.parse(markdownContent);

      // If syntax highlighting is enabled, try to apply it
      if (config.enable_syntax_highlighting && window.Prism) {
        Prism.highlightAllUnder(this.container);
      }

      // Signal that the visualization has finished rendering
      done();
    };

    renderMarkdown();
  },

  // Apply styling from configuration
  applyStyles: function(config) {
    // Build CSS based on configuration
    var css = `
      .markdown-visualization {
        font-family: ${config.font_family};
        font-size: ${config.font_size}px;
        line-height: ${config.line_height};
        color: ${config.text_color};
        background-color: ${config.background_color};
        padding: ${config.container_padding}px;
        text-align: ${config.text_alignment};
        ${config.content_max_width > 0 ? `max-width: ${config.content_max_width}px; margin: 0 auto;` : ''}
        overflow-wrap: break-word;
        word-wrap: break-word;
      }

      .markdown-visualization h1 {
        font-size: ${config.font_size * Math.pow(config.heading_scale, 4)}px;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        font-weight: 600;
      }

      .markdown-visualization h2 {
        font-size: ${config.font_size * Math.pow(config.heading_scale, 3)}px;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        font-weight: 600;
      }

      .markdown-visualization h3 {
        font-size: ${config.font_size * Math.pow(config.heading_scale, 2)}px;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        font-weight: 600;
      }

      .markdown-visualization h4 {
        font-size: ${config.font_size * config.heading_scale}px;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        font-weight: 600;
      }

      .markdown-visualization h5, .markdown-visualization h6 {
        font-size: ${config.font_size}px;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        font-weight: 600;
      }

      .markdown-visualization a {
        color: ${config.link_color};
        text-decoration: underline;
      }

      .markdown-visualization img {
        max-width: 100%;
        height: auto;
      }

      .markdown-visualization pre {
        background-color: rgba(0, 0, 0, 0.05);
        padding: 1em;
        border-radius: 4px;
        overflow-x: auto;
      }

      .markdown-visualization code {
        font-family: monospace;
        background-color: rgba(0, 0, 0, 0.05);
        padding: 0.2em 0.4em;
        border-radius: 3px;
      }

      .markdown-visualization pre code {
        background-color: transparent;
        padding: 0;
      }

      .markdown-visualization blockquote {
        border-left: 4px solid #ddd;
        padding-left: 1em;
        margin-left: 0;
        color: #666;
      }

      .markdown-visualization table {
        border-collapse: collapse;
        width: 100%;
        margin: 1em 0;
      }

      .markdown-visualization th, .markdown-visualization td {
        border: 1px solid #ddd;
        padding: 0.5em;
      }

      .markdown-visualization th {
        background-color: rgba(0, 0, 0, 0.05);
      }

      .markdown-visualization ul, .markdown-visualization ol {
        padding-left: 2em;
      }

      .markdown-visualization hr {
        border: none;
        border-top: 1px solid #ddd;
        margin: 2em 0;
      }

      /* Custom CSS */
      ${config.custom_css}
    `;

    // Apply the CSS
    this.styleElement.innerHTML = css;
  }
});
