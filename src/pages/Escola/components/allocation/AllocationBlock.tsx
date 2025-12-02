import React from 'react';
import { Teacher, Subject, Workload } from '@/context/DataContext';
import { Plus, Minus, X, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AllocationBlockProps {
    workload: Workload;
    teacher?: Teacher;
    subject?: Subject;
    color: string;
    onIncrement: () => void;
    onDecrement: () => void;
    onDelete: () => void;
    onFix?: () => void;
}

export const AllocationBlock: React.FC<AllocationBlockProps> = ({
    workload,
    teacher,
    subject,
    color,
    onIncrement,
    onDecrement,
    onDelete,
    onFix,
}) => {
    return (
        <div
            className={cn(
                "group relative bg-slate-800 rounded p-3 border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer",
                color.split(' ').find(c => c.startsWith('border-')) || 'border-blue-500'
            )}
            onClick={onFix}
            title="Clique para fixar horários"
        >
            <div className="flex justify-between items-start gap-2 pl-2">
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-100 text-sm truncate" title={teacher?.name}>
                        {teacher?.name || 'Professor Desconhecido'}
                    </div>
                    <div className="text-xs text-slate-400 truncate" title={subject?.name}>
                        {subject?.name || 'Disciplina Desconhecida'}
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <div className="flex flex-col items-center gap-0.5">
                        <span className="text-sm font-mono font-bold text-slate-200 bg-slate-700/50 px-1.5 py-0.5 rounded min-w-[24px] text-center">
                            {workload.hours}
                        </span>
                    </div>

                    <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); onIncrement(); }}
                            className="p-0.5 hover:bg-slate-700 rounded text-emerald-400"
                            title="Adicionar aula"
                        >
                            <Plus size={12} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDecrement(); }}
                            className="p-0.5 hover:bg-slate-700 rounded text-amber-400"
                            title="Remover aula"
                        >
                            <Minus size={12} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onFix && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onFix(); }}
                        className="bg-indigo-500 text-white rounded-full p-0.5 shadow-sm hover:bg-indigo-600"
                        title="Fixar Horários"
                    >
                        <Calendar size={10} />
                    </button>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600"
                    title="Remover Atribuição"
                >
                    <X size={10} />
                </button>
            </div>
        </div>
    );
};
