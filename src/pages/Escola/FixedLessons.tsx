import { useState } from "react";
import { SlotSelectorModal } from "@/components/modals/SlotSelectorModal";

interface FixedLessonsProps {
    teacherId: string;
    classId: string;
    subjectId: string;
    onClose: () => void;
}

export default function FixedLessons({
    teacherId,
    classId,
    subjectId,
    onClose,
}: FixedLessonsProps) {
    // We don't need local state for isOpen if the parent controls it via rendering,
    // but SlotSelectorModal expects isOpen.
    // Since Allocation.tsx will conditionally render this component, we can pass true.
    // However, for animation/exit, it's often better to keep it mounted and toggle isOpen.
    // But given the current structure of Allocation.tsx (conditional rendering), passing true is fine.

    return (
        <SlotSelectorModal
            isOpen={true}
            onClose={onClose}
            teacherId={teacherId}
            classId={classId}
            subjectId={subjectId}
        />
    );
}
