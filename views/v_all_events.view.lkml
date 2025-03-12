# The name of this view in Looker is "V All Events"
view: v_all_events {
  # The sql_table_name parameter indicates the underlying database table
  # to be used for all fields in this view.
  sql_table_name: `retro_tech_revolution.v_all_events` ;;

  # No primary key is defined for this view. In order to join this view in an Explore,
  # define primary_key: yes on a dimension that has no repeated values.

    # Here's what a typical dimension looks like in LookML.
    # A dimension is a groupable field that can be used to filter query results.
    # This dimension will be called "Bullet Type" in Explore.
  parameter: selected_client {
    type: string
    suggest_dimension: client_id
  }

  dimension: selected_client_vs_rest {
    type: string
    description: "Use with parameter 'selected_client' to compare selected client against Average of the rest"
    sql: CASE
          WHEN ${client_id} = {% parameter selected_client %} THEN ${client_id}
          ELSE 'Other'
         END
    ;;
  }

  dimension: bullet_type {
    type: string
    sql: ${TABLE}.bullet_type ;;
  }

  dimension: client_id {
    type: string
    sql: ${TABLE}.client_id ;;
  }

  dimension: enemy_health {
    type: string
    sql: ${TABLE}.enemy_health ;;
  }

  dimension: enemy_hit_count {
    type: string
    sql: ${TABLE}.enemy_hit_count ;;
  }

  dimension: enemy_id {
    type: string
    sql: ${TABLE}.enemy_id ;;
  }

  dimension: enemy_points {
    type: string
    sql: ${TABLE}.enemy_points ;;
  }

  dimension: enemy_type {
    type: string
    sql: ${TABLE}.enemy_type ;;
  }

  dimension: event_type {
    type: string
    sql: ${TABLE}.event_type ;;
  }

  dimension: help {
    type: string
    sql: ${TABLE}.help ;;
  }

  dimension: new_difficulty {
    type: string
    sql: ${TABLE}.new_difficulty ;;
  }

  dimension: player_health {
    type: number
    sql: CAST(${TABLE}.player_health as NUMERIC) ;;
  }

  dimension: player_hit_count {
    type: number
    sql: CAST(${TABLE}.player_hit_count AS NUMERIC) ;;
  }

  dimension: player_left_stick_x {
    type: string
    sql: ${TABLE}.player_left_stick_x ;;
  }

  dimension: player_left_stick_y {
    type: string
    sql: ${TABLE}.player_left_stick_y ;;
  }

  dimension: player_points {
    type: number
    sql: CAST(${TABLE}.player_points AS NUMERIC) ;;
  }

  dimension: player_x {
    type: string
    sql: ${TABLE}.player_x ;;
  }

  dimension: player_y {
    type: string
    sql: ${TABLE}.player_y ;;
  }

  dimension: prompt_text {
    type: string
    sql: ${TABLE}.prompt_text ;;
  }

  dimension: reason {
    type: string
    sql: ${TABLE}.reason ;;
  }

  dimension: score {
    type: number
    sql: CAST(${TABLE}.score AS NUMERIC) ;;
  }

  dimension: screenshot {
    type: string
    sql: ${TABLE}.screenshot ;;
  }

  dimension: session_id {
    type: string
    sql: ${TABLE}.session_id ;;
  }

  dimension: stopwatch {
    type: number
    sql: CAST(${TABLE}.stopwatch AS NUMERIC) ;;
  }

  dimension: ts {
    type: string
    hidden: yes
    sql: ${TABLE}.ts ;;
  }

  dimension_group: timestamp {
    type: time
    timeframes: [raw,second,minute,hour,date,hour_of_day]
    sql: TIMESTAMP_SECONDS(CAST(TRUNC(CAST(${TABLE}.ts AS NUMERIC)) AS INT64)) ;;
  }

  # dimension_group: session_duration {
  #   type: duration
  #   intervals: [second,minute]
  #   st
  # }

  measure: session_start {
    sql: MIN(${timestamp_raw}) ;;
  }

  measure: session_end {
    sql: MAX(${timestamp_raw}) ;;
  }

  measure: session_duration {
    type: number
    sql: TIMESTAMP_DIFF(${session_end},${session_start},SECOND) ;;
  }

  measure: health_overtime {
    type: average
    sql: ${player_health} ;;
  }

  measure: score_overtime {
    type: average
    sql: ${score} ;;
  }

  measure: stopwatch_overtime {
    type: average
    sql: ${stopwatch} ;;
  }

  measure: game_duration {
    type: average
    filters: [event_type: "on_gameover_screen_entered"]
    sql: ${stopwatch} ;;
  }

  measure: average_player_hit_count {
    type: average
    sql: ${player_hit_count} ;;
  }

  measure: enemy_count {
    type: count_distinct
    sql: ${enemy_id} ;;
  }

  measure: count {
    type: count
  }
}
