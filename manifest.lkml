project_name: "retro_tech_revolution_demo"

visualization: {
  id: "leaderboard-viz"
  label: "Leaderboard Stat"
  # file: "visualizations/rankingViz.js"
  dependencies: []
  url: "https://gistcdn.githack.com/LukaFontanilla/73ea6fc25243426eb46b2d13007159aa/raw/6030d21294df86e92530627c097f6a6efe35a1cb/rankingViz.js?min=1"
}

visualization: {
  id: "markdown-viz"
  label: "Markdown Visualization"
  # file: "visualizations/markdownViz.js"
  dependencies: ["https://cdn.jsdelivr.net/npm/marked/marked.min.js"]
  url: "https://gistcdn.githack.com/LukaFontanilla/e66ed7d3bed6fc5e9f9acbb65fe7785a/raw/6de3afda330ccfc8f7608e05874187b1b25c465f/markdown.js?min=1"
}
