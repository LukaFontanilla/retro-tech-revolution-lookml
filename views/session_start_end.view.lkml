
view: session_start_end {
  derived_table: {
    sql: SELECT
          v_all_events.session_id  AS v_all_events_session_id,
          v_all_events.client_id  AS v_all_events_client_id,
          MIN(TIMESTAMP_SECONDS(CAST(TRUNC(CAST(v_all_events.ts AS NUMERIC)) AS INT64)) ) AS v_all_events_session_start,
          MAX(TIMESTAMP_SECONDS(CAST(TRUNC(CAST(v_all_events.ts AS NUMERIC)) AS INT64)) ) AS v_all_events_session_end,
          COUNT(DISTINCT enemy_id) AS total_enemy_count,
      FROM `retro_tech_revolution.v_all_events`  AS v_all_events
      GROUP BY
          1,
          2
      ORDER BY
          3 DESC ;;
  }

  measure: count {
    hidden: yes
    type: count
    drill_fields: [detail*]
  }

  dimension: primary_key {
    type: string
    hidden: yes
    primary_key: yes
    sql: ${v_all_events_session_id} || "-" || ${v_all_events_client_id} ;;
  }

  dimension: v_all_events_session_id {
    type: string
    sql: ${TABLE}.v_all_events_session_id ;;
  }

  dimension: total_enemy_count {
    type: number
    sql: ${TABLE}.total_enemy_count ;;
  }

  dimension: v_all_events_client_id {
    type: string
    sql: ${TABLE}.v_all_events_client_id ;;
  }

  dimension_group: v_all_events_session_start {
    type: time
    timeframes: [raw,time]
    sql: ${TABLE}.v_all_events_session_start ;;
  }

  dimension_group: v_all_events_session_end {
    type: time
    timeframes: [raw,time]
    sql: ${TABLE}.v_all_events_session_end ;;
  }

  dimension_group: v_all_events_session_duration {
    type: duration
    intervals: [second,minute]
    sql_start: ${v_all_events_session_start_raw} ;;
    sql_end: ${v_all_events_session_end_raw} ;;
  }

  measure: average_enemy_count_by_session {
    type: average
    sql: ${total_enemy_count} ;;
  }

  set: detail {
    fields: [
        v_all_events_session_id,
  v_all_events_client_id,
  v_all_events_session_start_time,
  v_all_events_session_end_time
    ]
  }
}
