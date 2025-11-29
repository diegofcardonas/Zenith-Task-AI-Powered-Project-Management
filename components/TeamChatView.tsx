
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import AvatarWithStatus from './AvatarWithStatus';
import { useTranslation } from '../i18n';
import { User, ChatMessage } from '../types';

const TeamChatView: React.FC = () => {
    const { state, actions } = useAppContext();
    const { chatChannels, chatMessages, activeChatId, currentUser, users, isChatOpen, selectedListId } = state;
    const { handleSendMessage, handleSetActiveChat, setIsChatOpen, handleAddTask, addToast, handleCreateOrOpenDM } = actions;
    const { t } = useTranslation();
    
    const [messageInput, setMessageInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isMobileListVisible, setIsMobileListVisible] = useState(true);
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, activeChatId]);

    // Mobile view handling
    useEffect(() => {
        if (activeChatId) setIsMobileListVisible(false);
    }, [activeChatId]);

    const activeChannel = chatChannels.find(c => c.id === activeChatId);
    
    // Get active chat messages
    const currentMessages = useMemo(() => {
        return chatMessages.filter(m => m.channelId === activeChatId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [chatMessages, activeChatId]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !activeChatId) return;

        // Command handling
        if (messageInput.startsWith('/')) {
            const parts = messageInput.split(' ');
            const command = parts[0].toLowerCase();
            const content = parts.slice(1).join(' ');

            if (command === '/task' && content) {
                if (selectedListId) {
                    // Create task with placeholder data but the title from chat
                    const tempTemplate = {
                        id: 'chat-temp', 
                        name: 'chat', 
                        taskData: { title: content, description: `Created via chat by ${currentUser?.name}` }
                    };
                    handleAddTask(selectedListId, tempTemplate);
                    // Add system message essentially
                    handleSendMessage(activeChatId, `🤖 Tarea creada: ${content}`);
                } else {
                     addToast({ message: t('mainContent.createTaskNoProjectTooltip'), type: 'error' });
                }
                setMessageInput('');
                return;
            } else if (command === '/urgent' && content) {
                 handleSendMessage(activeChatId, `🚨 **URGENT:** ${content}`);
                 setMessageInput('');
                 return;
            }
        }

        handleSendMessage(activeChatId, messageInput);
        setMessageInput('');
    };
    
    const getChannelName = (channel) => {
        if (channel.type === 'dm') {
            const otherUserId = channel.participants.find(id => id !== currentUser?.id);
            const otherUser = users.find(u => u.id === otherUserId);
            return otherUser ? otherUser.name : channel.name;
        }
        return channel.name;
    };
    
    const getChannelAvatar = (channel) => {
        if (channel.type === 'dm') {
            const otherUserId = channel.participants.find(id => id !== currentUser?.id);
            const otherUser = users.find(u => u.id === otherUserId);
            if (otherUser) return <AvatarWithStatus user={otherUser} className="w-10 h-10" />;
        }
        return (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                {channel.name.charAt(0).toUpperCase()}
            </div>
        );
    };

    const renderMarkdown = (text: string) => {
        let html = text
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code class="bg-black/20 px-1 py-0.5 rounded text-sm font-mono border border-white/10">$1</code>')
            .replace(/\n/g, '<br />');
        return { __html: html };
    };

    const filteredChannels = chatChannels.filter(c => 
        getChannelName(c).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupChannels = filteredChannels.filter(c => c.type === 'group');
    const dmChannels = filteredChannels.filter(c => c.type === 'dm');

    const availableUsersForDM = users.filter(u => u.id !== currentUser.id);

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!currentUser || !isChatOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4 md:p-0">
            <div className="w-full h-full md:w-[90vw] md:h-[85vh] bg-[#0f172a] rounded-2xl shadow-2xl border border-white/10 flex overflow-hidden animate-scaleIn relative">
                {/* Close Button */}
                <button 
                    onClick={() => setIsChatOpen(false)}
                    className="absolute top-3 right-3 z-50 p-2 bg-[#1e293b]/80 hover:bg-white/10 text-text-secondary hover:text-white rounded-full transition-all border border-white/10 shadow-lg"
                    title={t('common.close')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>

                {/* Chat Sidebar / List */}
                <div className={`w-full md:w-80 bg-[#1e293b]/50 backdrop-blur-xl border-r border-white/10 flex flex-col z-20 ${isMobileListVisible ? 'flex' : 'hidden md:flex'}`}>
                    <div className="p-4 pr-12 border-b border-white/10 space-y-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            {t('chat.teamChat')}
                        </h2>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Buscar chat..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#0f172a] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>
                    <div className="flex-grow overflow-y-auto p-2 space-y-6 custom-scrollbar">
                        {/* Groups */}
                        {groupChannels.length > 0 && (
                            <div>
                                <h3 className="text-[10px] font-bold text-text-secondary/70 uppercase tracking-wider px-3 mb-2">{t('chat.channels')}</h3>
                                <div className="space-y-0.5">
                                    {groupChannels.map(channel => (
                                        <button
                                            key={channel.id}
                                            onClick={() => handleSetActiveChat(channel.id)}
                                            className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${activeChatId === channel.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-white/5 text-text-secondary hover:text-white'}`}
                                        >
                                            <span className={`mr-3 text-lg opacity-70 ${activeChatId === channel.id ? 'text-white' : 'text-text-secondary'}`}>#</span>
                                            <div className="flex-grow text-left min-w-0">
                                                <div className="font-medium text-sm truncate">{channel.name}</div>
                                                {channel.lastMessage && activeChatId !== channel.id && <div className="text-xs opacity-60 truncate">{channel.lastMessage}</div>}
                                            </div>
                                            {channel.unreadCount > 0 && activeChatId !== channel.id && (
                                                <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-2">{channel.unreadCount}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* DMs */}
                        <div>
                            <div className="flex items-center justify-between px-3 mb-2 group">
                                <h3 className="text-[10px] font-bold text-text-secondary/70 uppercase tracking-wider">{t('chat.directMessages')}</h3>
                                <button 
                                    onClick={() => setIsNewChatModalOpen(true)}
                                    className="text-text-secondary hover:text-white hover:bg-white/10 rounded p-0.5 transition-colors opacity-0 group-hover:opacity-100"
                                    title={t('chat.startNewDM')}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-0.5">
                                {dmChannels.map(channel => {
                                    const otherUserId = channel.participants.find(id => id !== currentUser.id);
                                    const otherUser = users.find(u => u.id === otherUserId);
                                    return (
                                        <button
                                            key={channel.id}
                                            onClick={() => handleSetActiveChat(channel.id)}
                                            className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${activeChatId === channel.id ? 'bg-white/10 text-white border border-white/5' : 'hover:bg-white/5 text-text-secondary hover:text-white border border-transparent'}`}
                                        >
                                            <div className="mr-3 relative">
                                                {otherUser ? <AvatarWithStatus user={otherUser} className="w-8 h-8" /> : <div className="w-8 h-8 bg-gray-500 rounded-full" />}
                                            </div>
                                            <div className="flex-grow text-left min-w-0">
                                                <div className="font-medium text-sm truncate">
                                                    {otherUser ? otherUser.name : channel.name}
                                                </div>
                                                {channel.lastMessage && <div className="text-xs opacity-60 truncate">{channel.lastMessage}</div>}
                                            </div>
                                            {channel.unreadCount > 0 && activeChatId !== channel.id && (
                                                <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-2">{channel.unreadCount}</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* New Chat Modal */}
                {isNewChatModalOpen && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setIsNewChatModalOpen(false)}>
                        <div className="bg-[#1e293b] w-80 max-h-[400px] rounded-xl shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-scaleIn" onClick={e => e.stopPropagation()}>
                            <div className="p-3 border-b border-white/10 flex justify-between items-center">
                                <h3 className="font-bold text-white text-sm">{t('chat.selectUser')}</h3>
                                <button onClick={() => setIsNewChatModalOpen(false)} className="text-text-secondary hover:text-white"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                            <div className="flex-grow overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                {availableUsersForDM.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => {
                                            handleCreateOrOpenDM(user.id);
                                            setIsNewChatModalOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                                    >
                                        <AvatarWithStatus user={user} className="w-8 h-8" />
                                        <div>
                                            <p className="text-sm font-medium text-white">{user.name}</p>
                                            <p className="text-xs text-text-secondary flex items-center gap-1">
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Online' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                                {user.status}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Chat Window */}
                <div className={`flex-grow flex flex-col bg-transparent relative z-10 ${!isMobileListVisible ? 'flex' : 'hidden md:flex'}`}>
                    {activeChatId && activeChannel ? (
                        <>
                            {/* Header */}
                            <div className="p-3 md:p-4 pr-12 md:pr-14 border-b border-white/10 flex items-center bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-30 shadow-sm justify-between">
                                <div className="flex items-center">
                                    <button 
                                        onClick={() => setIsMobileListVisible(true)} 
                                        className="md:hidden mr-3 p-2 hover:bg-white/10 rounded-full transition-colors text-text-secondary"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <div className="flex items-center gap-4">
                                        {getChannelAvatar(activeChannel)}
                                        <div>
                                            <h3 className="font-bold text-text-primary text-lg leading-tight">{getChannelName(activeChannel)}</h3>
                                            <div className="flex items-center text-xs text-text-secondary">
                                                {activeChannel.type === 'group' ? (
                                                    <>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
                                                        {activeChannel.participants.length} miembros
                                                    </>
                                                ) : (
                                                    <span className="flex items-center text-green-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                                                        {t('common.online')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
                                {currentMessages.map((msg, index) => {
                                    const isMe = msg.senderId === currentUser.id;
                                    const sender = users.find(u => u.id === msg.senderId);
                                    const showAvatar = !isMe && (index === 0 || currentMessages[index - 1].senderId !== msg.senderId);
                                    const isSequence = index > 0 && currentMessages[index - 1].senderId === msg.senderId;
                                    
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group ${isSequence ? 'mt-1' : 'mt-4'}`}>
                                            {!isMe && (
                                                <div className="w-8 mr-3 flex-shrink-0 flex items-start pt-1">
                                                    {showAvatar ? (sender && <AvatarWithStatus user={sender} className="w-8 h-8" />) : <div className="w-8" />}
                                                </div>
                                            )}
                                            <div className={`max-w-[85%] md:max-w-[65%] relative group`}>
                                                {!isMe && activeChannel.type === 'group' && showAvatar && (
                                                    <p className="text-xs font-bold text-text-secondary ml-1 mb-1">{sender?.name}</p>
                                                )}
                                                <div className={`px-4 py-2.5 shadow-sm text-[15px] leading-relaxed break-words relative
                                                    ${isMe 
                                                        ? 'bg-primary text-white rounded-2xl rounded-tr-sm shadow-primary/10' 
                                                        : 'bg-[#1e293b] border border-white/5 text-text-primary rounded-2xl rounded-tl-sm'
                                                    }`}
                                                >
                                                    <div dangerouslySetInnerHTML={renderMarkdown(msg.text)} />
                                                    <span className={`text-[10px] inline-block ml-2 opacity-70 float-right mt-1 ${isMe ? 'text-white' : 'text-text-secondary'}`}>
                                                        {formatTime(msg.timestamp)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-[#0f172a] border-t border-white/10 z-30 relative">
                                <form onSubmit={handleSend} className="flex gap-3 items-end max-w-4xl mx-auto relative">
                                    <div className="flex-grow bg-[#1e293b] rounded-3xl border border-white/10 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all flex items-end py-2 pl-2 pr-2 shadow-lg">
                                        <textarea
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSend(e);
                                                }
                                            }}
                                            placeholder={t('chat.placeholder')}
                                            className="flex-grow bg-transparent text-text-primary placeholder-text-secondary/50 focus:outline-none py-2 px-2 max-h-32 min-h-[44px] resize-none custom-scrollbar leading-relaxed"
                                            rows={1}
                                        />
                                        <button type="button" className="p-2 text-text-secondary hover:text-yellow-400 transition-colors rounded-full hover:bg-white/5 flex-shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </button>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={!messageInput.trim()}
                                        className="p-3 bg-primary text-white rounded-full hover:bg-primary-focus transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-105 active:scale-95 flex-shrink-0 mb-1"
                                    >
                                        <svg className="w-5 h-5 transform rotate-90 translate-x-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-text-secondary bg-[#0f172a] p-6 text-center">
                            <div className="w-24 h-24 bg-[#1e293b] rounded-full flex items-center justify-center mb-6 shadow-2xl border border-white/5 animate-float">
                                <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-2">¡Comienza una conversación!</h3>
                            <p className="max-w-xs opacity-70">{t('chat.selectToStart')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeamChatView;
