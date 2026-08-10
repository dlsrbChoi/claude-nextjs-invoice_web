import { NextRequest, NextResponse } from 'next/server';

const NOTION_API_VERSION = '2022-06-28';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notionPageId, reporterEmail, reason } = body;

    // 입력 검증
    if (!notionPageId?.trim()) {
      return NextResponse.json({ message: '유효하지 않은 요청입니다.' }, { status: 400 });
    }

    if (!reporterEmail?.trim()) {
      return NextResponse.json({ message: '신고자 이메일을 입력해주세요.' }, { status: 400 });
    }

    if (!reason?.trim()) {
      return NextResponse.json({ message: '신고 사유를 입력해주세요.' }, { status: 400 });
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reporterEmail)) {
      return NextResponse.json({ message: '유효한 이메일 주소를 입력해주세요.' }, { status: 400 });
    }

    // 길이 검증
    if (reason.length > 1000) {
      return NextResponse.json({ message: '신고 사유는 1000자 이내여야 합니다.' }, { status: 400 });
    }

    // 헤더 인젝션 방지: 개행 문자 제거
    const sanitizedEmail = reporterEmail.replace(/[\r\n]/g, '');
    const sanitizedReason = reason.replace(/[\r\n]/g, ' ');

    // Reports 데이터베이스 ID 확인
    const reportsDatabaseId = process.env.NOTION_REPORTS_DATABASE_ID;
    if (!reportsDatabaseId) {
      console.error('NOTION_REPORTS_DATABASE_ID not configured');
      return NextResponse.json({ message: '서버 설정 오류입니다.' }, { status: 500 });
    }

    // Notion API에 신고 추가
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': NOTION_API_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: {
          database_id: reportsDatabaseId,
        },
        properties: {
          title: {
            title: [
              {
                text: {
                  content: `[신고] ${notionPageId.substring(0, 8)}...`,
                },
              },
            ],
          },
          target_notion_page_id: {
            rich_text: [
              {
                text: {
                  content: notionPageId,
                },
              },
            ],
          },
          reason: {
            rich_text: [
              {
                text: {
                  content: sanitizedReason,
                },
              },
            ],
          },
          reporter_email: {
            email: sanitizedEmail,
          },
          reporter_name: {
            rich_text: [
              {
                text: {
                  content: 'Anonymous',
                },
              },
            ],
          },
          status: {
            select: {
              name: 'pending',
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Notion API error:', error);
      return NextResponse.json({ message: '신고 제출에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ message: '신고가 정상 접수되었습니다.' }, { status: 201 });
  } catch (error) {
    console.error('Report submission error:', error);
    return NextResponse.json({ message: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
