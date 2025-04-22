import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type LoginFormData, loginSchema } from "@/lib/schema";
import supabase from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Card } from "../ui/card";

const LoginForm = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const form = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});
	const [canSee, setCanSee] = useState(false);
	const { mutateAsync: login, isPending } = useMutation({
		mutationKey: ["login"],
		mutationFn: async (data: LoginFormData) => {
			const { error, data: user } = await supabase.auth.signInWithPassword({
				email: data.email,
				password: data.password,
			});

			if (error) {
				throw error;
			}

			return user;
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["auth"] });
			navigate("/dashboard");
		},
	});

	const onSubmit = (data: LoginFormData): void => {
		toast.promise(login(data), {
			loading: "Signing in...",
			success: () => {
				return "Signed in successfully! Redirecting to dashboard...";
			},
			error: (err: Error) => {
				return `Sign in failed: ${err?.message || "Please try again."}`;
			},
		});
	};

	const handleSignInWithGoogle = async () => {
		await supabase.auth.signInWithOAuth({
			provider: "google",
		});
	};

	return (
		<div className="flex h-screen w-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top_right,#4f32ff26,transparent_90%),radial-gradient(circle_at_bottom_left,#f51d7826,transparent_50%)]">
			<Card className="rounded-xl bg-white/40 mx-auto dark:bg-[#11131E] w-11/12 md:w-full md:max-w-md shadow-lg backdrop-blur-2xl">
				<div className="flex flex-col p-6 space-y-1">
					<div className="flex items-center justify-center gap-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-6 w-6 text-[#4F32FF]"
						>
							<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
							<path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
						</svg>
						<span className="text-xl font-bold">SplitWise</span>
					</div>
					<h3 className="font-semibold tracking-tight text-center text-2xl">
						Welcome back
					</h3>
					<p className="text-sm text-[#6b7280] text-center">
						Enter your email to sign in to your account
					</p>
				</div>

				<div className="p-6 pt-0 space-y-4">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="email"
								rules={{
									required: "Email is required",
									pattern: {
										value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
										message: "Please enter a valid email address",
									},
								}}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												placeholder="johndoe@example.com"
												type="email"
												className="border border-white/20 bg-[#F9FAFB]/80 backdrop-blur-md focus:border-black/10 focus:dark:bg-[#141727]/90"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="password"
								rules={{
									required: "Password is required",
								}}
								render={({ field }) => (
									<FormItem>
										<div className="flex items-center justify-between">
											<FormLabel>Password</FormLabel>
											<Link
												className="text-xs text-[#4F32FF] hover:underline"
												to="/"
											>
												Forgot password?
											</Link>
										</div>
										<FormControl>
											<div className="relative">
												<Input
													placeholder="********"
													type={canSee ? "text" : "password"}
													className=" border border-white/20 focus:border-black/10 bg-[#F9FAFB]/80 backdrop-blur-md  focus:dark:bg-[#141727]/90"
													{...field}
												/>
												<span className="absolute right-3 top-3 cursor-pointer">
													{canSee ? (
														<EyeClosed
															className="size-4"
															onClick={() => setCanSee((prev) => !prev)}
														/>
													) : (
														<Eye
															className="size-4"
															onClick={() => setCanSee((prev) => !prev)}
														/>
													)}
												</span>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button
								type="submit"
								className="rounded-3xl text-sm font-medium bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white w-full cursor-pointer hover:shadow-md dark:hover:bg-gradient-to-r dark:hover:from-[#4F32FF]/80 dark:hover:to-[#ff4ecd]/80 transition-all duration-300 "
								disabled={isPending}
							>
								Sign In
							</Button>
						</form>
					</Form>
					<div className="flex justify-center items-center text-[10px] md:text-xs uppercase">
						<hr className="h-px text-[#D6D9E0] w-full" />
						<span className="bg-[#f5f7f9] px-2 text-[#6b7280] dark:bg-transparent w-full ">
							Or continue with
						</span>
						<hr className="h-px text-[#D6D9E0] w-full" />
					</div>

					<div className="grid grid-cols-1">
						<Button
							variant="outline"
							className="bg-white/70 hover:bg-white/70 cursor-pointer hover:shadow-md backdrop-blur-md border border-white/20 text-[#030712] dark:bg-[#1c1f2c] dark:hover:bg-[#1c1f2c]/50 dark:text-white"
							onClick={handleSignInWithGoogle}
						>
							<svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
								<path
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									fill="#4285F4"
								/>
								<path
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									fill="#34A853"
								/>
								<path
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									fill="#FBBC05"
								/>
								<path
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									fill="#EA4335"
								/>
							</svg>
							Google
						</Button>
					</div>
					<div className="items-center pt-3 flex justify-center">
						<div className="text-sm text-[#6b7280]">
							Don't have an account?{" "}
							<Link className="text-[#4F32FF] hover:underline" to="/signup">
								Sign up
							</Link>
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
};

export default LoginForm;
