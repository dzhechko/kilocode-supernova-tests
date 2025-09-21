extends Label

# Step counter variable
var step_count: int = 0

# Goal tracking variables
var step_goal: int = 10000
var goal_achieved: bool = false
var is_flashing: bool = false
var flash_timer: float = 0.0
const FLASH_DURATION: float = 0.1
const FLASH_COUNT: int = 6

# Configuration parameters
@export var display_format: String = "Steps: %d"
@export var step_increment_sound: AudioStream = null
@export var show_goal_progress: bool = true
@export var goal_progress_format: String = "Steps: %d/%d (%.1f%%)"
@export var goal_achieved_color: Color = Color.GREEN
@export var normal_color: Color = Color.WHITE
@export var flash_color: Color = Color.YELLOW

# Reference to audio player for step sounds
var audio_player: AudioStreamPlayer

# Called when the node enters the scene tree for the first time.
func _ready():
	update_display()

	# Create audio player if step sound is configured
	if step_increment_sound:
		audio_player = AudioStreamPlayer.new()
		audio_player.stream = step_increment_sound
		add_child(audio_player)

	# Find main scene to get step goal
	var main_scene = get_parent()
	while main_scene and not main_scene.has_method("get_step_goal"):
		main_scene = main_scene.get_parent()

	if main_scene and main_scene.has_method("get_step_goal"):
		step_goal = main_scene.get_step_goal()

# Update the step count and refresh the display
func update_steps(new_count: int):
	step_count = max(0, new_count)  # Ensure non-negative
	update_display()

# Increment the step count by 1
func increment_steps():
	step_count += 1
	update_display()

	# Play step sound if configured
	if audio_player:
		audio_player.play()

	# Emit signal for other systems that might be listening
	emit_signal("steps_incremented", step_count)

# Decrement the step count by 1 (for undo functionality)
func decrement_steps():
	step_count = max(0, step_count - 1)
	update_display()

# Set step count to specific value
func set_steps(count: int):
	step_count = max(0, count)
	update_display()

# Get the current step count
func get_step_count() -> int:
	return step_count

# Get step count as string for saving/loading
func get_step_count_string() -> String:
	return str(step_count)

# Set step count from string (for loading)
func set_step_count_from_string(count_string: String):
	var new_count = int(count_string)
	if new_count >= 0:
		step_count = new_count
		update_display()

# Update the label text to show current step count
func update_display():
	if show_goal_progress and step_goal > 0:
		var progress = float(step_count) / float(step_goal)
		text = goal_progress_format % [step_count, step_goal, progress * 100.0]

		# Change color based on progress
		if goal_achieved:
			add_theme_color_override("font_color", goal_achieved_color)
		elif progress >= 1.0:
			add_theme_color_override("font_color", goal_achieved_color)
		elif progress >= 0.8:
			add_theme_color_override("font_color", Color.ORANGE)
		elif progress >= 0.5:
			add_theme_color_override("font_color", Color.YELLOW)
		else:
			add_theme_color_override("font_color", normal_color)
	else:
		text = display_format % step_count
		add_theme_color_override("font_color", normal_color)

# Reset step counter to zero
func reset_steps():
	var old_count = step_count
	step_count = 0
	update_display()

	# Emit signal for reset
	emit_signal("steps_reset", old_count)

# Update the step goal (called when goal changes in main scene)
func update_step_goal(new_goal: int):
	step_goal = max(1, new_goal)
	update_display()

# Set step count to specific value
func set_steps(count: int):
	step_count = max(0, count)
	update_display()

# Get step counter info for debugging
func get_step_info() -> Dictionary:
	return {
		"step_count": step_count,
		"display_format": display_format,
		"has_audio": audio_player != null,
		"step_goal": step_goal,
		"goal_progress": float(step_count) / float(step_goal) if step_goal > 0 else 0.0,
		"is_flashing": is_flashing
	}

# Signal emitted when steps are incremented
signal steps_incremented(new_total: int)

# Signal emitted when steps are reset
signal steps_reset(old_total: int)

# Called every frame
func _process(delta):
	# Handle flashing animation when goal is achieved
	if is_flashing:
		flash_timer -= delta
		if flash_timer <= 0:
			# Toggle visibility for flash effect
			visible = !visible
			flash_timer = FLASH_DURATION

			# Stop flashing after specified count
			if not visible:  # Count when we turn off
				flash_timer = FLASH_DURATION * 2  # Longer pause between flashes
			else:
				flash_timer = FLASH_DURATION

		# Set flash color when visible during flashing
		if visible and is_flashing:
			add_theme_color_override("font_color", flash_color)
		elif visible and not is_flashing and goal_achieved:
			add_theme_color_override("font_color", goal_achieved_color)

# Flash the step counter when goal is achieved
func flash_goal_achieved():
	is_flashing = true
	flash_timer = FLASH_DURATION
	visible = true  # Start visible
	goal_achieved = true  # Mark as achieved

	# Auto-stop flashing after duration
	await get_tree().create_timer(FLASH_DURATION * FLASH_COUNT * 2).timeout
	is_flashing = false
	visible = true  # Ensure we end visible

# Reset goal achievement state (for when starting a new goal)
func reset_goal_achievement():
	goal_achieved = false
	update_display()