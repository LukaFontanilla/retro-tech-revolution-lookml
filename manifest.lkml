project_name: "retro_tech_revolution_demo"

constant: vis_id {
  value: "leaderboard-viz"
  export: override_optional
}
constant: vis_label {
  value: "Leaderboard"
  export: override_optional
}
visualization: {
  id: "@{vis_id}"
  label: "@{vis_label}"
  file: "rankingViz.js"
  dependencies: []
}
