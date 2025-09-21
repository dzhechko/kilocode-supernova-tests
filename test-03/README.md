# Step Counter Game

A fitness-themed step counting game built with Godot 4.3. Move your character around to accumulate steps toward your daily goal while managing your health through careful jumping and movement.

## 🎮 Game Overview

This game combines movement mechanics with fitness tracking. Your goal is to reach the target number of steps (default: 10,000) while avoiding damage from excessive jumping or falling. The game features:

- **Step Tracking**: Automatic step counting based on distance traveled
- **Health System**: Take damage from high jumps or long falls
- **Goal Achievement**: Celebrate when you reach your step target
- **Configuration Panel**: Customize your step goal and detection settings
- **Visual Feedback**: Screen shake and color changes for damage and achievements

## 📋 Prerequisites and System Requirements

### Minimum System Requirements
- **Operating System**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **CPU**: 64-bit processor with 2+ cores
- **RAM**: 4 GB available memory
- **Graphics**: OpenGL 3.3 compatible graphics card
- **Storage**: 500 MB free space
- **Display**: 1920x1080 resolution recommended

### Required Software
- **Godot Engine 4.3+**: Download from [godotengine.org](https://godotengine.org/download)
  - Choose the "Standard" version (not Mono)
  - Available for Windows, macOS, and Linux

## 🚀 Installation and Setup

### Step 1: Install Godot Engine
1. Visit [godotengine.org/download](https://godotengine.org/download)
2. Download the appropriate version for your operating system:
   - **Windows**: `Godot_v4.3-stable_win64.exe.zip`
   - **macOS**: `Godot_v4.3-stable_macos.universal.zip`
   - **Linux**: `Godot_v4.3-stable_linux.x86_64.zip`
3. Extract the downloaded archive to a location of your choice
4. Run the Godot executable to verify installation

### Step 2: Download or Clone the Project
1. **Option A - Download ZIP**:
   - Download the project files as a ZIP archive
   - Extract to your desired location

2. **Option B - Git Clone** (if you have Git installed):
   ```bash
   git clone <repository-url>
   cd step-counter-game
   ```

### Step 3: Verify Project Structure
Ensure your project directory contains:
```
step-counter-game/
├── project.godot
├── scenes/
│   ├── main.tscn
│   ├── Player.tscn
│   ├── StepCounter.tscn
│   ├── LifeIndicator.tscn
│   └── StepConfig.tscn
├── scripts/
│   ├── main.gd
│   ├── Player.gd
│   ├── StepCounter.gd
│   ├── LifeSystem.gd
│   └── StepConfig.gd
└── assets/
    └── icon.png
```

## 🎯 How to Run the Game

### Method 1: Using Godot Editor (Recommended)
1. **Launch Godot Engine**
   - Double-click the Godot executable
   - Or run from command line: `./Godot_v4.3-stable_linux.x86_64` (Linux/macOS)
   - Or run `Godot_v4.3-stable_win64.exe` (Windows)

2. **Import the Project**
   - Click "Import" in the Project Manager
   - Navigate to your project directory
   - Select the `project.godot` file
   - Click "Import & Edit"

3. **Run the Game**
   - In the Godot editor, click the "Play" button (▶️) in the top toolbar
   - Or press `F5` to run the current scene
   - Or press `F6` to run the main scene specifically

### Method 2: Command Line
1. **Navigate to project directory**:
   ```bash
   cd /path/to/step-counter-game
   ```

2. **Run with Godot executable**:
   ```bash
   # Linux/macOS
   ./path/to/godot --path . --editor

   # Windows
   "C:\path\to\godot.exe" --path . --editor
   ```

3. **Run without editor** (exported games only):
   ```bash
   # Linux/macOS
   ./path/to/godot --path . --export-debug "Linux/X11" ./game_debug

   # Windows
   "C:\path\to\godot.exe" --path . --export-debug "Windows Desktop" .\game_debug.exe
   ```

## 🎮 Game Controls

### Movement Controls
- **WASD Keys**: Move character (W: up, A: left, S: down, D: right)
- **Spacebar**: Jump
- **Tab**: Toggle configuration panel

### Configuration Panel (Tab Key)
When opened, you can adjust:
- **Step Goal**: Set your target number of steps (default: 10,000)
- **Step Detection Mode**: Choose between "distance" or "time" based detection
- **Movement Speed**: Adjust character movement speed
- **Step Distance Threshold**: Distance required before counting a step (default: 50 units)

## 🎯 Gameplay Instructions

### Objective
Reach your daily step goal while maintaining your health by avoiding excessive jumping and falling.

### How Steps Are Counted
- Steps are automatically counted based on distance traveled
- Default: 50 units of movement = 1 step
- Steps only count when you're actively moving (velocity > 10 units/second)
- Step counter updates in real-time in the top-left corner

### Health System
- **Starting Health**: 100 HP
- **Jump Damage**: Take damage when jumping too high (2 damage per unit above 50)
- **Fall Damage**: Take damage when falling too far (5 damage per unit above 100)
- **Visual Feedback**: Health bar changes color (Green → Yellow → Red) as health decreases
- **Death**: Game continues but health stays at 0 (no respawn system)

### Goal Achievement
- **Default Goal**: 10,000 steps
- **Progress Tracking**: Real-time progress shown as percentage
- **Celebration**: When goal is reached:
  - Step counter flashes and turns green
  - Screen shake effect
  - Console message: "🎉 GOAL ACHIEVED! 🎉"

### Tips for Success
1. **Move efficiently**: Walk steadily rather than jumping excessively
2. **Avoid high jumps**: Keep jumps low to minimize damage
3. **Watch your health**: Monitor the health bar in the top-right corner
4. **Use the config panel**: Adjust settings to match your playstyle
5. **Celebrate achievements**: Enjoy the visual feedback when you reach your goal!

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Game Won't Start
- **Problem**: Godot editor fails to open the project
- **Solution**:
  1. Verify Godot 4.3+ is installed
  2. Check that `project.godot` exists in the project root
  3. Ensure no special characters in the project path
  4. Try restarting Godot editor

#### Performance Issues
- **Problem**: Game runs slowly or stutters
- **Solution**:
  1. Close other applications to free up RAM
  2. Lower graphics settings in Project → Project Settings → Rendering
  3. Check if your system meets minimum requirements
  4. Update graphics drivers

#### Controls Not Working
- **Problem**: Keyboard input not registering
- **Solution**:
  1. Click inside the game window to ensure focus
  2. Check Project → Project Settings → Input Map for correct key bindings
  3. Verify no other applications are capturing keyboard input
  4. Try a different keyboard or USB port

#### Step Counter Not Updating
- **Problem**: Steps not being counted during movement
- **Solution**:
  1. Ensure you're moving with WASD keys
  2. Check console for "Step counted!" messages
  3. Verify step detection settings in config panel
  4. Check if step distance threshold is too high

#### Configuration Panel Won't Open
- **Problem**: Tab key doesn't show configuration options
- **Solution**:
  1. Press Tab key (not Alt+Tab)
  2. Ensure no other applications are using Tab
  3. Check if configuration panel scene is properly loaded

#### Visual Issues
- **Problem**: Screen appears blurry or incorrectly sized
- **Solution**:
  1. Check display settings in Project → Project Settings → Display
  2. Verify your monitor resolution matches project settings (1920x1080)
  3. Update graphics drivers
  4. Try windowed mode: Project → Project Settings → Display → Window → Mode

### Getting Help
If issues persist:
1. Check the Godot console output for error messages
2. Verify all project files are present and not corrupted
3. Try running the project on a different computer
4. Check the [Godot documentation](https://docs.godotengine.org/) for version-specific issues

### Debug Information
Enable debug mode by:
1. Opening Project → Project Settings → Debug
2. Checking "Visible Collision Shapes" for physics debugging
3. Monitoring console output for step counting and damage messages

## 📊 Project Information

- **Engine**: Godot 4.3
- **Resolution**: 1920x1080
- **Physics FPS**: 60
- **Main Scene**: `scenes/main.tscn`
- **Player Scene**: `scenes/Player.tscn`

## 🔄 Updates and Development

### Checking for Updates
1. Pull latest changes from the repository
2. Restart Godot editor
3. Check Project → About for version information

### Development Setup
For developers wanting to modify the game:
1. Install Godot 4.3+
2. Clone/download the project
3. Open in Godot editor
4. Edit scenes and scripts as needed
5. Test changes using the Play button

### Exporting the Game
To create a standalone executable:
1. Go to Project → Export
2. Choose your target platform
3. Configure export settings
4. Click "Export Project"
5. Share the exported files with others

---

**Enjoy your step-counting adventure!** 🏃‍♂️💨