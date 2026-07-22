import type { Assignment, ProgressItem, SkillClassDetail } from "@/types";

export type ClassStage = "belajar" | "kerjakan_tugas" | "menunggu_nilai" | "selesai";

export type ClassJourney = {
  totalLessons: number;
  completedLessons: number;
  lessonPercent: number;
  totalAssignments: number;
  pendingAssignments: number;
  submittedAssignments: number;
  gradedAssignments: number;
  taskPercent: number;
  combinedPercent: number;
  stage: ClassStage;
  stageLabel: string;
  stageTone: "navy" | "gold" | "green" | "gray";
  nextStep: string;
};

export function buildClassJourney(
  skillClass: SkillClassDetail,
  progress: ProgressItem[],
  assignments: Assignment[],
): ClassJourney {
  const lessonIds = new Set(skillClass.lessons.map((lesson) => lesson.id));
  const completedLessonIds = new Set(
    progress
      .filter(
        (item) =>
          item.content_kind === "skill_lesson" &&
          item.status === "completed" &&
          lessonIds.has(item.content_id),
      )
      .map((item) => item.content_id),
  );

  const relatedAssignments = assignments.filter(
    (assignment) => assignment.lesson_id && lessonIds.has(assignment.lesson_id),
  );
  const pendingAssignments = relatedAssignments.filter((assignment) => !assignment.my_submission).length;
  const submittedAssignments = relatedAssignments.filter(
    (assignment) => assignment.my_submission && assignment.my_submission.status !== "graded",
  ).length;
  const gradedAssignments = relatedAssignments.filter(
    (assignment) => assignment.my_submission?.status === "graded",
  ).length;

  const totalLessons = skillClass.lessons.length;
  const completedLessons = completedLessonIds.size;
  const lessonPercent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const totalAssignments = relatedAssignments.length;
  const touchedAssignments = submittedAssignments + gradedAssignments;
  const taskPercent = totalAssignments ? Math.round((touchedAssignments / totalAssignments) * 100) : 100;
  const combinedPercent = Math.round((lessonPercent + taskPercent) / 2);

  if (!totalLessons) {
    return {
      totalLessons,
      completedLessons,
      lessonPercent,
      totalAssignments,
      pendingAssignments,
      submittedAssignments,
      gradedAssignments,
      taskPercent,
      combinedPercent,
      stage: "belajar",
      stageLabel: "Belajar",
      stageTone: "navy",
      nextStep: "Materi segera hadir di kelas ini.",
    };
  }

  if (completedLessons < totalLessons) {
    return {
      totalLessons,
      completedLessons,
      lessonPercent,
      totalAssignments,
      pendingAssignments,
      submittedAssignments,
      gradedAssignments,
      taskPercent,
      combinedPercent,
      stage: "belajar",
      stageLabel: "Belajar",
      stageTone: "gold",
      nextStep: `Lanjutkan ${skillClass.lessons[completedLessons]?.title ?? "materi berikutnya"}.`,
    };
  }

  if (pendingAssignments > 0) {
    return {
      totalLessons,
      completedLessons,
      lessonPercent,
      totalAssignments,
      pendingAssignments,
      submittedAssignments,
      gradedAssignments,
      taskPercent,
      combinedPercent,
      stage: "kerjakan_tugas",
      stageLabel: "Kerjakan Tugas",
      stageTone: "navy",
      nextStep: `Semua materi selesai. Kerjakan ${pendingAssignments} tugas yang tersisa.`,
    };
  }

  if (submittedAssignments > 0) {
    return {
      totalLessons,
      completedLessons,
      lessonPercent,
      totalAssignments,
      pendingAssignments,
      submittedAssignments,
      gradedAssignments,
      taskPercent,
      combinedPercent,
      stage: "menunggu_nilai",
      stageLabel: "Menunggu Nilai",
      stageTone: "gray",
      nextStep: "Tugas sudah dikirim. Pantau penilaian tutor dan feedback kelas ini.",
    };
  }

  return {
    totalLessons,
    completedLessons,
    lessonPercent,
    totalAssignments,
    pendingAssignments,
    submittedAssignments,
    gradedAssignments,
    taskPercent,
    combinedPercent,
    stage: "selesai",
    stageLabel: "Selesai",
    stageTone: "green",
    nextStep:
      totalAssignments > 0
        ? "Materi dan tugas inti sudah tuntas. Kelas siap masuk tahap penguatan."
        : "Materi kelas sudah selesai dipelajari.",
  };
}
