# views/sessions.view.lkml
view: sessions {
  derived_table: {
    sql:
      SELECT
        session_id,
        client_id,
        MIN(ts) AS session_start,
        MAX(ts) AS session_end,
        TIMESTAMP_DIFF(
          MAX(TIMESTAMP_SECONDS(CAST(TRUNC(CAST(ts AS NUMERIC)) AS INT64)) )
          , MIN(TIMESTAMP_SECONDS(CAST(TRUNC(CAST(ts AS NUMERIC)) AS INT64)) )
        , SECOND) / 60.0 AS session_duration_minutes,
        MAX(CAST(score AS NUMERIC)) AS max_score,
        MAX(CAST(player_points AS NUMERIC)) AS max_player_points,
        COUNTIF(CAST(enemy_health AS NUMERIC) = 0) AS enemies_defeated,
        COUNTIF(event_type = 'on_player_health_depleted') AS player_deaths,
        COUNTIF(event_type IN ('on_gemini_help_requested', 'on_received_gemini_help')) AS gemini_help_interactions,
        COUNTIF(event_type IN ('on_gemini_backstory_requested', 'on_gemini_backstory_text_received',
                             'on_gemini_backstory_text_received - issue with image')) AS gemini_backstory_interactions,
        CASE
          WHEN COUNTIF(event_type = 'on_level1_screen_entered') > 0 THEN 1
          ELSE 0
        END AS reached_level1,
        CASE
          WHEN COUNTIF(event_type = 'on_boss1_screen_entered') > 0 THEN 1
          ELSE 0
        END AS reached_boss1,
        COUNTIF(event_type = 'on_trivia_question_received') AS trivia_questions_received,
        MAX(CASE WHEN event_type = 'on_player_moving' THEN 1 ELSE 0 END) AS player_moved,
        SUM(CASE WHEN event_type = 'on_weapon_changed' THEN 1 ELSE 0 END) AS tool_changed,
        SUM(CASE WHEN event_type = 'on_bullet_created' THEN 1 ELSE 0 END) AS tool_used,
        MAX(CASE WHEN event_type = 'on_player_taking_damage' THEN 1 ELSE 0 END) AS took_damage
      FROM `retro_tech_revolution.v_all_events`
      GROUP BY 1, 2
    ;;
    # persist_for: "8 hours"
  }

  parameter: selected_session {
    suggest_explore: latest_sessions
    suggest_dimension: latest_session_ids
    label: "Selected Game Session"
    type: unquoted
    suggest_persist_for: "0 seconds"
  }

  dimension: selected_client_vs_rest_bool {
    type: yesno
    hidden: yes
    sql: ${session_id} = "{% parameter selected_session %}" ;;
  }

  dimension: selected_client_vs_rest {
    type: string
    description: "Use with parameter 'selected_session' to compare selected session against Average of the rest"
    sql: CASE
          WHEN ${session_id} = "{% parameter selected_session %}" THEN ${session_id}
          ELSE 'Other'
         END
    ;;
  }

  dimension: session_id {
    primary_key: yes
    type: string
    sql: ${TABLE}.session_id ;;
    # html: {% if selected_session._parameter_value === value %}
    #         ;;
    description: "Unique identifier for the game session"
    label: "Session ID"
    suggest_persist_for: "0 seconds"
  }

  dimension: session_id_formatted {
    type: string
    sql: ${TABLE}.session_id ;;
    hidden: yes
    html: {% if selected_session._parameter_value == value %}
    <div style="
    background-color: transparent; /* Dark background */
    display:flex;
    flex-direction: row;
    border-radius: 10px; /* Rounded corners */
    padding: 8px 15px; /* Padding inside the box */
    margin: 0.8rem; /* Existing margin */
    display: flex; /* Enable flexbox for layout */
    align-items: center; /* Vertically center items */
    gap: 12px; /* Space between star and text */
    /* --- Green Outer Glow --- */
    box-shadow:
    0 0 4px #39FF14, /* Inner sharp glow (Neon Green) */
    0 0 12px #39FF14, /* Medium glow */
    0 0 25px rgba(57, 255, 20, 0.7); /* Wider, slightly transparent glow */
    ">
    <span style=" /* Star Styling */
    font-size: 1.2rem; /* Adjust size as needed */
    line-height: 1; /* Prevent extra vertical space */
    color: #90EE90; /* Lighter green for the star itself */
    /* --- Green Text Glow --- */
    text-shadow:
    0 0 3px #39FF14, /* Inner glow (Neon Green) */
    0 0 8px #39FF14, /* Medium glow */
    0 0 15px rgba(57, 255, 20, 0.6); /* Wider glow */
    ">★</span>
    <span style=" /* Text Styling */
    color: #90EE90; /* Lighter green for text */
    font-weight: bold;
    font-size: 1.2rem; /* Matching star size */
    font-family: 'Courier New', monospace; /* Optional: Monospace font for number look */
    line-height: 1; /* Prevent extra vertical space */
    /* --- Green Text Glow --- */
    text-shadow:
    0 0 3px #39FF14, /* Inner glow (Neon Green) */
    0 0 8px #39FF14, /* Medium glow */
    0 0 15px rgba(57, 255, 20, 0.6); /* Wider glow */
    ">{{ rendered_value }}</span>
    </div>
    {% else %}
    {{ value }}
      {% endif %};;
    description: "Unique identifier for the game session"
    label: "Session ID Formatted"
  }

  dimension: client_id {
    type: string
    sql: ${TABLE}.client_id ;;
    description: "Unique identifier for the game client/installation"
    label: "Client ID"
  }

  dimension_group: session_start {
    type: time
    timeframes: [raw, time, date, week, month, quarter, year, hour_of_day, day_of_week]
    sql: ${TABLE}.session_start ;;
    description: "Time when the session started"
    label: "Session Start"
  }

  dimension_group: session_end {
    type: time
    timeframes: [raw, time, date, week, month]
    sql: ${TABLE}.session_end ;;
    description: "Time when the session ended"
    label: "Session End"
  }

  dimension: session_duration_minutes {
    type: number
    sql: ${TABLE}.session_duration_minutes ;;
    description: "Duration of the session in minutes"
    label: "Session Duration (min)"
    value_format_name: decimal_1
  }

  dimension: session_duration_tier {
    type: tier
    tiers: [5, 15, 30, 60]
    style: integer
    sql: ${session_duration_minutes} ;;
    description: "Session duration grouped into tiers"
    label: "Session Duration Tier"
  }

  dimension: max_score {
    hidden: yes
    type: number
    sql: ${TABLE}.max_score ;;
    description: "Maximum score achieved in the session"
    label: "Max Score: dimension"
  }

  dimension: score_tier {
    type: tier
    tiers: [1000, 5000, 10000, 50000]
    style: integer
    sql: ${max_score} ;;
    description: "Score grouped into tiers for easier analysis"
    label: "Score Tier"
  }

  # dimension: max_player_points {
  #   type: number
  #   sql: ${TABLE}.max_player_points ;;
  #   description: "Maximum player points achieved in the session"
  #   label: "Max Player Points"
  # }

  dimension: enemies_defeated {
    type: number
    sql: ${TABLE}.enemies_defeated ;;
    description: "Number of enemies defeated in the session"
    label: "Enemies Defeated"
  }

  dimension: player_deaths {
    type: number
    sql: ${TABLE}.player_deaths ;;
    description: "Number of player deaths in the session"
    label: "Player Deaths"
  }

  dimension: gemini_help_interactions {
    type: number
    sql: ${TABLE}.gemini_help_interactions ;;
    description: "Number of Gemini help interactions in the session"
    label: "Gemini Help Interactions"
  }

  dimension: gemini_backstory_interactions {
    type: number
    sql: ${TABLE}.gemini_backstory_interactions ;;
    description: "Number of Gemini backstory interactions in the session"
    label: "Gemini Backstory Interactions"
  }

  dimension: total_gemini_interactions {
    type: number
    sql: ${gemini_help_interactions} + ${gemini_backstory_interactions} ;;
    description: "Total number of Gemini interactions in the session"
    label: "Total Gemini Interactions"
  }

  dimension: has_used_gemini {
    type: yesno
    sql: ${total_gemini_interactions} > 0 ;;
    description: "Indicates if Gemini was used during this session"
    label: "Has Used Gemini"
    group_label: "Gemini Usage"
  }

  dimension: gemini_usage_tier {
    type: tier
    tiers: [1, 3, 5, 10]
    style: integer
    sql: ${total_gemini_interactions} ;;
    description: "Gemini usage grouped into tiers"
    label: "Gemini Usage Tier"
    group_label: "Gemini Usage"
  }

  dimension: reached_level1 {
    type: yesno
    sql: ${TABLE}.reached_level1 = 1 ;;
    description: "Indicates if the player reached level 1 in this session"
    label: "Reached Level 1"
    group_label: "Game Progress"
  }

  dimension: reached_boss1 {
    type: yesno
    sql: ${TABLE}.reached_boss1 = 1 ;;
    description: "Indicates if the player reached boss 1 in this session"
    label: "Reached Boss 1"
    group_label: "Game Progress"
  }

  dimension: trivia_questions_received {
    type: number
    sql: ${TABLE}.trivia_questions_received ;;
    description: "Number of trivia questions received in the session"
    label: "Trivia Questions Received"
  }

  dimension: has_trivia_interaction {
    type: yesno
    sql: ${trivia_questions_received} > 0 ;;
    description: "Indicates if the player interacted with trivia during the session"
    label: "Has Trivia Interaction"
  }

  dimension: player_moved {
    type: yesno
    sql: ${TABLE}.player_moved = 1 ;;
    description: "Indicates if the player moved during the session"
    label: "Player Moved"
    group_label: "Player Activity"
  }

  dimension: took_damage {
    type: yesno
    sql: ${TABLE}.took_damage = 1 ;;
    description: "Indicates if the player took damage during the session"
    label: "Took Damage"
    group_label: "Player Activity"
  }

  dimension: kill_death_ratio {
    type: number
    sql: CASE WHEN ${player_deaths} > 0 THEN ${enemies_defeated} / ${player_deaths} ELSE ${enemies_defeated} END ;;
    description: "Ratio of enemies defeated to player deaths"
    label: "Kill/Death Ratio"
    value_format_name: decimal_2
  }

  dimension: session_skill_rating {
    type: number
    sql:
      CASE
        WHEN ${player_deaths} = 0 AND ${enemies_defeated} > 10 THEN 100
        WHEN ${player_deaths} = 0 THEN 90
        ELSE GREATEST(0, LEAST(100,
          50 + (${enemies_defeated} * 5) - (${player_deaths} * 10) +
          (CASE WHEN ${reached_boss1} THEN 20 ELSE 0 END)
        ))
      END ;;
    description: "Calculated skill rating for the session based on performance metrics"
    label: "Session Skill Rating"
    value_format_name: decimal_0
  }

  dimension: skill_tier {
    type: string
    sql:
      CASE
        WHEN ${session_skill_rating} >= 80 THEN 'Expert'
        WHEN ${session_skill_rating} >= 60 THEN 'Advanced'
        WHEN ${session_skill_rating} >= 40 THEN 'Intermediate'
        WHEN ${session_skill_rating} >= 20 THEN 'Novice'
        ELSE 'Beginner'
      END ;;
    description: "Skill tier based on session skill rating"
    label: "Skill Tier"
  }

  dimension: engagement_score {
    type: number
    sql:
      (${session_duration_minutes} * 0.5) +
      (${total_gemini_interactions} * 2) +
      (${enemies_defeated} * 0.5) +
      (${trivia_questions_received} * 2) +
      (CASE WHEN ${reached_level1} THEN 5 ELSE 0 END) +
      (CASE WHEN ${reached_boss1} THEN 10 ELSE 0 END) ;;
    description: "Calculated engagement score based on session activities"
    label: "Engagement Score"
    value_format_name: decimal_0
  }

  dimension: engagement_tier {
    type: string
    sql:
      CASE
        WHEN ${engagement_score} >= 50 THEN 'Highly Engaged'
        WHEN ${engagement_score} >= 25 THEN 'Engaged'
        WHEN ${engagement_score} >= 10 THEN 'Moderately Engaged'
        ELSE 'Low Engagement'
      END ;;
    description: "Engagement tier based on engagement score"
    label: "Engagement Tier"
  }

  # Measures
  measure: count {
    type: count
    description: "Count of sessions"
    drill_fields: [session_id, client_id, session_start_date, max_score, enemies_defeated, total_gemini_interactions]
  }

  measure: average_session_duration {
    type: average
    sql: ${session_duration_minutes} ;;
    description: "Average session duration in minutes"
    label: "Avg Session Duration (min)"
    value_format_name: decimal_1
  }

  measure: median_session_duration {
    type: median
    sql: ${session_duration_minutes} ;;
    description: "Median session duration in minutes"
    label: "Median Session Duration (min)"
    value_format_name: decimal_1
  }

  measure: total_session_duration {
    type: sum
    sql: ${session_duration_minutes} ;;
    description: "Total minutes spent across all sessions"
    label: "Total Session Duration (min)"
    value_format_name: decimal_0
  }

  measure: average_score {
    type: average
    sql: ${max_score} ;;
    description: "Max score per session"
    label: "Max Score"
    value_format_name: decimal_0
  }

  measure: highest_score {
    type: max
    sql: ${max_score} ;;
    description: "Highest score achieved across all sessions"
    label: "Highest Score"
    value_format_name: decimal_0
  }

  measure: highest_score_selected_session {
    type: max
    sql: ${max_score} ;;
    filters: [selected_client_vs_rest_bool: "yes"]
    description: "Highest score achieved for selected session"
    label: "Selected Session: Highest Score"
    value_format_name: decimal_0
  }

  # measure: average_player_points {
  #   type: average
  #   sql: ${max_player_points} ;;
  #   description: "Average max player points per session"
  #   label: "Avg Max Player Points"
  #   value_format_name: decimal_0
  # }

  measure: average_enemies_defeated {
    type: average
    sql: ${enemies_defeated} ;;
    description: "Average number of enemies defeated per session"
    label: "Avg Enemies Defeated"
    value_format_name: decimal_1
  }

  measure: average_tool_swap {
    type: average
    sql: ${TABLE}.tool_changed ;;
    description: "Average number of tool swaps across all sessions"
    label: "Average Tool Swap"
  }

  measure: average_tool_use {
    type: average
    sql: ${TABLE}.tool_used ;;
    description: "Average number of tool use across all sessions"
    label: "Average Tool Use"
    value_format_name: decimal_2
  }


  measure: total_enemies_defeated {
    type: sum
    sql: ${enemies_defeated} ;;
    description: "Total number of enemies defeated across all sessions"
    label: "Total Enemies Defeated"
  }

  measure: average_player_deaths {
    type: average
    sql: ${player_deaths} ;;
    description: "Average number of player deaths per session"
    label: "Avg Player Deaths"
    value_format_name: decimal_1
  }

  measure: total_player_deaths {
    type: sum
    sql: ${player_deaths} ;;
    description: "Total number of player deaths across all sessions"
    label: "Total Player Deaths"
  }

  measure: survival_rate {
    type: number
    sql: 1.0 - (SUM(${player_deaths}) / NULLIF(SUM(${player_deaths} + ${enemies_defeated}), 0)) ;;
    description: "Rate of player survival relative to combat encounters"
    label: "Survival Rate"
    value_format_name: percent_2
  }

  measure: average_gemini_help_interactions {
    type: average
    sql: ${gemini_help_interactions} ;;
    description: "Average number of Gemini help interactions per session"
    label: "Avg Gemini Help Interactions"
    value_format_name: decimal_1
  }

  measure: total_gemini_help_interactions {
    type: sum
    sql: ${gemini_help_interactions} ;;
    description: "Total number of Gemini help interactions across all sessions"
    label: "Total Gemini Help Interactions"
  }

  measure: average_gemini_backstory_interactions {
    type: average
    sql: ${gemini_backstory_interactions} ;;
    description: "Average number of Gemini backstory interactions per session"
    label: "Avg Gemini Backstory Interactions"
    value_format_name: decimal_1
  }

  measure: total_gemini_backstory_interactions {
    type: sum
    sql: ${gemini_backstory_interactions} ;;
    description: "Total number of Gemini backstory interactions across all sessions"
    label: "Total Gemini Backstory Interactions"
  }

  measure: average_total_gemini_interactions {
    type: average
    sql: ${total_gemini_interactions} ;;
    description: "Average total Gemini interactions per session"
    label: "Avg Total Gemini Interactions"
    value_format_name: decimal_1
  }

  measure: total_gemini_interactions_sum {
    type: sum
    sql: ${total_gemini_interactions} ;;
    description: "Sum of all Gemini interactions across sessions"
    label: "Total Gemini Interactions"
  }

  measure: gemini_adoption_rate {
    type: number
    sql: SUM(CASE WHEN ${has_used_gemini} THEN 1 ELSE 0 END) / NULLIF(${count}, 0) ;;
    description: "Percentage of sessions where Gemini was used"
    label: "Gemini Adoption Rate"
    value_format_name: percent_2
  }

  measure: level1_completion_rate {
    type: number
    sql: SUM(CASE WHEN ${reached_level1} THEN 1 ELSE 0 END) / NULLIF(${count}, 0) * 100 ;;
    description: "Percentage of sessions where player reached level 1"
    label: "Level 1 Completion Rate"
    value_format_name: decimal_1
  }

  measure: boss1_completion_rate {
    type: number
    sql: SUM(CASE WHEN ${reached_boss1} THEN 1 ELSE 0 END) / NULLIF(${count}, 0) * 100 ;;
    description: "Percentage of sessions where player reached boss 1"
    label: "Boss 1 Completion Rate"
    value_format_name: decimal_1
  }

  measure: level_to_boss_conversion {
    type: number
    sql: SUM(CASE WHEN ${reached_boss1} THEN 1 ELSE 0 END) / NULLIF(SUM(CASE WHEN ${reached_level1} THEN 1 ELSE 0 END), 0) * 100 ;;
    description: "Percentage of sessions that reached level 1 and then made it to boss 1"
    label: "Level to Boss Conversion"
    value_format_name: decimal_1
  }

  measure: total_trivia_questions {
    type: sum
    sql: ${trivia_questions_received} ;;
    description: "Total number of trivia questions received across sessions"
    label: "Total Trivia Questions"
  }

  measure: average_trivia_questions {
    type: average
    sql: ${trivia_questions_received} ;;
    description: "Average number of trivia questions per session"
    label: "Avg Trivia Questions"
    value_format_name: decimal_1
  }

  measure: trivia_adoption_rate {
    type: number
    sql: SUM(CASE WHEN ${has_trivia_interaction} THEN 1 ELSE 0 END) / NULLIF(${count}, 0) ;;
    description: "Percentage of sessions with trivia interaction"
    label: "Trivia Adoption Rate"
    value_format_name: percent_2
  }

  measure: average_kd_ratio {
    type: average
    sql: ${kill_death_ratio} ;;
    description: "Average kill/death ratio across sessions"
    label: "Avg K/D Ratio"
    value_format_name: decimal_2
  }

  measure: average_skill_rating {
    type: average
    sql: ${session_skill_rating} ;;
    description: "Average skill rating across sessions"
    label: "Avg Skill Rating"
    value_format_name: decimal_1
  }

  measure: average_engagement_score {
    type: average
    sql: ${engagement_score} ;;
    description: "Average engagement score across sessions"
    label: "Avg Engagement Score"
    value_format_name: decimal_1
  }
}
