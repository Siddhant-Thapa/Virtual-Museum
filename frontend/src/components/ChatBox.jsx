import React, { useState, useEffect, useRef } from 'react';

export default function ChatBox({ onClose, autoQuestion = "" }) {
    const [input, setInput] = useState(autoQuestion);
    const [messages, setMessages] = useState([]);
    const [listening, setListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const recognitionRef = useRef(null);
    const inputRef = useRef(null);
    const hasUserTypedRef = useRef(false); // ✅ NEW

    const speak = (text) => {
        if (isMuted) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        const setVoiceAndSpeak = () => {
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(v =>
                v.name.toLowerCase().includes('female') ||
                v.name.toLowerCase().includes('samantha') ||
                v.name.toLowerCase().includes('karen') ||
                v.name.toLowerCase().includes('susan') ||
                v.name.toLowerCase().includes('victoria') ||
                v.name.toLowerCase().includes('zira') ||
                (v.name.toLowerCase().includes('google') && v.name.toLowerCase().includes('female')) ||
                (v.name.toLowerCase().includes('microsoft') && v.name.toLowerCase().includes('zira'))
            );
            if (femaleVoice) utterance.voice = femaleVoice;
            window.speechSynthesis.speak(utterance);
        };
        if (window.speechSynthesis.getVoices().length > 0) {
            setVoiceAndSpeak();
        } else {
            window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
        }
    };

    const systemPrompt = `You are a friendly and knowledgeable AI tour guide inside a 3D Virtual Museum built for PES University. 
The museum is divided into two rooms:

🟦 Room 1 (Front Room):
- A marble sculpture of a warrior at the center
- A T-Rex skeleton on the right
- An ancient ceremonial knife on the left pedestal

🟥 Room 2 (Back Room):
- Diplodocus dinosaur hanging from above
- Arrow Man statue on the right
- Spear Man statue in the far right
- GN geometric sculpture on the far left

Speak like a museum guide. Keep responses concise and engaging.
Avoid repeating the same full description in every response.
Instead, refer back to what the user has already explored or asked.`;

    // ✅ Modified useEffect: Respect user's typing
    useEffect(() => {
        if (autoQuestion && !hasUserTypedRef.current) {
            setInput(autoQuestion);
            const timer = setTimeout(() => {
                handleSend(autoQuestion);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [autoQuestion]);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) return;
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.onstart = () => setListening(true);
        recognition.onend = () => setListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
        };
        recognitionRef.current = recognition;
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            const isTypingInInput = document.activeElement === inputRef.current ||
                document.activeElement.tagName === 'INPUT' ||
                document.activeElement.tagName === 'TEXTAREA';
            if (!isTypingInInput) {
                if (e.key.toLowerCase() === 'q') onClose();
                if (e.key.toLowerCase() === 'm') setIsMuted(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleSend = async (messageText = null) => {
        const textToSend = messageText || input;
        if (!textToSend.trim() || isLoading) return;
        const userMessage = { from: 'user', text: textToSend };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setIsLoading(true);
        if (!messageText) setInput('');
        try {
            const modelOptions = [
                "anthropic/claude-3-haiku",
                "meta-llama/llama-2-7b-chat",
                "google/gemma-7b-it",
                "mistralai/mistral-7b-instruct",
                "openai/gpt-3.5-turbo"
            ];
            let response = null;
            for (const model of modelOptions) {
                try {
                    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            Authorization: "your api key **later correct this just saving progress",
                            "Content-Type": "application/json",
                            "HTTP-Referer": window.location.origin,
                            "X-Title": "PES Virtual Museum"
                        },
                        body: JSON.stringify({
                            model,
                            messages: [
                                { role: "system", content: systemPrompt },
                                ...newMessages.map(m => ({
                                    role: m.from === 'user' ? 'user' : 'assistant',
                                    content: m.text
                                }))
                            ],
                            max_tokens: 150,
                            temperature: 0.7
                        })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data?.choices?.[0]?.message?.content) {
                            response = data.choices[0].message.content.trim();
                            break;
                        }
                    }
                } catch { }
            }

            const fallbackResponse = getFallbackResponse(textToSend);
            const finalResponse = response || fallbackResponse;
            setMessages(prev => [...prev, { from: 'ai', text: finalResponse }]);
            speak(finalResponse);
            if (!messageText) setInput('');
        } catch (err) {
            const fallbackResponse = getFallbackResponse(textToSend);
            setMessages(prev => [...prev, { from: 'ai', text: fallbackResponse }]);
            speak(fallbackResponse);
            if (!messageText) setInput('');
        } finally {
            setIsLoading(false);
        }
    };

    const getFallbackResponse = (userInput) => {
        const input = userInput.toLowerCase();
        if (input.includes('hello') || input.includes('hi')) return "Hello! Welcome to the PES University Virtual Museum! 🏛️ What would you like to explore?";
        if (input.includes('room 1') || input.includes('front')) return "Room 1 features the warrior sculpture, a T-Rex skeleton, and an ancient knife.";
        if (input.includes('room 2') || input.includes('back')) return "Room 2 contains the Diplodocus, Arrow Man, Spear Man, and GN sculpture.";
        if (input.includes('t-rex')) return "The T-Rex skeleton is a fearsome dinosaur with powerful jaws and a towering frame.";
        if (input.includes('warrior')) return "The warrior sculpture showcases classical craftsmanship and symbolic strength.";
        if (input.includes('diplodocus')) return "The Diplodocus display highlights its long neck and elegant structure, suspended from above.";
        if (input.includes('hephaestus')) return "The Hephaestus temple represents ancient Greek architecture and mythology, showcasing the god of fire and metalworking.";
        return "Feel free to ask about any exhibits like the T-Rex, warrior, or GN sculpture!";
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div style={styles.chatBox}>
            <div style={styles.tipBar}>🔘 Press <strong>Q</strong> to exit chat | 🔇 Press <strong>M</strong> to toggle voice</div>
            <button onClick={onClose} style={styles.closeBtn}>❌</button>
            <div style={styles.header}><h3 style={styles.title}>🏛️ Museum AI Guide</h3></div>
            <div style={styles.chat}>
                {messages.length === 0 && (
                    <div style={styles.welcomeMsg}>Welcome to PES University Virtual Museum! 🦕</div>
                )}
                {messages.map((m, i) => (
                    <div key={i} style={{
                        ...styles.message,
                        ...(m.from === 'user' ? styles.userMessage : styles.aiMessage)
                    }}>
                        <strong>{m.from === 'user' ? 'You' : 'Guide'}:</strong> {m.text}
                    </div>
                ))}
                {isLoading && <div style={styles.loadingMsg}>🤔 Let me think...</div>}
            </div>

            <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                style={styles.inputRow}
            >
                <input
                    ref={inputRef}
                    value={input}
                    onChange={e => {
                        hasUserTypedRef.current = true; // ✅ Mark as user-typed
                        setInput(e.target.value);
                    }}
                    onKeyPress={handleKeyPress}
                    style={styles.input}
                    placeholder="Ask your museum guide..."
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    style={{ ...styles.sendBtn, ...(isLoading ? styles.btnDisabled : {}) }}
                    disabled={isLoading}
                >
                    {isLoading ? '⏳' : 'Send'}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        if (recognitionRef.current && !listening) recognitionRef.current.start();
                    }}
                    style={{
                        ...styles.sendBtn,
                        backgroundColor: listening ? '#28a745' : '#6c757d'
                    }}
                    disabled={isLoading}
                >
                    {listening ? '🔴' : '🎤'}
                </button>
            </form>
        </div>
    );
}

const styles = {
    chatBox: {
        position: 'absolute', bottom: 20, right: 20, width: 380,
        background: '#ffffff', border: '2px solid #007bff',
        borderRadius: 12, padding: 16, zIndex: 1000,
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)', fontFamily: 'Arial, sans-serif'
    },
    closeBtn: {
        position: 'absolute', top: 8, right: 8,
        background: 'transparent', border: 'none',
        fontSize: 18, cursor: 'pointer', opacity: 0.7
    },
    header: { marginBottom: 12 },
    title: { margin: 0, fontSize: 16, color: '#007bff', textAlign: 'center' },
    chat: {
        height: 200, overflowY: 'auto', marginBottom: 12,
        backgroundColor: '#f8f9fa', padding: 10,
        borderRadius: 8, border: '1px solid #e9ecef'
    },
    message: {
        marginBottom: 8, padding: 8, borderRadius: 8,
        fontSize: 14, lineHeight: 1.4
    },
    userMessage: { backgroundColor: '#e3f2fd', marginLeft: 20, textAlign: 'right' },
    aiMessage: { backgroundColor: '#f1f8e9', marginRight: 20 },
    welcomeMsg: {
        textAlign: 'center', color: '#666',
        fontStyle: 'italic', padding: 20, fontSize: 14
    },
    loadingMsg: {
        textAlign: 'center', color: '#007bff',
        fontStyle: 'italic', padding: 8
    },
    inputRow: { display: 'flex', gap: 8 },
    input: {
        flexGrow: 1, padding: 10, borderRadius: 6,
        border: '1px solid #ccc', fontSize: 14, outline: 'none'
    },
    sendBtn: {
        padding: '10px 12px', border: 'none',
        backgroundColor: '#007bff', color: '#fff',
        borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 'bold'
    },
    btnDisabled: { backgroundColor: '#ccc', cursor: 'not-allowed' },
    tipBar: {
        marginBottom: 6, fontSize: 13,
        textAlign: 'center', color: '#555', fontStyle: 'italic'
    }
};
