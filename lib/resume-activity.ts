import { JOURNEY_COURSES } from './journey-data';
import { getJourneyRecord } from './journey-progress';
import { getLibrary } from './pilsa-library';
import { loadDailyState } from './daily-journey-storage';

export interface ResumeActivity {
  title: string;
  href: string;
  progress: string;
  updatedAt: string;
}

export function getLatestActivity(userId: string | null = null): ResumeActivity | null {
  const activities: ResumeActivity[] = [];
  for (const course of JOURNEY_COURSES) {
    const progress = getJourneyRecord(course.id)?.progress;
    if (progress) activities.push({ title: course.title, href: `/journey/${course.id}`,
      progress: `${progress.stationIndex}개 항목을 지났어요`, updatedAt: progress.updatedAt });
  }
  for (const record of getLibrary()) {
    if (record.progress) activities.push({ title: record.title,
      href: `/${record.sourceType === 'challenge' ? 'challenge' : 'transcription'}/${encodeURIComponent(record.sourceId)}`,
      progress: `${Math.floor(record.progress.percent)}% 필사했어요`, updatedAt: record.progress.updatedAt });
  }
  const daily = loadDailyState(new Date(), userId).session;
  if (daily?.startedAt && !daily.completedAt) activities.push({ title: '오늘의 지식타자', href: '/journey/daily',
    progress: `${daily.answers.length}/5문제를 마쳤어요`, updatedAt: daily.updatedAt });
  return activities.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] || null;
}
