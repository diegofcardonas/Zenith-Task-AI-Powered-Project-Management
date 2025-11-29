
import React, { useState, useMemo } from 'react';
import { useTranslation } from '../i18n';
import { useAppContext } from '../contexts/AppContext';

const HelpPanel: React.FC = () => {
    const { t } = useTranslation();
    const { state, actions } = useAppContext();
    const { isHelpOpen } = state;
    const { setIsHelpOpen } = actions;
    const [searchTerm, setSearchTerm] = useState('');
    const [openCategory, setOpenCategory] = useState<string | null>('general');

    const helpData = useMemo(() => {
        return {
            general: [
                { id: 'workspace', ...t('help.articles.workspace', { returnObjects: true }) },
                { id: 'projects', ...t('help.articles.projects', { returnObjects: true }) },
            ],
            views: [
                { id: 'board', ...t('help.articles.board', { returnObjects: true }) },
                { id: 'list', ...t('help.articles.list', { returnObjects: true }) },
                { id: 'backlog', ...t('help.articles.backlog', { returnObjects: true }) },
                { id: 'gantt', ...t('help.articles.gantt', { returnObjects: true }) },
                { id: 'eisenhower', ...t('help.articles.eisenhower', { returnObjects: true }) },
            ],
            roles: [
                { id: 'roles', ...t('help.articles.roles', { returnObjects: true }) },
            ],
            actions: [
                { id: 'tasks', ...t('help.articles.tasks', { returnObjects: true }) },
                { id: 'approvals', ...t('help.articles.approvals', { returnObjects: true }) },
            ]
        };
    }, [t]);

    const categories = [
        { id: 'general', label: t('help.categories.general') },
        { id: 'views', label: t('help.categories.views') },
        { id: 'roles', label: t('help.categories.roles') },
        { id: 'actions', label: t('help.categories.actions') },
    ];

    const filteredContent = useMemo(() => {
        if (!searchTerm) return null;
        const allArticles = Object.values(helpData).flat();
        return allArticles.filter((article: any) => 
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            article.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, helpData]);

    const renderMarkdown = (text: string) => {
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
            .replace(/\n/g, '<br />');
        return { __html: html };
    };

    if (!isHelpOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={() => setIsHelpOpen(false)}></div>
            <div className="relative w-full max-w-md bg-[#1e293b] h-full shadow-2xl flex flex-col border-l border-white/10 animate-slideInRight">
                
                {/* Header */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t('help.title')}
                    </h2>
                    <button onClick={() => setIsHelpOpen(false)} className="text-text-secondary hover:text-white p-1 rounded-full hover:bg-white/10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-white/10">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder={t('help.search')} 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#0f172a] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                    {searchTerm ? (
                        <div className="space-y-4">
                            {filteredContent && filteredContent.length > 0 ? (
                                filteredContent.map((article: any) => (
                                    <div key={article.id} className="bg-surface border border-white/5 rounded-lg p-4 animate-fadeIn">
                                        <h3 className="font-bold text-primary mb-2">{article.title}</h3>
                                        <div className="text-sm text-text-secondary leading-relaxed" dangerouslySetInnerHTML={renderMarkdown(article.content)} />
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-text-secondary italic mt-10">{t('modals.noResultsFound')}</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {categories.map(cat => (
                                <div key={cat.id} className="border border-white/5 rounded-lg overflow-hidden bg-surface/30">
                                    <button 
                                        onClick={() => setOpenCategory(openCategory === cat.id ? null : cat.id)}
                                        className="w-full flex items-center justify-between p-3 text-left font-semibold text-text-primary hover:bg-white/5 transition-colors"
                                    >
                                        {cat.label}
                                        <svg className={`w-4 h-4 transition-transform ${openCategory === cat.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {openCategory === cat.id && (
                                        <div className="p-3 pt-0 space-y-3 bg-black/10 border-t border-white/5">
                                            {(helpData as any)[cat.id].map((article: any) => (
                                                <div key={article.id} className="p-2">
                                                    <h4 className="text-sm font-bold text-primary mb-1">{article.title}</h4>
                                                    <div className="text-xs text-text-secondary leading-relaxed" dangerouslySetInnerHTML={renderMarkdown(article.content)} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HelpPanel;
