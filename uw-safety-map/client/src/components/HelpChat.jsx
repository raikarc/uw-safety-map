import { useState, useRef, useEffect } from 'react';
import { getResponse } from '../utils/chatbot';
import './HelpChat.css';

const INITIAL_MESSAGE = {
  from: 'bot',
  text: "Hi — I'm here to help you stay safe. Tell me what's going on and I'll tell you exactly what to do and who to call.",
};

export default function HelpChat({ onClose }) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const userMsg = { from: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const response = getResponse(text);
      setTyping(false);
      const msgs = [{ from: 'bot', ...response }];
      if (response.followUp) {
        msgs.push({ from: 'bot', text: response.followUp });
      }
      if (response.femaleAddon) {
        msgs.push({
          from: 'bot',
          text: response.femaleAddon.note,
          contacts: response.femaleAddon.contacts,
          tips: response.femaleAddon.tips,
        });
      }
      setMessages(prev => [...prev, ...msgs]);
    }, 600);
  }

  return (
    <div className="helpchat">
      <div className="helpchat-header">
        <span>🆘 Safety Assistant</span>
        <button className="helpchat-close" onClick={onClose}>✕</button>
      </div>

      <div className="helpchat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`helpchat-msg helpchat-msg--${msg.from}`}>
            <p className="helpchat-msg-text">{msg.text}</p>
            {msg.contacts && (
              <div className="helpchat-contacts">
                {msg.contacts.map((c, j) => (
                  <a key={j} href={`tel:${c.number.replace(/\D/g, '')}`} className="helpchat-contact-btn">
                    📞 {c.label}<span>{c.number}</span>
                  </a>
                ))}
              </div>
            )}
            {msg.tips && (
              <ul className="helpchat-tips">
                {msg.tips.map((t, j) => <li key={j}>{t}</li>)}
              </ul>
            )}
          </div>
        ))}
        {typing && (
          <div className="helpchat-msg helpchat-msg--bot">
            <span className="helpchat-typing"><span /><span /><span /></span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className="helpchat-input-row" onSubmit={handleSend}>
        <input
          className="helpchat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Describe your situation..."
          autoFocus
        />
        <button type="submit" className="helpchat-send">Send</button>
      </form>
    </div>
  );
}
