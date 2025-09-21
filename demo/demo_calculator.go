package main

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/lipgloss"
)

// Demo version that shows how the calculator looks without requiring TTY
func main() {
	// Simulate the calculator display
	displayStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color("0")).
		Background(lipgloss.Color("254")).
		Padding(1, 2).
		Width(32).
		Align(lipgloss.Right).
		Bold(true).
		Border(lipgloss.ThickBorder()).
		BorderForeground(lipgloss.Color("63"))

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

	var result strings.Builder
	result.WriteString(titleStyle.Render("🧮 Terminal Calculator"))
	result.WriteString("\n")

	// Separator
	separatorStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color("240")).
		MarginBottom(1)
	result.WriteString(separatorStyle.Render("─" + strings.Repeat("─", 32)))
	result.WriteString("\n")

	// Display with sample number
	result.WriteString(displayStyle.Render("123,456.789"))
	result.WriteString("\n\n")

	// Button styles
	numberButtonStyle := func() lipgloss.Style {
		return lipgloss.NewStyle().
			Foreground(lipgloss.Color("15")).
			Background(lipgloss.Color("117")).
			Padding(0, 1).
			Margin(0, 1).
			Width(5).
			Align(lipgloss.Center).
			Bold(true)
	}

	operatorButtonStyle := func() lipgloss.Style {
		return lipgloss.NewStyle().
			Foreground(lipgloss.Color("15")).
			Background(lipgloss.Color("33")).
			Padding(0, 1).
			Margin(0, 1).
			Width(5).
			Align(lipgloss.Center).
			Bold(true)
	}

	clearButtonStyle := func() lipgloss.Style {
		return lipgloss.NewStyle().
			Foreground(lipgloss.Color("15")).
			Background(lipgloss.Color("160")).
			Padding(0, 1).
			Margin(0, 1).
			Width(5).
			Align(lipgloss.Center).
			Bold(true)
	}

	equalsButtonStyle := func() lipgloss.Style {
		return lipgloss.NewStyle().
			Foreground(lipgloss.Color("15")).
			Background(lipgloss.Color("28")).
			Padding(0, 1).
			Margin(0, 1).
			Width(5).
			Align(lipgloss.Center).
			Bold(true)
	}

	// Create button grid
	buttons := [][]string{
		{"C", "CE", "⌫", "÷"},
		{"7", "8", "9", "×"},
		{"4", "5", "6", "-"},
		{"1", "2", "3", "+"},
		{"0", ".", "=", ""},
	}

	// Render buttons
	for i, row := range buttons {
		for j, button := range row {
			if button == "" {
				continue
			}

			var style lipgloss.Style
			switch {
			case button == "C" || button == "CE" || button == "⌫":
				style = clearButtonStyle()
			case button == "=":
				style = equalsButtonStyle()
			case button == "+" || button == "-" || button == "×" || button == "÷":
				style = operatorButtonStyle()
			default:
				style = numberButtonStyle()
			}

			// Highlight the "5" button as if it's selected
			if i == 2 && j == 1 {
				style = style.Copy().Bold(true).Foreground(lipgloss.Color("226"))
			}

			result.WriteString(style.Render(button))
		}
		result.WriteString("\n")
	}

	fmt.Println(containerStyle.Render(result.String()))
	fmt.Println()
	fmt.Println("📝 Instructions:")
	fmt.Println("• Use arrow keys (↑↓←→) to navigate between buttons")
	fmt.Println("• Press Enter to select a button")
	fmt.Println("• Or type numbers/operators directly")
	fmt.Println("• Press 'q' or 'ESC' to exit")
	fmt.Println()
	fmt.Println("✅ Calculator is ready! Run 'go run .' in a proper terminal to use it interactively.")
}