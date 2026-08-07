# 배포 및 운영 가이드

## 배포 옵션

### 옵션 1: Vercel (권장)

**장점**:

- Next.js 최적화 (Vercel이 개발사)
- 자동 배포 파이프라인
- 글로벌 CDN
- 무료 Hobby 플랜 지원
- 자동 HTTPS

**단점**:

- 외국 서버 기반 (한국 사용자 일부 느릴 수 있음)

#### 1단계: Vercel 프로젝트 생성

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel --prod
```

또는 GitHub 웹 연동:

1. GitHub에 저장소 푸시
2. [vercel.com](https://vercel.com)에서 "Import Project"
3. GitHub 저장소 선택
4. "Deploy" 클릭

#### 2단계: 환경 변수 설정

Vercel 대시보드에서:

```
Settings > Environment Variables
```

추가:

```
NOTION_API_KEY = your_key_here
NOTION_DATABASE_ID = your_database_id_here
ADMIN_PASSWORD = your_secure_password_here
```

#### 3단계: 배포 확인

```bash
# 배포 상태 확인
vercel status

# 배포 로그 확인
vercel logs
```

### 옵션 2: AWS (EC2)

**장점**:

- 완전한 제어
- 한국 리전 선택 가능 (ap-northeast-2)
- 스케일링 가능

**단점**:

- 관리 복잡도 높음
- 비용 증가 가능

#### EC2 배포 절차

```bash
# 1. EC2 인스턴스 생성
# - OS: Ubuntu 22.04 LTS
# - 인스턴스 타입: t3.micro (프리 티어)
# - 리전: ap-northeast-2 (서울)

# 2. SSH로 접속
ssh -i your-key.pem ubuntu@your-instance-ip

# 3. Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs npm

# 4. 저장소 클론
git clone https://github.com/your-username/invoice-web.git
cd invoice-web

# 5. 의존성 설치
npm install

# 6. 환경 변수 설정
cat > .env << EOF
NOTION_API_KEY=your_key_here
NOTION_DATABASE_ID=your_database_id_here
ADMIN_PASSWORD=your_secure_password_here
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
EOF

# 7. 빌드
npm run build

# 8. PM2 설치 및 시작
npm install -g pm2
pm2 start "npm run start" --name "invoice-web"
pm2 startup
pm2 save

# 9. Nginx 설정
sudo apt-get install -y nginx
sudo cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo systemctl restart nginx

# 10. HTTPS 설정 (Let's Encrypt)
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com
```

### 옵션 3: Docker + Kubernetes

**장점**:

- 컨테이너화로 일관된 환경
- 자동 스케일링
- 마이크로서비스 구조

**단점**:

- 초기 설정 복잡
- 운영 오버헤드

#### Dockerfile 예시

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000
CMD ["npm", "run", "start"]
```

```bash
# 빌드
docker build -t invoice-web:latest .

# 실행
docker run -e NOTION_API_KEY=xxx -e ADMIN_PASSWORD=xxx -p 3000:3000 invoice-web:latest
```

## 환경별 설정

### 개발 환경 (Development)

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NOTION_API_KEY=your_dev_key
NOTION_DATABASE_ID=your_dev_database_id
ADMIN_PASSWORD=dev_password_123
```

**특징**:

- Source maps 포함
- Hot module reloading
- 상세 에러 메시지

### 테스트 환경 (Staging)

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://staging.your-domain.com
NOTION_API_KEY=your_staging_key
NOTION_DATABASE_ID=your_staging_database_id
ADMIN_PASSWORD=secure_staging_password
```

**특징**:

- 프로덕션과 동일한 환경
- SSL/TLS 활성화
- 실제 데이터로 테스트

### 프로덕션 환경 (Production)

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NOTION_API_KEY=your_production_key
NOTION_DATABASE_ID=your_production_database_id
ADMIN_PASSWORD=very_secure_password_12345!@#
```

**특징**:

- 최소 번들 크기
- Error reporting 활성화
- 백업 및 모니터링

## 배포 후 검증 체크리스트

### 배포 직후

- [ ] 사이트 접근 가능 확인 (http://your-domain.com)
- [ ] HTTPS 활성화 확인 (자물쇠 아이콘)
- [ ] 홈페이지 로드 시간 측정
- [ ] 관리자 로그인 테스트
- [ ] 견적서 조회 테스트

### 성능 검증

- [ ] Google Lighthouse 실행
  ```
  Chrome DevTools > Lighthouse > Analyze page load
  ```
- [ ] Core Web Vitals 확인
- [ ] 페이지 로드 타임 < 3초 확인

### 보안 검증

- [ ] HTTPS 활성화
- [ ] 보안 헤더 확인
  ```
  https://securityheaders.com/?q=your-domain.com
  ```
- [ ] HTTP → HTTPS 자동 리다이렉트 확인
- [ ] XSS 테스트
- [ ] CSRF 테스트

### 모니터링 설정

- [ ] Error tracking (Sentry 등)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Uptime monitoring
- [ ] Log aggregation

## 운영 가이드

### 정기 유지보수

#### 일일

- [ ] 시스템 정상 작동 확인
- [ ] 에러 로그 검토

#### 주간

- [ ] 백업 확인
- [ ] 성능 메트릭 검토

#### 월간

- [ ] 의존성 업데이트
  ```bash
  npm outdated
  npm update
  npm audit fix
  ```
- [ ] 보안 패치 적용

#### 분기별

- [ ] Lighthouse 감사
- [ ] 사용자 피드백 검토
- [ ] 기능 개선 계획

### 문제 해결

#### 배포 실패

```bash
# 빌드 로그 확인
npm run build

# 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# 타입 검사
npm run typecheck
```

#### 성능 저하

```bash
# 번들 분석
npm run build -- --profile

# 캐시 무효화 (Vercel)
vercel env ls  # 환경 변수 확인
vercel -f      # 재배포
```

#### 로그인 실패

```bash
# 1. ADMIN_PASSWORD 확인
# 2. .env.local 설정 확인
# 3. 쿠키 삭제 후 재시도
# 4. 서버 로그 확인
```

### 롤백 절차

#### Vercel

```bash
# 이전 배포로 복구
vercel rollback
```

#### AWS/자체 서버

```bash
# 1. 이전 버전 저장소로 이동
git checkout previous-commit

# 2. 재빌드
npm run build

# 3. PM2 재시작
pm2 restart invoice-web
pm2 save
```

## 모니터링 설정

### Google Analytics (GA4)

```typescript
// 추후 구현: Google Analytics 추가
// src/components/analytics.tsx

export function GoogleAnalytics() {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
      />
      <Script
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `,
        }}
      />
    </>
  );
}
```

### Sentry (에러 트래킹)

```typescript
// 추후 구현: Sentry 통합
// src/sentry.client.config.ts

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://xxx@xxx.ingest.sentry.io/xxx',
  tracesSampleRate: 1.0,
});
```

### Vercel Analytics (자동)

- Vercel에 배포 시 자동 활성화
- 대시보드 > Analytics에서 Core Web Vitals 확인

## 비용 최적화

### Vercel

- **Hobby 플랜**: 무료 (월 500 빌드, 100GB 대역폭)
- **Pro 플랜**: $20/월 (무제한 빌드, 1TB 대역폭)

### AWS EC2

- **t3.micro**: 월 $7-10
- **데이터 전송**: 월 $0-50 (트래픽에 따라)

### 권장

- 초기/테스트: Vercel Hobby (무료)
- 프로덕션: Vercel Pro 또는 AWS

## 보안 배포 체크리스트

- [ ] 환경 변수 모두 설정
- [ ] HTTPS 활성화
- [ ] 보안 헤더 설정
- [ ] ADMIN_PASSWORD 강화 (12자 이상)
- [ ] npm audit 통과
- [ ] npm run check-all 통과
- [ ] 최종 테스트 완료
- [ ] 롤백 계획 수립
- [ ] 모니터링 설정
- [ ] 팀 공지

## 참고 자료

- [Vercel Deployment](https://vercel.com/docs/deployments/overview)
- [Next.js Production Deployment](https://nextjs.org/docs/deployment)
- [AWS Deployment](https://aws.amazon.com/getting-started/hands-on/deploy-nodejs-web-app/)
- [Nginx Configuration](https://nginx.org/en/docs/)
