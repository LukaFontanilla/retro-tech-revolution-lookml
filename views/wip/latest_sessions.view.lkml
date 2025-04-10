view: latest_sessions {
  derived_table: {
    sql:  SELECT
        session_id,
        MAX(ts) AS session_start
      FROM `retro_tech_revolution.v_all_events`
      GROUP BY 1
      ORDER BY 2 desc
      LIMIT 15
      ;;
  }

  dimension: latest_session_ids {
    type: string
    sql: ${TABLE}.session_id ;;
    suggest_persist_for: "0 minutes"
  }

  dimension_group: session_start {
    type: time
    timeframes: [raw, time, date, week, month, quarter, year, hour_of_day, day_of_week]
    sql: TIMESTAMP_SECONDS(CAST(TRUNC(CAST(${TABLE}.session_start AS NUMERIC)) AS INT64)) ;;
    description: "Time when the session started"
    label: "Session Start"
  }
}
