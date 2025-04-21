project_name: "retro_tech_revolution_demo"

visualization: {
  id: "leaderboard-viz"
  label: "Leaderboard Stat"
  file: "visualizations/rankingViz.js"
  dependencies: []
}

visualization: {
  id: "markdown-viz"
  label: "Markdown Visualization"
  file: "visualizations/markdownViz.js"
  dependencies: ["https://cdn.jsdelivr.net/npm/marked/marked.min.js"]
}
