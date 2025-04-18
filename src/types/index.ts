import type { protectPage } from "@/lib/services/authService";

export type UserData = Awaited<ReturnType<typeof protectPage>>;
