import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-3",
        caption: "flex justify-center items-center pt-1 relative",
        caption_label: "text-sm font-semibold text-[var(--app-text-primary,#f0ede8)]",
        nav: "flex items-center gap-1",
        nav_button: cn(
          "inline-flex items-center justify-center w-7 h-7 rounded-full",
          "border border-[var(--app-border,rgba(255,255,255,0.08))]",
          "bg-[rgba(255,255,255,0.04)] text-[var(--app-text-secondary,rgba(240,237,232,0.65))]",
          "hover:bg-[rgba(205,127,50,0.12)] hover:border-[rgba(205,127,50,0.3)]",
          "hover:text-[#CD7F32] transition-colors cursor-pointer"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell: "w-9 text-center text-[0.68rem] font-bold tracking-widest text-[var(--app-text-muted,rgba(240,237,232,0.38))] uppercase pb-1",
        row: "flex w-full mt-1",
        cell: "relative h-9 w-9 text-center p-0 focus-within:relative focus-within:z-20",
        day: cn(
          "inline-flex items-center justify-center",
          "h-9 w-9 rounded-full p-0",
          "text-sm font-medium",
          "text-[var(--app-text-secondary,rgba(240,237,232,0.72))]",
          "hover:bg-[rgba(205,127,50,0.15)] hover:text-[var(--app-text-primary,#f0ede8)]",
          "transition-colors cursor-pointer select-none",
          "aria-selected:opacity-100"
        ),
        day_selected: cn(
          "!bg-[#CD7F32] !text-[#1a1525] font-bold",
          "hover:!bg-[#b8711e]"
        ),
        day_today: cn(
          "ring-1 ring-[rgba(205,127,50,0.55)]",
          "text-[#CD7F32] font-semibold"
        ),
        day_outside: "opacity-30 text-[var(--app-text-muted,rgba(240,237,232,0.38))]",
        day_disabled: "opacity-20 cursor-not-allowed pointer-events-none",
        day_range_middle: "aria-selected:bg-[rgba(205,127,50,0.12)] aria-selected:text-[var(--app-text-primary,#f0ede8)] rounded-none",
        day_range_end: "day-range-end",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-3.5 w-3.5" />,
        IconRight: () => <ChevronRight className="h-3.5 w-3.5" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
