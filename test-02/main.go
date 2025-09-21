package main

import (
	"fmt"
	"os"

	"github.com/charmbracelet/bubbletea"
	"bubble-tea-calculator/models"
	"bubble-tea-calculator/ui"
)

type Model struct {
	calculator *models.Calculator
	ui         ui.CalculatorUI
}

func initialModel() Model {
	calc := models.NewCalculator()
	return Model{
		calculator: calc,
		ui:         ui.NewCalculatorUI(calc),
	}
}

func (m Model) Init() tea.Cmd {
	return nil
}

func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "q", "ctrl+c", "esc":
			return m, tea.Quit
		}
	}

	// Update UI and let it handle the message
	newUI, cmd := m.ui.Update(msg)
	m.ui = newUI

	return m, cmd
}

func (m Model) View() string {
	return m.ui.Render()
}

func main() {
	p := tea.NewProgram(initialModel())
	if _, err := p.Run(); err != nil {
		fmt.Printf("Error: %v", err)
		os.Exit(1)
	}
}