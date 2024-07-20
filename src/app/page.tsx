// components/Chat.tsx
'use client';
import { useEffect, useState } from 'react';

interface Message {
  isUser: boolean;
  text: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [assistantId, setAssistantId] = useState('');
  const [threadId, setThreadId] = useState('');

  const initChat = async () => {
    try {
      const response1 = await fetch('/api/assistant', {
        method: 'POST',
      });
      if (!response1.ok) {
        throw new Error('Failed to fetch assistant ID');
      }
      const assistantId = await response1.json();
      console.log(assistantId);
      setAssistantId(assistantId);

      const response2 = await fetch('/api/assistant/threads', {
        method: 'POST',
      });
      if (!response2.ok) {
        throw new Error('Failed to fetch thread ID');
      }
      const threadId = await response2.json();
      console.log(threadId);
      setThreadId(threadId);
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  useEffect(() => {
    initChat();
  }, []);

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { isUser: true, text: input }]);
      setInput('');
      // Simulate assistant response
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { isUser: false, text: 'This is an automated response.' },
        ]);
      }, 1000);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} mb-2`}
          >
            <div
              className={`max-w-xs truncate rounded-lg p-2 ${msg.isUser ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="flex bg-white p-4">
        <input
          className="mr-2 flex-grow rounded-lg border p-2 focus:outline-none"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
        />
        <button
          className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
