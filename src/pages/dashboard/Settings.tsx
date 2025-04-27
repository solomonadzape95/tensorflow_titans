import { updateProfile } from "@/lib/services/userService";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Lock,
  Moon,
  Palette,
  Save,
  Sun,
  Upload,
  UserIcon,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useDarkMode } from "@/hooks/use-darkmode";
import { FaFloppyDisk } from "react-icons/fa6";
import { useLoaderData } from "react-router";
import type { UserData } from "@/types";
import { uploadAvatar } from "@/lib/services/userService";

export default function Settings() {
  const [darkMode, toggleDarkMode] = useDarkMode();
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useLoaderData() as UserData;

  // Add form state
  const [formData, setFormData] = useState({
    firstName: profile?.full_name.split(" ")[0] || "",
    lastName: profile?.full_name.split(" ")[1] || "",
    email: profile?.email || "",
  });

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id.replace("-", "")]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      // Prepare the update data
      const updates = {
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
      };

      // Update the profile
      await updateProfile(profile.id, updates);

      toast.success("Settings saved", {
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Error saving settings", {
        description: "There was a problem updating your profile.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        // 2MB
        toast.error("File too large", {
          description: "Please select an image under 2MB.",
        });
        return;
      }

      setIsLoading(true);
      await uploadAvatar(profile.id, file);

      toast.success("Avatar updated", {
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast.error("Error updating avatar", {
        description: "There was a problem updating your profile picture.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  function initialName(fullName: string) {
    const name = fullName.trim().split(" ").filter(Boolean);
    console.log(name);
    if (name.length === 0) return "";
    if (name.length === 1) return name[0].substring(0, 2).toUpperCase();
    return (name[0][0] + name[name.length - 1][0]).toUpperCase();
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="space-y-8">
        <div className="animate-in">
          <h1 className="text-3xl font-bold tracking-tight font-display">
            <span className="text-gradient">Settings</span>
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 h-fit w-fit p-2 text-md shadow-md">
            <TabsTrigger
              value="profile"
              className="data-[state=on]:bg-[#4F32FF] data-[state=on]:text-[#4F32FF] transition-all duration-300"
            >
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="data-[state=on]:bg-[#4F32FF] data-[state=on]:text-[#4F32FF] transition-all duration-300"
            >
              <Lock className="mr-2 h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="data-[state=on]:bg-[#4F32FF] data-[state=on]:text-[#4F32FF] transition-all duration-300"
            >
              <Palette className="mr-2 h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=on]:bg-[#4F32FF] data-[state=on]:text-[#4F32FF] transition-all duration-300"
            >
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 animate-in">
            <Card className="hover:shadow-glow transition-all duration-300 bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                  <Avatar className="h-24 w-24 animate-pulse-glow">
                    <AvatarImage
                      src={
                        profile?.avatar_url ||
                        "/placeholder.svg?height=96&width=96"
                      }
                      alt="User"
                    />
                    <AvatarFallback className="text-2xl">
                      {initialName(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button
                      className="w-full sm:w-auto bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white"
                      onClick={() =>
                        document.getElementById("avatar-upload")?.click()
                      }
                      disabled={isLoading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Change Avatar
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, GIF or PNG. Max size 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                {/* <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" placeholder="Tell us about yourself" />
                </div> */}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  variant="gradient"
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-gradient-to-r cursor-pointer from-[#4F32FF] to-[#ff4ecd] text-white"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <FaFloppyDisk />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6 animate-in">
            <Card className="hover:shadow-glow transition-all duration-300 bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button className="bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white">
                  <Save className="mr-2 h-4 w-4" />
                  Update Password
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6 animate-in">
            <Card className="hover:shadow-glow transition-all duration-300 bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>
                  Customize the appearance of the app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <Label>Color Theme</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div
                      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg glass transition-all duration-300 p-4 ${
                        !darkMode
                          ? "border-primary bg-primary/10 shadow-glow"
                          : "hover:bg-primary/20 bg-transparent"
                      }`}
                      onClick={() => toggleDarkMode(false)}
                    >
                      <Sun
                        className={`mb-2 h-6 w-6 transition-all duration-300 ${
                          !darkMode ? "text-primary animate-bounce-subtle" : ""
                        }`}
                      />
                      <span className="text-sm">Light</span>
                    </div>

                    <div
                      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg glass transition-all duration-300 p-4 ${
                        darkMode
                          ? "border-primary bg-primary/10 shadow-glow"
                          : "hover:bg-primary/20 bg-transparent"
                      }`}
                      onClick={() => toggleDarkMode(true)}
                    >
                      <Moon
                        className={`mb-2 h-6 w-6 transition-all duration-300 ${
                          darkMode ? "text-primary animate-bounce-subtle" : ""
                        }`}
                      />
                      <span className="text-sm">Dark</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 animate-in">
            <Card className="hover:shadow-glow transition-all duration-300 bg-[#F9FAFB]/80 dark:bg-[#141727]/90 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-xl">
                  Notification Preferences
                </CardTitle>
                <CardDescription className="text-md">
                  Control how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive emails{" "}
                        </p>
                      </div>
                      <Switch id="email" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications from the app
                        </p>
                      </div>
                      <Switch id="push" defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button className="bg-gradient-to-r from-[#4F32FF] to-[#ff4ecd] text-white">
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />
    </main>
  );
}
