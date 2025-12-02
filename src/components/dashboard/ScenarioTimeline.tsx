import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProgressStep, StepStatus } from "@/hooks/useScenarioProgress";

interface ScenarioTimelineProps {
    steps: ProgressStep[];
}

export function ScenarioTimeline({ steps }: ScenarioTimelineProps) {
    const navigate = useNavigate();
    const completedCount = steps.filter(s => s.status === 'completed').length;
    const progressPercentage = (completedCount / steps.length) * 100;

    const getStepStyles = (status: StepStatus) => {
        switch (status) {
            case 'completed':
                return {
                    circle: 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30',
                    label: 'text-emerald-400 font-semibold',
                    icon: <CheckCircle2 className="h-4 w-4" />
                };
            case 'error':
                return {
                    circle: 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/30 animate-pulse',
                    label: 'text-amber-400 font-semibold',
                    icon: <AlertCircle className="h-4 w-4" />
                };
            case 'current':
                return {
                    circle: 'bg-blue-600 text-white ring-4 ring-blue-900/50 scale-110 shadow-lg shadow-blue-600/40',
                    label: 'text-blue-400 font-bold',
                    icon: null
                };
            case 'pending':
            default:
                return {
                    circle: 'bg-slate-800 text-slate-500 border border-slate-600',
                    label: 'text-slate-500',
                    icon: null
                };
        }
    };

    const handleStepClick = (step: ProgressStep) => {
        navigate(step.path);
    };

    return (
        <div className="w-full max-w-4xl mx-auto my-6 px-4">
            <div className="relative">
                {/* Background Line (Gray) */}
                <div className="absolute top-4 left-0 w-full h-[2px] bg-slate-700 -z-0" />

                {/* Progress Line (Green) */}
                <div
                    className="absolute top-4 left-0 h-[2px] bg-emerald-500 -z-0 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                />

                {/* Steps Container */}
                <div className="flex flex-row items-center justify-between w-full relative z-10">
                    {steps.map((step, index) => {
                        const styles = getStepStyles(step.status);
                        const isClickable = step.status !== 'pending';

                        return (
                            <div
                                key={step.id}
                                className="flex flex-col items-center relative z-10 group"
                            >
                                {/* Circle */}
                                <button
                                    onClick={() => handleStepClick(step)}
                                    disabled={!isClickable}
                                    className={`
                                        w-8 h-8 rounded-full flex items-center justify-center 
                                        font-bold text-sm transition-all duration-300
                                        ${styles.circle}
                                        ${isClickable ? 'cursor-pointer hover:scale-125 hover:shadow-xl' : 'cursor-not-allowed opacity-60'}
                                    `}
                                    title={step.errorMessage || step.label}
                                >
                                    {styles.icon || <span>{index + 1}</span>}
                                </button>

                                {/* Label */}
                                <span
                                    className={`
                                        text-xs mt-2 font-medium text-center max-w-[80px] leading-tight
                                        transition-colors duration-300
                                        ${styles.label}
                                    `}
                                >
                                    {step.label}
                                </span>

                                {/* Error Tooltip (appears on hover) */}
                                {step.errorMessage && (
                                    <div className="absolute top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                        <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl max-w-[200px]">
                                            <p className="text-xs text-slate-300 text-center leading-tight">
                                                {step.errorMessage}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
