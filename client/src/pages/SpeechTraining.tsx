import { useState, useRef, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, RefreshCw, Mic, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function SpeechTraining() {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const recognitionRef = useRef<any>(null);
    const isTogglingRef = useRef(false);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    const toggleRecording = useCallback(() => {
        if (isTogglingRef.current) return;
        isTogglingRef.current = true;

        // Debounce toggle to prevent race conditions
        setTimeout(() => { isTogglingRef.current = false; }, 500);

        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }, [isRecording]);

    const startRecording = () => {
        if (!("webkitSpeechRecognition" in window)) {
            alert("Speech recognition is not supported in this browser. Please use Chrome.");
            return;
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition;

        // Always create a fresh instance to avoid stale state issues
        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch (e) { }
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
            let fullText = "";
            for (let i = 0; i < event.results.length; ++i) {
                fullText += event.results[i][0].transcript;
            }
            setTranscript(fullText);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsRecording(false);
        };

        recognitionRef.current = recognition;

        try {
            // Reset transcript on new start if it was empty or user wants new session
            // For now, we keep appending or simple reset? 
            // Let's reset if it was stopped.
            if (!isRecording) setTranscript("");
            recognition.start();
        } catch (e) {
            console.error("Failed to start", e);
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const speakText = (text: string) => {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0F172A] font-body text-slate-200">
            <Sidebar />
            <main className="flex-1 lg:pl-72 p-6 md:p-8 max-w-4xl mx-auto space-y-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-display font-bold text-white">Voice Clarity</h1>
                    <p className="text-slate-400">Real-time speech transcription and playback.</p>
                </div>

                <div className="grid gap-6">
                    <Card className="bg-slate-900/50 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden relative min-h-[500px] flex flex-col items-center justify-center">

                        <CardContent className="p-0 w-full flex flex-col items-center gap-12 relative z-10">

                            {/* Animated Mic Button Container */}
                            <div className="relative group">
                                {/* Ambient Glow */}
                                <div className={cn(
                                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[80px] transition-all duration-700 pointer-events-none",
                                    isRecording ? "bg-cyan-500/30" : "bg-cyan-500/0"
                                )} />

                                {/* Ripple Effects when recording */}
                                {isRecording && (
                                    <>
                                        <motion.div
                                            initial={{ scale: 1, opacity: 0.5 }}
                                            animate={{ scale: 2, opacity: 0 }}
                                            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                                            className="absolute top-0 left-0 w-full h-full bg-cyan-500/20 rounded-full"
                                        />
                                        <motion.div
                                            initial={{ scale: 1, opacity: 0.5 }}
                                            animate={{ scale: 1.5, opacity: 0 }}
                                            transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.5 }}
                                            className="absolute top-0 left-0 w-full h-full bg-cyan-500/20 rounded-full"
                                        />
                                    </>
                                )}

                                {/* Main Button */}
                                <button
                                    onClick={toggleRecording}
                                    className={cn(
                                        "relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl z-20 group-hover:scale-105 active:scale-95",
                                        isRecording
                                            ? "bg-gradient-to-br from-rose-500 to-red-600 shadow-[0_0_40px_rgba(244,63,94,0.4)] border-4 border-rose-400/50"
                                            : "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_40px_rgba(6,182,212,0.4)] border-4 border-cyan-400/50"
                                    )}
                                >
                                    <div className="text-white drop-shadow-md">
                                        {isRecording ? (
                                            <StopCircle className="w-16 h-16 fill-current animate-pulse" />
                                        ) : (
                                            <Mic className="w-16 h-16" />
                                        )}
                                    </div>

                                    {/* Text Overlay on Hover (Desktop) or always visible if confusing? Keep it clean inside button? */}
                                </button>

                                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                                    <h3 className={cn("text-lg font-bold transition-colors", isRecording ? "text-rose-400" : "text-cyan-400")}>
                                        {isRecording ? "Listening..." : "Tap to Speak"}
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        {isRecording ? "Tap again to stop" : "Start instant transcription"}
                                    </p>
                                </div>
                            </div>

                            {/* Live Transcript */}
                            <div className={cn(
                                "w-full max-w-2xl min-h-[160px] p-8 rounded-3xl border transition-all duration-500 flex items-center justify-center text-center mt-8 cursor-text",
                                transcript
                                    ? "bg-slate-800/80 border-cyan-500/30 shadow-lg shadow-cyan-900/10"
                                    : "bg-slate-800/30 border-white/5"
                            )}>
                                <AnimatePresence mode="wait">
                                    {transcript ? (
                                        <motion.p
                                            key="text"
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-2xl md:text-4xl font-display font-medium text-white leading-relaxed"
                                        >
                                            "{transcript}"
                                        </motion.p>
                                    ) : (
                                        <motion.p
                                            key="placeholder"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-slate-600 text-lg font-medium"
                                        >
                                            ...
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Actions */}
                            <div className={cn(
                                "flex gap-4 transition-all duration-500",
                                transcript && !isRecording ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                            )}>
                                <Button
                                    onClick={() => speakText(transcript)}
                                    size="lg"
                                    className="h-14 px-8 text-lg bg-white/10 hover:bg-white/20 text-white border-2 border-white/10 hover:border-white/20 backdrop-blur-md rounded-2xl transition-all"
                                >
                                    <Volume2 className="mr-2 w-6 h-6" />
                                    Read Aloud
                                </Button>
                                <Button
                                    onClick={() => setTranscript("")}
                                    size="lg"
                                    variant="ghost"
                                    className="h-14 px-8 text-lg text-slate-400 hover:text-white rounded-2xl"
                                >
                                    <RefreshCw className="mr-2 w-5 h-5" />
                                    Clear
                                </Button>
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
