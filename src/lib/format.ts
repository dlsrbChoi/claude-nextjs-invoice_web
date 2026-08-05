/**
 * 데이터 포맷팅 유틸리티
 */

/**
 * 날짜를 로컬 문자열로 변환
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/**
 * 통화를 형식화된 문자열로 변환
 */
export function formatCurrency(amount: number, currency: string = 'KRW'): string {
  const formatter = new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'KRW' ? 0 : 2,
    maximumFractionDigits: currency === 'KRW' ? 0 : 2,
  })

  return formatter.format(amount)
}

/**
 * 숫자를 포맷된 문자열로 변환
 */
export function formatNumber(number: number, decimals: number = 0): string {
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number)
}
