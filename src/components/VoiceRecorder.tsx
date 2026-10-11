import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  RefreshCw,
  Play,
  Pause,
  AlertCircle,
  Sparkles,
  Volume2,
  Trash2,
  Globe,
} from 'lucide-react';
import { transcribeVoice } from '../lib/api.ts';

interface Props {
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  onTranscriptionComplete: (text: string, detectedLang?: string, isSimulation?: boolean, note?: string) => void;
  onFallbackToText: () => void;
  availableLanguages: Array<{
    code: string;
    sarvamCode: string;
    label: string;
    nativeLabel: string;
    voiceSupported: boolean;
  }>;
}

export const VoiceRecorder: React.FC<Props> = ({
  selectedLanguage,
  onLanguageChange,
  onTranscriptionComplete,
  onFallbackToText,
  availableLanguages,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setMicError(null);
    setInfoMessage(null);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Audio recording is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Determine mimeType
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/wav';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const fullBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(fullBlob);
        const url = URL.createObjectURL(fullBlob);
        setAudioUrl(url);

        // Stop all audio tracks to release microphone hardware
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250); // Slice data every 250ms
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError('Microphone permission was denied. Please allow microphone access or switch to text mode.');
      } else {
        setMicError(err.message || 'Could not initialize microphone recording.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const discardRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingSeconds(0);
    setIsPlaying(false);
    setInfoMessage(null);
    setMicError(null);
  };

  const togglePlayback = () => {
    if (!audioElementRef.current && audioUrl) {
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;
      audio.onended = () => setIsPlaying(false);
    }

    if (audioElementRef.current) {
      if (isPlaying) {
        audioElementRef.current.pause();
        setIsPlaying(false);
      } else {
        audioElementRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleTranscribe = async () => {
    if (!audioBlob) return;

    setIsTranscribing(true);
    setMicError(null);
    setInfoMessage(null);

    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const res = reader.result as string;
          const base64 = res.split(',')[1] || '';
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(audioBlob);
      const audioBase64 = await base64Promise;

      const result = await transcribeVoice(
        audioBase64,
        audioBlob.type,
        selectedLanguage
      );

      if (result.transcript && result.transcript.trim().length > 0) {
        onTranscriptionComplete(
          result.transcript,
          result.languageCode || selectedLanguage,
          result.isDemoSimulation,
          result.provider
        );
      } else if (result.isDemoSimulation) {
        // Honest notification as required:
        setInfoMessage(
          result.message ||
            'Voice was captured! Sarvam AI Saaras STT is awaiting SARVAM_API_KEY. Please use text entry or check integration instructions.'
        );
      } else {
        setMicError('No clear speech was recognized. Please speak clearly or use text mode.');
      }
    } catch (err: any) {
      console.error('Transcription failed:', err);
      setMicError(err.message || 'Speech recognition failed. Please try again or switch to text mode.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      {/* Language Selector Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-700">
          <Globe className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">Spoken Language:</span>
        </div>
        <select
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          disabled={isRecording || isTranscribing}
          className="text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {availableLanguages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.nativeLabel} ({l.label})
            </option>
          ))}
        </select>
      </div>

      {/* Recording Area */}
      <div className="flex flex-col items-center justify-center py-6 text-center">
        {!isRecording && !audioBlob && (
          <>
            <button
              type="button"
              onClick={startRecording}
              className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              <Mic className="w-8 h-8 group-hover:scale-110 transition-transform" />
            </button>
            <p className="mt-4 font-medium text-slate-800 text-sm">Tap microphone to describe your problem</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Speak in English, Hindi, Telugu, or your preferred language. Sarvam AI will listen and extract details.
            </p>
          </>
        )}

        {/* Live Recording State */}
        {isRecording && (
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center w-24 h-24 mb-4">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
              <button
                type="button"
                onClick={stopRecording}
                className="relative flex items-center justify-center w-20 h-20 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 transition-all"
              >
                <Square className="w-7 h-7" />
              </button>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span>Recording: {formatTime(recordingSeconds)}</span>
            </div>
            <p className="text-xs text-slate-500">Tap the red square when you finish speaking</p>
          </div>
        )}

        {/* Recorded Preview State */}
        {!isRecording && audioBlob && (
          <div className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-slate-800">Voice Note Captured</span>
              </div>
              <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                {formatTime(recordingSeconds)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={togglePlayback}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={discardRecording}
                disabled={isTranscribing}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-red-600 bg-white border border-slate-200 rounded-lg hover:border-red-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Discard</span>
              </button>

              <button
                type="button"
                onClick={handleTranscribe}
                disabled={isTranscribing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {isTranscribing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Transcribing with Sarvam AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                    <span>Process Audio with Sarvam AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Informative Messages / Failures */}
        {infoMessage && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 text-left max-w-md flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Voice Processing Notice</p>
              <p className="mt-0.5 text-slate-600">{infoMessage}</p>
              <button
                type="button"
                onClick={onFallbackToText}
                className="mt-2 text-xs font-semibold text-blue-700 underline hover:text-blue-900"
              >
                Switch to Text Input
              </button>
            </div>
          </div>
        )}

        {micError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 text-left max-w-md flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Recording Error</p>
              <p className="mt-0.5 text-slate-600">{micError}</p>
              <button
                type="button"
                onClick={onFallbackToText}
                className="mt-2 text-xs font-semibold text-rose-700 underline hover:text-rose-900"
              >
                Continue using Text Mode
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
