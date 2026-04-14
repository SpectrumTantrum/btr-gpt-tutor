"use client"

import { useTheme } from "next-themes"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const THEMES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "glass", label: "Glass" },
] as const

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-1.5">
      <Label htmlFor="theme-select">Theme</Label>
      <Select value={theme ?? "light"} onValueChange={(v) => setTheme(v ?? "light")}>
        <SelectTrigger id="theme-select">
          <SelectValue placeholder="Select theme" />
        </SelectTrigger>
        <SelectContent>
          {THEMES.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
