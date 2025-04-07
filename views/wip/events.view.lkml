# views/game_events.view.lkml
view: events {
  sql_table_name: `retro_tech_revolution.v_all_events` ;;

  dimension: event_id {
    primary_key: yes
    type: string
    sql: ${ts} || ${session_id} || ${client_id} ;;
    description: "Unique identifier for each game event"
  }

  dimension_group: event {
    type: time
    timeframes: [raw, time, date, week, month, quarter, year, hour_of_day, day_of_week,second]
    sql: TIMESTAMP_SECONDS(CAST(TRUNC(CAST(${TABLE}.ts AS NUMERIC)) AS INT64)) ;;
    description: "Timestamp when the game event occurred"
    label: "Event Occurrence"
  }

  dimension: event_type {
    type: string
    sql: ${TABLE}.event_type ;;
    description: "Type of game event"
    label: "Event Type"
  }

  dimension: client_id {
    type: string
    sql: ${TABLE}.client_id ;;
    description: "Unique identifier for the game client/installation"
    label: "Client ID"
  }

  dimension: session_id {
    type: string
    sql: ${TABLE}.session_id ;;
    description: "Unique identifier for the game session"
    label: "Session ID"
  }

  dimension: player_health {
    type: number
    sql: CAST(${TABLE}.player_health AS NUMERIC) ;;
    description: "Current health points of the player"
    label: "Player Health"
  }

  dimension: player_hit_count {
    type: number
    sql: ${TABLE}.player_hit_count ;;
    description: "Number of times the player has been hit"
    label: "Player Hit Count"
  }

  dimension: player_points {
    type: number
    sql: CAST(${TABLE}.player_points AS NUMERIC) ;;
    description: "Current score or points of the player"
    label: "Player Points"
  }

  dimension: player_x {
    type: number
    sql: ${TABLE}.player_x ;;
    description: "Player's X coordinate in the game"
    label: "Player X Position"
  }

  dimension: player_y {
    type: number
    sql: ${TABLE}.player_y ;;
    description: "Player's Y coordinate in the game"
    label: "Player Y Position"
  }

  dimension: player_left_stick_x {
    type: number
    sql: ${TABLE}.player_left_stick_x ;;
    description: "X-axis value of the player's left controller stick"
    label: "Left Stick X"
  }

  dimension: player_left_stick_y {
    type: number
    sql: ${TABLE}.player_left_stick_y ;;
    description: "Y-axis value of the player's left controller stick"
    label: "Left Stick Y"
  }

  dimension: enemy_id {
    type: string
    sql: ${TABLE}.enemy_id ;;
    description: "Unique identifier for the enemy"
    label: "Enemy ID"
  }

  dimension: enemy_type {
    type: string
    sql: ${TABLE}.enemy_type ;;
    description: "Type or category of enemy"
    label: "Enemy Type"
  }

  dimension: enemy_health {
    type: number
    sql: ${TABLE}.enemy_health ;;
    description: "Current health points of the enemy"
    label: "Enemy Health"
  }

  dimension: enemy_hit_count {
    type: number
    sql: ${TABLE}.enemy_hit_count ;;
    description: "Number of times the enemy has been hit"
    label: "Enemy Hit Count"
  }

  dimension: enemy_points {
    type: number
    sql: ${TABLE}.enemy_points ;;
    description: "Points awarded for defeating this enemy"
    label: "Enemy Point Value"
  }

  dimension: bullet_type {
    type: string
    sql: ${TABLE}.bullet_type ;;
    description: "Type of bullet or projectile used"
    label: "Bullet Type"
  }

  dimension: new_difficulty {
    type: string
    sql: CASE WHEN ${TABLE}.new_difficulty = "0" THEN "Beginner" WHEN ${TABLE}.new_difficulty = "1" THEN "Intermmediate" ELSE "Advanced" END ;;
    description: "Current game difficulty setting. 0 = Beginner, 1 = Intermmediate, 2 = Advanced"
    label: "Difficulty Level"
  }

  dimension: prompt_text {
    type: string
    sql: ${TABLE}.prompt_text ;;
    description: "Text displayed to the player in prompts or dialogs"
    label: "Prompt Text"
  }

  dimension: reason {
    type: string
    sql: ${TABLE}.reason ;;
    description: "Reason or cause for the event"
    label: "Event Reason"
  }

  dimension: help {
    type: string
    sql: ${TABLE}.help ;;
    description: "Help information provided to the player"
    label: "Help Info"
  }

  dimension: score {
    type: number
    sql: CAST(${TABLE}.score AS NUMERIC) ;;
    description: "Current game score"
    label: "Score"
  }

  dimension: screenshot {
    type: string
    sql: ${TABLE}.screenshot ;;
    html: <img src="data:image/jpeg;base64,{{value}}" width="100px" height="100px"/> ;;
    description: "Reference to screenshot taken during the event"
    label: "Screenshot"
  }

  dimension: stopwatch {
    type: number
    sql: ${TABLE}.stopwatch ;;
    description: "Time measurement for the event"
    label: "Stopwatch"
  }

  dimension: stopwatch_tier {
    type: tier
    tiers: [0,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100,105,110,115,120,125,130,135,140]
    description: "Time buckets for the event"
    style: integer
    sql: CAST(${stopwatch} AS FLOAT64) ;;
  }

  dimension: ts {
    type: string
    sql: ${TABLE}.ts ;;
    description: "Raw timestamp value"
    label: "Timestamp"
    hidden: yes  # Hidden because we have the event_time dimension
  }

  # Event Type Categorization Dimensions
  # These dimensions help categorize events without creating fields not in the raw table

  dimension: event_category {
    type: string
    sql:
      CASE
        WHEN ${event_type} LIKE '%screen_entered%' THEN 'Screen Navigation'
        WHEN ${event_type} IN ('on_game_paused', 'on_game_unpaused') THEN 'Game State'
        WHEN ${event_type} LIKE '%player%' THEN 'Player Action'
        WHEN ${event_type} LIKE '%enemy%' THEN 'Enemy Interaction'
        WHEN ${event_type} LIKE '%gemini%' THEN 'Gemini Integration'
        WHEN ${event_type} LIKE '%bullet%' THEN 'Combat'
        WHEN ${event_type} LIKE '%trivia%' THEN 'Trivia'
        ELSE 'Other'
      END ;;
    description: "General category of the event type"
    label: "Event Category"
  }

  dimension: screen_name {
    type: string
    sql:
      CASE
        WHEN ${event_type} = 'on_splashscreen_entered' THEN 'Splash Screen'
        WHEN ${event_type} = 'on_questions_screen_entered' THEN 'Questions Screen'
        WHEN ${event_type} = 'on_controls_screen_entered' THEN 'Controls Screen'
        WHEN ${event_type} = 'on_backstory_screen_entered' THEN 'Backstory Screen'
        WHEN ${event_type} = 'on_level1_screen_entered' THEN 'Level 1'
        WHEN ${event_type} = 'on_boss1_screen_entered' THEN 'Boss 1'
        WHEN ${event_type} = 'on_gameover_screen_entered' THEN 'Game Over'
        ELSE NULL
      END ;;
    description: "Name of the screen if this is a screen navigation event"
    label: "Screen Name"
  }

  dimension: is_screen_event {
    type: yesno
    sql: ${screen_name} IS NOT NULL ;;
    description: "Whether this event represents screen navigation"
    label: "Is Screen Navigation"
  }

  dimension: gemini_interaction_type {
    type: string
    sql:
      CASE
        WHEN ${event_type} = 'on_gemini_help_requested' THEN 'Help Requested'
        WHEN ${event_type} = 'on_received_gemini_help' THEN 'Help Received'
        WHEN ${event_type} = 'on_gemini_backstory_requested' THEN 'Backstory Requested'
        WHEN ${event_type} = 'on_gemini_backstory_text_received' THEN 'Backstory Received'
        WHEN ${event_type} = 'on_gemini_backstory_text_received - issue with image' THEN 'Backstory Received (Issue)'
        ELSE NULL
      END ;;
    description: "Type of Gemini AI interaction"
    label: "Gemini Interaction Type"
  }

  dimension: is_gemini_event {
    type: yesno
    sql: ${gemini_interaction_type} IS NOT NULL ;;
    description: "Whether this event involves Gemini AI"
    label: "Is Gemini Interaction"
  }

  dimension: player_action_type {
    type: string
    sql:
      CASE
        WHEN ${event_type} = 'on_player_created' THEN 'Created'
        WHEN ${event_type} = 'on_player_moving' THEN 'Moving'
        WHEN ${event_type} = 'on_player_iddle' THEN 'Idle'
        WHEN ${event_type} = 'on_player_weapon_changed' THEN 'Weapon Changed'
        WHEN ${event_type} = 'on_player_health_depleted' THEN 'Health Depleted'
        WHEN ${event_type} = 'on_player_taking_damage' THEN 'Taking Damage'
        WHEN ${event_type} = 'on_player_score_increased' THEN 'Score Increased'
        ELSE NULL
      END ;;
    description: "Type of player action"
    label: "Player Action Type"
  }

  dimension: enemy_action_type {
    type: string
    sql:
      CASE
        WHEN ${event_type} = 'on_enemy_created' THEN 'Created'
        WHEN ${event_type} = 'on_enemy_taking_damage' THEN 'Taking Damage'
        WHEN ${event_type} = 'On_enemy_health_depleted' THEN 'Health Depleted'
        ELSE NULL
      END ;;
    description: "Type of enemy action"
    label: "Enemy Action Type"
  }

  dimension: game_state {
    type: string
    sql:
      CASE
        WHEN ${event_type} = 'on_game_paused' THEN 'Paused'
        WHEN ${event_type} = 'on_game_unpaused' THEN 'Unpaused'
        WHEN ${event_type} = 'on_trivia_question_received' THEN 'Trivia'
        ELSE NULL
      END ;;
    description: "Game state changes"
    label: "Game State Change"
  }

  # Measures
  measure: count {
    type: count
    description: "Count of game events"
    drill_fields: [event_date, event_type, client_id, player_points]
  }

  measure: distinct_sessions {
    type: count_distinct
    sql: ${session_id} ;;
    description: "Count of unique game sessions"
    label: "Number of Sessions"
    drill_fields: [session_id, event_date]
  }

  measure: distinct_clients {
    type: count_distinct
    sql: ${client_id} ;;
    description: "Count of unique game clients"
    label: "Number of Clients"
    drill_fields: [client_id, distinct_sessions]
  }

  measure: total_score {
    type: sum
    sql: ${score} ;;
    description: "Sum of all scores"
    label: "Total Score"
    value_format_name: decimal_0
  }

  measure: avg_score {
    type: average
    sql: ${score} ;;
    description: "Average score"
    label: "Average Score"
    value_format_name: decimal_0
  }

  measure: max_score {
    type: max
    sql: ${score} ;;
    description: "Maximum score"
    label: "Max Score"
    value_format_name: decimal_0
  }

  measure: total_player_points {
    type: sum
    sql: ${player_points} ;;
    description: "Sum of all player points"
    label: "Total Player Points"
    value_format_name: decimal_0
  }

  measure: avg_player_points {
    type: average
    sql: ${player_points} ;;
    description: "Average player points"
    label: "Average Player Points"
    value_format_name: decimal_0
  }

  measure: enemy_defeat_count {
    type: count
    filters: [enemy_action_type: "Health Depleted"]
    description: "Count of enemies defeated"
    label: "Enemies Defeated"
  }

  measure: player_death_count {
    type: count
    filters: [player_action_type: "Health Depleted"]
    description: "Count of player deaths"
    label: "Player Deaths"
  }

  measure: gemini_help_request_count {
    type: count
    filters: [gemini_interaction_type: "Help Requested"]
    description: "Count of Gemini help requests"
    label: "Gemini Help Requests"
  }

  measure: gemini_backstory_request_count {
    type: count
    filters: [gemini_interaction_type: "Backstory Requested"]
    description: "Count of Gemini backstory requests"
    label: "Gemini Backstory Requests"
  }

  measure: screen_navigation_count {
    type: count
    filters: [is_screen_event: "yes"]
    description: "Count of screen navigation events"
    label: "Screen Navigation Count"
  }

  measure: level1_entry_count {
    type: count
    filters: [screen_name: "Level 1"]
    description: "Count of Level 1 entries"
    label: "Level 1 Entries"
  }

  measure: boss1_entry_count {
    type: count
    filters: [screen_name: "Boss 1"]
    description: "Count of Boss 1 entries"
    label: "Boss 1"
  }
}
