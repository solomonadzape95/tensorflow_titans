import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
	{
		variants: {
			variant: {
				default:
					"glass-button bg-primary text-primary-foreground hover:shadow-glow",
				destructive:
					"glass-button bg-destructive text-destructive-foreground hover:shadow-glow",
				outline:
					"glass-button border-2 border-input bg-transparent hover:bg-accent/50 hover:text-accent-foreground",
				secondary:
					"glass-button bg-secondary text-secondary-foreground hover:shadow-glow",
				ghost: "hover:bg-accent/50 hover:text-accent-foreground",
				gradient:
					"relative overflow-hidden bg-gradient-to-r from-primary to-[#ff4ecd] text-white before:absolute before:inset-0 before:bg-gradient-shine before:translate-x-[-100%] hover:before:animate-shimmer",
				link: "text-primary underline-offset-4 hover:underline",
				glass:
					"glass-button bg-transparent backdrop-blur-md border border-solid border-white/20 text-foreground hover:shadow-glow",
				neumorphic:
					"neumorphic text-foreground hover:shadow-lg active:neumorphic-inset",
			},
			size: {
				default: "h-9 px-4 py-2 has-[>svg]:px-3",
				sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
				lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
				icon: "size-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
