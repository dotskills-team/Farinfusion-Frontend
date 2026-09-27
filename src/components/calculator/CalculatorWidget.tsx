"use client";

import { useState, useCallback } from "react";
import { Calculator as CalculatorIcon, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Operator = "+" | "-" | "*" | "/" | null;

function calculate(a: number, b: number, op: Operator): number {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      return b === 0 ? NaN : a / b;
    default:
      return b;
  }
}

function formatDisplay(value: number): string {
  if (Number.isNaN(value)) return "Error";
  if (!Number.isFinite(value)) return "Error";
  const str = value.toString();
  if (str.length > 14) {
    return value.toPrecision(10).replace(/\.?0+$/, "");
  }
  return str;
}

function Calculator() {
  const [display, setDisplay] = useState("0");
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [memory, setMemory] = useState(0);

  const clearAll = useCallback(() => {
    setDisplay("0");
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  }, []);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes(".")) setDisplay(display + ".");
  };

  const backspace = () => {
    if (waitingForOperand) return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : "0");
  };

  const toggleSign = () => {
    setDisplay((parseFloat(display) * -1).toString());
  };

  const inputPercent = () => {
    setDisplay((parseFloat(display) / 100).toString());
  };

  const performOperator = (nextOperator: Operator) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operator) {
      const result = calculate(prevValue, inputValue, operator);
      setDisplay(formatDisplay(result));
      setPrevValue(result);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);
    if (operator && prevValue !== null) {
      const result = calculate(prevValue, inputValue, operator);
      setDisplay(formatDisplay(result));
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  const memoryClear = () => setMemory(0);
  const memoryRecall = () => {
    setDisplay(memory.toString());
    setWaitingForOperand(true);
  };
  const memoryAdd = () => setMemory(memory + parseFloat(display));
  const memorySubtract = () => setMemory(memory - parseFloat(display));

  const memButtons: { label: string; onClick: () => void }[] = [
    { label: "MC", onClick: memoryClear },
    { label: "MR", onClick: memoryRecall },
    { label: "M+", onClick: memoryAdd },
    { label: "M-", onClick: memorySubtract },
  ];

  const baseBtn =
    "h-12 rounded-lg text-base font-medium transition-colors active:scale-95";
  const numBtn = cn(
    baseBtn,
    "bg-muted hover:bg-muted/80 text-foreground"
  );
  const opBtn = cn(
    baseBtn,
    "bg-primary/10 hover:bg-primary/20 text-primary"
  );
  const funcBtn = cn(
    baseBtn,
    "bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm"
  );

  return (
    <div className="w-full max-w-xs mx-auto select-none">
      {/* Memory row */}
      <div className="grid grid-cols-4 gap-2 mb-2">
        {memButtons.map((m) => (
          <button key={m.label} className={funcBtn} onClick={m.onClick}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Display */}
      <div className="bg-muted/50 rounded-lg p-4 mb-3 text-right">
        {operator && prevValue !== null && (
          <div className="text-xs text-muted-foreground truncate">
            {prevValue} {operator}
          </div>
        )}
        <div className="text-3xl font-semibold tracking-tight truncate">
          {display}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-2">
        <button className={funcBtn} onClick={clearAll}>
          AC
        </button>
        <button className={funcBtn} onClick={toggleSign}>
          +/-
        </button>
        <button className={funcBtn} onClick={inputPercent}>
          %
        </button>
        <button className={opBtn} onClick={() => performOperator("/")}>
          ÷
        </button>

        {["7", "8", "9"].map((d) => (
          <button key={d} className={numBtn} onClick={() => inputDigit(d)}>
            {d}
          </button>
        ))}
        <button className={opBtn} onClick={() => performOperator("*")}>
          ×
        </button>

        {["4", "5", "6"].map((d) => (
          <button key={d} className={numBtn} onClick={() => inputDigit(d)}>
            {d}
          </button>
        ))}
        <button className={opBtn} onClick={() => performOperator("-")}>
          −
        </button>

        {["1", "2", "3"].map((d) => (
          <button key={d} className={numBtn} onClick={() => inputDigit(d)}>
            {d}
          </button>
        ))}
        <button className={opBtn} onClick={() => performOperator("+")}>
          +
        </button>

        <button className={numBtn} onClick={() => inputDigit("0")}>
          0
        </button>
        <button className={numBtn} onClick={inputDecimal}>
          .
        </button>
        <button className={funcBtn} onClick={backspace} aria-label="Backspace">
          <Delete className="w-4 h-4 mx-auto" />
        </button>
        <button
          className={cn(baseBtn, "bg-primary text-primary-foreground hover:bg-primary/90")}
          onClick={handleEquals}
        >
          =
        </button>
      </div>
    </div>
  );
}

export default function CalculatorWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Sits in the header's normal flex flow now — no `fixed` positioning.
          (A fixed button shifts when a Radix Dialog/DropdownMenu opens and
          locks body scroll, because the scrollbar-compensation changes the
          viewport width that `right: Npx` is measured against.) */}
      <button
        onClick={() => setOpen(true)}
        className="h-9 w-9 flex items-center justify-center rounded-full border bg-background hover:bg-muted transition-colors shadow-sm shrink-0"
        aria-label="Open calculator"
        title="Calculator"
      >
        <CalculatorIcon className="w-4 h-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Calculator</DialogTitle>
          </DialogHeader>
          <Calculator />
        </DialogContent>
      </Dialog>
    </>
  );
}