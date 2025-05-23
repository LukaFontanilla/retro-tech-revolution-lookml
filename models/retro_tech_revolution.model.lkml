# Define the database connection to be used for this model.
connection: "default_bigquery_connection"

# include all the views
include: "/views/**/*.view.lkml"
include: "/views/main/*.view.lkml"

# Datagroups define a caching policy for an Explore. To learn more,
# use the Quick Help panel on the right to see documentation.

datagroup: retro_tech_revolution_default_datagroup {
  # sql_trigger: SELECT MAX(id) FROM etl_log;;
  max_cache_age: "1 minutes"
}

persist_with: retro_tech_revolution_default_datagroup

# Explores allow you to join together different views (database tables) based on the
# relationships between fields. By joining a view into an Explore, you make those
# fields available to users for data analysis.
# Explores should be purpose-built for specific use cases.

# To see the Explore you’re building, navigate to the Explore menu and select an Explore under "Retro Tech Revolution"

# To create more sophisticated Explores that involve multiple views, you can use the join parameter.
# Typically, join parameters require that you define the join type, join relationship, and a sql_on clause.
# Each joined view also needs to define a primary key.

explore: sessions {
  join: events {
    type: left_outer
    sql_on: ${sessions.session_id} = ${events.session_id} ;;
    relationship: one_to_many
  }
  join: gemini_summary {
    type: left_outer
    sql_on: ${gemini_summary.session_id} = ${sessions.session_id} ;;
    relationship: one_to_many
  }
}

explore: game_play_summaries {}
explore: screenshots {}
explore: v_ranking {}
explore: latest_sessions {}
