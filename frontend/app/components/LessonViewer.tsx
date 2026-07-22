"use client";

import { useEffect, useState } from "react";

import type { Lesson } from "@/types";

const CONTENT_LABELS: Record<Lesson["content_type"], string> = {
  text: "Teks",
  video: "Video",
  pdf: "PDF",
  link: "Tautan",
};

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  return match?.[1] ?? null;
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  return match?.[1] ?? null;
}

function getEmbedUrl(url: string): string | null {
  const youtubeId = getYouTubeId(url);
  if (youtubeId) return `https://www.youtube.com/embed/${youtubeId}`;

  const vimeoId = getVimeoId(url);
  if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`;

  return null;
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

function renderText(text: string) {
  return text
    .split("\n\n")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part, index) => (
      <p key={index} className="leading-7 text-navy-700">
        {part}
      </p>
    ));
}

export default function LessonViewer({
  lesson,
  lessonNumber,
  totalLessons,
  completedLessons,
  completed,
  busy,
  onComplete,
  completeLabel,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  lesson: Lesson;
  lessonNumber: number;
  totalLessons: number;
  completedLessons: number;
  completed: boolean;
  busy: boolean;
  onComplete: () => void;
  completeLabel?: string;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  const mediaUrl = lesson.content_url?.trim() || "";
  const embedUrl = mediaUrl ? getEmbedUrl(mediaUrl) : null;
  const progressPercent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const [showVideoPlayer, setShowVideoPlayer] = useState(lesson.content_type !== "video");

  useEffect(() => {
    setShowVideoPlayer(lesson.content_type !== "video");
  }, [lesson.id, lesson.content_type]);

  return (
    <section className="rounded-[28px] border border-navy-100 bg-white p-5 shadow-soft sm:p-6">
      <div className="rounded-[24px] border border-gold-100 bg-gradient-to-r from-gold-50 via-white to-navy-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">Progres belajar</p>
            <p className="mt-1 text-sm text-navy-700">
              Materi {lessonNumber} dari {totalLessons} · {completedLessons} selesai
            </p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-navy-900 shadow-soft">
            {progressPercent}%
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-gradient-to-r from-gold-500 to-navy-700" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">
            Materi {lessonNumber}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-navy-900">{lesson.title}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-navy-600">
            <span className="rounded-full bg-navy-50 px-3 py-1">{CONTENT_LABELS[lesson.content_type]}</span>
            {lesson.duration_minutes ? (
              <span className="rounded-full bg-navy-50 px-3 py-1">{lesson.duration_minutes} menit</span>
            ) : null}
            {completed ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">Sudah selesai</span>
            ) : (
              <span className="rounded-full bg-gold-50 px-3 py-1 text-gold-800">Sedang dipelajari</span>
            )}
          </div>
        </div>
        <button
          onClick={onComplete}
          disabled={busy || completed}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            completed
              ? "bg-emerald-50 text-emerald-700"
              : "border border-navy-100 text-navy-900 hover:bg-navy-50"
          } disabled:opacity-70`}
        >
          {completed ? "✓ Selesai" : busy ? "Menyimpan..." : completeLabel ?? "Tandai selesai"}
        </button>
      </div>

      <div className="mt-6 space-y-5">
        {lesson.content_type === "video" && mediaUrl ? (
          <div className="overflow-hidden rounded-[24px] border border-navy-100 bg-navy-950">
            {!showVideoPlayer ? (
              <button
                type="button"
                onClick={() => setShowVideoPlayer(true)}
                className="group relative flex aspect-video w-full items-end overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,210,94,0.45),_transparent_32%),linear-gradient(135deg,_#06142b_0%,_#10284c_52%,_#1c4f88_100%)] p-6 text-left"
              >
                <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(6,20,43,0.08)_0%,_rgba(6,20,43,0.72)_100%)]" />
                <div className="absolute right-5 top-5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                  Preview video
                </div>
                <div className="relative flex w-full items-end justify-between gap-4">
                  <div className="max-w-xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-200">Lesson video</p>
                    <h3 className="mt-3 text-2xl font-semibold text-white sm:text-[28px]">{lesson.title}</h3>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-white/80">
                      <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">Format video</span>
                      {lesson.duration_minutes ? (
                        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">{lesson.duration_minutes} menit</span>
                      ) : null}
                      {embedUrl ? (
                        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">Embedded player</span>
                      ) : isDirectVideo(mediaUrl) ? (
                        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">Direct video</span>
                      ) : (
                        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">Tautan eksternal</span>
                      )}
                    </div>
                    <p className="mt-4 max-w-lg text-sm leading-6 text-white/78">
                      Buka video untuk mengikuti materi seperti pengalaman LMS: fokus pada inti lesson, lalu lanjut ke tugas yang terkait.
                    </p>
                  </div>
                  <div className="relative shrink-0">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-navy-950 shadow-[0_24px_48px_rgba(0,0,0,0.28)] transition group-hover:scale-105">
                      <span className="ml-1 text-3xl">▶</span>
                    </div>
                    <p className="mt-3 text-center text-sm font-semibold text-white">Putar materi</p>
                  </div>
                </div>
              </button>
            ) : embedUrl ? (
              <iframe
                src={embedUrl}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full"
              />
            ) : isDirectVideo(mediaUrl) ? (
              <video src={mediaUrl} controls className="aspect-video w-full bg-black" />
            ) : (
              <div className="flex aspect-video items-center justify-center p-6 text-center text-sm text-white/80">
                <div>
                  <p>Video tersedia melalui tautan eksternal.</p>
                  <a
                    href={mediaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex rounded-full bg-white px-4 py-2 font-semibold text-navy-900"
                  >
                    Buka video
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {lesson.content_type === "pdf" && mediaUrl ? (
          <div className="overflow-hidden rounded-[24px] border border-navy-100 bg-navy-50">
            <iframe src={mediaUrl} title={lesson.title} className="h-[520px] w-full" />
          </div>
        ) : null}

        {lesson.content_type === "link" && mediaUrl ? (
          <div className="rounded-[24px] border border-navy-100 bg-navy-50 p-5">
            <p className="text-sm text-navy-600">Materi ini dibuka melalui tautan eksternal.</p>
            <a
              href={mediaUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex rounded-full bg-navy-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Buka tautan materi
            </a>
          </div>
        ) : null}

        {lesson.content_text ? (
          <div className="rounded-[24px] border border-navy-100 bg-navy-50/60 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-navy-700">Ringkasan materi</h3>
            <div className="mt-4 space-y-4 text-sm sm:text-[15px]">{renderText(lesson.content_text)}</div>
          </div>
        ) : null}

        {mediaUrl ? (
          <a
            href={mediaUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex text-sm font-semibold text-gold-700 hover:underline"
          >
            Buka sumber asli ↗
          </a>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-navy-100 pt-4">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="rounded-full border border-navy-100 px-4 py-2 text-sm font-semibold text-navy-900 transition hover:bg-navy-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Materi sebelumnya
          </button>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className="rounded-full bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:bg-navy-200"
          >
            Materi berikutnya →
          </button>
        </div>
      </div>
    </section>
  );
}
