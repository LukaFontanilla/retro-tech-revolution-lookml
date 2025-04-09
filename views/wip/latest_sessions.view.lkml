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
  }
}
