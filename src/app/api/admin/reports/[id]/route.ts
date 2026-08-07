/**
 * 신고 상태 변경 API 엔드포인트 (Task 614)
 * PATCH /api/admin/reports/[id]
 *
 * 관리자가 신고의 상태(pending/reviewing/resolved/dismissed)를 변경할 때 사용
 * Notion Reports 데이터베이스의 해당 페이지를 업데이트한다.
 *
 * 보안 구현:
 * - 세션 토큰 검증 (HMAC-SHA256)
 * - 유효한 Notion 페이지 ID 형식 검증
 * - 유효한 상태값 검증
 * - Notion API 에러 처리 (쓰기 경로이므로 신중한 롤백/재시도 불가)
 * - XSS 방지 (상태값은 enum이므로 자동 방지)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import type { ReportStatus } from '@/lib/types';

/**
 * PATCH /api/admin/reports/[id]
 *
 * @param request NextRequest
 * @param context { params: Promise<{ id: string }> }
 *
 * @body {
 *   status: 'pending' | 'reviewing' | 'resolved' | 'dismissed'
 * }
 *
 * @returns {
 *   200: { success: true, message: string }
 *   400: { error: string, details?: string[] }
 *   401: { error: string }
 *   404: { error: string }
 *   500: { error: string }
 * }
 */
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Step 1: Content-Type 검증
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: '요청 형식이 올바르지 않습니다. application/json을 사용해주세요.' },
        { status: 400 }
      );
    }

    // Step 2: 요청 본문 파싱
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: '요청 본문이 유효한 JSON이 아닙니다.' }, { status: 400 });
    }

    const { status } = body as Record<string, unknown>;

    // Step 3: 상태값 검증
    const validStatuses: ReportStatus[] = ['pending', 'reviewing', 'resolved', 'dismissed'];
    if (!status || typeof status !== 'string' || !validStatuses.includes(status as ReportStatus)) {
      return NextResponse.json(
        {
          error: '유효하지 않은 상태값입니다.',
          details: [`허용된 상태: ${validStatuses.join(', ')}`],
        },
        { status: 400 }
      );
    }

    // Step 4: 세션 검증
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
    }

    const sessionResult = await verifySessionToken(token);
    if (!sessionResult.valid) {
      return NextResponse.json(
        { error: '세션이 만료되었습니다. 다시 로그인해주세요.' },
        { status: 401 }
      );
    }

    // Step 5: 신고 ID 검증 및 정규화
    const { id: reportId } = await context.params;

    if (!reportId || typeof reportId !== 'string' || reportId.trim().length === 0) {
      return NextResponse.json({ error: '유효한 신고 ID가 필요합니다.' }, { status: 400 });
    }

    // Notion 페이지 ID 형식 검증 (간단한 정규식 — 실제로는 normalizeNotionPageId 사용 권장)
    const normalizedId = reportId.replace(/-/g, '').toLowerCase();
    if (!/^[a-f0-9]{32}$/.test(normalizedId)) {
      return NextResponse.json({ error: '유효하지 않은 신고 ID 형식입니다.' }, { status: 400 });
    }

    // Step 6: Notion API를 통한 페이지 업데이트
    const apiKey = process.env.NOTION_API_KEY;
    if (!apiKey) {
      console.error('NOTION_API_KEY 환경 변수 미설정');
      return NextResponse.json(
        { error: '서버 설정 오류: Notion API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 상태값을 Notion select 필드명으로 매핑
    // Notion select 필드의 실제 옵션값에 맞춰야 함
    // 현재: pending → "Pending", reviewing → "Reviewing", resolved → "Resolved", dismissed → "Dismissed"
    const notionStatusMap: Record<ReportStatus, string> = {
      pending: 'Pending',
      reviewing: 'Reviewing',
      resolved: 'Resolved',
      dismissed: 'Dismissed',
    };

    const notionStatusValue = notionStatusMap[status as ReportStatus];

    // Notion 페이지 업데이트 요청
    const notionResponse = await fetch(`https://api.notion.com/v1/pages/${normalizedId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          status: {
            select: {
              name: notionStatusValue,
            },
          },
        },
      }),
    });

    // Step 7: Notion API 응답 처리
    if (!notionResponse.ok) {
      const notionError = await notionResponse.text();
      console.error('Notion API 쓰기 실패:', {
        status: notionResponse.status,
        statusText: notionResponse.statusText,
        body: notionError,
        reportId: normalizedId,
      });

      // 특정 에러 타입별 응답
      if (notionResponse.status === 404) {
        return NextResponse.json({ error: '신고를 찾을 수 없습니다.' }, { status: 404 });
      }

      if (notionResponse.status === 403) {
        return NextResponse.json(
          {
            error: '이 신고에 접근할 수 있는 권한이 없습니다.',
            details: ['Notion Integration 권한을 확인하세요.'],
          },
          { status: 403 }
        );
      }

      if (notionResponse.status === 429) {
        return NextResponse.json(
          {
            error: 'Notion API 레이트 제한 도달.',
            details: ['잠시 후 다시 시도해주세요.'],
          },
          { status: 429 }
        );
      }

      // 기타 에러는 500으로 처리
      return NextResponse.json(
        {
          error: '신고 상태 변경에 실패했습니다.',
          details: ['Notion API 오류가 발생했습니다.'],
        },
        { status: 500 }
      );
    }

    // Step 8: 성공 응답
    console.log(`신고 상태 변경 완료: ${normalizedId} → ${status}`);

    return NextResponse.json(
      {
        success: true,
        message: `신고 상태가 변경되었습니다.`,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    console.error('신고 상태 변경 API 오류:', errorMessage);

    return NextResponse.json(
      {
        error: '서버 오류가 발생했습니다.',
        details: [process.env.NODE_ENV === 'development' ? errorMessage : ''],
      },
      { status: 500 }
    );
  }
}
