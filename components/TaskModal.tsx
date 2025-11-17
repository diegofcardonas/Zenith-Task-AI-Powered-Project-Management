import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Task, User, Status, Priority, Subtask, Role, Comment, Attachment, List } from '../types';
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

const renderMarkdown = (text: string) => {
    if (!text) return { __html: '' };
    let html = text
      .replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-2 mb-1">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-3 mb-1">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-secondary px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/\n/g, '<br />');
    
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul class="list-disc ml-5">$1</ul>');
    return { __html: html };
};

const TaskModal: React.FC = () => {
  const { state, actions } = useAppContext();
  const { selectedTask: task, users, allLists, currentUser, allTasks } = state;
  const { setSelectedTaskId, handleUpdateTask, handleDeleteTask, setEditingUserId, addNotification, handleSaveTemplate, logActivity } = actions;
  const { t, i18n } = useTranslation();
  const timeAgo = useTimeAgo();
    
  if (!task || !currentUser) return null;

  const [editedTask, setEditedTask] = useState<Task>(task);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isDependencyPickerOpen, setIsDependencyPickerOpen] = useState(false);
  const [isMentioning, setIsMentioning] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [suggestedDetails, setSuggestedDetails] = useState<{ priority?: Priority; assigneeId?: string }>({});
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [descriptionView, setDescriptionView] = useState<'write' | 'preview'>('write');
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const [isGeneratingReplies, setIsGeneratingReplies] = useState(false);
  
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const dependencyPickerRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  
  const debouncedTitle = useDebounce(editedTask.title, 500);

  const isReadOnly = currentUser.role === Role.Guest;

  const statusText: { [key in Status]: string } = {
    [Status.Todo]: t('common.todo'),
    [Status.InProgress]: t('common.inProgress'),
    [Status.Done]: t('common.done'),
  };

  useEffect(() => {
    setEditedTask(task);
  }, [task]);
  
  useEffect(() => {
    if (!editingCommentId && !replyingTo) {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [editedTask.comments, editingCommentId, replyingTo]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dependencyPickerRef.current && !dependencyPickerRef.current.contains(event.target as Node)) {
            setIsDependencyPickerOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  useEffect(() => {
    const getSuggestions = async () => {
        if (debouncedTitle && debouncedTitle !== task.title) {
            setIsSuggesting(true);
            const suggestions = await suggestTaskDetails(debouncedTitle, users);
            setSuggestedDetails(suggestions);
            setIsSuggesting(false);
        } else {
            setSuggestedDetails({});
        }
    };
    getSuggestions();
  }, [debouncedTitle, users, task.title]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'reminder') {
        const reminderValue = value === 'No reminder' ? null : value;
        setEditedTask(prev => ({ ...prev, reminder: reminderValue }));
    } else {
        setEditedTask(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSaveChanges = () => {
    if (editedTask.listId !== task.listId) {
        const oldListName = allLists.find(l => l.id === task.listId)?.name || 'una lista';
        const newListName = allLists.find(l => l.id === editedTask.listId)?.name || 'otra lista';
        logActivity(task.id, `movió la tarea de "${oldListName}" a "${newListName}"`, currentUser);
    }
    handleUpdateTask(editedTask);
    setSelectedTaskId(null);
  };

  const handleDelete = () => {
    handleDeleteTask(task.id);
  };

  const handleGenerateSubtasks = async () => {
    setIsGeneratingSubtasks(true);
    const subtaskTexts = await generateSubtasks(editedTask.title, editedTask.description);
    const newSubtasks: Subtask[] = subtaskTexts.map(text => ({
      id: `st-${Date.now()}-${Math.random()}`,
      text,
      completed: false
    }));
    setEditedTask(prev => ({...prev, subtasks: [...prev.subtasks, ...newSubtasks]}));
    setIsGeneratingSubtasks(false);
  };
  
  const handleGenerateDescription = async () => {
    if(!editedTask.title) return;
    setIsGeneratingDesc(true);
    const description = await generateTaskDescription(editedTask.title);
    setEditedTask(prev => ({ ...prev, description }));
    setIsGeneratingDesc(false);
  };
  
  const handleGenerateTitleAndDescription = async () => {
    const userPrompt = window.prompt(t('aiChat.promptForTaskGeneration'));
    if (!userPrompt || userPrompt.trim() === '') return;

    setIsGeneratingTitle(true);
    try {
        const result = await generateTaskTitleAndDescription(userPrompt);
        if (result.title && result.description) {
            setEditedTask(prev => ({ ...prev, title: result.title, description: result.description }));
        }
    } catch (error) {
        console.error("Failed to generate task details:", error);
    } finally {
        setIsGeneratingTitle(false);
    }
  };

  const handleSubtaskToggle = (subtaskId: string) => {
    setEditedTask(prev => ({
        ...prev,
        subtasks: prev.subtasks.map(st => st.id === subtaskId ? {...st, completed: !st.completed} : st)
    }));
  };

  const handleAddSubtask = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && newSubtaskText.trim()) {
          const newSubtask: Subtask = {
              id: `st-${Date.now()}`,
              text: newSubtaskText.trim(),
              completed: false,
          };
          setEditedTask(prev => ({...prev, subtasks: [...prev.subtasks, newSubtask]}));
          setNewSubtaskText('');
      }
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    setEditedTask(prev => ({
        ...prev,
        subtasks: prev.subtasks.filter(st => st.id !== subtaskId)
    }));
  };
  
  const handleAddComment = (text: string, parentId?: string) => {
    if (text.trim()) {
        const newComment: Comment = {
            id: `c-${Date.now()}`,
            user: currentUser,
            text: text.trim(),
            timestamp: new Date().toISOString(),
            parentId,
        };
        
        const mentions: string[] = text.match(/@\[(.*?)\]\((.*?)\)/g) || [];
        mentions.forEach(mention => {
            const userId = mention.match(/\((.*?)\)/)?.[1];
            if (userId && userId !== currentUser.id) {
                addNotification({
                    userId,
                    text: t('notifications.mentionMessage', { name: currentUser.name, taskTitle: editedTask.title }),
                    link: { type: 'task', taskId: editedTask.id, listId: editedTask.listId }
                });
            }
        });
        setEditedTask(prev => ({...prev, comments: [...prev.comments, newComment]}));
        setNewCommentText('');
        setReplyingTo(null);
        setSuggestedReplies([]);
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNewCommentText(text);

    const mentionMatch = text.match(/@(\w*)$/);
    if (mentionMatch) {
        setIsMentioning(true);
        setMentionQuery(mentionMatch[1]);
    } else {
        setIsMentioning(false);
    }
  };

  const handleMentionSelect = (user: User) => {
    const text = newCommentText;
    const newText = text.replace(/@(\w*)$/, `@\[${user.name}\](${user.id}) `);
    setNewCommentText(newText);
    setIsMentioning(false);
    commentInputRef.current?.focus();
  };

    const handleEditComment = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditingCommentText(comment.text);
    };

    const handleSaveEditedComment = () => {
        if (!editingCommentId) return;
        setEditedTask(prev => ({
            ...prev,
            comments: prev.comments.map(c => c.id === editingCommentId ? {...c, text: editingCommentText } : c)
        }));
        setEditingCommentId(null);
        setEditingCommentText('');
    };

    const handleCancelEditComment = () => {
        setEditingCommentId(null);
        setEditingCommentText('');
    };

    const handleDeleteComment = (commentId: string) => {
        if (window.confirm(t('modals.confirmDeleteComment'))) {
            setEditedTask(prev => ({
                ...prev,
                comments: prev.comments.filter(c => c.id !== commentId)
            }));
        }
    };

    const { commentTree } = useMemo(() => {
        const comments = editedTask.comments || [];
        const commentMap = new Map<string, CommentWithReplies>();
        const tree: CommentWithReplies[] = [];

        comments.forEach(comment => {
            commentMap.set(comment.id, { ...comment, replies: [] });
        });

        comments.forEach(comment => {
            if (comment.parentId && commentMap.has(comment.parentId)) {
                commentMap.get(comment.parentId)!.replies.push(commentMap.get(comment.id)!);
            } else {
                tree.push(commentMap.get(comment.id)!);
            }
        });
        
        return { commentTree: tree };
    }, [editedTask.comments]);


  const { isBlocked, dependencies, blockingTasks } = useMemo(() => {
    const dependencies = (editedTask.dependsOn || []).map(id => allTasks.find(t => t.id === id)).filter(Boolean) as Task[];
    const isBlocked = dependencies.some(t => t.status !== Status.Done);
    const blockingTasks = allTasks.filter(t => t.dependsOn?.includes(editedTask.id));
    return { isBlocked, dependencies, blockingTasks };
  }, [editedTask, allTasks]);

  const isCircular = (targetId: string, currentTask: Task): boolean => {
    if ((currentTask.dependsOn || []).includes(targetId)) return true;
    for (const depId of (currentTask.dependsOn || [])) {
        const nextTask = allTasks.find(t => t.id === depId);
        if (nextTask && isCircular(targetId, nextTask)) return true;
    }
    return false;
  };

  const availableTasksForDependency = useMemo(() => {
    return allTasks.filter(potentialDep => {
        if (potentialDep.id === editedTask.id) return false;
        if ((potentialDep.dependsOn || []).includes(editedTask.id)) return false;
        if ((editedTask.dependsOn || []).includes(potentialDep.id)) return false;
        if (isCircular(editedTask.id, potentialDep)) return false;
        return true;
    });
  }, [allTasks, editedTask]);
  
  const handleAddDependency = (dependencyId: string) => {
    setEditedTask(prev => ({ ...prev, dependsOn: [...(prev.dependsOn || []), dependencyId] }));
    setIsDependencyPickerOpen(false);
  };

  const handleRemoveDependency = (dependencyId: string) => {
    setEditedTask(prev => ({ ...prev, dependsOn: (prev.dependsOn || []).filter(id => id !== dependencyId) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        Array.from(e.target.files).forEach((file: File) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const newAttachment: Attachment = {
                    id: `att-${Date.now()}-${Math.random()}`,
                    name: file.name,
                    url: event.target?.result as string,
                    type: file.type,
                    size: file.size,
                };
                setEditedTask(prev => ({ ...prev, attachments: [...(prev.attachments || []), newAttachment] }));
            };
            reader.readAsDataURL(file);
        });
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setEditedTask(prev => ({ ...prev, attachments: (prev.attachments || []).filter(att => att.id !== id) }));
  };

  const handleSaveTemplateClick = () => {
    const name = window.prompt(t('modals.templateNamePrompt'));
    if (name) {
        const { id, createdAt, comments, attachments, ...taskData } = editedTask;
        handleSaveTemplate(name, taskData);
    }
  };
  
  const applySuggestion = (suggestion: Partial<Task>) => {
    setEditedTask(prev => ({ ...prev, ...suggestion }));
    setSuggestedDetails({});
  };

  const renderedComment = (text: string) => {
    const processedText = text.replace(/@\[(.*?)\]\((.*?)\)/g, '**@$1**');
    return renderMarkdown(processedText);
  };
  
  const handleGetSmartReplies = async () => {
    if(isGeneratingReplies || editedTask.comments.length === 0) return;
    setIsGeneratingReplies(true);
    const replies = await generateSmartReplies(editedTask.comments, editedTask.title, currentUser);
    setSuggestedReplies(replies);
    setIsGeneratingReplies(false);
  }
  
  const CommentComponent: React.FC<{comment: CommentWithReplies}> = ({ comment }) => {
    const isEditing = editingCommentId === comment.id;
    const isReplying = replyingTo === comment.id;

    return (
        <div className="flex items-start gap-3 group">
            <button onClick={() => setEditingUserId(comment.user.id)} className="flex-shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary"><AvatarWithStatus user={comment.user} className="w-8 h-8" /></button>
            <div className="flex-1">
                <div className="bg-secondary p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-text-primary">{comment.user.name}</span>
                        <span className="text-xs text-text-secondary">{timeAgo(comment.timestamp)}</span>
                    </div>
                    {isEditing ? (
                        <div className="mt-2">
                            <textarea value={editingCommentText} onChange={(e) => setEditingCommentText(e.target.value)} className="w-full p-2 bg-surface rounded-md border border-border" rows={2}/>
                            <div className="flex items-center gap-2 mt-1">
                                <button onClick={handleSaveEditedComment} className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary-focus">{t('common.save')}</button>
                                <button onClick={handleCancelEditComment} className="px-2 py-1 text-xs bg-secondary-focus text-text-secondary rounded hover:bg-border">{t('common.cancel')}</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-start">
                             <div className="text-sm text-text-primary mt-1 prose prose-invert max-w-none" dangerouslySetInnerHTML={renderedComment(comment.text)}></div>
                             {!isReadOnly && (
                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="p-1 text-text-secondary hover:text-primary"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg></button>
                                    {currentUser.id === comment.user.id && <button onClick={() => handleEditComment(comment)} className="p-1 text-text-secondary hover:text-blue-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg></button>}
                                    {(currentUser.id === comment.user.id || currentUser.role === Role.Admin) && <button onClick={() => handleDeleteComment(comment.id)} className="p-1 text-text-secondary hover:text-red-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>}
                                </div>
                             )}
                        </div>
                    )}
                </div>
                 {isReplying && <CommentInput parentId={comment.id} onAddComment={handleAddComment} />}
                 {comment.replies.length > 0 && (
                    <div className="mt-3 pl-6 border-l-2 border-border/50 space-y-3">
                        {comment.replies.map(reply => <CommentComponent key={reply.id} comment={reply} />)}
                    </div>
                 )}
            </div>
        </div>
    );
  }

  const CommentInput: React.FC<{ parentId?: string, onAddComment: (text: string, parentId?: string) => void }> = ({ parentId, onAddComment }) => {
    return (
        <div className="flex items-start gap-3 mt-4">
            <AvatarWithStatus user={currentUser} className="w-8 h-8 mt-1 flex-shrink-0" />
            <div className="flex-1 relative">
                <textarea 
                    value={newCommentText} 
                    onChange={handleCommentChange}
                    onFocus={handleGetSmartReplies}
                    ref={commentInputRef}
                    placeholder={t('modals.commentPlaceholder')} 
                    className="w-full p-2 bg-secondary rounded-md border border-border focus:ring-primary focus:border-primary" 
                    rows={2}
                    autoFocus={!!parentId}
                />
                 { (suggestedReplies.length > 0 || isGeneratingReplies) &&
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        {isGeneratingReplies ? (
                           <button disabled className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full flex items-center gap-1"><Spinner /> {t('modals.suggesting')}</button>
                        ) : (
                             <button onClick={handleGetSmartReplies} className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full hover:bg-primary/30 flex items-center gap-1">{t('modals.suggestReplies')}</button>
                        )}
                        {suggestedReplies.map((reply, i) => (
                             <button key={i} onClick={() => setNewCommentText(reply)} className="px-2 py-1 text-xs bg-secondary-focus text-text-secondary rounded-full hover:bg-border">
                                 {reply}
                             </button>
                        ))}
                    </div>
                }
                <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => onAddComment(newCommentText, parentId)} className="px-4 py-1.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-focus transition-colors">
                        {parentId ? t('modals.reply') : t('modals.comment')}
                    </button>
                    {parentId && <button onClick={() => setReplyingTo(null)} className="px-4 py-1.5 bg-secondary-focus text-text-secondary text-sm font-semibold rounded-lg hover:bg-border">{t('common.cancel')}</button>}
                </div>
            </div>
        </div>
    );
  }


  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm animate-fadeIn" role="dialog" aria-modal="true">
      <div className="bg-surface rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-scaleIn" onClick={e => e.stopPropagation()}>
        <header className="p-6 border-b border-border flex justify-between items-start gap-4">
            <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2">
                    <input type="text" name="title" value={editedTask.title} onChange={handleInputChange} className="text-2xl font-bold bg-transparent focus:outline-none w-full text-text-primary disabled:text-text-secondary truncate" placeholder={t('modals.taskTitlePlaceholder')} readOnly={isReadOnly}/>
                    {!isReadOnly && (
                        <button onClick={handleGenerateTitleAndDescription} disabled={isGeneratingTitle} className="p-2 text-primary rounded-full hover:bg-primary/20 disabled:opacity-50 disabled:cursor-wait flex-shrink-0" title={t('modals.generateTitleDescWithAI')}>
                            {isGeneratingTitle ? <Spinner /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>}
                        </button>
                    )}
                </div>
                {isSuggesting && <div className="text-xs text-text-secondary italic mt-1">{t('modals.searchingForSuggestions')}</div>}
                {(suggestedDetails.priority || suggestedDetails.assigneeId) && (
                    <div className="mt-2 p-2 bg-primary/10 rounded-md flex items-center justify-between gap-2 text-sm">
                        <span>{t('modals.aiSuggestion')} {suggestedDetails.priority && `Priority ${suggestedDetails.priority}`} {suggestedDetails.assigneeId && `Assign to ${users.find(u => u.id === suggestedDetails.assigneeId)?.name}`}</span>
                        <button onClick={() => applySuggestion(suggestedDetails)} className="px-2 py-0.5 text-xs bg-primary text-white rounded-full hover:bg-primary-focus">{t('modals.apply')}</button>
                    </div>
                )}
            </div>
          <button onClick={() => setSelectedTaskId(null)} className="text-gray-400 hover:text-white flex-shrink-0" aria-label={t('common.close')}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </header>
        <main className="p-6 overflow-y-auto flex-grow grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center border-b border-border">
                             <button onClick={() => setDescriptionView('write')} className={`px-3 py-1 text-sm font-semibold ${descriptionView === 'write' ? 'border-b-2 border-primary text-text-primary' : 'text-text-secondary'}`}>{t('modals.write')}</button>
                             <button onClick={() => setDescriptionView('preview')} className={`px-3 py-1 text-sm font-semibold ${descriptionView === 'preview' ? 'border-b-2 border-primary text-text-primary' : 'text-text-secondary'}`}>{t('modals.preview')}</button>
                        </div>
                        {!isReadOnly && <button onClick={handleGenerateDescription} disabled={isGeneratingDesc || !editedTask.title} className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">{isGeneratingDesc ? <Spinner /> : '✨'}{isGeneratingDesc ? t('modals.generating') : t('modals.generateWithAI')}</button>}
                    </div>
                    {descriptionView === 'write' ? (
                        <textarea id="description" name="description" value={editedTask.description} onChange={handleInputChange} className="w-full p-2 bg-secondary rounded-md border border-border focus:ring-primary focus:border-primary min-h-[120px]" placeholder={t('modals.addMoreDetail')} readOnly={isReadOnly} />
                    ) : (
                        <div className="w-full p-2 bg-secondary rounded-md border border-border min-h-[120px] prose prose-invert max-w-none text-text-primary" dangerouslySetInnerHTML={renderMarkdown(editedTask.description)}></div>
                    )}
                </div>
                
                 <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-text-secondary">{t('modals.attachments')}</label>
                        {!isReadOnly && (
                            <button onClick={() => attachmentInputRef.current?.click()} className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full hover:bg-primary/30 flex items-center gap-1">
                                {t('modals.attachFile')}
                            </button>
                        )}
                        <input type="file" multiple ref={attachmentInputRef} onChange={handleFileChange} className="hidden" />
                    </div>
                    <div className="space-y-2">
                        {(editedTask.attachments || []).map(att => (
                            <div key={att.id} className="flex items-center justify-between bg-secondary p-2 rounded-md text-sm">
                                <a href={att.url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">{att.name}</a>
                                {!isReadOnly && <button onClick={() => handleRemoveAttachment(att.id)} className="p-1 text-text-secondary hover:text-red-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-text-secondary">{t('modals.subtasksCompleted', { completed: editedTask.subtasks.filter(st => st.completed).length, total: editedTask.subtasks.length })}</label>
                         {!isReadOnly && <button onClick={handleGenerateSubtasks} disabled={isGeneratingSubtasks || !editedTask.title} className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">{isGeneratingSubtasks ? <Spinner /> : '✨'}{isGeneratingSubtasks ? t('modals.generating') : t('modals.generateWithAI')}</button>}
                    </div>
                    <div className="mt-2 space-y-2">
                        {editedTask.subtasks.map(subtask => (<div key={subtask.id} className="flex items-center gap-2 bg-secondary p-2 rounded-md group"><input type="checkbox" checked={subtask.completed} onChange={() => handleSubtaskToggle(subtask.id)} disabled={isReadOnly} className="w-4 h-4 rounded text-primary bg-surface border-border focus:ring-primary" /><span className={`flex-grow ${subtask.completed ? 'line-through text-text-secondary' : ''}`}>{subtask.text}</span>{!isReadOnly && <button onClick={() => handleDeleteSubtask(subtask.id)} className="p-1 text-text-secondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" title={t('tooltips.deleteSubtask')}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>}</div>))}
                        {!isReadOnly && <input type="text" value={newSubtaskText} onChange={(e) => setNewSubtaskText(e.target.value)} onKeyDown={handleAddSubtask} placeholder={t('modals.addSubtask')} className="w-full bg-transparent p-2 focus:outline-none placeholder-text-secondary" />}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-text-secondary mb-2">{t('modals.dependencies')}</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-xs font-semibold text-text-secondary uppercase">{t('modals.dependsOn')}</label>
                                {!isReadOnly && (<div className="relative" ref={dependencyPickerRef}><button onClick={() => setIsDependencyPickerOpen(p => !p)} className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full hover:bg-primary/30 flex items-center gap-1">{t('common.add')}</button>{isDependencyPickerOpen && (<div className="absolute right-0 mt-2 w-72 bg-secondary rounded-lg shadow-lg border border-border z-10 p-2 max-h-60 overflow-y-auto">{availableTasksForDependency.length > 0 ? availableTasksForDependency.map(depTask => (<button key={depTask.id} onClick={() => handleAddDependency(depTask.id)} className="w-full text-left p-2 hover:bg-secondary-focus rounded-md text-sm truncate">{depTask.title}</button>)) : <div className="p-2 text-sm text-text-secondary text-center italic">{t('modals.noAvailableTasks')}</div>}</div>)}</div>)}
                            </div>
                            <div className="space-y-2">{dependencies.map(dep => (<div key={dep.id} className="flex items-center justify-between bg-secondary p-2 rounded-md text-sm"><div className="flex items-center gap-2 truncate"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${dep.status === Status.Done ? 'bg-status-done/20 text-status-done' : 'bg-status-inprogress/20 text-status-inprogress'}`}>{dep.status}</span><span className="truncate">{dep.title}</span></div>{!isReadOnly && (<button onClick={() => handleRemoveDependency(dep.id)} className="p-1 text-text-secondary hover:text-red-400 rounded-full flex-shrink-0"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>)}</div>))}{dependencies.length === 0 && <p className="text-xs text-text-secondary italic px-2">{t('modals.noDependencies')}</p>}</div>
                        </div>
                        <div><label className="text-xs font-semibold text-text-secondary uppercase">{t('modals.blocking')}</label><div className="space-y-2 mt-1">{blockingTasks.map(dep => (<div key={dep.id} className="flex items-center justify-between bg-secondary p-2 rounded-md text-sm"><div className="flex items-center gap-2 truncate"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${dep.status === Status.Done ? 'bg-status-done/20 text-status-done' : 'bg-status-inprogress/20 text-status-inprogress'}`}>{dep.status}</span><span className="truncate">{dep.title}</span></div></div>))}{blockingTasks.length === 0 && <p className="text-xs text-text-secondary italic px-2">{t('modals.noBlocking')}</p>}</div></div>
                    </div>
                </div>

                 <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-text-secondary">{t('modals.comments')}</h3>
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2">{commentTree.map(comment => (<CommentComponent key={comment.id} comment={comment} />))}<div ref={commentsEndRef} /></div>
                    {!isReadOnly && !replyingTo && <CommentInput onAddComment={handleAddComment} />}
                </div>
            </div>

            <div className="md:col-span-1 space-y-4">
                <div title={isBlocked ? "Las dependencias deben completarse primero" : ""}><label htmlFor="status" className="text-sm font-semibold text-text-secondary">{t('modals.status')}</label><select id="status" name="status" value={editedTask.status} onChange={handleInputChange} disabled={isReadOnly || isBlocked} className="w-full mt-1 p-2 bg-secondary rounded-md border border-border focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed">{Object.values(Status).map(s => <option key={s} value={s}>{statusText[s]}</option>)}</select></div>
                <div><label htmlFor="listId" className="text-sm font-semibold text-text-secondary">{t('sidebar.projects')}</label><select id="listId" name="listId" value={editedTask.listId} onChange={handleInputChange} disabled={isReadOnly} className="w-full mt-1 p-2 bg-secondary rounded-md border border-border focus:ring-primary focus:border-primary">{allLists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
                <div><label htmlFor="assigneeId" className="text-sm font-semibold text-text-secondary">{t('modals.assignee')}</label><select id="assigneeId" name="assigneeId" value={editedTask.assigneeId || ''} onChange={handleInputChange} disabled={isReadOnly} className="w-full mt-1 p-2 bg-secondary rounded-md border border-border focus:ring-primary focus:border-primary"><option value="">{t('common.unassigned')}</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
                <div><label htmlFor="priority" className="text-sm font-semibold text-text-secondary">{t('modals.priority')}</label><select id="priority" name="priority" value={editedTask.priority} onChange={handleInputChange} disabled={isReadOnly} className="w-full mt-1 p-2 bg-secondary rounded-md border border-border focus:ring-primary focus:border-primary">{Object.values(Priority).map(p => <option key={p} value={p}>{t(`common.${p.toLowerCase()}`)}</option>)}</select></div>
                <div><label htmlFor="dueDate" className="text-sm font-semibold text-text-secondary">{t('modals.dueDate')}</label><input type="date" id="dueDate" name="dueDate" value={editedTask.dueDate} onChange={handleInputChange} readOnly={isReadOnly} className="w-full mt-1 p-2 bg-secondary rounded-md border border-border focus:ring-primary focus:border-primary" /></div>
                <div><label htmlFor="reminder" className="text-sm font-semibold text-text-secondary">{t('modals.reminder')}</label><select id="reminder" name="reminder" value={editedTask.reminder || 'No reminder'} onChange={handleInputChange} disabled={isReadOnly} className="w-full mt-1 p-2 bg-secondary rounded-md border border-border focus:ring-primary focus:border-primary"><option value="No reminder">{t('modals.noReminder')}</option><option value="En la fecha de vencimiento">{t('modals.onDueDate')}</option><option value="1 día antes">{t('modals.oneDayBefore')}</option><option value="2 días antes">{t('modals.twoDaysBefore')}</option><option value="1 semana antes">{t('modals.oneWeekBefore')}</option></select></div>
                {/* Fix: Complete the toLocaleString options object and add closing tags and export */}
                {editedTask.createdAt && (<div><label className="text-sm font-semibold text-text-secondary">{t('modals.createdAt')}</label><p className="mt-1 p-2 text-text-secondary bg-secondary rounded-md border border-border text-sm">{new Date(editedTask.createdAt).toLocaleString(i18n.language, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p></div>)}
            </div>
        </main>
        <footer className="p-6 border-t border-border flex justify-between items-center">
            <div>
                {!isReadOnly && <button onClick={handleSaveTemplateClick} className="px-3 py-1.5 text-xs bg-secondary-focus text-text-secondary rounded-lg hover:bg-border">{t('modals.saveAsTemplate')}</button>}
            </div>
            <div className="flex gap-4">
                {!isReadOnly && <button onClick={handleDelete} className="px-4 py-2 bg-red-500/10 text-red-400 font-semibold rounded-lg hover:bg-red-500/20">{t('modals.deleteTask')}</button>}
                {!isReadOnly && <button onClick={handleSaveChanges} className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-focus">{t('modals.saveAndClose')}</button>}
            </div>
        </footer>
      </div>
    </div>
  );
};

export default TaskModal;
