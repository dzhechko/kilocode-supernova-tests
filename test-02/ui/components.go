package ui

import (
	"strings"

	"github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"bubble-tea-calculator/models"
)

type Button struct {
	Label    string
	Key      string
	Style    lipgloss.Style
	Selected bool
}

type ButtonGrid struct {
	Buttons [][]Button
	SelectedRow int
	SelectedCol int
}

func NewButtonGrid() ButtonGrid {
	buttons := [][]Button{
		{
			{Label: "C", Key: "c", Style: clearButtonStyle()},
			{Label: "CE", Key: "ce", Style: clearButtonStyle()},
			{Label: "⌫", Key: "backspace", Style: operatorButtonStyle()},
			{Label: "÷", Key: "/", Style: operatorButtonStyle()},
		},
		{
			{Label: "7", Key: "7", Style: numberButtonStyle()},
			{Label: "8", Key: "8", Style: numberButtonStyle()},
			{Label: "9", Key: "9", Style: numberButtonStyle()},
			{Label: "×", Key: "*", Style: operatorButtonStyle()},
		},
		{
			{Label: "4", Key: "4", Style: numberButtonStyle()},
			{Label: "5", Key: "5", Style: numberButtonStyle()},
			{Label: "6", Key: "6", Style: numberButtonStyle()},
			{Label: "-", Key: "-", Style: operatorButtonStyle()},
		},
		{
			{Label: "1", Key: "1", Style: numberButtonStyle()},
			{Label: "2", Key: "2", Style: numberButtonStyle()},
			{Label: "3", Key: "3", Style: numberButtonStyle()},
			{Label: "+", Key: "+", Style: operatorButtonStyle()},
		},
		{
			{Label: "0", Key: "0", Style: numberButtonStyle().Width(10)},
			{Label: ".", Key: ".", Style: numberButtonStyle()},
			{Label: "=", Key: "enter", Style: equalsButtonStyle()},
		},
	}

	return ButtonGrid{
		Buttons:     buttons,
		SelectedRow: 0,
		SelectedCol: 0,
	}
}

func (bg *ButtonGrid) MoveUp() {
	bg.SelectedRow = (bg.SelectedRow - 1 + len(bg.Buttons)) % len(bg.Buttons)
}

func (bg *ButtonGrid) MoveDown() {
	bg.SelectedRow = (bg.SelectedRow + 1) % len(bg.Buttons)
}

func (bg *ButtonGrid) MoveLeft() {
	bg.SelectedCol = (bg.SelectedCol - 1 + len(bg.Buttons[bg.SelectedRow])) % len(bg.Buttons[bg.SelectedRow])
}

func (bg *ButtonGrid) MoveRight() {
	bg.SelectedCol = (bg.SelectedCol + 1) % len(bg.Buttons[bg.SelectedRow])
}

func (bg *ButtonGrid) GetSelectedButton() *Button {
	return &bg.Buttons[bg.SelectedRow][bg.SelectedCol]
}

func (bg *ButtonGrid) SelectButton(row, col int) {
	bg.SelectedRow = row
	bg.SelectedCol = col
}

func (bg *ButtonGrid) Render() string {
	var result strings.Builder

	for i, row := range bg.Buttons {
		for j, button := range row {
			if i == bg.SelectedRow && j == bg.SelectedCol {
				button.Selected = true
				result.WriteString(button.Style.Copy().Bold(true).Render(button.Label))
			} else {
				button.Selected = false
				result.WriteString(button.Style.Render(button.Label))
			}
		}
		result.WriteString("\n")
	}

	return result.String()
}

type Display struct {
	calculator *models.Calculator
}

func NewDisplay(calc *models.Calculator) Display {
	return Display{calculator: calc}
}

func (d Display) Render() string {
	displayStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color("0")).
		Background(lipgloss.Color("254")).
		Padding(1, 2).
		Margin(1).
		Width(32).
		Align(lipgloss.Right).
		Bold(true).
		Border(lipgloss.ThickBorder()).
		BorderForeground(lipgloss.Color("63"))

	content := d.calculator.GetDisplay()
	return displayStyle.Render(content)
}

type CalculatorUI struct {
	calculator *models.Calculator
	grid       ButtonGrid
	display    Display
}

func NewCalculatorUI(calc *models.Calculator) CalculatorUI {
	return CalculatorUI{
		calculator: calc,
		grid:       NewButtonGrid(),
		display:    NewDisplay(calc),
	}
}

func (cui *CalculatorUI) Update(msg tea.Msg) (CalculatorUI, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "up":
			cui.grid.MoveUp()
		case "down":
			cui.grid.MoveDown()
		case "left":
			cui.grid.MoveLeft()
		case "right":
			cui.grid.MoveRight()
		case "enter":
			selected := cui.grid.GetSelectedButton()
			cui.handleButtonPress(selected.Key)
		case "q", "ctrl+c":
			return *cui, tea.Quit
		default:
			// Handle direct key presses
			cui.handleButtonPress(msg.String())
		}
	}
	return *cui, nil
}

func (cui *CalculatorUI) handleButtonPress(key string) {
	switch key {
	case "0", "1", "2", "3", "4", "5", "6", "7", "8", "9":
		cui.calculator.InputDigit(key)
	case ".":
		cui.calculator.InputDecimal()
	case "+", "-", "*", "/":
		cui.calculator.InputOperation(key)
	case "enter":
		cui.calculator.Calculate()
	case "c":
		cui.calculator.Clear()
	case "ce":
		cui.calculator.ClearEntry()
	case "backspace":
		cui.calculator.Backspace()
	}
}

func (cui *CalculatorUI) Render() string {
	var result strings.Builder

	// Main container
	containerStyle := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(lipgloss.Color("57")).
		Padding(1, 2).
		Margin(1)

	// Title
	titleStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color("39")).
		Bold(true).
		MarginBottom(1).
		Align(lipgloss.Center)

	result.WriteString(titleStyle.Render("🧮 Terminal Calculator"))
	result.WriteString("\n")

	// Separator
	separatorStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color("240")).
		MarginBottom(1)
	result.WriteString(separatorStyle.Render("─" + strings.Repeat("─", 32)))
	result.WriteString("\n")

	// Display container
	displayContainerStyle := lipgloss.NewStyle().
		Border(lipgloss.NormalBorder()).
		BorderForeground(lipgloss.Color("63")).
		Padding(1).
		MarginBottom(2)

	result.WriteString(displayContainerStyle.Render(cui.display.Render()))
	result.WriteString("\n\n")

	// Button grid
	result.WriteString(cui.grid.Render())

	return containerStyle.Render(result.String())
}

// Button styles
func numberButtonStyle() lipgloss.Style {
	return lipgloss.NewStyle().
		Foreground(lipgloss.Color("15")).
		Background(lipgloss.Color("117")).
		Padding(0, 1).
		Margin(0, 1).
		Width(5).
		Align(lipgloss.Center).
		Bold(true)
}

func operatorButtonStyle() lipgloss.Style {
	return lipgloss.NewStyle().
		Foreground(lipgloss.Color("15")).
		Background(lipgloss.Color("33")).
		Padding(0, 1).
		Margin(0, 1).
		Width(5).
		Align(lipgloss.Center).
		Bold(true)
}

func clearButtonStyle() lipgloss.Style {
	return lipgloss.NewStyle().
		Foreground(lipgloss.Color("15")).
		Background(lipgloss.Color("160")).
		Padding(0, 1).
		Margin(0, 1).
		Width(5).
		Align(lipgloss.Center).
		Bold(true)
}

func equalsButtonStyle() lipgloss.Style {
	return lipgloss.NewStyle().
		Foreground(lipgloss.Color("15")).
		Background(lipgloss.Color("28")).
		Padding(0, 1).
		Margin(0, 1).
		Width(5).
		Align(lipgloss.Center).
		Bold(true)
}