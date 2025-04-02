view: game_play_summaries {
  sql_table_name: `data-cloud-interactive-demo.retro_tech_revolution.game_play_summaries` ;;

  dimension: duration {
    type: number
    sql: ${TABLE}.duration ;;
  }
  dimension: event_end_timestamp {
    type: number
    sql: ${TABLE}.event_end_timestamp ;;
  }
  dimension: event_start_timestamp {
    type: number
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
  }
  dimension: summary_type {
    type: string
    sql: ${TABLE}.summary_type ;;
  }
  measure: count {
    type: count
  }
}
