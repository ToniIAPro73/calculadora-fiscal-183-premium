import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "ac-button inline-flex items-center justify-center gap-2 whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "ac-button--primary",
        destructive: "ac-button--destructive",
        outline: "ac-button--secondary",
        secondary: "ac-button--secondary",
        ghost: "ac-button--ghost",
        link: "min-h-0 border-0 bg-transparent p-0 text-[var(--accent)] shadow-none normal-case tracking-normal hover:underline",
      },
      size: {
        default: "",
        sm: "ac-button--sm",
        lg: "ac-button--lg",
        icon: "h-11 w-11 min-h-0 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
