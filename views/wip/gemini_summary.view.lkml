view: gemini_summary {
  sql_table_name: `data-cloud-interactive-demo.retro_tech_revolution.gemini_summary` ;;

  dimension: event_end_timestamp {
    type: string
    sql: ${TABLE}.event_end_timestamp ;;
  }
  dimension: event_start_timestamp {
    type: string
    sql: ${TABLE}.event_start_timestamp ;;
  }
  dimension_group: ingestion_timestamp {
    type: time
    timeframes: [raw, time, date, week, month, quarter, year]
    sql: ${TABLE}.ingestion_timestamp ;;
  }
  dimension: screenshot_uri {
    type: string
    sql: ${TABLE}.screenshot_uri ;;
  }
  dimension: session_id {
    type: string
    sql: ${TABLE}.session_id ;;
  }
  dimension: summary_text {
    type: string
    sql: ${TABLE}.summary_text ;;
    html: <div class="vis"><span style="text-wrap:auto;font-size:0.6em;">{{value}}</span></div> ;;
  }
  measure: count {
    type: count
  }
}
