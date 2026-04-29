/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Calendar as CalendarIcon, PenTool, Sparkles, CheckCircle2, History, ChevronLeft, ChevronRight, BarChart3, Trash2, RefreshCcw } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  getYear
} from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Home() {
  const { 
    topic, setTopic, 
    koreanText, setKoreanText, 
    englishText, setEnglishText, 
    feedbackData, setFeedbackData, 
    isSubmitting, setIsSubmitting, 
    difficulty, setDifficulty,
    reset 
  } = useAppStore();
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [accessCode, setAccessCode] = useState(['', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [authError, setAuthError] = useState('');

  const [view, setView] = useState<'practice' | 'history' | 'analytics'>('practice');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [historyData, setHistoryData] = useState<any[]>([]);
  const feedbackRef = useRef<HTMLDivElement>(null);
  
  // Calendar States
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [expandAll, setExpandAll] = useState(false);

  // Swipe Gestures
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const minSwipeDistance = 50;
  const viewsArray = ['practice', 'history', 'analytics'];

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentX = e.targetTouches[0].clientX;
    setTouchEnd(currentX);
    
    const distance = currentX - touchStart;
    const currentIndex = viewsArray.indexOf(view);
    
    if ((currentIndex === 0 && distance > 0) || (currentIndex === viewsArray.length - 1 && distance < 0)) {
      setSwipeOffset(distance * 0.3);
    } else {
      setSwipeOffset(distance);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (!touchStart || touchEnd === null) {
      setSwipeOffset(0);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    const currentIndex = viewsArray.indexOf(view);
    
    if (isLeftSwipe && currentIndex < viewsArray.length - 1) {
      setView(viewsArray[currentIndex + 1] as 'practice' | 'history' | 'analytics');
    } else if (isRightSwipe && currentIndex > 0) {
      setView(viewsArray[currentIndex - 1] as 'practice' | 'history' | 'analytics');
    }
    
    setSwipeOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  useEffect(() => {
    setExpandAll(false);
  }, [selectedDate]);

  useEffect(() => {
    const auth = localStorage.getItem('english_mastery_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && !topic && view === 'practice') {
      fetchTopic();
    }
  }, [view, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && (view === 'history' || view === 'analytics')) {
      loadHistory();
      if (view === 'history' && !selectedDate) {
        setSelectedDate(new Date());
      }
    }
  }, [view, isAuthenticated]);

  const handleAuth = async (codeStr?: string) => {
    const code = codeStr || accessCode.join('');
    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('english_mastery_auth', 'true');
        setIsAuthenticated(true);
      } else {
        setAuthError('Access code is incorrect.');
      }
    } catch {
      setAuthError('An error occurred. Please try again.');
    }
  };

  const handleAccessCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    
    const newCode = [...accessCode];
    newCode[index] = value;
    setAccessCode(newCode);
    setAuthError('');

    if (value !== '') {
      if (index < 3) {
        inputRefs.current[index + 1]?.focus();
      } else {
        const fullCode = newCode.join('');
        if (fullCode.length === 4) {
          handleAuth(fullCode);
        }
      }
    }
  };

  const handleAccessCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !accessCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  async function fetchTopic(overrideDiff?: string) {
    const diffToUse = overrideDiff || difficulty;
    reset(); // Reset topic to show loading state and clear old texts
    try {
      const res = await fetch('/api/topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty: diffToUse })
      });
      const data = await res.json();
      if (data.topic) {
        setTopic(data.topic);
      } else if (data.error) {
        alert("Error fetching topic: " + data.error);
        setTopic("Failed to load topic. Please check API Key.");
      }
    } catch (error) {
      console.error(error);
      alert("Network error fetching topic.");
      setTopic("Network Error");
    }
  }

  async function loadHistory() {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (data.practices) {
        setHistoryData(data.practices);
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleSubmit = async () => {
    if (koreanText.trim().length === 0 || englishText.trim().length === 0) {
      alert("한국어 원문과 영어 번역문을 모두 입력해 주세요.");
      return;
    }
    
    setIsSubmitting(true);
    setFeedbackData({ correctedText: '', feedback: '', score: undefined });
    
    // Auto scroll down to feedback section
    setTimeout(() => {
      feedbackRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, koreanText, englishText })
      });
      
      if (!res.ok) throw new Error('Failed to fetch feedback');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream available');
      
      const decoder = new TextDecoder();
      let done = false;
      let accumulated = "";

      let finalScore: number | undefined = undefined;
      let finalCorrected = '';
      let finalFeedback = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          accumulated += decoder.decode(value, { stream: true });
          
          let remaining = accumulated;
          let tempScore = '';
          let tempCorrected = '';
          let tempFeedback = '';
          
          if (remaining.includes('---CORRECTED---')) {
            remaining = remaining.split('---CORRECTED---')[1];
          }
          
          if (remaining.includes('---FEEDBACK---')) {
            const parts = remaining.split('---FEEDBACK---');
            tempCorrected = parts[0].trim();
            remaining = parts[1];
          } else {
            tempCorrected = remaining.trim();
            remaining = '';
          }
          
          if (remaining.includes('---SCORE---')) {
            const parts = remaining.split('---SCORE---');
            tempFeedback = parts[0].trim();
            tempScore = parts[1].trim();
          } else {
            if (remaining.length > 0) tempFeedback = remaining.trim();
          }
          
          finalScore = tempScore && !isNaN(parseInt(tempScore)) ? parseInt(tempScore) : undefined;
          finalCorrected = tempCorrected;
          finalFeedback = tempFeedback;

          setFeedbackData({
            score: finalScore,
            correctedText: finalCorrected,
            feedback: finalFeedback
          });
          
          // Continuous scroll
          setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          }, 50);
        }
      }

      // Save to database after stream finishes
      if (finalCorrected) {
        await fetch('/api/practice/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            topic, koreanText, englishText, 
            correctedText: finalCorrected, 
            feedback: finalFeedback, 
            score: finalScore 
          })
        });
      }

    } catch (error) {
      console.error(error);
      alert("제출 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 작문 기록을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/practice/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert("기록이 성공적으로 삭제되었습니다.");
        loadHistory();
      } else {
        alert("삭제에 실패했습니다: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // Calendar Helpers
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const onDateClick = (day: Date) => setSelectedDate(day);

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Group practices by date string (YYYY-MM-DD)
    const practiceCountsByDate: Record<string, number> = {};
    historyData.forEach(prac => {
      const d = format(new Date(prac.date), 'yyyy-MM-dd');
      practiceCountsByDate[d] = (practiceCountsByDate[d] || 0) + 1;
    });

    return (
      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
          <div key={i} className="calendar-day-header">{d}</div>
        ))}
        {days.map((day, i) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const count = practiceCountsByDate[dayKey] || 0;
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <div
              key={i}
              className={`calendar-cell ${!isCurrentMonth ? 'disabled' : ''} ${isSelected ? 'active' : ''}`}
              onClick={() => onDateClick(day)}
            >
              <span style={{ fontWeight: isSelected ? 'bold' : 'normal', opacity: !isCurrentMonth ? 0.5 : 1 }}>
                {format(day, dateFormat)}
              </span>
              {count > 0 && isCurrentMonth && (
                <div className="calendar-badge">{count}</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Filter selected date's practices
  const selectedDatePractices = selectedDate 
    ? historyData.filter(prac => isSameDay(new Date(prac.date), selectedDate))
    : [];

  // Stats
  const currentYear = getYear(currentMonth);
  const thisYearPractices = historyData.filter(prac => getYear(new Date(prac.date)) === currentYear).length;
  const thisMonthPractices = historyData.filter(prac => isSameMonth(new Date(prac.date), currentMonth)).length;

  // Analytics Chart Data Preparation
  const getChartData = () => {
    // Sort practices by date ascending, take ones with score
    const scoredPractices = historyData
      .filter(prac => prac.score !== null && prac.score !== undefined)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
    return scoredPractices.map(prac => ({
      name: format(new Date(prac.date), 'MM/dd'),
      score: prac.score,
      topic: prac.topic
    }));
  };

  const getActivityData = () => {
    const counts: Record<string, number> = {};
    
    // Sort by date ascending
    const sortedData = [...historyData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sortedData.forEach(prac => {
      const d = format(new Date(prac.date), 'MM/dd');
      counts[d] = (counts[d] || 0) + 1;
    });

    return Object.keys(counts).map(dateStr => ({
      name: dateStr,
      count: counts[dateStr]
    }));
  };

  const chartData = getChartData();
  const activityData = getActivityData();

  if (isAuthenticated === null) return null; // Initial loading state

  if (isAuthenticated === false) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="glass-panel panel-content" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <PenTool size={48} color="var(--primary)" />
          </div>
          <h2 style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>Access Required</h2>
          <p style={{ marginBottom: '2rem', opacity: 0.8 }}>이 앱은 개인용 작문 연습 도구입니다. 접근 코드를 입력해 주세요.</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={accessCode[index]}
                onChange={(e) => handleAccessCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleAccessCodeKeyDown(index, e)}
                style={{ 
                  width: '3.5rem', 
                  height: '4.5rem', 
                  fontSize: '2rem', 
                  textAlign: 'center', 
                  borderRadius: '1rem', 
                  border: '2px solid var(--border)', 
                  background: 'var(--surface)', 
                  color: 'var(--primary)',
                  fontWeight: 'bold',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            ))}
          </div>
          
          {authError && <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '1rem' }}>{authError}</p>}
          <button className="btn-primary" style={{ width: '100%' }} onClick={() => handleAuth()}>
            접속하기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main 
      style={{ minHeight: '100vh', padding: '2rem 1rem', overflowX: 'hidden' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header */}
        <header className="glass-panel page-header">
          <div className="header-title">
            <PenTool size={28} color="var(--primary)" />
            <h1 className="gradient-text" style={{ fontSize: '1.5rem', margin: 0 }}>English Mastery</h1>
          </div>
          <nav className="header-nav">
            <button 
              className={`btn-primary`} 
              style={{ background: view === 'practice' ? '' : 'transparent', color: view === 'practice' ? '' : 'var(--foreground)', boxShadow: view === 'practice' ? '' : 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={() => setView('practice')}
            >
              <PenTool size={18} /> Practice
            </button>
            <button 
              className={`btn-primary`} 
              style={{ background: view === 'history' ? '' : 'transparent', color: view === 'history' ? '' : 'var(--foreground)', boxShadow: view === 'history' ? '' : 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={() => setView('history')}
            >
              <History size={18} /> History
            </button>
            <button 
              className={`btn-primary`} 
              style={{ background: view === 'analytics' ? '' : 'transparent', color: view === 'analytics' ? '' : 'var(--foreground)', boxShadow: view === 'analytics' ? '' : 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              onClick={() => setView('analytics')}
            >
              <BarChart3 size={18} /> Analytics
            </button>
          </nav>
        </header>
      </div>

      <div style={{ overflow: 'hidden', width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}>
        <div style={{
          display: 'flex',
          width: '300%',
          transform: `translateX(calc(-${viewsArray.indexOf(view) * 33.333}% + ${swipeOffset}px))`,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
        }}>
          
          {/* Practice Section */}
          <div style={{ width: '33.333%', padding: '0 1rem' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Topic Section */}
                <section className="glass-panel panel-content" style={{ textAlign: 'center', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.2rem', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>Today&apos;s Topic</h2>
                <button 
                  onClick={() => fetchTopic()} 
                  disabled={!topic}
                  style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: '0.25rem', opacity: topic ? 1 : 0.5 }}
                  title="Generate new topic"
                >
                  <RefreshCcw size={18} className={!topic ? 'animate-spin' : ''} />
                </button>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', marginBottom: '1.5rem', flexWrap: 'nowrap', width: '100%' }}>
                {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                  <button
                    key={level}
                    disabled={!topic}
                    onClick={() => {
                      if (difficulty !== level) {
                        setDifficulty(level as 'Beginner' | 'Intermediate' | 'Advanced');
                        fetchTopic(level);
                      }
                    }}
                    style={{
                      background: difficulty === level ? 'var(--primary)' : 'transparent',
                      color: difficulty === level ? 'white' : 'var(--foreground)',
                      border: `1px solid var(--primary)`,
                      padding: '0.3rem 0.4rem',
                      borderRadius: '2rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: !topic ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: !topic ? 0.5 : 1,
                      flex: '1 1 auto',
                      textAlign: 'center',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
              
              {topic ? (
                <p style={{ fontSize: '1rem', fontWeight: '600', lineHeight: 1.4 }}>&quot;{topic}&quot;</p>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', height: '60px' }}>
                  <Sparkles className="animate-spin" /> Generating topic...
                </div>
              )}
            </section>

            {/* Writing Section */}
            <section className="glass-panel panel-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: 600, color: 'var(--accent)', fontSize: '1.1rem' }}>1. 한국어 원문 작성</label>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>주제에 대해 한 단락 분량의 한국어 글을 자유롭게 작성해 보세요.</p>
                  <textarea 
                    className="textarea-field" 
                    value={koreanText}
                    onChange={(e) => setKoreanText(e.target.value)}
                    placeholder="여기에 한국어로 작문하세요..."
                    disabled={feedbackData !== null}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '1.1rem' }}>2. 영어 번역 작성</label>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>위에서 쓴 한국어 글을 영어로 번역하여 작성해 보세요.</p>
                  <textarea 
                    className="textarea-field" 
                    value={englishText}
                    onChange={(e) => setEnglishText(e.target.value)}
                    placeholder="Translate your Korean text here..."
                    disabled={feedbackData !== null}
                  />
                </div>

                {/* AI Feedback Display */}
                <div ref={feedbackRef}>
                  {(feedbackData !== null || isSubmitting) && (
                    <div style={{ marginTop: '1rem', padding: '1.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '1rem', borderLeft: '4px solid var(--primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <p style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', margin: 0 }}>
                          {isSubmitting && (!feedbackData || (!feedbackData.correctedText && !feedbackData.feedback)) ? (
                            <><Sparkles className="animate-spin" color="var(--primary)" /> AI가 분석 및 교정 중입니다...</>
                          ) : (
                            <><CheckCircle2 size={24} color="var(--primary)" /> AI 피드백 및 교정본</>
                          )}
                        </p>
                        {feedbackData && feedbackData.score !== undefined && (
                          <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '2rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            💯 점수: {feedbackData.score} / 100
                          </div>
                        )}
                      </div>
                      
                      {feedbackData && feedbackData.correctedText && (
                        <div style={{ marginBottom: '1.5rem' }}>
                          <h4 style={{ color: 'var(--primary-hover)', marginBottom: '0.5rem' }}>교정된 영어 문장</h4>
                          <p style={{ fontSize: '1.1rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{feedbackData.correctedText}</p>
                        </div>
                      )}
                      {feedbackData && feedbackData.feedback && (
                        <div>
                          <h4 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>상세 피드백</h4>
                          <p style={{ fontSize: '1rem', opacity: 0.9, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{feedbackData.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

               <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                {feedbackData !== null ? (
                  <button className="btn-primary" onClick={() => { reset(); fetchTopic(); }}>
                    새로운 작문 시작 (New Practice)
                  </button>
                ) : (
                  <button className="btn-primary" onClick={handleSubmit} disabled={isSubmitting || !topic}>
                    {isSubmitting ? 'AI 평가 중...' : '제출 및 피드백 받기'}
                  </button>
                )}
              </div>
            </section>
          </div>
        </div>
        </div>

        {/* History Section */}
        <div style={{ width: '33.333%', padding: '0 1rem' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              <section className="glass-panel panel-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CalendarIcon size={28} color="var(--primary)" />
                  <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Calendar History</h2>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', opacity: 0.8, fontSize: '0.9rem', fontWeight: 500 }}>
                  <span>이번 달: {thisMonthPractices}개</span>
                  <span>올해: {thisYearPractices}개</span>
                </div>
              </div>
              
              {/* Calendar Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <button onClick={prevMonth} style={{ background: 'transparent', border: 'none', color: 'var(--foreground)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <ChevronLeft size={24} />
                </button>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                  {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <button onClick={nextMonth} style={{ background: 'transparent', border: 'none', color: 'var(--foreground)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <ChevronRight size={24} />
                </button>
              </div>

              {renderCalendar()}
            </section>

            {/* Selected Date Details */}
            {selectedDate && (
              <section className="glass-panel panel-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', margin: 0 }}>
                    {format(selectedDate, 'MMMM d, yyyy')} 작문 기록 ({selectedDatePractices.length}건)
                  </h3>
                  {selectedDatePractices.length > 0 && (
                    <button 
                      onClick={() => setExpandAll(!expandAll)}
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.4rem 1rem', borderRadius: '2rem', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--foreground)', fontWeight: 500, transition: 'all 0.2s' }}
                    >
                      {expandAll ? '모두 접기' : '모두 펼치기'}
                    </button>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {selectedDatePractices.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '1rem', opacity: 0.7 }}>해당 날짜의 연습 기록이 없습니다.</p>
                  ) : (
                    selectedDatePractices.map((prac) => (
                      <div key={prac.id} style={{ border: '1px solid var(--border)', borderRadius: '1rem', padding: '1.5rem', position: 'relative' }}>
                        <div className="history-item-header">
                          <h3 style={{ fontWeight: 600, fontSize: '1.2rem', margin: 0 }}>&quot;{prac.topic}&quot;</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>
                              {format(new Date(prac.date), 'h:mm a')}
                            </span>
                            {prac.score !== null && (
                              <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                점수: {prac.score}
                              </span>
                            )}
                            <button 
                              onClick={() => handleDelete(prac.id)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: 0.8 }}
                              title="Delete practice"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        <details style={{ cursor: 'pointer' }} open={expandAll}>
                          <summary style={{ fontWeight: 500, marginBottom: '1rem', color: 'var(--secondary)' }}>작문 내용 및 피드백 보기</summary>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem', background: 'rgba(255, 255, 255, 0.03)', padding: '1.5rem', borderRadius: '1rem' }}>
                            
                            <div>
                              <h4 style={{ color: 'var(--accent)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>한국어 원문</h4>
                              <p style={{ whiteSpace: 'pre-wrap', opacity: 0.9 }}>{prac.koreanText}</p>
                            </div>
                            
                            <div>
                              <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>나의 영어 번역</h4>
                              <p style={{ whiteSpace: 'pre-wrap', opacity: 0.9 }}>{prac.englishText}</p>
                            </div>

                            {prac.correctedText && (
                              <div>
                                <h4 style={{ color: 'var(--primary-hover)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>AI 교정본</h4>
                                <p style={{ whiteSpace: 'pre-wrap', color: 'var(--primary-hover)' }}>{prac.correctedText}</p>
                              </div>
                            )}

                            {prac.feedback && (
                              <div>
                                <h4 style={{ color: 'var(--secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>피드백</h4>
                                <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', fontStyle: 'italic', opacity: 0.8 }}>{prac.feedback}</p>
                              </div>
                            )}

                          </div>
                        </details>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
        </div>

        {/* Analytics Section */}
        <div style={{ width: '33.333%', padding: '0 1rem' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <section className="glass-panel panel-content" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              
              {/* Activity Chart */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                  <PenTool size={28} color="var(--secondary)" />
                  <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Daily Activity</h2>
                </div>

                {activityData.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '3rem', opacity: 0.7 }}>
                    아직 작문 연습 기록이 없습니다.
                  </p>
                ) : (
                  <div style={{ width: '100%', height: '350px', marginTop: '1rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={activityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--foreground)" opacity={0.7} />
                        <YAxis stroke="var(--foreground)" opacity={0.7} allowDecimals={false} />
                        <Tooltip 
                          contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.5rem' }}
                          itemStyle={{ color: 'var(--secondary)', fontWeight: 'bold' }}
                          labelStyle={{ color: 'var(--foreground)' }}
                          formatter={(value) => [`${value || 0} 건`, '작문 횟수']}
                        />
                        <Bar dataKey="count" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', opacity: 0.7 }}>
                  일별 작문 연습 횟수 추이입니다.
                </p>
              </div>

              {/* Score Chart */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                  <BarChart3 size={28} color="var(--primary)" />
                  <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Score Analytics</h2>
                </div>

                {chartData.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '3rem', opacity: 0.7 }}>
                    아직 평가된 점수 데이터가 없습니다. 먼저 작문 연습을 완료해 주세요!
                  </p>
                ) : (
                  <div style={{ width: '100%', height: '350px', marginTop: '1rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" stroke="var(--foreground)" opacity={0.7} />
                        <YAxis stroke="var(--foreground)" opacity={0.7} domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.5rem' }}
                          itemStyle={{ color: 'var(--primary-hover)', fontWeight: 'bold' }}
                          labelStyle={{ color: 'var(--foreground)' }}
                        />
                        <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', opacity: 0.7 }}>
                  과거부터 현재까지의 번역 점수(100점 만점) 변화 추이입니다.
                </p>
              </div>

            </section>
          </div>
        </div>

        </div>
      </div>
    </main>
  );
}
