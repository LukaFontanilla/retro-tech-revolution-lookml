view: screenshots {
  sql_table_name: `data-cloud-interactive-demo.retro_tech_revolution.screenshots` ;;

  dimension: encoded_screenshot {
    type: string
    sql: ${TABLE}.encoded_screenshot ;;
    html: <img src="data:image/jpeg;base64,{{value}}" width="100px" height="100px"/> ;;
    description: "Reference to screenshot taken during the event"
    label: "Screenshot"
  }
  dimension: screenshot_url {
    type: string
    sql: ${TABLE}.screenshot_url ;;
  }
  dimension: session_id {
    type: string
    sql: ${TABLE}.session_id ;;
  }
  dimension: timestamp {
    type: string
    sql: ${TABLE}.timestamp ;;
  }
  measure: count {
    type: count
  }
}
