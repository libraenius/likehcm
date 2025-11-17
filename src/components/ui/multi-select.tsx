"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

export interface MultiSelectOption {
  value: string
  label: string
  badge?: string
  badgeClassName?: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
  maxCount?: number
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Выберите элементы...",
  className,
  maxCount,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
    } else {
      if (maxCount && selected.length >= maxCount) {
        return
      }
      onChange([...selected, value])
    }
  }

  const removeOption = (value: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selected.filter((item) => item !== value))
  }

  const selectedOptions = options.filter((option) => selected.includes(option.value))

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn(
          "w-full justify-between text-left font-normal min-h-10 h-auto py-2 items-start",
          !selected.length && "text-muted-foreground"
        )}
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
          {selected.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            selectedOptions.map((option) => (
              <Badge
                key={option.value}
                variant="secondary"
                className="mr-1 mb-1"
                onClick={(e) => removeOption(option.value, e)}
              >
                {option.label}
                {option.badge && (
                  <span className={cn("ml-1", option.badgeClassName)}>{option.badge}</span>
                )}
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Удалить"
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer inline-flex items-center justify-center"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      removeOption(option.value, e as any)
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onClick={(e) => removeOption(option.value, e)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </span>
              </Badge>
            ))
          )}
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md">
          <div className="max-h-60 overflow-auto p-1">
            {options.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                Нет доступных опций
              </div>
            ) : (
              options.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <div
                    key={option.value}
                    className={cn(
                      "relative flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer select-none hover:bg-accent hover:text-accent-foreground",
                      isSelected && "bg-accent"
                    )}
                    onClick={() => toggleOption(option.value)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleOption(option.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="truncate">{option.label}</span>
                      {option.badge && (
                        <Badge
                          variant="outline"
                          className={cn("text-xs shrink-0", option.badgeClassName)}
                        >
                          {option.badge}
                        </Badge>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

