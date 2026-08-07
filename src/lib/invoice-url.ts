/**
 * 견적서 공유 링크 생성 유틸리티
 */

/**
 * Notion 페이지 ID로부터 견적서 공유용 절대 URL을 생성합니다.
 * NEXT_PUBLIC_APP_URL 환경 변수가 설정되지 않은 경우 상대 경로를 반환합니다.
 *
 * @param notionPageId Notion 페이지 ID
 * @returns 견적서 상세 페이지의 절대(또는 상대) URL
 */
export function buildInvoiceShareUrl(notionPageId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const path = `/invoice/${notionPageId}`;

  if (!baseUrl) {
    return path;
  }

  // baseUrl 끝의 슬래시 제거하여 중복 슬래시 방지
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');

  return `${normalizedBaseUrl}${path}`;
}
