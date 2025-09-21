# Terminal Calculator

A beautiful terminal-based calculator built with Go and Bubble Tea framework.

## Features

- **Classic Calculator Layout**: Clean, intuitive interface with a familiar button grid
- **Keyboard Navigation**: Use arrow keys to navigate between buttons
- **Hotkeys**: Direct keyboard input for numbers and operations
- **Visual Feedback**: Selected buttons are highlighted
- **Formatted Display**: Numbers are displayed with thousand separators
- **Full Functionality**: Addition, subtraction, multiplication, division, and decimal support

## Controls

### Navigation
- **Arrow Keys** (↑↓←→): Move between calculator buttons
- **Enter**: Press the selected button
- **ESC** or **q**: Exit the application

### Direct Input
- **Numbers** (0-9): Input digits directly
- **Operators** (+, -, *, /): Perform operations
- **Enter**: Calculate result (equals)
- **Backspace**: Delete last digit
- **C**: Clear all
- **CE**: Clear current entry
- **.**: Add decimal point

## Installation

1. Make sure you have Go installed (version 1.21 or higher)
2. Clone or download this project
3. Install dependencies:
   ```bash
   go mod tidy
   ```
4. Run the calculator:
   ```bash
   go run .
   ```

## Building

To build a standalone executable:
```bash
go build -o calculator
./calculator
```

## Button Layout

```
[     DISPLAY     ]
[C ] [CE] [⌫ ] [÷ ]
[7 ] [8 ] [9 ] [× ]
[4 ] [5 ] [6 ] [- ]
[1 ] [2 ] [3 ] [+ ]
[0        ] [.] [= ]
```

## Example Usage

1. Start the calculator: `go run .`
2. Use arrow keys to navigate to buttons or press numbers directly
3. For example, to calculate 123 + 456:
   - Press: 1, 2, 3, +, 4, 5, 6, Enter
   - Result: 579

## Technical Details

- Built with [Bubble Tea](https://github.com/charmbracelet/bubbletea) for terminal UI
- Styled with [Lip Gloss](https://github.com/charmbracelet/lipgloss) for beautiful terminal output
- Full keyboard support with both navigation and direct input modes
- Proper error handling for division by zero and invalid operations