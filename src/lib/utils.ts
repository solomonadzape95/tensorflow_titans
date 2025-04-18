import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getInitials(name: string) {
	const names = name.split(" ");
	return names.map((n) => n.charAt(0).toUpperCase()).join("");
}
