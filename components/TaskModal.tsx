import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Task, User, Status, Priority, Subtask, Role, Comment, Attachment, List, Permission } from '../types';
import { generateSubtasks, generateTaskDescription, generateTaskTitleAndDescription, suggestTaskDetails, generateSmartReplies } from '../services/geminiService';
import { useDebounce } from '../hooks/useDebounce';
import AvatarWithStatus from './AvatarWithStatus';
import { useAppContext } from '../contexts/AppContext';
import { useTranslation } from '../i18n';
import { useTimeAgo } from '../hooks/useTimeAgo';

interface CommentWithReplies extends Comment {
  replies: CommentWithReplies[];
}

const Spinner: React.FC = () => (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const CommentComponent: React.FC<{
    comment: CommentWithReplies;
    onReply: (commentId: string) => void;
    isReadOnly: boolean;
}> = ({ comment, onReply, isReadOnly }) => {
    const timeAgo = useTimeAgo();
    const { t } = useTranslation();

    return (
        <div className="flex gap-3">
            <AvatarWithStatus user={comment.user} className="w-8 h-8 flex-shrink-0 mt-1" />
            <div className="flex-grow min-w-0">
                <div className="bg-secondary p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-text-primary truncate">{comment.user.name}</span>
                        <span className="text-xs text-text-secondary whitespace-nowrap ml-2">{timeAgo(comment.timestamp)}</span>
                    </div>
                    <p className="text-sm text-text-primary break-words">{comment.text}</p>
                </div>
                {!isReadOnly && <button onClick={() => onReply(comment.id)} className="text-xs text-primary hover:underline mt-1 ml-2">{t('modals.reply')}</button>}
                
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 space-y-3 pl-4 border-l-2 border-border">
                        {comment.replies.map(reply => (
                            <CommentComponent key={reply.id} comment={reply} onReply={onReply} isReadOnly={isReadOnly} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const TaskModal: React.FC = () => {
    const { state, actions, permissions } = useAppContext();
    const { selectedTask, users, lists, currentUser, allTasks, taskTemplates } = state;
    const { setSelectedTaskId, handleUpdateTask, handleDeleteTask, logActivity, addNotification, handleSaveTemplate } = actions;
    const { t, i18n } = useTranslation();
    const timeAgo = useTimeAgo();

    const [editedTask, setEditedTask] = useState<Task | null>(selectedTask);
    const debouncedTitle = useDebounce(editedTask?.title || '', 500);
    const [aiSuggestion, setAiSuggestion] = useState<{ priority?: Priority; assigneeId?: string } | null>(null);
    const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
    const [newSubtaskText, setNewSubtaskText] = useState('');
    const attachmentInputRef = useRef<HTMLInputElement>(null);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const canEdit = permissions.has(Permission.EDIT_TASKS);
    const canDelete = permissions.has(Permission.DELETE_TASKS);
    const canComment = permissions.has(Permission.COMMENT);

    useEffect(() => {
        setEditedTask(selectedTask);
    }, [selectedTask]);

    useEffect(() => {
        const fetchSuggestion = async () => {
            if (debouncedTitle && debouncedTitle.length > 5 && editedTask?.id === selectedTask?.id) {
                const suggestion = await suggestTaskDetails(debouncedTitle, users);
                if (suggestion.priority || suggestion.assigneeId) {
                    setAiSuggestion(suggestion);
                }
            }
        };
        fetchSuggestion();
    }, [debouncedTitle, users, editedTask?.id, selectedTask?.id]);


    if (!selectedTask || !editedTask) return null;

    const handleClose = () => {
        setSelectedTaskId(null);
    };

    const handleSaveAndClose = () => {
        if (editedTask) {
            setIsSaving(true);
            handleUpdateTask(editedTask);
            setTimeout(() => {
                setIsSaving(false);
                handleClose();
            }, 300);
        }
    };
    
    const handleInputChange = (field: keyof Task, value: any) => {
        setEditedTask(prev => prev ? { ...prev, [field]: value } : null);
    };
    
    const handleSubtaskChange = (id: string, completed: boolean, text: string) => {
        const newSubtasks = editedTask.subtasks.map(st => st.id === id ? { ...st, completed, text } : st);
        handleInputChange('subtasks', newSubtasks);
    };

    const handleAddSubtask = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && newSubtaskText.trim()) {
            const newSubtask: Subtask = { id: `st-${Date.now()}`, text: newSubtaskText, completed: false };
            handleInputChange('subtasks', [...editedTask.subtasks, newSubtask]);
            setNewSubtaskText('');
        }
    };

    const handleDeleteSubtask = (id: string) => {
        handleInputChange('subtasks', editedTask.subtasks.filter(st => st.id !== id));
    };

    const handleGenerateSubtasksClick = async () => {
        if (!canEdit) return;
        setIsGeneratingSubtasks(true);
        const subtaskTexts = await generateSubtasks(editedTask.title, editedTask.description);
        const newSubtasks: Subtask[] = subtaskTexts.map(text => ({ id: `st-${Date.now()}-${Math.random()}`, text, completed: false }));
        handleInputChange('subtasks', [...editedTask.subtasks, ...newSubtasks]);
        setIsGeneratingSubtasks(false);
    };
    
    const handleGenerateDescriptionClick = async () => {
        if (!canEdit) return;
        setIsGeneratingDescription(true);
        const description = await generateTaskDescription(editedTask.title);
        handleInputChange('description', description);
        setIsGeneratingDescription(false);
    };
    
    const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            files.forEach((file: File) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const newAttachment: Attachment = {
                        id: `att-${Date.now()}`,
                        name: file.name,
                        url: reader.result as string,
                        type: file.type,
                        size: file.size,
                    };
                    handleInputChange('attachments', [...editedTask.attachments, newAttachment]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleDeleteAttachment = (id: string) => {
        handleInputChange('attachments', editedTask.attachments.filter(att => att.id !== id));
    };
    
    const handleAddComment = (text: string, parentId?: string) => {
      if (!text.trim()) return;
      const newCommentData: Comment = {
        id: `c-${Date.now()}`,
        user: currentUser!,
        text,
        timestamp: new Date().toISOString(),
        parentId,
      };
      
      const mentionMatches = text.matchAll(/@(\w+)/g);
      for (const match of mentionMatches) {
        const username = match[1];
        if (username) {
            const user = users.find(u => u.name.toLowerCase() === username.toLowerCase());
            if(user && user.id !== currentUser!.id) {
              addNotification({
                userId: user.id,
                text: t('notifications.mentionMessage', {name: currentUser!.name, taskTitle: editedTask.title}),
                link: { type: 'task', taskId: editedTask.id, listId: editedTask.listId }
              });
            }
        }
      }

      handleInputChange('comments', [...editedTask.comments, newCommentData]);
      setNewComment('');
      setReplyingTo(null);
      setSuggestedReplies([]);
    };
    
    const handleGenerateReplies = async () => {
        setIsSuggesting(true);
        const replies = await generateSmartReplies(editedTask.comments, editedTask.title, currentUser!);
        setSuggestedReplies(replies);
        setIsSuggesting(false);
    };
    
    const project = lists.find(l => l.id === selectedTask.listId);
    
    const statusText: { [key in Status]: string } = {
        [Status.Todo]: t('common.todo'),
        [Status.InProgress]: t('common.inProgress'),
        [Status.Done]: t('common.done'),
    };
    const priorityText: { [key in Priority]: string } = {
        [Priority.Low]: t('common.low'),
        [Priority.Medium]: t('common.medium'),
        [Priority.High]: t('common.high'),
    };

    const commentTree = useMemo(() => {
        const comments = editedTask.comments || [];
        const commentMap: { [key: string]: CommentWithReplies } = {};
        const rootComments: CommentWithReplies[] = [];

        comments.forEach(comment => {
            commentMap[comment.id] = { ...comment, replies: [] };
        });

        comments.forEach(comment => {
            if (comment.parentId && commentMap[comment.parentId]) {
                commentMap[comment.parentId].replies.push(commentMap[comment.id]);
            } else {
                rootComments.push(commentMap[comment.id]);
            }
        });
        
        return rootComments.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    }, [editedTask.comments]);


    return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-end md:items-center z-40 backdrop-blur-sm animate-fadeIn"
      onClick={handleSaveAndClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-surface w-full h-full md:h-[90vh] md:max-w-4xl md:rounded-xl shadow-2xl flex flex-col animate-scaleIn overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-border flex justify-between items-center flex-shrink-0 bg-surface sticky top-0 z-10">
          <div className="text-sm text-text-secondary truncate max-w-[50%]">{project?.name}</div>
          <div className="flex items-center gap-2">
            {canEdit && (
                <button
                    onClick={() => {
                        const name = prompt(t('modals.templateNamePrompt'));
                        if (name) handleSaveTemplate(name, {
                            title: editedTask.title,
                            description: editedTask.description,
                            priority: editedTask.priority,
                            subtasks: editedTask.subtasks.map(st => ({...st, completed: false})),
                        });
                    }}
                    className="p-2 text-text-secondary hover:text-primary rounded-full hover:bg-primary/10 transition-colors hidden sm:block"
                    title={t('modals.saveAsTemplate')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                </button>
            )}
            {canDelete && (
                <button onClick={() => handleDeleteTask(editedTask.id)} className="p-2 text-text-secondary hover:text-priority-high rounded-full hover:bg-priority-high/10 transition-colors" title={t('modals.deleteTask')}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                    </svg>
                </button>
            )}
             <button onClick={handleSaveAndClose} className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-secondary-focus transition-colors" aria-label={t('common.close')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </header>
        
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
            <main className="lg:col-span-2 p-4 sm:p-6 overflow-y-auto space-y-6">
                {/* Title */}
                <input
                    type="text"
                    value={editedTask.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder={t('modals.taskTitlePlaceholder')}
                    disabled={!canEdit}
                    className="w-full bg-transparent text-2xl sm:text-3xl font-bold focus:outline-none break-words"
                />

                {/* AI Suggestion */}
                 {canEdit && aiSuggestion && (
                    <div className="bg-secondary/50 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between text-sm animate-fadeIn gap-2">
                        <div>
                            <span className="font-semibold text-primary">{t('modals.aiSuggestion')}</span>
                            <span className="text-text-secondary ml-2">
                               {t('modals.aiSuggestionContent', {
                                   priority: aiSuggestion.priority ? priorityText[aiSuggestion.priority] : '',
                                   assignee: users.find(u => u.id === aiSuggestion.assigneeId)?.name || ''
                               })}
                            </span>
                        </div>
                        <button onClick={() => { handleInputChange('priority', aiSuggestion.priority); handleInputChange('assigneeId', aiSuggestion.assigneeId); setAiSuggestion(null); }} className="px-3 py-1 bg-primary text-white rounded-md hover:bg-primary-focus text-xs font-semibold self-start sm:self-auto">{t('modals.apply')}</button>
                    </div>
                )}


                {/* Description */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-text-secondary">{t('modals.description')}</label>
                        {canEdit && (
                            <button onClick={handleGenerateDescriptionClick} disabled={isGeneratingDescription} className="flex items-center gap-1.5 px-2 py-1 text-xs bg-secondary rounded-md hover:bg-secondary-focus disabled:opacity-50">
                                {isGeneratingDescription ? <Spinner /> : '✨'}
                                {t('modals.generateWithAI')}
                            </button>
                        )}
                    </div>
                    <textarea
                        value={editedTask.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={6}
                        disabled={!canEdit}
                        placeholder={t('modals.addMoreDetail')}
                        className="w-full p-2 bg-secondary rounded-md border border-border focus:ring-primary focus:border-primary"
                    />
                </div>
                
                {/* Subtasks */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-text-secondary">{t('modals.subtasksCompleted', { completed: editedTask.subtasks.filter(s => s.completed).length, total: editedTask.subtasks.length })}</label>
                        {canEdit && (
                            <button onClick={handleGenerateSubtasksClick} disabled={isGeneratingSubtasks} className="flex items-center gap-1.5 px-2 py-1 text-xs bg-secondary rounded-md hover:bg-secondary-focus disabled:opacity-50">
                                {isGeneratingSubtasks ? <Spinner /> : '✨'}
                                {t('modals.generateWithAI')}
                            </button>
                        )}
                    </div>
                    <div className="space-y-2">
                        {editedTask.subtasks.map(st => (
                            <div key={st.id} className="flex items-start gap-2 group">
                                <input type="checkbox" checked={st.completed} disabled={!canEdit} onChange={e => handleSubtaskChange(st.id, e.target.checked, st.text)} className="w-4 h-4 mt-1 rounded text-primary bg-surface border-border focus:ring-primary flex-shrink-0" />
                                <input type="text" value={st.text} disabled={!canEdit} onChange={e => handleSubtaskChange(st.id, st.completed, e.target.value)} className={`flex-grow bg-transparent p-1 rounded min-w-0 ${st.completed ? 'line-through text-text-secondary' : ''}`} />
                                {canEdit && <button onClick={() => handleDeleteSubtask(st.id)} className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-text-secondary hover:text-priority-high p-1"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>}
                            </div>
                        ))}
                        {canEdit && <input type="text" value={newSubtaskText} onChange={e => setNewSubtaskText(e.target.value)} onKeyDown={handleAddSubtask} placeholder={t('modals.addSubtask')} className="w-full bg-secondary p-2 mt-2 rounded border border-transparent focus:border-border" />}
                    </div>
                </div>

                {/* Comments */}
                 <div className="pb-6">
                    <h3 className="text-sm font-semibold text-text-secondary mb-2">{t('modals.comments')}</h3>
                    {canComment && (
                        <div className="mb-4">
                             <textarea value={newComment} onChange={e => setNewComment(e.target.value)} rows={3} placeholder={replyingTo ? t('modals.reply') : t('modals.commentPlaceholder')} className="w-full p-2 bg-secondary rounded-md border border-border focus:ring-primary focus:border-primary" />
                             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-2">
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                  <button onClick={handleGenerateReplies} disabled={isSuggesting} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-secondary rounded-md hover:bg-secondary-focus disabled:opacity-50 whitespace-nowrap">
                                      {isSuggesting ? <Spinner /> : '✨'} {t('modals.suggestReplies')}
                                  </button>
                                  {replyingTo && <button onClick={() => setReplyingTo(null)} className="text-xs text-text-secondary hover:underline">{t('common.cancel')}</button>}
                                </div>
                                <button onClick={() => handleAddComment(newComment, replyingTo || undefined)} className="w-full sm:w-auto px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-focus text-sm">{replyingTo ? t('modals.reply') : t('modals.comment')}</button>
                             </div>
                             {suggestedReplies.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {suggestedReplies.map((reply, i) => (
                                        <button key={i} onClick={() => handleAddComment(reply)} className="px-2 py-1 bg-secondary text-text-secondary text-xs rounded-full hover:bg-secondary-focus text-left">{reply}</button>
                                    ))}
                                </div>
                             )}
                        </div>
                    )}
                    <div className="space-y-4">
                       {commentTree.map(comment => (
                           <CommentComponent key={comment.id} comment={comment} onReply={setReplyingTo} isReadOnly={!canComment} />
                       ))}
                    </div>
                 </div>

            </main>
            <aside className="lg:col-span-1 p-4 sm:p-6 border-t lg:border-t-0 lg:border-l border-border overflow-y-auto space-y-5 bg-surface/50 lg:bg-transparent">
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <label className="font-semibold text-text-secondary block">{t('modals.status')}</label>
                        <select value={editedTask.status} disabled={!canEdit} onChange={e => handleInputChange('status', e.target.value)} className="w-full mt-1 p-2 bg-secondary rounded-md border border-transparent hover:border-border focus:ring-primary focus:border-primary">
                            {Object.values(Status).map(s => <option key={s} value={s}>{statusText[s]}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="font-semibold text-text-secondary block">{t('modals.priority')}</label>
                        <select value={editedTask.priority} disabled={!canEdit} onChange={e => handleInputChange('priority', e.target.value)} className="w-full mt-1 p-2 bg-secondary rounded-md border border-transparent hover:border-border focus:ring-primary focus:border-primary">
                             {Object.values(Priority).map(p => <option key={p} value={p}>{priorityText[p]}</option>)}
                        </select>
                    </div>
                 </div>
                 <div>
                    <label className="font-semibold text-text-secondary block text-sm">{t('modals.assignee')}</label>
                    <select value={editedTask.assigneeId || ''} disabled={!canEdit} onChange={e => handleInputChange('assigneeId', e.target.value || null)} className="w-full mt-1 p-2 bg-secondary rounded-md border border-transparent hover:border-border focus:ring-primary focus:border-primary">
                        <option value="">{t('common.unassigned')}</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="font-semibold text-text-secondary block text-sm">{t('modals.dueDate')}</label>
                    <input type="date" value={editedTask.dueDate} disabled={!canEdit} onChange={e => handleInputChange('dueDate', e.target.value)} className="w-full mt-1 p-2 bg-secondary rounded-md border border-transparent hover:border-border focus:ring-primary focus:border-primary" />
                 </div>
                 {/* Attachments */}
                 <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-text-secondary">{t('modals.attachments')}</label>
                         {canEdit && (
                            <button onClick={() => attachmentInputRef.current?.click()} className="text-xs text-primary hover:underline">{t('modals.attachFile')}</button>
                         )}
                    </div>
                    <input type="file" ref={attachmentInputRef} onChange={handleFileAttach} className="hidden" multiple disabled={!canEdit} />
                    <div className="space-y-2">
                        {editedTask.attachments.map(att => (
                            <div key={att.id} className="bg-secondary p-2 rounded-md flex items-center justify-between text-sm group">
                                <a href={att.url} download={att.name} className="truncate hover:underline flex-grow mr-2">{att.name}</a>
                                {canEdit && <button onClick={() => handleDeleteAttachment(att.id)} className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-text-secondary hover:text-priority-high"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>}
                            </div>
                        ))}
                    </div>
                 </div>
                 {/* Dependencies */}
                 <div>
                    <h3 className="text-sm font-semibold text-text-secondary mb-2">{t('modals.dependencies')}</h3>
                    <div className="p-3 bg-secondary rounded-lg space-y-2">
                        <div>
                            <div className="flex justify-between items-center text-xs mb-1">
                                <label className="font-semibold text-text-secondary">{t('modals.dependsOn')}</label>
                                {/* <button className="text-primary hover:underline">+ Add</button> */}
                            </div>
                            {editedTask.dependsOn.length > 0 ? (
                                <ul className="text-xs list-disc pl-4">
                                    {editedTask.dependsOn.map(depId => <li key={depId}>{allTasks.find(t => t.id === depId)?.title}</li>)}
                                </ul>
                            ) : <p className="text-xs text-text-secondary italic">{t('modals.noDependencies')}</p>}
                        </div>
                        <div className="pt-2 border-t border-border">
                            <label className="font-semibold text-text-secondary text-xs">{t('modals.blocking')}</label>
                            {allTasks.filter(t => t.dependsOn?.includes(editedTask.id)).length > 0 ? (
                                <ul className="text-xs list-disc pl-4">
                                    {allTasks.filter(t => t.dependsOn?.includes(editedTask.id)).map(t => <li key={t.id}>{t.title}</li>)}
                                </ul>
                            ) : <p className="text-xs text-text-secondary italic">{t('modals.noBlocking')}</p>}
                        </div>
                    </div>
                 </div>
                 <div className="text-xs text-text-secondary pt-2">
                    {t('modals.createdAt')} {new Date(editedTask.createdAt).toLocaleString(i18n.language)}
                 </div>
            </aside>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;