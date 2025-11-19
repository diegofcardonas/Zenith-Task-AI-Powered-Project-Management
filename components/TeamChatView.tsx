
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import AvatarWithStatus from './AvatarWithStatus';
import { useTranslation } from '../i18n';
import { User, ChatMessage } from '../types';

const TeamChatView: React.FC = () => {
    const { state, actions } = useAppContext();
    const { chatChannels, chatMessages, activeChatId, currentUser, users } = state;
    const { handleSendMessage, handleSetActiveChat } = actions;
    const { t } = useTranslation();
    
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isMobileListVisible, setIsMobileListVisible] = useState(true);

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
    const currentMessages = chatMessages.filter(m => m.channelId === activeChatId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (messageInput.trim() && activeChatId) {
            handleSendMessage(activeChatId, messageInput);
            setMessageInput('');
        }
    };

    const getChannelName = (channel) => {
        if (channel.type === 'dm') {
            // For DMs, show the other person's name if possible
            const otherUserId = channel.participants.find(id => id !== currentUser.id);
            const otherUser = users.find(u => u.id === otherUserId);
            return otherUser ? otherUser.name : channel.name;
        }
        return channel.name;
    };
    
    const getChannelAvatar = (channel) => {
        if (channel.type === 'dm') {
            const otherUserId = channel.participants.find(id => id !== currentUser.id);
            const otherUser = users.find(u => u.id === otherUserId);
            if (otherUser) return <AvatarWithStatus user={otherUser} className="w-10 h-10" />;
        }
        // Fallback for group or unknown
        return (
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {channel.name.charAt(0).toUpperCase()}
            </div>
        );
    };

    const groupChannels = chatChannels.filter(c => c.type === 'group');
    const dmChannels = chatChannels.filter(c => c.type === 'dm');

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex h-full bg-background overflow-hidden">
            {/* Chat Sidebar / List */}
            <div className={`w-full md:w-80 bg-surface border-r border-border flex flex-col ${isMobileListVisible ? 'flex' : 'hidden md:flex'}`}>
                <div className="p-4 border-b border-border">
                    <h2 className="text-xl font-bold text-text-primary">{t('chat.teamChat')}</h2>
                </div>
                <div className="flex-grow overflow-y-auto p-2 space-y-6">
                    {/* Groups */}
                    <div>
                        <h3 className="text-xs font-bold text-text-secondary uppercase px-3 mb-2">{t('chat.channels')}</h3>
                        <div className="space-y-1">
                            {groupChannels.map(channel => (
                                <button
                                    key={channel.id}
                                    onClick={() => handleSetActiveChat(channel.id)}
                                    className={`w-full flex items-center p-2 rounded-lg transition-colors ${activeChatId === channel.id ? 'bg-primary/10 text-primary' : 'hover:bg-secondary text-text-primary'}`}
                                >
                                    <span className="mr-3 text-lg">#</span>
                                    <div className="flex-grow text-left">
                                        <div className="font-semibold text-sm">{channel.name}</div>
                                        {channel.lastMessage && <div className="text-xs text-text-secondary truncate max-w-[150px]">{channel.lastMessage}</div>}
                                    </div>
                                    {channel.unreadCount > 0 && (
                                        <span className="bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{channel.unreadCount}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* DMs */}
                    <div>
                        <h3 className="text-xs font-bold text-text-secondary uppercase px-3 mb-2">{t('chat.directMessages')}</h3>
                        <div className="space-y-1">
                            {dmChannels.map(channel => {
                                const otherUserId = channel.participants.find(id => id !== currentUser.id);
                                const otherUser = users.find(u => u.id === otherUserId);
                                return (
                                    <button
                                        key={channel.id}
                                        onClick={() => handleSetActiveChat(channel.id)}
                                        className={`w-full flex items-center p-2 rounded-lg transition-colors ${activeChatId === channel.id ? 'bg-primary/10' : 'hover:bg-secondary'}`}
                                    >
                                        <div className="mr-3">
                                            {otherUser ? <AvatarWithStatus user={otherUser} className="w-8 h-8" /> : <div className="w-8 h-8 bg-gray-500 rounded-full" />}
                                        </div>
                                        <div className="flex-grow text-left min-w-0">
                                            <div className={`font-semibold text-sm truncate ${activeChatId === channel.id ? 'text-primary' : 'text-text-primary'}`}>
                                                {otherUser ? otherUser.name : channel.name}
                                            </div>
                                            {channel.lastMessage && <div className="text-xs text-text-secondary truncate">{channel.lastMessage}</div>}
                                        </div>
                                        {channel.unreadCount > 0 && (
                                            <span className="bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">{channel.unreadCount}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-grow flex flex-col bg-background ${!isMobileListVisible ? 'flex' : 'hidden md:flex'}`}>
                {activeChatId && activeChannel ? (
                    <>
                        {/* Header */}
                        <div className="p-3 md:p-4 border-b border-border flex items-center bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
                            <button 
                                onClick={() => setIsMobileListVisible(true)} 
                                className="md:hidden mr-3 text-text-secondary"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <div className="flex items-center gap-3">
                                {getChannelAvatar(activeChannel)}
                                <div>
                                    <h3 className="font-bold text-text-primary">{getChannelName(activeChannel)}</h3>
                                    <p className="text-xs text-text-secondary">
                                        {activeChannel.type === 'group' 
                                            ? `${activeChannel.participants.length} participants` 
                                            : t('common.online')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-50">
                            {currentMessages.map((msg, index) => {
                                const isMe = msg.senderId === currentUser.id;
                                const sender = users.find(u => u.id === msg.senderId);
                                const showAvatar = !isMe && (index === 0 || currentMessages[index - 1].senderId !== msg.senderId);
                                
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group mb-1`}>
                                        {!isMe && (
                                            <div className="w-8 mr-2 flex-shrink-0 flex items-end">
                                                {showAvatar && sender && <AvatarWithStatus user={sender} className="w-8 h-8" />}
                                            </div>
                                        )}
                                        <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-3 relative shadow-sm ${
                                            isMe 
                                                ? 'bg-primary text-white rounded-tr-none' 
                                                : 'bg-surface border border-border text-text-primary rounded-tl-none'
                                        }`}>
                                            {!isMe && activeChannel.type === 'group' && showAvatar && (
                                                <p className="text-xs font-bold text-primary mb-1">{sender?.name}</p>
                                            )}
                                            <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">{msg.text}</p>
                                            <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-text-secondary'}`}>
                                                {formatTime(msg.timestamp)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 md:p-4 bg-surface border-t border-border">
                            <form onSubmit={handleSend} className="flex gap-2 items-end bg-secondary rounded-xl p-2 border border-border focus-within:border-primary/50 transition-colors">
                                <button type="button" className="p-2 text-text-secondary hover:text-primary transition-colors rounded-full hover:bg-white/5">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </button>
                                <button type="button" className="p-2 text-text-secondary hover:text-primary transition-colors rounded-full hover:bg-white/5">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                </button>
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder={t('chat.placeholder')}
                                    className="flex-grow bg-transparent text-text-primary placeholder-text-secondary focus:outline-none py-2 px-2 max-h-32 overflow-y-auto"
                                />
                                <button 
                                    type="submit" 
                                    disabled={!messageInput.trim()}
                                    className="p-2 bg-primary text-white rounded-full hover:bg-primary-focus transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                >
                                    <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                        <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-4 shadow-inner">
                            <svg className="w-10 h-10 text-primary opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </div>
                        <p>{t('chat.selectToStart')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamChatView;
