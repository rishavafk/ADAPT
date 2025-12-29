import { Sidebar } from "@/components/Sidebar";
import { useMedications, useCreateMedication, useDeleteMedication } from "@/hooks/use-medications";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useState } from "react";
import { Pill, Plus, Clock, History, FlaskConical, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const PARKINSONS_MEDICATIONS = [
  "Carbidopa-Levodopa (Sinemet)",
  "Carbidopa-Levodopa ER (Rytary)",
  "Pramipexole (Mirapex)",
  "Ropinirole (Requip)",
  "Rotigotine (Neupro)",
  "Entacapone (Comtan)",
  "Rasagiline (Azilect)",
  "Selegiline (Eldepryl)",
  "Amantadine (Gocovri)",
  "Safinamide (Xadago)",
  "Opicapone (Ongentys)",
  "Istradefylline (Nourianz)"
];

export default function Medications() {
  const { data: medications, isLoading } = useMedications();
  const { mutate: logMedication, isPending } = useCreateMedication();
  const { mutate: deleteMedication, isPending: isDeleting } = useDeleteMedication();

  const [formData, setFormData] = useState({
    name: "",
    customName: "",
    dosage: "",
    time: format(new Date(), "HH:mm"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const medName = formData.name === "Other" ? formData.customName : formData.name;
    if (!medName) return;

    // Combine today's date with the time input
    const today = new Date();
    const [hours, minutes] = formData.time.split(':').map(Number);
    today.setHours(hours, minutes);

    logMedication({
      medicationName: medName,
      dosage: formData.dosage,
      timeTaken: today.toISOString(),
    }, {
      onSuccess: () => {
        setFormData(prev => ({ ...prev, name: "", customName: "", dosage: "" }));
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-[#0F172A] font-body text-slate-200">
      <Sidebar />
      <main className="flex-1 lg:pl-72 p-6 md:p-8 max-w-5xl mx-auto space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-bold text-white">Medications</h1>
          <p className="text-slate-400">Log your doses to correlate with symptom changes.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="shadow-2xl border-white/5 bg-slate-900/50 backdrop-blur-xl h-full">
              <CardHeader className="bg-cyan-500/5 pb-6 border-b border-white/5">
                <CardTitle className="flex items-center gap-2 text-cyan-400">
                  <div className="p-2 bg-slate-900 rounded-lg shadow-sm border border-white/5">
                    <Plus className="w-5 h-5" />
                  </div>
                  Log New Dose
                </CardTitle>
                <CardDescription className="text-slate-500">Record a medication you just took.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="med-name" className="text-base text-slate-300">Medication Name</Label>
                    <Select
                      value={formData.name}
                      onValueChange={(val) => setFormData({ ...formData, name: val })}
                    >
                      <SelectTrigger className="h-12 text-lg bg-slate-800/50 border-white/10 text-white">
                        <SelectValue placeholder="Select medication" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                        {PARKINSONS_MEDICATIONS.map((med) => (
                          <SelectItem key={med} value={med} className="focus:bg-cyan-500/20 focus:text-cyan-400">{med}</SelectItem>
                        ))}
                        <SelectItem value="Other" className="focus:bg-cyan-500/20 focus:text-cyan-400">Other (Specify)</SelectItem>
                      </SelectContent>
                    </Select>

                    {formData.name === "Other" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="pt-2"
                      >
                        <Input
                          placeholder="Enter medication name"
                          value={formData.customName}
                          onChange={e => setFormData({ ...formData, customName: e.target.value })}
                          className="h-12 text-lg bg-slate-800/50 border-white/10 text-white"
                        />
                      </motion.div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="med-dosage" className="text-base text-slate-300">Dosage</Label>
                      <Input
                        id="med-dosage"
                        placeholder="e.g. 100mg"
                        value={formData.dosage}
                        onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                        className="h-12 bg-slate-800/50 border-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="med-time" className="text-base text-slate-300">Time Taken</Label>
                      <Input
                        id="med-time"
                        type="time"
                        value={formData.time}
                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                        className="h-12 bg-slate-800/50 border-white/10 text-white [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-lg font-semibold mt-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all"
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
              <CardHeader className="px-0 pt-0 pb-6">
                <CardTitle className="flex items-center gap-2 text-white text-2xl">
                  <History className="w-6 h-6 text-slate-500" />
                  Recent History
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-800/50 rounded-2xl animate-pulse" />)}
                  </div>
                ) : medications?.length === 0 ? (
                  <div className="text-center p-12 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30 text-slate-500 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-600">
                      <FlaskConical className="w-6 h-6" />
                    </div>
                    <p>No medications logged yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {medications?.map((med, i) => (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={med.id}
                        className="flex items-center justify-between p-5 bg-slate-900/50 rounded-2xl border border-white/5 shadow-sm hover:bg-slate-800 transition-all group"
                      >
                        <div className="flex items-center gap-5">
                          <div className="p-3.5 bg-cyan-500/10 text-cyan-400 rounded-xl group-hover:bg-cyan-500 group-hover:text-slate-900 transition-colors duration-300">
                            <Pill className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-lg text-white">{med.medicationName}</p>
                            <p className="text-slate-500 font-medium">{med.dosage}</p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-white/5">
                            <Clock className="w-3.5 h-3.5" />
                            {format(new Date(med.timeTaken), "h:mm a")}
                          </div>

                          <div className="flex items-center gap-3">
                            <p className="text-xs text-slate-600 font-medium">
                              {format(new Date(med.timeTaken), "MMM d")}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-colors"
                              onClick={() => deleteMedication(med.id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
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
