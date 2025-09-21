# kilocode-supernova-tests

This repository contains multiple test projects and applications.

## Projects

### 1. Movie Tracker App (test-01)

A beautiful movie tracking application built with Expo React Native, featuring a GitHub-style calendar view to track your movie watching habits.

#### Features

- 🎬 **Movie Search**: Search for movies using the TMDB API
- 📅 **GitHub-Style Calendar**: Visual calendar showing movies watched per day
- ⭐ **Reviews System**: Add and manage personal reviews for movies
- ❤️ **Favorites**: Keep track of your favorite movies
- 📊 **Statistics**: View your movie watching statistics
- 🎨 **Beautiful UI**: Red, blue, and yellow color scheme with transparency effects

#### Technologies Used

- **React Native** with Expo
- **React Navigation** for navigation
- **AsyncStorage** for local data persistence
- **Axios** for API requests
- **TMDB API** for movie data

### 2. Terminal Calculator (test-02)

A beautiful terminal-based calculator built with Go and Bubble Tea framework.

#### Features

- **Classic Calculator Layout**: Clean, intuitive interface with a familiar button grid
- **Keyboard Navigation**: Use arrow keys to navigate between buttons
- **Hotkeys**: Direct keyboard input for numbers and operations
- **Visual Feedback**: Selected buttons are highlighted
- **Formatted Display**: Numbers are displayed with thousand separators
- **Full Functionality**: Addition, subtraction, multiplication, division, and decimal support

#### Controls

##### Navigation
- **Arrow Keys** (↑↓←→): Move between calculator buttons
- **Enter**: Press the selected button
- **ESC** or **q**: Exit the application

##### Direct Input
- **Numbers** (0-9): Input digits directly
- **Operators** (+, -, *, /): Perform operations
- **Enter**: Calculate result (equals)
- **Backspace**: Delete last digit
- **C**: Clear all
- **CE**: Clear current entry
- **.**: Add decimal point

#### Installation

1. Make sure you have Go installed (version 1.21 or higher)
2. Navigate to the calculator directory
3. Install dependencies:
   ```bash
   go mod tidy
   ```
4. Run the calculator:
   ```bash
   go run .
   ```

#### Technologies Used

- Built with [Bubble Tea](https://github.com/charmbracelet/bubbletea) for terminal UI
- Styled with [Lip Gloss](https://github.com/charmbracelet/lipgloss) for beautiful terminal output
- Full keyboard support with both navigation and direct input modes
- Proper error handling for division by zero and invalid operations
