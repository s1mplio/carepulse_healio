"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Send, User, Bot, Paperclip, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

const DoctorChatPage = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm Dr. CarePulse, your AI health assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<{file: File, base64: string, mimeType: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Automatically scroll to the latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile({
          file,
          base64: (reader.result as string).split(",")[1],
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    const fileToUpload = selectedFile;
    setSelectedFile(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          fileData: fileToUpload ? { base64: fileToUpload.base64, mimeType: fileToUpload.mimeType } : null
        }),
      });
      const data = await response.json();

      if (data.content) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.content,
            timestamp: new Date(),
          },
        ]);
      } else {
        throw new Error(data.error || "No response from assistant");
      }
    } catch (error) {
      console.error("Chat Error:", error);
      // Optionally add an error message to the chat
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-dark-300 text-white">
      {/* Chat Header */}
      <header className="flex items-center justify-between border-b border-dark-500 bg-dark-200 px-6 py-4">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => router.back()}
        >
          <Image
            src="/assets/icons/logo-full.svg"
            height={32}
            width={120}
            alt="logo"
            className="h-8 w-auto"
          />
          <div className="h-6 w-[1px] bg-dark-500 mx-2" />
          <div>
            <h2 className="text-sm font-semibold">Dr. CarePulse</h2>
            <p className="text-[10px] text-green-500 uppercase tracking-wider">AI Medical Assistant</p>
          </div>
        </div>
      </header>

      {/* Conversation Thread */}
      <div ref={scrollRef} className="remove-scrollbar flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[85%] sm:max-w-[70%] gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === "user" ? "bg-blue-600" : "bg-green-600"}`}>
                {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={`rounded-2xl px-4 py-3 text-sm shadow-md ${msg.role === "user" ? "bg-blue-600 text-white rounded-tr-none" : "bg-dark-400 text-white rounded-tl-none border border-dark-500"}`}>
                <div className="leading-relaxed whitespace-pre-wrap prose prose-invert max-w-none">
                  <ReactMarkdown>
                    {msg.content}
                  </ReactMarkdown>
                </div>
                <span className="mt-2 block text-[10px] opacity-50 text-right">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-1.5 bg-dark-400 border border-dark-500 rounded-2xl px-5 py-4 rounded-tl-none">
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-green-500"></div>
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-green-500 [animation-delay:0.2s]"></div>
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-green-500 [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      {/* Message Input Form */}
      <footer className="border-t border-dark-500 bg-dark-200 p-4 space-y-4">
        {selectedFile && (
          <div className="mx-auto max-w-4xl flex items-center gap-2 bg-dark-400 p-2 rounded-lg border border-dark-500 w-fit">
            <span className="text-xs text-blue-400 truncate max-w-[200px]">{selectedFile.file.name}</span>
            <button onClick={() => setSelectedFile(null)} className="text-dark-600 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}
        <form onSubmit={handleSend} className="mx-auto max-w-4xl flex items-center gap-2 sm:gap-4">
          <label className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-dark-500 bg-dark-400 text-dark-600 hover:text-white cursor-pointer transition-colors">
            <Paperclip size={20} />
            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
          </label>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Describe your health concern..." className="flex-1 bg-dark-400 border border-dark-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-all text-white placeholder:text-dark-600" />
          <button type="submit" disabled={!input.trim() || isLoading} className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Send size={20} />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default DoctorChatPage;