/**
 * AI Chatbot Component
 * Floating chat interface for natural language queries with audio support
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { chatbotApi, datasetsApi } from "@/services/api";
import { AnimatePresence, motion } from "framer-motion";
import {
    Bot,
    Loader2,
    MessageSquare,
    Send,
    Sparkles,
    User,
    Volume2,
    VolumeX,
    X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const AIChatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your RefineryIQ assistant. I can help you with energy consumption data, SEC metrics, alerts, predictions, and optimization recommendations. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Text-to-Speech function
  const speakText = (text: string) => {
    if (!audioEnabled || !('speechSynthesis' in window)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to use a more natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.includes('en') && (voice.name.includes('Google') || voice.name.includes('Microsoft'))
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const active = await datasetsApi.getActive();
      if (!active?.dataset_id) {
        const noDatasetMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Please select a dataset to ask questions.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, noDatasetMessage]);
        setIsLoading(false);
        return;
      }

      const userRole = user?.role === "ADMIN" ? "admin" : "operator";
      const response = await chatbotApi.query({
        dataset_id: active.dataset_id,
        user_role: userRole,
        question: userMessage.content,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Speak the response if audio is enabled
      if (audioEnabled) {
        speakText(response.answer);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Unable to fetch insights at the moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (audioEnabled) {
      // Stop any ongoing speech when disabling
      window.speechSynthesis.cancel();
    }
  };

  const suggestedQuestions = [
    "What's the current SEC?",
    "Any active alerts?",
    "Show recommendations",
    "Energy forecast",
  ];

  return (
    <>
      {/* Chat toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors",
          isOpen
            ? "bg-muted hover:bg-muted/80"
            : "bg-gradient-to-br from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageSquare className="w-6 h-6 text-primary-foreground" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse animation when closed */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] h-[500px] rounded-2xl bg-white/75 backdrop-blur-md border border-blue-100 shadow-md flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-blue-100 bg-white/70 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#003A8F]/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-brand-blue" />
                </div>
                <div className="flex-1">
                  <h3 className="font-orbitron font-bold text-brand-blue">RefineIQ Assistant</h3>
                  <p className="text-xs text-slate-500">
                    Powered by AI Intelligence
                  </p>
                </div>
                {/* Audio Toggle Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleAudio}
                  className={cn(
                    "w-9 h-9 transition-colors",
                    audioEnabled
                      ? "text-brand-blue hover:text-brand-blue/80 hover:bg-[#003A8F]/10"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  )}
                  title={audioEnabled ? "Audio On - Click to mute" : "Audio Off - Click to enable"}
                >
                  {audioEnabled ? (
                    <Volume2 className="w-5 h-5" />
                  ) : (
                    <VolumeX className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      message.role === "user"
                        ? "bg-[#F37021]/15"
                        : "bg-[#003A8F]/10"
                    )}
                  >
                    {message.role === "user" ? (
                      <User className="w-4 h-4 text-[#F37021]" />
                    ) : (
                      <Bot className="w-4 h-4 text-brand-blue" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "max-w-[80%] p-3 rounded-lg text-sm",
                      message.role === "user"
                        ? "bg-[#F37021]/10 text-slate-800"
                        : "bg-white/80 backdrop-blur-sm border border-blue-100 text-slate-800"
                    )}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#003A8F]/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-brand-blue" />
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm border border-blue-100 p-3 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-blue" />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested questions */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 border-t border-blue-100">
                <p className="text-xs text-slate-500 mb-2">
                  Quick questions:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question) => (
                    <button
                      key={question}
                      onClick={() => {
                        setInput(question);
                      }}
                      className="px-2 py-1 text-xs bg-white/70 backdrop-blur-sm rounded border border-blue-100 hover:border-[#003A8F]/40 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-blue-100">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about energy, alerts, predictions..."
                  className="flex-1 bg-white/80 backdrop-blur-sm border-blue-100 focus:border-[#003A8F]/50"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="bg-brand-orange hover:bg-brand-orange/90 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
