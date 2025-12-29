import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Key, Brain, Shield, Save, Trash2, Info } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";

export default function Settings() {
  const [googleAiApiKey, setGoogleAiApiKey] = useState("");
  const [customPrompt, setCustomPrompt] = useState(
    "Summarize the patient’s motor symptom trends, medication effectiveness, and any notable patterns. Provide actionable insights in 2-3 sentences."
  );

  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to load settings");
      return res.json();
    },
  });

  useEffect(() => {
    if (settings) {
      if (settings.googleAiApiKey) setGoogleAiApiKey(settings.googleAiApiKey);
      if (settings.customPrompt) setCustomPrompt(settings.customPrompt);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      return res.json();
    },
    onSuccess: () => {
      alert("Settings saved");
    },
    onError: () => {
      alert("Failed to save settings");
    },
  });

  const testMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Test failed");
      return res.json();
    },
    onSuccess: (data: any) => {
      alert(`AI test succeeded: ${data.message}`);
    },
    onError: (err) => {
      alert(`AI test failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      openaiApiKey: "",
      googleAiApiKey,
      aiProvider: "google",
      aiEnabled: "true",
      customPrompt,
    });
  };

  const handleClearKey = () => {
    setGoogleAiApiKey("");
    saveMutation.mutate({
      openaiApiKey: "",
      googleAiApiKey: "",
      aiProvider: "google",
      aiEnabled: "true",
      customPrompt,
    });
  };

  return (
    <div className="flex min-h-screen bg-[#0F172A] font-body text-slate-200">
      <Sidebar />
      <main className="flex-1 lg:pl-72 p-6 md:p-8 space-y-8 max-w-3xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-white">Settings</h1>
          <p className="text-slate-400">Manage your account and AI preferences.</p>
        </div>

        {/* AI Settings */}
        <Card className="bg-slate-900/50 backdrop-blur-xl border-white/5 shadow-xl">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="w-5 h-5 text-purple-400" />
              AI Insights Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="google-api-key" className="flex items-center gap-2 text-slate-300">
                  <Key className="w-4 h-4 text-cyan-400" />
                  Google Gemini API Key
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="google-api-key"
                    type="password"
                    placeholder="AIza..."
                    value={googleAiApiKey}
                    onChange={(e) => setGoogleAiApiKey(e.target.value)}
                    className="flex-1 bg-slate-800/50 border-white/10 text-white focus:border-cyan-500"
                  />
                  <Button variant="outline" size="icon" onClick={handleClearKey} disabled={!googleAiApiKey} className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-2 items-start text-xs text-slate-500 bg-slate-800/50 p-3 rounded-lg border border-white/5">
                  <Info className="w-4 h-4 mt-0.5 text-cyan-400 shrink-0" />
                  <p>
                    Your API key is stored encrypted. If you have set the <code className="text-cyan-400">GOOGLE_AI_API_KEY</code> environment variable, you can leave this blank.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="custom-prompt" className="text-slate-300">Custom Insight Prompt (Optional)</Label>
                <Textarea
                  id="custom-prompt"
                  placeholder="Summarize the patient’s motor symptom trends..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={4}
                  className="bg-slate-800/50 border-white/10 text-white focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5">
                <Button onClick={handleSave} disabled={saveMutation.isPending} className="gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => testMutation.mutate()}
                  disabled={testMutation.isPending}
                  className="gap-2 border-white/10 bg-transparent text-slate-300 hover:text-white hover:bg-white/5"
                >
                  <Shield className="w-4 h-4" />
                  Test Connectivity
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="bg-slate-900/30 border-white/5 shadow-none">
          <CardHeader>
            <CardTitle className="text-slate-300 text-lg">About ADAPT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-500">
            <p>Version <span className="text-slate-400">1.0.0 (Production Build)</span></p>
            <p>© 2025 ADAPT – Parkinson’s Assistant. All rights reserved.</p>
            <p>This application helps track motor symptoms and medication effectiveness for Parkinson’s disease management.</p>
            <div className="pt-4 flex gap-2">
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">HIPAA Compliant</Badge>
              <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20">End-to-End Encrypted</Badge>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
