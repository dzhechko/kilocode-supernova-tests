extends CharacterBody2D

# Movement parameters
@export var move_speed: float = 200.0
@export var acceleration: float = 1000.0
@export var friction: float = 1000.0

# Jump parameters
@export var jump_velocity: float = -400.0  # Negative for upward movement
@export var gravity: float = 980.0  # Gravity strength
@export var fall_gravity_multiplier: float = 1.5  # Extra gravity when falling
@export var jump_damage_threshold: float = 50.0  # Minimum jump height for damage
@export var fall_damage_threshold: float = 100.0  # Minimum fall distance for damage

# Step detection parameters
@export var step_distance_threshold: float = 50.0  # Distance to travel before counting a step
@export var step_time_threshold: float = 0.5  # Minimum time between steps (seconds)
@export var step_detection_mode: String = "distance"  # "distance" or "time"

# Step tracking
var last_position: Vector2
var distance_traveled: float = 0.0
var last_step_time: float = 0.0
var step_count: int = 0

# Jump and fall tracking
var is_jumping: bool = false
var jump_start_y: float = 0.0
var fall_start_y: float = 0.0
var max_fall_distance: float = 0.0
var was_on_floor: bool = false
var last_y_position: float = 0.0

# Input actions
var input_direction: Vector2 = Vector2.ZERO

# Reference to main scene for step counter integration
var main_scene: Node2D

# Reference to life system for damage handling
var life_system: Node

func _ready():
	last_position = position
	last_y_position = position.y
	last_step_time = Time.get_time_dict_from_system()["hour"] * 3600 + Time.get_time_dict_from_system()["minute"] * 60 + Time.get_time_dict_from_system()["second"]

	# Find main scene reference
	main_scene = get_parent()
	while main_scene and not main_scene.has_method("increment_step_counter"):
		main_scene = main_scene.get_parent()

	# Find life system reference
	life_system = get_parent()
	while life_system and not life_system.has_method("take_damage"):
		life_system = life_system.get_parent()

func _physics_process(delta):
	# Handle input
	handle_input()

	# Apply gravity and jumping
	apply_gravity_and_jump(delta)

	# Apply movement
	apply_movement(delta)

	# Update step detection
	update_step_detection(delta)

	# Update fall detection
	update_fall_detection(delta)

	# Update last position for distance calculation
	last_position = position
	last_y_position = position.y

func handle_input():
	# Get input direction
	input_direction = Vector2.ZERO
	input_direction.x = Input.get_action_strength("move_right") - Input.get_action_strength("move_left")
	input_direction.y = Input.get_action_strength("move_down") - Input.get_action_strength("move_up")

	# Normalize diagonal movement
	if input_direction.length() > 1:
		input_direction = input_direction.normalized()

	# Handle jump input
	if Input.is_action_just_pressed("jump") and is_on_floor():
		handle_jump()

func apply_movement(delta):
	# Apply acceleration
	if input_direction != Vector2.ZERO:
		velocity = velocity.move_toward(input_direction * move_speed, acceleration * delta)
	else:
		# Apply friction
		velocity = velocity.move_toward(Vector2.ZERO, friction * delta)

	# Move the character
	move_and_slide()

func update_step_detection(delta):
	var current_time = Time.get_time_dict_from_system()["hour"] * 3600 + Time.get_time_dict_from_system()["minute"] * 60 + Time.get_time_dict_from_system()["second"]

	# Calculate distance traveled since last frame
	var distance_this_frame = position.distance_to(last_position)
	distance_traveled += distance_this_frame

	# Check if we should count a step
	var should_count_step = false

	if step_detection_mode == "distance":
		# Distance-based step detection
		if distance_traveled >= step_distance_threshold:
			should_count_step = true
			distance_traveled = 0.0  # Reset distance counter
	elif step_detection_mode == "time":
		# Time-based step detection
		if current_time - last_step_time >= step_time_threshold:
			should_count_step = true
			last_step_time = current_time

	# Count step if conditions are met
	if should_count_step and velocity.length() > 10.0:  # Only count steps if actually moving
		count_step()

func count_step():
	step_count += 1

	# Send step count to main scene
	if main_scene and main_scene.has_method("increment_step_counter"):
		main_scene.increment_step_counter()

	# Optional: Add visual or audio feedback here
	print("Step counted! Total steps: ", step_count)

# Jump and fall handling functions
func handle_jump():
	is_jumping = true
	jump_start_y = position.y
	velocity.y = jump_velocity
	print("Player jumped!")

func apply_gravity_and_jump(delta):
	# Apply gravity
	if not is_on_floor():
		if velocity.y > 0:  # Falling
			velocity.y += gravity * fall_gravity_multiplier * delta
		else:  # Jumping or neutral
			velocity.y += gravity * delta
	else:
		# Reset jump state when on floor
		if is_jumping:
			is_jumping = false
			# Calculate jump height for damage
			var jump_height = abs(jump_start_y - position.y)
			if jump_height > jump_damage_threshold:
				apply_jump_damage(jump_height)

func update_fall_detection(delta):
	var current_y = position.y

	# Track if we were on floor last frame
	var currently_on_floor = is_on_floor()

	# Detect when we start falling
	if was_on_floor and not currently_on_floor and velocity.y > 0:
		fall_start_y = last_y_position
		max_fall_distance = 0.0
		print("Started falling")

	# Track fall distance while falling
	if not currently_on_floor and velocity.y > 0:
		var fall_distance_this_frame = current_y - last_y_position
		if fall_distance_this_frame > 0:
			max_fall_distance += fall_distance_this_frame

	# Detect when we land
	if not was_on_floor and currently_on_floor:
		if max_fall_distance > fall_damage_threshold:
			apply_fall_damage(max_fall_distance)
		print("Landed after falling %.1f units" % max_fall_distance)

	was_on_floor = currently_on_floor

func apply_jump_damage(jump_height: float):
	if life_system and life_system.has_method("handle_jump_damage"):
		life_system.handle_jump_damage(jump_height)
		print("Applied jump damage for height: %.1f" % jump_height)
		# Add screen shake effect for jump damage
		if has_method("apply_screen_shake"):
			apply_screen_shake(0.2, 5.0)

func apply_fall_damage(fall_distance: float):
	if life_system and life_system.has_method("handle_fall_damage"):
		life_system.handle_fall_damage(fall_distance)
		print("Applied fall damage for distance: %.1f" % fall_distance)
		# Add stronger screen shake for fall damage
		if has_method("apply_screen_shake"):
			apply_screen_shake(0.3, 10.0)

# Public methods for external control
func get_step_count() -> int:
	return step_count

func reset_steps():
	step_count = 0
	distance_traveled = 0.0
	last_step_time = Time.get_time_dict_from_system()["hour"] * 3600 + Time.get_time_dict_from_system()["minute"] * 60 + Time.get_time_dict_from_system()["second"]

func set_step_detection_mode(mode: String):
	if mode in ["distance", "time"]:
		step_detection_mode = mode

func set_step_distance_threshold(threshold: float):
	step_distance_threshold = max(1.0, threshold)

func set_step_time_threshold(threshold: float):
	step_time_threshold = max(0.1, threshold)

func set_move_speed(speed: float):
	move_speed = max(50.0, speed)

# Screen shake effect for damage feedback
var shake_timer: float = 0.0
var shake_intensity: float = 0.0
var original_camera_offset: Vector2

func apply_screen_shake(duration: float, intensity: float):
	shake_timer = duration
	shake_intensity = intensity

	# Store original camera offset if not already stored
	if not has_method("get_original_camera_offset"):
		if has_node("Camera2D"):
			original_camera_offset = get_node("Camera2D").offset

func _process(delta):
	# Handle screen shake
	if shake_timer > 0:
		shake_timer -= delta
		if has_node("Camera2D"):
			var camera = get_node("Camera2D")
			var shake_offset = Vector2(
				randf_range(-shake_intensity, shake_intensity),
				randf_range(-shake_intensity, shake_intensity)
			)
			camera.offset = original_camera_offset + shake_offset

			if shake_timer <= 0:
				camera.offset = original_camera_offset

# Get movement info for debugging
func get_movement_info() -> Dictionary:
	return {
		"velocity": velocity,
		"speed": velocity.length(),
		"distance_traveled": distance_traveled,
		"step_count": step_count,
		"step_detection_mode": step_detection_mode,
		"position": position,
		"is_jumping": is_jumping,
		"max_fall_distance": max_fall_distance
	}