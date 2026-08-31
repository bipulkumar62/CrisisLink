import { useState, useEffect, useRef, useCallback } from 'react';

// Speech Recognition API TypeScript typing
interface IWindowSpeechRecognition extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export type SpeechStatus =
  | 'UNCHECKED'
  | 'SUPPORTED'
  | 'UNSUPPORTED'
  | 'LISTENING'
  | 'PROCESSING'
  | 'ERROR'
  | 'STOPPED';

export interface UseBrowserSpeechProps {
  onTranscriptChange?: (text: string) => void;
  language?: string;
}

export function useBrowserSpeech({
  onTranscriptChange,
  language = 'en-IN',
}: UseBrowserSpeechProps = {}) {
  const [status, setStatus] = useState<SpeechStatus>('UNCHECKED');
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check speech recognition capability on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const win = window as IWindowSpeechRecognition;
        const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

        if (SpeechRecognitionClass) {
          setIsSupported(true);
          setStatus('SUPPORTED');
        } else {
          setIsSupported(false);
          setStatus('UNSUPPORTED');
          setErrorMessage('Browser Speech Recognition is not supported on this browser. Text input remains fully active.');
        }
      }
    } catch {
      setIsSupported(false);
      setStatus('UNSUPPORTED');
    }
  }, []);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startListening = useCallback(() => {
    setErrorMessage(null);
    setInterimTranscript('');

    if (typeof window === 'undefined') return;

    const win = window as IWindowSpeechRecognition;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      setStatus('UNSUPPORTED');
      setErrorMessage('Speech recognition is not available in your browser. Please type your report description directly.');
      return;
    }

    try {
      // Abort any existing instance
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setStatus('LISTENING');
        setRecordingSeconds(0);
        clearTimer();
        timerRef.current = setInterval(() => {
          setRecordingSeconds((s) => s + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptChunk = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) {
            final += transcriptChunk + ' ';
          } else {
            interim += transcriptChunk;
          }
        }

        if (final) {
          setFinalTranscript((prev) => {
            const updated = prev ? `${prev} ${final.trim()}` : final.trim();
            if (onTranscriptChange) {
              onTranscriptChange(updated);
            }
            return updated;
          });
        }

        setInterimTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        clearTimer();
        setIsListening(false);
        setStatus('ERROR');

        switch (event.error) {
          case 'not-allowed':
          case 'permission-denied':
            setErrorMessage('Microphone access was denied. Please allow microphone permissions or type your description.');
            break;
          case 'no-speech':
            setErrorMessage('No voice detected. Please check your microphone and speak clearly.');
            break;
          case 'audio-capture':
            setErrorMessage('No microphone device found on this system.');
            break;
          case 'network':
            setErrorMessage('Speech service network issue. Please type your description manually.');
            break;
          default:
            setErrorMessage(`Speech recognition notice: ${event.error || 'Voice capture interrupted'}. Type input available.`);
            break;
        }
      };

      recognition.onend = () => {
        clearTimer();
        setIsListening(false);
        setStatus('STOPPED');
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      clearTimer();
      setIsListening(false);
      setStatus('ERROR');
      setErrorMessage(err?.message || 'Could not start voice recognition.');
    }
  }, [language, onTranscriptChange]);

  const stopListening = useCallback(() => {
    clearTimer();
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Error stopping speech recognition:', err);
      }
    }
    setIsListening(false);
    setStatus('STOPPED');
  }, [isListening]);

  useEffect(() => {
    return () => {
      clearTimer();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    status,
    errorMessage,
    interimTranscript,
    finalTranscript,
    recordingSeconds,
    startListening,
    stopListening,
    clearTranscript: () => {
      setFinalTranscript('');
      setInterimTranscript('');
    },
  };
}
