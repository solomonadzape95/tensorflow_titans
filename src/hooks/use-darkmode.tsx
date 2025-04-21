import { useEffect, useState } from "react";

export function useDarkMode(initialValue = false) {
	const [darkMode, setDarkMode] = useState(() => {
		if (typeof localStorage !== undefined) {
			const value = localStorage.getItem("appDarkMode");
			if (value !== null) {
				return JSON.parse(value);
			}
		}
		return initialValue;
	});
	useEffect(() => {
		if (typeof localStorage !== undefined) {
			localStorage.setItem("appDarkMode", JSON.stringify(darkMode));
		}
		if (darkMode) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}, [darkMode]);

	const toggleDarkMode = (value: boolean) => {
		setDarkMode(value);
	};
	return [darkMode, toggleDarkMode];
}
