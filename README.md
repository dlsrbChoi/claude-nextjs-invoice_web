# 노션 기반 견적서 관리 시스템 MVP

노션을 데이터베이스로 활용하여 견적서를 관리하고, 클라이언트가 웹에서 조회 및 PDF 다운로드할 수 있는 시스템입니다.

## 🎯 주요 기능

- **Notion API 연동** — Notion 데이터베이스에서 견적서 데이터 조회
- **견적서 조회** — Notion 페이지 ID 또는 URL을 통한 견적서 조회
- **상세 정보 표시** — 클라이언트, 항목, 금액 등 견적서 전체 정보 표시
- **PDF 다운로드** — 브라우저 인쇄 기능을 통한 PDF 저장
- **반응형 디자인** — 모바일부터 데스크톱까지 모든 기기 대응
- **다크모드 지원** — next-themes로 구현된 라이트/다크/시스템 테마 전환
- **URL 검증** — Notion 페이지 ID 유효성 검증 및 정규화
- **에러 처리** — 사용자 친화적 에러 메시지 및 404 페이지

## 📁 폴더 구조

```
invoice-web/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                 # 홈페이지 (견적서 조회)
│   │   ├── invoice/
│   │   │   └── [notionPageId]/
│   │   │       └── page.tsx         # 견적서 상세 페이지
│   │   ├── layout.tsx               # 루트 레이아웃 (헤더, 푸터)
│   │   ├── error.tsx                # 에러 경계
│   │   ├── not-found.tsx            # 404 페이지
│   │   └── globals.css              # 전역 스타일 (TailwindCSS, 테마 변수)
│   ├── components/
│   │   ├── ui/                      # shadcn UI 컴포넌트 (Button, Card, Input 등)
│   │   ├── layout/                  # 레이아웃 컴포넌트
│   │   │   ├── header.tsx          # 상단 헤더
│   │   │   ├── footer.tsx          # 하단 푸터
│   │   │   ├── container.tsx       # max-width 래퍼
│   │   │   ├── theme-toggle.tsx    # 다크모드 토글
│   │   │   └── mobile-nav.tsx      # 모바일 네비게이션
│   │   ├── patterns/                # 재사용 가능한 패턴
│   │   │   ├── page-header.tsx     # 페이지 헤더
│   │   │   └── empty-state.tsx     # 빈 상태 표시
│   │   ├── invoice/                 # 견적서 관련 컴포넌트
│   │   │   ├── invoice-detail.tsx  # 견적서 상세 표시
│   │   │   └── invoice-lookup.tsx  # 견적서 조회 폼
│   │   └── theme-provider.tsx       # next-themes 래퍼
│   └── lib/
│       ├── notion.ts                # Notion API 클라이언트
│       ├── types.ts                 # TypeScript 타입 정의
│       ├── format.ts                # 날짜 및 통화 포맷팅
│       └── utils.ts                 # 유틸리티 함수 (cn() 등)
├── public/                          # 정적 자산
├── .env.example                     # 환경 변수 템플릿
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── CLAUDE.md                        # 개발자 가이드
└── README.md
```

## 🚀 시작하기

### 필수 조건

- Node.js 18+
- npm 또는 yarn
- Notion API 키

### 1. 설치

```bash
# 저장소 클론
git clone https://github.com/dlsrbChoi/invoice-web.git
cd invoice-web

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
```

### 2. Notion API 키 설정

`.env.local` 파일에 Notion API 키를 설정하세요:

```env
NOTION_API_KEY=your_notion_api_key_here
```

Notion API 키는 [Notion Integrations](https://www.notion.so/my-integrations)에서 생성할 수 있습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열면 애플리케이션이 실행됩니다.

## 💡 사용 방법

1. **Notion 데이터베이스 생성** — 견적서 정보를 저장할 Notion 데이터베이스 생성
2. **Integration 권한 설정** — Notion Integration에 데이터베이스 접근 권한 부여
3. **페이지 ID 복사** — Notion 견적서 페이지의 URL에서 페이지 ID 추출
4. **웹에서 조회** — 홈페이지에서 페이지 ID 또는 URL 입력
5. **PDF 다운로드** — "PDF 다운로드" 버튼 또는 브라우저 인쇄 기능으로 저장

## 🏗️ 프로젝트 구조

### Notion API 연동

`src/lib/notion.ts`에서 Notion API 기능을 제공합니다:

```tsx
import { getInvoiceFromNotion, normalizeNotionPageId } from '@/lib/notion';

// 페이지 ID 정규화 (하이픈 추가/제거)
const normalizedId = normalizeNotionPageId(pageId);

// Notion에서 견적서 데이터 조회
const invoice = await getInvoiceFromNotion(normalizedId);
```

### 타입 정의

`src/lib/types.ts`에서 TypeScript 타입을 제공합니다:

```tsx
interface Invoice {
  id: string;
  title: string;
  clientName: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'viewed' | 'paid';
  // ... 더 많은 필드
}
```

## 🎨 테마 커스터마이징

다크모드는 `next-themes`로 구현되어 있으며, 색상 변수는 `src/app/globals.css`에 정의되어 있습니다.

oklch 포맷의 CSS 변수를 수정하여 색상을 커스터마이징할 수 있습니다:

```css
:root {
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  /* ... 다른 변수들 */
}

.dark {
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  /* ... */
}
```

## 📦 주요 의존성

- **프레임워크**: Next.js 16, React 19, TypeScript 5
- **스타일**: TailwindCSS v4, oklch 색상 시스템
- **UI**: ShadcnUI (base-nova 스타일, @base-ui/react 기반)
- **아이콘**: lucide-react
- **테마**: next-themes (라이트/다크/시스템 모드)
- **유틸리티**: clsx + tailwind-merge, class-variance-authority

## 🔧 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드된 앱 실행
npm run start

# ESLint 실행
npm run lint
```

## 🚀 배포

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

환경 변수를 Vercel 프로젝트 설정에 추가하세요.

### Docker 배포

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🐛 트러블슈팅

### "NOTION_API_KEY 환경 변수가 설정되지 않았습니다"

- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- `NOTION_API_KEY` 값을 입력했는지 확인
- 개발 서버를 재시작해보세요 (`npm run dev`)

### "유효하지 않은 페이지 ID"

- Notion 페이지 URL에서 올바른 페이지 ID 추출 확인
- 페이지 ID는 32자 16진수 또는 UUID 형식이어야 합니다
- Integration에 해당 페이지에 대한 접근 권한이 있는지 확인

## 📖 참고 자료

- [Next.js 문서](https://nextjs.org/docs)
- [Notion API 문서](https://developers.notion.com)
- [TailwindCSS 문서](https://tailwindcss.com/docs)
- [shadcn/ui 문서](https://ui.shadcn.com)
- [React 문서](https://react.dev)

## 📄 라이선스

MIT License

## 기여

버그 리포트 및 기능 제안은 [Issues](https://github.com/dlsrbChoi/invoice-web/issues)에서 해주세요.

---

**Made with ❤️ for Invoice Management**
