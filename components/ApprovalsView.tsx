
import React, { useMemo } from 'react';
import { Task, User, Role } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { useTranslation } from '../i18n';
import AvatarWithStatus from './AvatarWithStatus';

const ApprovalCard: React.FC<{ 
    task: Task; 
    assignee?: User; 
    type: 'review' | 'request'; 
    onApprove?: (id: string) => void; 
    onReject?: (id: string) => void;
    onSelect: (task: Task) => void;
}> = ({ task, assignee, type, onApprove, onReject, onSelect }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-surface border border-white/5 rounded-lg p-4 hover:border-primary/30 transition-colors shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded text-text-secondary">{task.issueKey}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                        task.approvalStatus === 'approved' ? 'bg-green-500/20 text-green-500' :
                        task.approvalStatus === 'rejected' ? 'bg-red-500/20 text-red-500' :
                        'bg-amber-500/20 text-amber-500'
                    }`}>
                        {t(`approvals.${task.approvalStatus}`)}
                    </span>
                </div>
                <button onClick={() => onSelect(task)} className="text-text-secondary hover:text-primary text-xs underline">
                    {t('common.view')}
                </button>
            </div>
            
            <div>
                <h4 className="text-sm font-semibold text-text-primary line-clamp-2 cursor-pointer hover:text-primary" onClick={() => onSelect(task)}>{task.title}</h4>
                {assignee && (
                    <div className="flex items-center gap-2 mt-2">
                        <AvatarWithStatus user={assignee} className="w-5 h-5" />
                        <span className="text-xs text-text-secondary">{assignee.name}</span>
                    </div>
                )}
            </div>

            {type === 'review' && task.approvalStatus === 'pending' && (
                <div className="flex gap-2 mt-2 pt-3 border-t border-white/5">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onApprove?.(task.id); }}
                        className="flex-1 bg-green-500/10 hover:bg-green-500/20 text-green-500 text-xs font-bold py-1.5 rounded transition-colors border border-green-500/20"
                    >
                        {t('approvals.approve')}
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onReject?.(task.id); }}
                        className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold py-1.5 rounded transition-colors border border-red-500/20"
                    >
                        {t('approvals.reject')}
                    </button>
                </div>
            )}
        </div>
    );
};

const ApprovalsView: React.FC = () => {
    const { t } = useTranslation();
    const { state, actions } = useAppContext();
    const { tasks, currentUser, users } = state;
    const { handleApproveTask, handleRejectTask, setSelectedTaskId } = actions;

    if (!currentUser) return null;

    const canManage = currentUser.role === Role.Admin || currentUser.role === Role.Manager;

    const { needsApproval, myRequests } = useMemo(() => {
        // Needs Approval: Tasks pending approval (Visible to Managers/Admins)
        // In a real app, this might be filtered by team or specific assignee manager
        const pending = tasks.filter(t => t.approvalStatus === 'pending');
        
        // My Requests: Tasks I am assigned to that have an approval status
        const requests = tasks.filter(t => t.assigneeId === currentUser.id && t.approvalStatus !== 'none');

        return {
            needsApproval: pending,
            myRequests: requests
        };
    }, [tasks, currentUser]);

    return (
        <div className="flex flex-col h-full p-4 md:p-8 overflow-y-auto bg-[#0f172a]">
            <div className="mb-8 animate-fadeIn">
                <h1 className="text-3xl font-bold text-text-primary mb-2">{t('approvals.title')}</h1>
                <p className="text-text-secondary text-lg">{t('approvals.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Managers Column: Needs Approval */}
                {canManage && (
                    <div className="flex flex-col gap-4 animate-slideUpFade">
                        <div className="flex items-center justify-between bg-surface/50 p-4 rounded-xl border border-white/5">
                            <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
                                {t('approvals.needsApproval')}
                            </h3>
                            <span className="bg-secondary text-xs font-bold px-2 py-1 rounded-lg">{needsApproval.length}</span>
                        </div>
                        
                        <div className="grid gap-4">
                            {needsApproval.length > 0 ? (
                                needsApproval.map(task => (
                                    <ApprovalCard 
                                        key={task.id}
                                        task={task}
                                        assignee={users.find(u => u.id === task.assigneeId)}
                                        type="review"
                                        onApprove={handleApproveTask}
                                        onReject={handleRejectTask}
                                        onSelect={(t) => setSelectedTaskId(t.id)}
                                    />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-text-secondary/20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-text-secondary text-sm">{t('approvals.noPendingApprovals')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Users Column: My Requests */}
                <div className={`flex flex-col gap-4 animate-slideUpFade ${canManage ? '' : 'lg:col-span-2'}`} style={{ animationDelay: '100ms' }}>
                    <div className="flex items-center justify-between bg-surface/50 p-4 rounded-xl border border-white/5">
                        <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                            {t('approvals.myRequests')}
                        </h3>
                        <span className="bg-secondary text-xs font-bold px-2 py-1 rounded-lg">{myRequests.length}</span>
                    </div>

                    <div className="grid gap-4">
                        {myRequests.length > 0 ? (
                            myRequests.map(task => (
                                <ApprovalCard 
                                    key={task.id}
                                    task={task}
                                    type="request"
                                    onSelect={(t) => setSelectedTaskId(t.id)}
                                />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-text-secondary/20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                <p className="text-text-secondary text-sm">{t('approvals.noSentRequests')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApprovalsView;
