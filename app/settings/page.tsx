import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Dashboard</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your account settings and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="Enter your email" type="email" />
                <p className="text-xs text-muted-foreground">
                  We'll use this email for notifications and account recovery.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="Enter your username" />
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="marketing-emails">Marketing emails</Label>
                  <Switch id="marketing-emails" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Receive emails about new features, updates, and promotions.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="security-alerts">Security alerts</Label>
                  <Switch id="security-alerts" defaultChecked />
                </div>
                <p className="text-xs text-muted-foreground">
                  Receive alerts about suspicious activity and security updates.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex items-center gap-4">
                  <Button variant="outline" className="flex-1">
                    Light
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Dark
                  </Button>
                  <Button variant="outline" className="flex-1">
                    System
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Density</Label>
                <div className="flex items-center gap-4">
                  <Button variant="outline" className="flex-1">
                    Compact
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Comfortable
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="validator-alerts">Validator alerts</Label>
                  <Switch id="validator-alerts" defaultChecked />
                </div>
                <p className="text-xs text-muted-foreground">
                  Receive alerts when validators become delinquent or change commission.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reward-notifications">Reward notifications</Label>
                  <Switch id="reward-notifications" defaultChecked />
                </div>
                <p className="text-xs text-muted-foreground">
                  Receive notifications about staking rewards and APY changes.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="network-updates">Network updates</Label>
                  <Switch id="network-updates" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Receive notifications about Solana network updates and upgrades.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage your API keys for programmatic access.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex gap-2">
                  <Input id="api-key" value="••••••••••••••••••••••••••••••" readOnly className="flex-1" />
                  <Button variant="outline">Copy</Button>
                  <Button variant="outline">Regenerate</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use this key to access the API programmatically. Keep it secret!
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>API Usage</Label>
                <div className="h-4 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full w-1/3 rounded-full bg-primary" />
                </div>
                <p className="text-xs text-muted-foreground">You've used 33% of your API quota this month.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
