
package models

import (
	"errors"
	"strconv"
	"strings"
)

type Calculator struct {
	Display    string
	FirstNum   float64
	SecondNum  float64
	Operation  string
	WaitingForOperand bool
}

func NewCalculator() *Calculator {
	return &Calculator{
		Display:           "0",
		FirstNum:          0,
		SecondNum:        0,
		Operation:         "",
		WaitingForOperand: false,
	}
}

func (c *Calculator) InputDigit(digit string) {
	if c.WaitingForOperand {
		c.Display = digit
		c.WaitingForOperand = false
	} else {
		if c.Display == "0" {
			c.Display = digit
		} else {
			c.Display += digit
		}
	}
}

func (c *Calculator) InputDecimal() {
	if c.WaitingForOperand {
		c.Display = "0."
		c.WaitingForOperand = false
	} else if !strings.Contains(c.Display, ".") {
		c.Display += "."
	}
}

func (c *Calculator) InputOperation(operation string) {
	if c.Operation != "" {
		c.Calculate()
	}
	c.FirstNum, _ = strconv.ParseFloat(c.Display, 64)
	c.Operation = operation
	c.WaitingForOperand = true
}

func (c *Calculator) Calculate() error {
	if c.Operation == "" {
		return nil
	}

	c.SecondNum, _ = strconv.ParseFloat(c.Display, 64)

	switch c.Operation {
	case "+":
		c.FirstNum += c.SecondNum
	case "-":
		c.FirstNum -= c.SecondNum
	case "*":
		c.FirstNum *= c.SecondNum
	case "/":
		if c.SecondNum == 0 {
			return errors.New("division by zero")
		}
		c.FirstNum /= c.SecondNum
	}

	c.Display = strconv.FormatFloat(c.FirstNum, 'f', -1, 64)
	c.Operation = ""
	c.WaitingForOperand = true
	return nil
}

func (c *Calculator) Clear() {
	c.Display = "0"
	c.FirstNum = 0
	c.SecondNum = 0
	c.Operation = ""
	c.WaitingForOperand = false
}

func (c *Calculator) ClearEntry() {
	c.Display = "0"
	c.WaitingForOperand = false
}

func (c *Calculator) Backspace() {
	if len(c.Display) > 1 {
		c.Display = c.Display[:len(c.Display)-1]
	} else {
		c.Display = "0"
	}
}

func (c *Calculator) GetDisplay() string {
	// Format large numbers with thousand separators
	display := c.Display
	if len(display) > 3 {
		parts := strings.Split(display, ".")
		integerPart := parts[0]

		// Add thousand separators
		n := len(integerPart)
		for i := n - 3; i > 0; i -= 3 {
			integerPart = integerPart[:i] + "," + integerPart[i:]
		}

		if len(parts) > 1 {
			display = integerPart + "." + parts[1]
		} else {
			display = integerPart
		}
	}
	return display
}
