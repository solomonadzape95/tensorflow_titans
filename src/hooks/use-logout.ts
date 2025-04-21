import supabase from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const useLogout = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationKey: ["logout"],
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      navigate("/login");
    },
  });
};

// logout functionality
export const useLogOutHandler = () => {
  const { mutateAsync: logout, isPending } = useLogout();

  const handleLogOut = () => {
    toast.promise(logout(), {
      loading: "Loging out...",
      success: () => {
        return "Logged out successfully!";
      },
      error: (err: Error) => {
        return `Logout failed: ${err?.message || "Please try again."}`;
      },
    });
  };

  return { handleLogOut, isPending };
};
