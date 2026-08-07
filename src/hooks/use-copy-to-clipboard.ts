'use client';

/**
 * 클립보드 복사 훅
 * navigator.clipboard API를 우선 사용하고, 지원되지 않는 환경에서는
 * document.execCommand fallback을 사용합니다. 복사 성공 시 2초간 피드백 상태를 유지합니다.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

const COPY_FEEDBACK_DURATION_MS = 2000;

interface UseCopyToClipboardResult {
  isCopied: boolean;
  copy: (text: string) => Promise<void>;
}

/**
 * 텍스트를 클립보드에 복사하는 fallback 함수
 * navigator.clipboard를 사용할 수 없는 환경(비보안 컨텍스트 등)을 위한 대체 구현
 */
function fallbackCopyToClipboard(text: string): boolean {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  // 화면에 보이지 않도록 스타일 처리
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  textArea.style.top = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  let succeeded = false;
  try {
    succeeded = document.execCommand('copy');
  } catch {
    succeeded = false;
  } finally {
    document.body.removeChild(textArea);
  }

  return succeeded;
}

export function useCopyToClipboard(): UseCopyToClipboardResult {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const copy = useCallback(async (text: string) => {
    let succeeded = false;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        succeeded = true;
      } else {
        succeeded = fallbackCopyToClipboard(text);
      }
    } catch {
      // clipboard API 실패 시 fallback 시도
      succeeded = fallbackCopyToClipboard(text);
    }

    if (succeeded) {
      setIsCopied(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setIsCopied(false);
      }, COPY_FEEDBACK_DURATION_MS);
    }
  }, []);

  return { isCopied, copy };
}
