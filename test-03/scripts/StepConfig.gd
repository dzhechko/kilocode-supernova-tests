extends Control

# Default values
const DEFAULT_DETECTION_MODE = "distance"
const DEFAULT_DISTANCE_THRESHOLD = 50.0
const DEFAULT_TIME_THRESHOLD = 0.5
const DEFAULT_MOVE_SPEED = 200.0
const DEFAULT_STEP_GOAL = 10000

# References to UI elements
@onready var detection_mode_option = $Panel/DetectionModeOption
@onready var distance_threshold_spinbox = $Panel/DistanceThresholdSpinBox
@onready var time_threshold_spinbox = $Panel/TimeThresholdSpinBox
@onready var move_speed_spinbox = $Panel/MoveSpeedSpinBox
@onready var step_goal_spinbox = $Panel/StepGoalSpinBox

# Reference to main scene
var main_scene: Node2D

# Called when the node enters the scene tree for the first time.
func _ready():
	# Find main scene reference
	main_scene = get_parent()
	while main_scene and not main_scene.has_method("get_player"):
		main_scene = main_scene.get_parent()

	# Load current settings
	load_current_settings()

	# Connect button signals
	$Panel/ApplyButton.connect("pressed", _on_apply_pressed)
	$Panel/CloseButton.connect("pressed", _on_close_pressed)
	$Panel/ResetButton.connect("pressed", _on_reset_pressed)

	# Connect option button signal
	detection_mode_option.connect("item_selected", _on_detection_mode_changed)

	# Initially hide the panel
	visible = false

func load_current_settings():
	var player = null
	if main_scene and main_scene.has_method("get_player"):
		player = main_scene.get_player()

	if player:
		# Load detection mode
		var current_mode = player.step_detection_mode if "step_detection_mode" in player else DEFAULT_DETECTION_MODE
		detection_mode_option.select(0 if current_mode == "distance" else 1)

		# Load distance threshold
		var current_distance = player.step_distance_threshold if "step_distance_threshold" in player else DEFAULT_DISTANCE_THRESHOLD
		distance_threshold_spinbox.value = current_distance

		# Load time threshold
		var current_time = player.step_time_threshold if "step_time_threshold" in player else DEFAULT_TIME_THRESHOLD
		time_threshold_spinbox.value = current_time

		# Load move speed
		var current_speed = player.move_speed if "move_speed" in player else DEFAULT_MOVE_SPEED
		move_speed_spinbox.value = current_speed

		# Load step goal
		var current_goal = DEFAULT_STEP_GOAL
		if main_scene and main_scene.has_method("get_step_goal"):
			current_goal = main_scene.get_step_goal()
		step_goal_spinbox.value = current_goal

		# Update UI visibility based on mode
		_update_ui_visibility(current_mode)

func _update_ui_visibility(mode: String):
	# Show/hide controls based on detection mode
	var show_distance = mode == "distance"
	var show_time = mode == "time"

	distance_threshold_spinbox.visible = show_distance
	$Panel/DistanceThresholdLabel.visible = show_distance

	time_threshold_spinbox.visible = show_time
	$Panel/TimeThresholdLabel.visible = show_time

func _on_detection_mode_changed(index: int):
	var mode = "distance" if index == 0 else "time"
	_update_ui_visibility(mode)

func _on_apply_pressed():
	var player = null
	if main_scene and main_scene.has_method("get_player"):
		player = main_scene.get_player()

	if player:
		# Apply detection mode
		var mode = "distance" if detection_mode_option.selected == 0 else "time"
		if player.has_method("set_step_detection_mode"):
			player.set_step_detection_mode(mode)

		# Apply distance threshold
		if player.has_method("set_step_distance_threshold"):
			player.set_step_distance_threshold(distance_threshold_spinbox.value)

		# Apply time threshold
		if player.has_method("set_step_time_threshold"):
			player.set_step_time_threshold(time_threshold_spinbox.value)

		# Apply move speed
		if player.has_method("set_move_speed"):
			player.set_move_speed(move_speed_spinbox.value)

		# Apply step goal
		if main_scene and main_scene.has_method("set_step_goal"):
			main_scene.set_step_goal(step_goal_spinbox.value)

		print("Step detection settings applied!")

	# Hide the config panel
	visible = false

func _on_close_pressed():
	# Reload current settings to undo any changes
	load_current_settings()
	visible = false

func _on_reset_pressed():
	# Reset to default values
	detection_mode_option.select(0)  # distance mode
	distance_threshold_spinbox.value = DEFAULT_DISTANCE_THRESHOLD
	time_threshold_spinbox.value = DEFAULT_TIME_THRESHOLD
	move_speed_spinbox.value = DEFAULT_MOVE_SPEED
	step_goal_spinbox.value = DEFAULT_STEP_GOAL

	_update_ui_visibility("distance")

# Public method to show the config panel
func show_config():
	visible = true
	load_current_settings()

# Public method to hide the config panel
func hide_config():
	visible = false

# Handle input to close config with Escape key
func _input(event):
	if event.is_action_pressed("ui_cancel") and visible:
		_on_close_pressed()