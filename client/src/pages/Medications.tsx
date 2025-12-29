import { Sidebar } from "@/components/Sidebar";
import { useMedications, useCreateMedication } from "@/hooks/use-medications";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useState } from "react";
import { Pill, Plus, Clock, History } from "lucide-react";
import { motion } from "framer-motion";

export default function Medications() {
  const { data: medications, isLoading } = useMedications();
  const { mutate: logMedication, isPending } = useCreateMedication();
  
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    time: format(new Date(), "HH:mm"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    // Combine today's date with the time input
    const today = new Date();
    const [hours, minutes] = formData.time.split(':').map(Number);
    today.setHours(hours, minutes);

    logMedication({
      medicationName: formData.name,
      dosage: formData.dosage,
      timeTaken: today.toISOString(),
    }, {
      onSuccess: () => {
        setFormData(prev => ({ ...prev, name: "", dosage: "" }));
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-body">
      <Sidebar />
      <main className="flex-1 lg:pl-72 p-6 md:p-8 max-w-4xl mx-auto space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-bold text-foreground">Medications</h1>
          <p className="text-muted-foreground">Log your doses to correlate with symptom changes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="shadow-lg border-primary/10">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Log New Dose
                </CardTitle>
                <CardDescription>Record a medication you just took.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="med-name">Medication Name</Label>
                    <Input 
                      id="med-name"
                      placeholder="e.g. Levodopa" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="h-12 text-lg"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="med-dosage">Dosage</Label>
                      <Input 
                        id="med-dosage"
                        placeholder="e.g. 100mg" 
                        value={formData.dosage}
                        onChange={e => setFormData({...formData, dosage: e.target.value})}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="med-time">Time Taken</Label>
                      <Input 
                        id="med-time"
                        type="time"
                        value={formData.time}
                        onChange={e => setFormData({...formData, time: e.target.value})}
                        className="h-12"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg font-semibold mt-2" 
                    disabled={isPending}
                  >
                    {isPending ? "Logging..." : "Log Dose"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full border-none shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <History className="w-5 h-5" />
                  Recent History
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />)}
                  </div>
                ) : medications?.length === 0 ? (
                  <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-white/50 text-muted-foreground">
                    No medications logged yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {medications?.map((med) => (
                      <div 
                        key={med.id} 
                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 text-primary rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                            <Pill className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{med.medicationName}</p>
                            <p className="text-sm text-muted-foreground">{med.dosage}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground bg-slate-50 px-3 py-1 rounded-full">
                            <Clock className="w-3 h-3" />
                            {format(new Date(med.timeTaken), "HH:mm")}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(med.timeTaken), "MMM d")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
