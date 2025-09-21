# kilocode-supernova-tests

This repository contains multiple test projects and applications, each organized in its own directory.

## Project Structure

```
kilocode-supernova-tests/
├── test-01/          # Movie Tracker App (React Native)
├── test-02/          # Terminal Calculator (Go)
├── test-03/          # VNC Remote Access Setup
└── README.md         # This file
```

## Projects

### 1. Movie Tracker App (`test-01/`)

A beautiful movie tracking application built with Expo React Native, featuring a GitHub-style calendar view to track your movie watching habits.

#### Features

- 🎬 **Movie Search**: Search for movies using the TMDB API
- 📅 **GitHub-Style Calendar**: Visual calendar showing movies watched per day
- ⭐ **Reviews System**: Add and manage personal reviews for movies
- ❤️ **Favorites**: Keep track of your favorite movies
- 📊 **Statistics**: View your movie watching statistics
- 🎨 **Beautiful UI**: Red, blue, and yellow color scheme with transparency effects

#### Quick Start

```bash
cd test-01/
npm install
npm start
```

#### Technologies Used

- **React Native** with Expo
- **React Navigation** for navigation
- **AsyncStorage** for local data persistence
- **Axios** for API requests
- **TMDB API** for movie data

---

### 2. Terminal Calculator (`test-02/`)

A beautiful terminal-based calculator built with Go and Bubble Tea framework.

#### Features

- **Classic Calculator Layout**: Clean, intuitive interface with a familiar button grid
- **Keyboard Navigation**: Use arrow keys to navigate between buttons
- **Hotkeys**: Direct keyboard input for numbers and operations
- **Visual Feedback**: Selected buttons are highlighted
- **Formatted Display**: Numbers are displayed with thousand separators
- **Full Functionality**: Addition, subtraction, multiplication, division, and decimal support

#### Quick Start

```bash
cd test-02/
go mod tidy
go run .
```

#### Controls

- **Arrow Keys** (↑↓←→): Navigate between calculator buttons
- **Enter**: Press the selected button
- **Numbers** (0-9): Input digits directly
- **Operators** (+, -, *, /): Perform operations
- **ESC** or **q**: Exit the application

#### Technologies Used

- Built with [Bubble Tea](https://github.com/charmbracelet/bubbletea) for terminal UI
- Styled with [Lip Gloss](https://github.com/charmbracelet/lipgloss) for beautiful terminal output
- Full keyboard support with both navigation and direct input modes
- Proper error handling for division by zero and invalid operations

---

### 3. VNC Remote Access Setup (`test-03/`)

VNC remote access configuration and setup tools.

## Getting Started

Each project is self-contained in its respective directory. Navigate to the project you're interested in and follow the instructions in that folder.

## Contributing

Feel free to contribute to any of the projects by:
- Adding new features
- Improving the UI/UX
- Fixing bugs
- Adding more test projects

## License

This project is open source and available under the MIT License.
