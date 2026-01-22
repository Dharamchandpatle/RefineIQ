import { useAuth } from "@/hooks/useAuth";
import { chatbotApi, datasetsApi } from "@/services/api";
import { useState } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const ChatbotWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const active = await datasetsApi.getActive();
      if (!active?.dataset_id) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Please select a dataset to ask questions." },
        ]);
        setIsLoading(false);
        return;
      }
      const userRole = user?.role === "ADMIN" ? "admin" : "operator";
      const response = await chatbotApi.query({
        dataset_id: active.dataset_id,
        user_role: userRole,
        question: userMessage.content,
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.answer },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Unable to fetch insights at the moment." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <div className="w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-brand-blue">RefineryIQ Assistant</h4>
            <button type="button" onClick={() => setIsOpen(false)} className="text-xs text-slate-500">
              Close
            </button>
          </div>
          <div className="flex-1 p-4 space-y-3 max-h-72 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-xs text-slate-500">
                Ask about KPIs, anomalies, or recommendations.
              </p>
            ) : (
              messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={message.role === "user" ? "text-right" : "text-left"}
                >
                  <p
                    className={
                      message.role === "user"
                        ? "inline-block bg-brand-blue text-white text-xs px-3 py-2 rounded-lg"
                        : "inline-block bg-slate-100 dark:bg-slate-800 text-xs px-3 py-2 rounded-lg"
                    }
                  >
                    {message.content}
                  </p>
                </div>
              ))
            )}
            {isLoading ? <p className="text-xs text-slate-500">Thinking...</p> : null}
          </div>
          <div className="p-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask a question"
                className="flex-1 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs bg-white dark:bg-slate-900"
              />
              <button
                type="button"
                onClick={handleSend}
                className="px-3 py-2 bg-brand-orange text-white text-xs rounded-md"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-4 py-3 bg-brand-orange text-white rounded-full shadow-md text-xs"
        >
          Chatbot
        </button>
      )}
    </div>
  );
};

export default ChatbotWidget;
