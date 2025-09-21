extends ProgressBar

# Life system variables
var current_life: float = 100.0
var max_life: float = 100.0
var is_alive: bool = true

# Reference to the label for displaying life text
@onready var life_label = $Label

# Visual feedback variables
var damage_flash_timer: float = 0.0
var is_flashing: bool = false
var original_modulate: Color

# Called when the node enters the scene tree for the first time.
func _ready():
	update_display()
	original_modulate = modulate

func _process(delta):
	# Handle damage flash effect
	if is_flashing:
		damage_flash_timer -= delta
		if damage_flash_timer <= 0:
			is_flashing = false
			modulate = original_modulate
		else:
			# Flash red during damage
			var flash_intensity = sin(damage_flash_timer * 20) * 0.5 + 0.5
			modulate = Color(1.0, 1.0 - flash_intensity * 0.8, 1.0 - flash_intensity * 0.8, 1.0)

# Set the maximum life value
func set_max_life(new_max: float):
	max_life = new_max
	max_value = new_max
	current_life = min(current_life, max_life)
	update_display()

# Get the current life value
func get_current_life() -> float:
	return current_life

# Get the maximum life value
func get_max_life() -> float:
	return max_life

# Check if the player is alive
func is_player_alive() -> bool:
	return is_alive

# Take damage and reduce life
func take_damage(damage_amount: float):
	if not is_alive:
		return

	current_life -= damage_amount
	current_life = max(current_life, 0)

	# Update progress bar
	value = current_life

	# Trigger visual feedback
	trigger_damage_feedback()

	# Check if player died
	if current_life <= 0:
		current_life = 0
		is_alive = false
		print("Player died!")

	update_display()

# Heal the player
func heal(heal_amount: float):
	if not is_alive:
		return

	current_life += heal_amount
	current_life = min(current_life, max_life)

	# Update progress bar
	value = current_life
	update_display()

# Reset life to maximum
func reset_life():
	current_life = max_life
	is_alive = true
	value = current_life
	update_display()

# Set life to a specific value
func set_life(new_life: float):
	current_life = clamp(new_life, 0, max_life)
	value = current_life

	if current_life <= 0:
		is_alive = false
	else:
		is_alive = true

	update_display()

# Get life as percentage (0.0 to 1.0)
func get_life_percentage() -> float:
	if max_life <= 0:
		return 0.0
	return current_life / max_life

# Update the visual display
func update_display():
	if life_label:
		life_label.text = "LIFE: %d%%" % (get_life_percentage() * 100)

	# Change color based on life percentage
	if get_life_percentage() > 0.6:
		# Green for high life
		modulate = Color(0.2, 1.0, 0.2, 1.0)
	elif get_life_percentage() > 0.3:
		# Yellow for medium life
		modulate = Color(1.0, 1.0, 0.2, 1.0)
	else:
		# Red for low life
		modulate = Color(1.0, 0.2, 0.2, 1.0)

# Handle jump damage (called when player jumps)
func handle_jump_damage(jump_height: float = 1.0):
	var damage = jump_height * 2.0  # 2 damage per unit of jump height
	take_damage(damage)
	print("Jump damage: %.1f (height: %.1f)" % [damage, jump_height])

# Handle fall damage (called when player falls)
func handle_fall_damage(fall_distance: float = 1.0):
	var damage = fall_distance * 5.0  # 5 damage per unit of fall distance
	take_damage(damage)
	print("Fall damage: %.1f (distance: %.1f)" % [damage, fall_distance])

# Get damage info for debugging
func get_damage_info() -> Dictionary:
	return {
		"current_life": current_life,
		"max_life": max_life,
		"life_percentage": get_life_percentage() * 100,
		"is_alive": is_alive
	}

# Trigger visual feedback for damage
func trigger_damage_feedback():
	is_flashing = true
	damage_flash_timer = 0.5  # Flash for 0.5 seconds