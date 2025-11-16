import React, { useState, useRef, useEffect } from 'react';
import { Task, List, User } from '../types';
import { getAIChatResponse } from '../services/geminiService';

interface AIChatbotProps {
    tasks: Task[];
    lists: List[];
    users: User[];
}

const AIChatbot: React.FC<AIChatbotProps> = ({ tasks, lists, users }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'model', parts: { text: string }[] }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage = { role: 'user' as const, parts: [{ text: input }] };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const aiResponse = await getAIChatResponse([...messages, userMessage], input, tasks, lists, users);

            if (aiResponse.functionCalls && aiResponse.functionCalls.length > 0) {
                for (const fc of aiResponse.functionCalls) {
                    let actionText = `ejecutando una acción`;
                    if(fc.name === 'create_task') actionText = `creando la tarea "${fc.args.title}"`;
                    if(fc.name === 'update_task_status') actionText = `actualizando la tarea "${fc.args.taskTitle}"`;
                    if(fc.name === 'assign_task') actionText = `asignando la tarea "${fc.args.taskTitle}"`;
                    
                    const modelMessage = { role: 'model' as const, parts: [{ text: `De acuerdo, ${actionText}...` }] };
                    setMessages(prev => [...prev, modelMessage]);

                    window.dispatchEvent(new CustomEvent('execute-ai-action', {
                        detail: { action: fc.name, args: fc.args }
                    }));
                }
            } else {
                const modelMessage = { role: 'model' as const, parts: [{ text: aiResponse.text }] };
                setMessages(prev => [...prev, modelMessage]);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Lo siento, ocurrió un error.";
            const modelMessage = { role: 'model' as const, parts: [{ text: errorMessage }] };
            setMessages(prev => [...prev, modelMessage]);
        }
        
        setIsLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    const renderMarkdown = (text: string) => {
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code class="bg-secondary px-1 py-0.5 rounded text-sm">$1</code>')
            .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
            .replace(/\n/g, '<br />');
        
        html = html.replace(/(<li.*<\/li>)/gs, '<ul>$1</ul>');
        return { __html: html };
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(p => !p)}
                className="fixed bottom-6 right-6 bg-primary text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-200 z-50"
                aria-label="Abrir Asistente IA"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                )}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 max-h-[70vh] bg-surface rounded-xl shadow-2xl flex flex-col border border-border z-50 animate-scaleIn">
                    <header className="p-4 border-b border-border">
                        <h3 className="font-semibold text-text-primary">Asistente IA</h3>
                        <p className="text-sm text-text-secondary">¡Pregúntame sobre tus proyectos!</p>
                    </header>
                    <div className="flex-grow p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">AI</div>}
                                <div className={`max-w-xs p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-secondary'}`}>
                                    <div dangerouslySetInnerHTML={renderMarkdown(msg.parts[0].text)} />
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">AI</div>
                                <div className="max-w-xs p-3 rounded-lg bg-secondary flex items-center">
                                    <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                                    <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce ml-1" style={{animationDelay: '0.2s'}}></div>
                                    <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce ml-1" style={{animationDelay: '0.4s'}}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-4 border-t border-border">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ej: ¿Qué tareas están atrasadas?"
                                className="w-full p-2 pr-10 bg-secondary rounded-lg border border-border focus:ring-primary focus:border-primary"
                                disabled={isLoading}
                            />
                            <button onClick={handleSend} disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-primary disabled:opacity-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChatbot;