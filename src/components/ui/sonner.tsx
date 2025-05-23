import { useDarkMode } from "@/hooks/use-darkmode";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = (props: ToasterProps) => {
	const [darkMode] = useDarkMode();

	return (
		<Sonner
			theme={darkMode ? "dark" : "light"}
			className="toaster group"
			closeButton
			style={
				{
					"--normal-bg": "var(--popover)",
					"--normal-text": "var(--popover-foreground)",
					"--normal-border": "var(--border)",
				} as React.CSSProperties
			}
			{...props}
		/>
	);
};

export { Toaster };
