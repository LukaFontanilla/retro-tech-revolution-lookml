view: v_ranking {
  sql_table_name: `data-cloud-interactive-demo.retro_tech_revolution.v_ranking` ;;

  dimension: max_score {
    type: number
    sql: ${TABLE}.max_score ;;
  }
  dimension: max_score_time {
    type: number
    sql: ${TABLE}.max_score_time ;;
  }
  dimension: player_rank {
    type: number
    sql: ${TABLE}.player_rank ;;
  }
  parameter: selected_session {
    suggest_dimension: session_id
    label: "Selected Game Session"
    type: unquoted
  }
  dimension: session_id {
    type: string
    sql: ${TABLE}.session_id ;;
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
  }

  measure: count {
    type: count
  }
}
