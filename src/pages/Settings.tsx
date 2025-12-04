import { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, 
  Link2, 
  Bell, 
  Shield, 
  User, 
  DollarSign,
  Slack,
  Calendar,
  CreditCard,
  Database,
  FileText,
  Calculator,
  Check,
  ExternalLink,
  RefreshCw,
  Trash2,
  Download,
  Clock,
  Save,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAppData } from "@/context/AppDataContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { founderContext, setFounderContext, loading } = useAppData();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [saving, setSaving] = useState(false);
  const [contextForm, setContextForm] = useState({
    cashReserves: founderContext.cashReserves,
    monthlyBurnRate: founderContext.monthlyBurnRate,
    monthlyRevenue: founderContext.monthlyRevenue,
    weeklyGrowthRate: founderContext.weeklyGrowthRate,
    weeklyGrowthTarget: founderContext.weeklyGrowthTarget,
    teamSize: founderContext.teamSize,
  });

  // Update form when context loads
  useEffect(() => {
    setContextForm({
      cashReserves: founderContext.cashReserves,
      monthlyBurnRate: founderContext.monthlyBurnRate,
      monthlyRevenue: founderContext.monthlyRevenue,
      weeklyGrowthRate: founderContext.weeklyGrowthRate,
      weeklyGrowthTarget: founderContext.weeklyGrowthTarget,
      teamSize: founderContext.teamSize,
    });
  }, [founderContext]);

  const [notifications, setNotifications] = useState({
    mondayReminder: true,
    mondayTime: "09:00",
    fridayReminder: true,
    fridayTime: "16:00",
    decisionAlerts: true,
    timeSensitive: true,
  });

  const handleSaveContext = async () => {
    setSaving(true);
    try {
      await setFounderContext({
        cashReserves: contextForm.cashReserves,
        monthlyBurnRate: contextForm.monthlyBurnRate,
        monthlyRevenue: contextForm.monthlyRevenue,
        weeklyGrowthRate: contextForm.weeklyGrowthRate,
        weeklyGrowthTarget: contextForm.weeklyGrowthTarget,
        teamSize: contextForm.teamSize,
        dataSource: 'manual',
      });
      toast({
        title: "Context saved",
        description: "Your founder context has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error saving context",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full bg-[#0F1729] items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-[#0F1729] text-white overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="px-8 pt-8 pb-6 shrink-0">
          <h1 className="text-3xl font-serif text-white mb-1">Settings</h1>
          <p className="text-sm text-gray-400">Manage your account, context, and preferences</p>
        </header>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <Tabs defaultValue="context" className="w-full max-w-4xl">
            <TabsList className="bg-[#1F2D47] border border-white/10 mb-8 h-12 p-1">
              <TabsTrigger value="context" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400 gap-2">
                <DollarSign className="h-4 w-4" /> Context
              </TabsTrigger>
              <TabsTrigger value="integrations" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400 gap-2">
                <Link2 className="h-4 w-4" /> Integrations
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400 gap-2">
                <Bell className="h-4 w-4" /> Notifications
              </TabsTrigger>
              <TabsTrigger value="account" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-gray-400 gap-2">
                <User className="h-4 w-4" /> Account
              </TabsTrigger>
            </TabsList>

            {/* CONTEXT TAB */}
            <TabsContent value="context" className="space-y-6 mt-0">
              <div className="space-y-2 mb-8">
                <h2 className="text-xl font-serif font-medium text-white">Founder Context</h2>
                <p className="text-sm text-gray-400">This data helps Quillio provide relevant insights about your runway and growth.</p>
              </div>

              <div className="bg-[#1F2D47]/60 border border-white/10 rounded-xl p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Cash Reserves ($)</Label>
                    <Input 
                      type="number"
                      value={contextForm.cashReserves}
                      onChange={(e) => setContextForm({...contextForm, cashReserves: Number(e.target.value)})}
                      className="bg-black/20 border-white/10 focus-visible:ring-accent" 
                      placeholder="500000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Monthly Burn Rate ($)</Label>
                    <Input 
                      type="number"
                      value={contextForm.monthlyBurnRate}
                      onChange={(e) => setContextForm({...contextForm, monthlyBurnRate: Number(e.target.value)})}
                      className="bg-black/20 border-white/10 focus-visible:ring-accent" 
                      placeholder="40000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Monthly Revenue (MRR) ($)</Label>
                    <Input 
                      type="number"
                      value={contextForm.monthlyRevenue}
                      onChange={(e) => setContextForm({...contextForm, monthlyRevenue: Number(e.target.value)})}
                      className="bg-black/20 border-white/10 focus-visible:ring-accent" 
                      placeholder="8000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Team Size</Label>
                    <Input 
                      type="number"
                      value={contextForm.teamSize}
                      onChange={(e) => setContextForm({...contextForm, teamSize: Number(e.target.value)})}
                      className="bg-black/20 border-white/10 focus-visible:ring-accent" 
                      placeholder="8"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Weekly Growth Rate (%)</Label>
                    <Input 
                      type="number"
                      step="0.1"
                      value={contextForm.weeklyGrowthRate}
                      onChange={(e) => setContextForm({...contextForm, weeklyGrowthRate: Number(e.target.value)})}
                      className="bg-black/20 border-white/10 focus-visible:ring-accent" 
                      placeholder="3.2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Weekly Growth Target (%)</Label>
                    <Input 
                      type="number"
                      step="0.1"
                      value={contextForm.weeklyGrowthTarget}
                      onChange={(e) => setContextForm({...contextForm, weeklyGrowthTarget: Number(e.target.value)})}
                      className="bg-black/20 border-white/10 focus-visible:ring-accent" 
                      placeholder="5"
                    />
                  </div>
                </div>

                {/* Calculated Values */}
                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Calculated Values</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="text-xs text-gray-500 mb-1">Runway</div>
                      <div className="text-2xl font-bold text-accent">{founderContext.runway} days</div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="text-xs text-gray-500 mb-1">Net Burn</div>
                      <div className="text-2xl font-bold text-white">
                        ${(contextForm.monthlyBurnRate - contextForm.monthlyRevenue).toLocaleString()}/mo
                      </div>
                    </div>
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="text-xs text-gray-500 mb-1">Status</div>
                      <div className={`text-lg font-bold ${
                        founderContext.defaultAliveStatus === 'alive' ? 'text-green-400' :
                        founderContext.defaultAliveStatus === 'dead' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {founderContext.defaultAliveStatus === 'alive' ? 'Default Alive' :
                         founderContext.defaultAliveStatus === 'dead' ? 'Default Dead' : 'Uncertain'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveContext} disabled={saving} className="bg-accent hover:bg-accent/90 gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Context
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* INTEGRATIONS TAB */}
            <TabsContent value="integrations" className="space-y-6 mt-0">
              <div className="space-y-2 mb-8">
                <h2 className="text-xl font-serif font-medium text-white">Connected Tools</h2>
                <p className="text-sm text-gray-400">Connect your tools to pull context automatically.</p>
              </div>

              <div className="space-y-4">
                <IntegrationCard 
                  icon={Slack}
                  name="Slack"
                  description="Capture thoughts with /capture command"
                  connected={false}
                  recommended
                />
                <IntegrationCard 
                  icon={Calendar}
                  name="Google Calendar"
                  description="Auto-create focus blocks, protect priority time"
                  connected={false}
                  recommended
                />
                <IntegrationCard 
                  icon={CreditCard}
                  name="Stripe"
                  description="Track revenue, calculate growth rate automatically"
                  connected={false}
                />
                <IntegrationCard 
                  icon={Database}
                  name="Linear"
                  description="Pull project context, track sprint progress"
                  connected={false}
                />
              </div>
            </TabsContent>

            {/* NOTIFICATIONS TAB */}
            <TabsContent value="notifications" className="space-y-8 mt-0">
              <div className="space-y-2 mb-8">
                <h2 className="text-xl font-serif font-medium text-white">Notification Preferences</h2>
                <p className="text-sm text-gray-400">Control when and how Quillio surfaces important moments.</p>
              </div>

              <div className="space-y-6">
                <NotificationSetting 
                  title="Monday Ritual Reminder"
                  description="Get reminded to complete your weekly ritual"
                  enabled={notifications.mondayReminder}
                  onToggle={(v) => setNotifications({...notifications, mondayReminder: v})}
                  time={notifications.mondayTime}
                  onTimeChange={(v) => setNotifications({...notifications, mondayTime: v})}
                  showTime
                />
                
                <Separator className="bg-white/5" />

                <NotificationSetting 
                  title="Friday Recap Reminder"
                  description="Get notified when your weekly recap is ready"
                  enabled={notifications.fridayReminder}
                  onToggle={(v) => setNotifications({...notifications, fridayReminder: v})}
                  time={notifications.fridayTime}
                  onTimeChange={(v) => setNotifications({...notifications, fridayTime: v})}
                  showTime
                />
                
                <Separator className="bg-white/5" />

                <NotificationSetting 
                  title="Decision Loop Alerts"
                  description="Get alerted when a topic is mentioned 3+ times without resolution"
                  enabled={notifications.decisionAlerts}
                  onToggle={(v) => setNotifications({...notifications, decisionAlerts: v})}
                />
              </div>
            </TabsContent>

            {/* ACCOUNT TAB */}
            <TabsContent value="account" className="space-y-8 mt-0">
              <div className="space-y-2 mb-8">
                <h2 className="text-xl font-serif font-medium text-white">Account Settings</h2>
                <p className="text-sm text-gray-400">Manage your profile and session.</p>
              </div>

              <div className="space-y-6">
                <div className="bg-[#1F2D47]/60 border border-white/10 rounded-xl p-6">
                  <h3 className="font-medium text-white mb-6">Profile</h3>
                  <div className="grid gap-4 max-w-md">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">Email</Label>
                      <Input 
                        value={user?.email || ""} 
                        disabled
                        className="bg-black/20 border-white/10 text-gray-400" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-wider font-bold text-gray-500">User ID</Label>
                      <Input 
                        value={user?.id || ""} 
                        disabled
                        className="bg-black/20 border-white/10 text-gray-400 font-mono text-xs" 
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#1F2D47]/60 border border-white/10 rounded-xl p-6">
                  <h3 className="font-medium text-white mb-4">Keyboard Shortcuts</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Quick Capture Shortcut</p>
                      <code className="bg-black/40 px-3 py-1.5 rounded text-sm text-accent font-mono">⌘ + Shift + C</code>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1F2D47]/60 border border-white/10 rounded-xl p-6">
                  <h3 className="font-medium text-white mb-4">Session</h3>
                  <Button 
                    onClick={handleSignOut}
                    variant="outline" 
                    className="border-white/10 bg-transparent text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    Sign Out
                  </Button>
                </div>

                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                  <h3 className="font-medium text-red-400 mb-4">Danger Zone</h3>
                  <p className="text-sm text-gray-400 mb-4">Permanently delete your account and all associated data.</p>
                  <Button variant="outline" className="border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10 gap-2">
                    <Trash2 className="h-4 w-4" /> Delete Account
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

const IntegrationCard = ({ icon: Icon, name, description, connected, recommended }: any) => (
  <div className="bg-[#1F2D47]/60 border border-white/10 rounded-xl p-6 hover:bg-[#1F2D47]/80 transition-colors">
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-4">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${connected ? 'bg-accent/10' : 'bg-white/5'}`}>
          <Icon className={`h-6 w-6 ${connected ? 'text-accent' : 'text-gray-400'}`} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-white text-lg">{name}</span>
            {recommended && <Badge variant="outline" className="border-accent/30 text-accent text-[10px] h-5">Recommended</Badge>}
          </div>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {connected ? (
          <Badge className="bg-green-500/20 text-green-500 border-none gap-1">
            <Check className="h-3 w-3" /> Connected
          </Badge>
        ) : (
          <Button className="bg-accent hover:bg-accent/90 text-white gap-2">
            Connect <ExternalLink className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  </div>
);

const NotificationSetting = ({ title, description, enabled, onToggle, time, onTimeChange, showTime }: any) => (
  <div className="flex items-start justify-between gap-8">
    <div className="flex-1">
      <div className="font-medium text-white mb-1">{title}</div>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
    <div className="flex items-center gap-4 shrink-0">
      {showTime && (
        <Input 
          type="time" 
          value={time} 
          onChange={(e) => onTimeChange(e.target.value)}
          className="w-28 bg-black/20 border-white/10 text-sm"
          disabled={!enabled}
        />
      )}
      <Switch checked={enabled} onCheckedChange={onToggle} />
    </div>
  </div>
);
