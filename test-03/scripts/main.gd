extends Node2D

# Reference to the step counter UI
@onready var step_counter = $CanvasLayer/StepCounter/Panel/Label

# Reference to the life system UI
@onready var life_system = $CanvasLayer/LifeIndicator/Panel/ProgressBar

# Reference to the player
@onready var player = $Player

# Reference to the step configuration panel
@onready var step_config = $CanvasLayer/StepConfig

# Step goal system
var step_goal: int = 10000  # Default 10,000 steps
var goal_achieved: bool = false
var goal_celebration_timer: float = 0.0
const GOAL_CELEBRATION_DURATION: float = 3.0

# Called when the node enters the scene tree for the first time.
func _ready():
	print("Main scene loaded!")
	print("Welcome to your Godot project!")

	# Initialize step counter at 0
	update_step_counter(0)

	# Initialize life system at maximum
	reset_player_life()

	# Load saved step goal
	load_step_goal()

	# Find player reference
	var player = $Player
	if player:
		print("Player found and ready!")
		# Connect to player's step counting signal if needed
		# player.connect("step_counted", self, "_on_player_step_counted")
	else:
		print("Warning: Player not found!")

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	# Check for config panel toggle (Tab key)
	if Input.is_action_just_pressed("toggle_config"):
		toggle_step_config()

	# Handle goal celebration
	if goal_achieved and goal_celebration_timer > 0:
		goal_celebration_timer -= delta
		if goal_celebration_timer <= 0:
			goal_achieved = false
			print("Goal celebration ended!")

# Update the step counter to a specific value
func update_step_counter(new_count: int):
	if step_counter and step_counter.has_method("update_steps"):
		step_counter.update_steps(new_count)

# Increment the step counter by 1
func increment_step_counter():
	if step_counter and step_counter.has_method("increment_steps"):
		step_counter.increment_steps()

	# Check if goal is achieved
	check_goal_achievement()

# Get the current step count
func get_current_steps() -> int:
	if step_counter and step_counter.has_method("get_step_count"):
		return step_counter.get_step_count()
	return 0

# Life system methods
# Take damage to the player
func take_damage(damage_amount: float):
	if life_system and life_system.has_method("take_damage"):
		life_system.take_damage(damage_amount)

# Heal the player
func heal_player(heal_amount: float):
	if life_system and life_system.has_method("heal"):
		life_system.heal(heal_amount)

# Reset player life to maximum
func reset_player_life():
	if life_system and life_system.has_method("reset_life"):
		life_system.reset_life()

# Set player life to specific value
func set_player_life(life_value: float):
	if life_system and life_system.has_method("set_life"):
		life_system.set_life(life_value)

# Get current player life
func get_current_life() -> float:
	if life_system and life_system.has_method("get_current_life"):
		return life_system.get_current_life()
	return 0.0

# Get maximum player life
func get_max_life() -> float:
	if life_system and life_system.has_method("get_max_life"):
		return life_system.get_max_life()
	return 100.0

# Check if player is alive
func is_player_alive() -> bool:
	if life_system and life_system.has_method("is_player_alive"):
		return life_system.is_player_alive()
	return true

# Handle jump damage
func handle_jump_damage(jump_height: float = 1.0):
	if life_system and life_system.has_method("handle_jump_damage"):
		life_system.handle_jump_damage(jump_height)

# Handle fall damage
func handle_fall_damage(fall_distance: float = 1.0):
	if life_system and life_system.has_method("handle_fall_damage"):
		life_system.handle_fall_damage(fall_distance)

# Get life system info for debugging
func get_life_info() -> Dictionary:
	if life_system and life_system.has_method("get_damage_info"):
		return life_system.get_damage_info()
	return {}

# Player control methods
func get_player() -> Node2D:
	return player

func get_player_movement_info() -> Dictionary:
	if player and player.has_method("get_movement_info"):
		return player.get_movement_info()
	return {}

func reset_player_steps():
	if player and player.has_method("reset_steps"):
		player.reset_steps()

	# Reset goal achievement state
	goal_achieved = false
	goal_celebration_timer = 0.0

	# Reset step counter goal achievement
	if step_counter and step_counter.has_method("reset_goal_achievement"):
		step_counter.reset_goal_achievement()

func set_player_step_detection_mode(mode: String):
	if player and player.has_method("set_step_detection_mode"):
		player.set_step_detection_mode(mode)

func set_player_step_distance_threshold(threshold: float):
	if player and player.has_method("set_step_distance_threshold"):
		player.set_step_distance_threshold(threshold)

func set_player_step_time_threshold(threshold: float):
	if player and player.has_method("set_step_time_threshold"):
		player.set_step_time_threshold(threshold)

func set_player_move_speed(speed: float):
	if player and player.has_method("set_move_speed"):
		player.set_move_speed(speed)

# Step configuration methods
func toggle_step_config():
	if step_config and step_config.has_method("show_config"):
		if step_config.visible:
			step_config.hide_config()
		else:
			step_config.show_config()

func show_step_config():
	if step_config and step_config.has_method("show_config"):
		step_config.show_config()

func hide_step_config():
	if step_config and step_config.has_method("hide_config"):
		step_config.hide_config()

# Step goal management methods
func set_step_goal(new_goal: int):
	step_goal = max(1, new_goal)  # Ensure goal is at least 1
	save_step_goal()

	# Update step counter display
	if step_counter and step_counter.has_method("update_step_goal"):
		step_counter.update_step_goal(step_goal)

	print("Step goal set to: ", step_goal)

func get_step_goal() -> int:
	return step_goal

func get_goal_progress() -> float:
	var current_steps = get_current_steps()
	return min(float(current_steps) / float(step_goal), 1.0)  # Cap at 100%

func check_goal_achievement():
	var current_steps = get_current_steps()
	if current_steps >= step_goal and not goal_achieved:
		achieve_goal()

func achieve_goal():
	goal_achieved = true
	goal_celebration_timer = GOAL_CELEBRATION_DURATION
	print("🎉 GOAL ACHIEVED! 🎉")
	print("Congratulations! You've reached your step goal of ", step_goal, " steps!")

	# Add visual feedback - flash the step counter
	if step_counter and step_counter.has_method("flash_goal_achieved"):
		step_counter.flash_goal_achieved()

	# Optional: Add screen shake effect for goal achievement
	if player and player.has_method("apply_screen_shake"):
		player.apply_screen_shake(0.5, 8.0)

func is_goal_achieved() -> bool:
	return goal_achieved

func get_goal_info() -> Dictionary:
	return {
		"goal": step_goal,
		"current": get_current_steps(),
		"progress": get_goal_progress(),
		"achieved": goal_achieved,
		"remaining": max(0, step_goal - get_current_steps())
	}

# Persistence methods
func save_step_goal():
	# In a real game, you might save to a file or database
	# For now, we'll just print it
	print("Saving step goal: ", step_goal)

func load_step_goal():
	# In a real game, you might load from a file or database
	# For now, we'll use the default value
	print("Loading step goal: ", step_goal)

# Example function that can be called from other scripts
func get_project_info() -> Dictionary:
	return {
		"name": "My Godot Project",
		"version": "1.0.0",
		"description": "A basic Godot project setup with step counting"
	}