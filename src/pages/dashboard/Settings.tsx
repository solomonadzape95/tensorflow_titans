"use client";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Globe,
  Lock,
  Moon,
  Palette,
  Save,
  Sun,
  Upload,
  User,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useDarkMode } from "@/hooks/use-darkmode";

export default function Settings() {
  const [darkMode, toggleDarkMode] = useDarkMode();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast("Settings saved", {
        description: "Your settings have been updated successfully.",
      });
    }, 1000);
  };

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
          <TabsList className="glass">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
            >
              <Lock className="mr-2 h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
            >
              <Palette className="mr-2 h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
            >
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 animate-in">
            <Card className="hover:shadow-glow transition-all duration-300">
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
                      src="/placeholder.svg?height=96&width=96"
                      alt="User"
                    />
                    <AvatarFallback className="text-2xl">JD</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button className="w-full sm:w-auto">
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
                    <Input id="first-name" defaultValue="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" defaultValue="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="demo@splitwise.com"
                  />
                </div>

                <div className="space-y-2">
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
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  variant="gradient"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
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
            <Card className="hover:shadow-glow transition-all duration-300">
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
                <Button variant="gradient">
                  <Save className="mr-2 h-4 w-4" />
                  Update Password
                </Button>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <CardTitle>Language & Region</CardTitle>
                <CardDescription>
                  Set your language and regional preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger id="language" className="glass">
                      <Globe className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="glass">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger id="currency" className="glass">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="glass">
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                      <SelectItem value="jpy">JPY (¥)</SelectItem>
                      <SelectItem value="cad">CAD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="gradient">
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6 animate-in">
            <Card className="hover:shadow-glow transition-all duration-300">
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
            <Card className="hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Email Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-expenses">New Expenses</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive emails when new expenses are added
                        </p>
                      </div>
                      <Switch id="email-expenses" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-payments">Payments</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive emails when payments are made
                        </p>
                      </div>
                      <Switch id="email-payments" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-reminders">Reminders</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive payment reminders
                        </p>
                      </div>
                      <Switch id="email-reminders" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-marketing">Marketing</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive marketing emails and newsletters
                        </p>
                      </div>
                      <Switch id="email-marketing" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Push Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-expenses">New Expenses</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications for new expenses
                        </p>
                      </div>
                      <Switch id="push-expenses" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-payments">Payments</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications for payments
                        </p>
                      </div>
                      <Switch id="push-payments" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="push-reminders">Reminders</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive payment reminder notifications
                        </p>
                      </div>
                      <Switch id="push-reminders" defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="gradient">
                  <Save className="mr-2 h-4 w-4" />
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

