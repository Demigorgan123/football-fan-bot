'use client';
import { AssistantStream } from 'openai/lib/AssistantStream.mjs';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import ronaldo from '@/app/images/ronaldo.png';
import { Quicksand } from 'next/font/google';

type Message = {
  isUser: boolean;
  text: string;
};

const inter = Quicksand({ subsets: ['latin'] });

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isDisable, setIsDisable] = useState(false);
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
      // console.log(assistantId.assistantId);
      setAssistantId(assistantId.assistantId);

      const response2 = await fetch('/api/assistant/threads', {
        method: 'POST',
      });
      if (!response2.ok) {
        throw new Error('Failed to fetch thread ID');
      }
      const threadId = await response2.json();
      // console.log(threadId.threadId);
      setThreadId(threadId.threadId);
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  useEffect(() => {
    initChat();
  }, []);

  const appendMessage = (isUser: boolean, text: string) => {
    setMessages((prevMsg) => [...prevMsg, { isUser, text }]);
  };

  const appendToLastMessage = (text: string) => {
    setMessages((prevMsg) => {
      const lastMsg = prevMsg[prevMsg.length - 1];
      const updateLastMsg = {
        ...lastMsg,
        text: lastMsg.text + text,
      };
      return [...prevMsg.slice(0, -1), updateLastMsg];
    });
  };

  const handleTextCreated = () => {
    appendMessage(false, '');
  };

  const handleTextDelta = (delta: any) => {
    if (delta.value != null) {
      appendToLastMessage(delta.value);
    }
  };

  const handleRunCompleted = () => {
    setIsDisable(false);
  };

  const handleReadableStream = (stream: AssistantStream) => {
    stream.on('textCreated', handleTextCreated);
    stream.on('textDelta', handleTextDelta);
    stream.on('event', (event) => {
      if (event.event === 'thread.run.completed') handleRunCompleted();
    });
  };

  const sendMessage = async (text: string) => {
    const response = await fetch(
      `/api/assistant/threads/${threadId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({
          assistantId,
          content: text,
        }),
      },
    );
    const stream = AssistantStream.fromReadableStream(response.body);
    handleReadableStream(stream);
  };
  const handleSend = () => {
    if (!userInput.trim()) return;
    sendMessage(userInput);
    setMessages((prevMesg) => [...prevMesg, { isUser: true, text: userInput }]);
    setUserInput('');
    setIsDisable(true);
  };

  return (
    <div className={`flex h-screen flex-col bg-gray-100 ${inter.className}`}>
      <div className="flex items-center justify-center gap-4 py-2">
        <div className="hidden md:block">
          <Image src={ronaldo} alt="ronaldo" className="w-20" />
        </div>

        <div className="text-center md:text-left">
          <p className="text-6xl font-semibold">Football Fan Bot</p>
          <p>
            Your ultimate football guide: scores, news, teams, stats, and
            updates
          </p>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} mb-2`}
          >
            <div
              className={`max-w-xs rounded-lg p-2 ${msg.isUser ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}
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
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
        />
        <button
          className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={handleSend}
          disabled={isDisable}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
