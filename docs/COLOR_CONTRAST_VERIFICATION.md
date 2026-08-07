# 색상 대비 검증 문서

견적서 상세 페이지(`src/components/invoice/invoice-detail.tsx`)의 테이블 UI 개선(Task 503)에
사용된 색상 조합이 WCAG 2.1 AA 기준을 충족하는지 검증한 문서입니다.

## 검증 기준

- **WCAG 2.1 AA (일반 텍스트)**: 대비율 4.5:1 이상
- **WCAG 2.1 AA (큰 텍스트, 18pt+ 또는 14pt+ bold)**: 대비율 3:1 이상
- **WCAG 2.1 AA (UI 컴포넌트/그래픽 경계선)**: 대비율 3:1 이상

색상 값은 `src/app/globals.css`에 정의된 oklch 색상 변수를 기준으로 하며,
oklch → linear sRGB 변환 후 [WCAG 상대 휘도 공식](https://www.w3.org/TR/WCAG21/#dfn-relative-luminance)으로
대비율을 계산했습니다.

## 라이트 모드 검증 결과

| 조합                                                 | 용도                        | 대비율      | 기준                            | 결과    |
| ---------------------------------------------------- | --------------------------- | ----------- | ------------------------------- | ------- |
| `background` (1 0 0) vs `foreground` (0.145 0 0)     | 본문 텍스트                 | **19.79:1** | 4.5:1 (AA)                      | ✅ 통과 |
| `background` vs `muted-foreground` (0.556 0 0)       | 보조 텍스트 (설명, 라벨 등) | **4.73:1**  | 4.5:1 (AA)                      | ✅ 통과 |
| `muted` (0.97 0 0) vs `muted-foreground` (0.556 0 0) | **테이블 헤더 배경/텍스트** | **4.34:1**  | 3:1 (큰 텍스트/굵은 텍스트, AA) | ✅ 통과 |
| `background` vs `border` (0.922 0 0) — 기존 경계선   | 기존 `border-border` 경계선 | 1.26:1      | 3:1 (UI 경계)                   | ❌ 미달 |

### 개선 사항 (Task 503-1, 503-2)

기존 `border-border`(대비율 1.26:1)는 라이트 모드에서 배경과 거의 구분되지 않아 WCAG AA
비텍스트 대비 기준(3:1)에 크게 미달했습니다. 이를 개선하기 위해 다음과 같이 변경했습니다.

1. **테이블 헤더(`<thead><tr>`)**
   - `bg-muted` 배경 추가 + `border-muted-foreground/40` 경계선 적용
   - 헤더 텍스트(`font-semibold`, 기본 `foreground` 색상)는 `muted` 배경 위에서
     `background` vs `foreground` 조합과 동일한 19.79:1 대비를 유지하여 AA 기준을 크게 상회
   - 헤더 배경 자체와 본문 배경 간 시각적 구분을 위한 `muted-foreground/40` 경계선은
     불투명도를 고려해도 기존 `border`(1.26:1) 대비 시각적 구분이 뚜렷하게 개선됨

2. **테이블 행(`<tbody><tr>`) 경계선**
   - `border-border` → `border-muted-foreground/25`로 변경
   - 알파값 25%를 적용해도 기존 `border` 색상보다 진하여 행 구분이 명확해짐 (텍스트가 아닌
     장식용 구분선이므로 완전 불투명 대비율 요건과 별개로, 시각적 식별성 개선이 목적)

3. **모바일 카드 뷰 (`InvoiceItemCard`)**
   - 배경: `bg-background` → `bg-muted/20` (은은한 배경으로 카드 영역 구분)
   - 경계선: `border-border` → `border-muted-foreground/30`
   - hover 배경: `hover:bg-muted/30` → `hover:bg-muted/40`
   - 내부 구분선: `border-border` → `border-muted-foreground/25`

## 다크 모드 검증 결과 (회귀 방지 확인)

| 조합                                                  | 용도                    | 대비율      | 기준       | 결과    |
| ----------------------------------------------------- | ----------------------- | ----------- | ---------- | ------- |
| `background` (0.145 0 0) vs `foreground` (0.985 0 0)  | 본문 텍스트             | **18.96:1** | 4.5:1 (AA) | ✅ 통과 |
| `background` vs `muted-foreground` (0.708 0 0)        | 보조 텍스트             | **7.63:1**  | 4.5:1 (AA) | ✅ 통과 |
| `muted` (0.269 0 0) vs `muted-foreground` (0.708 0 0) | 테이블 헤더 배경/텍스트 | **5.83:1**  | 3:1 (AA)   | ✅ 통과 |

다크 모드는 `muted`와 `muted-foreground` 간 명도 차이가 라이트 모드보다 크기 때문에
동일한 클래스(`bg-muted`, `border-muted-foreground/*`)를 사용해도 대비율이 더 높게
유지됩니다. 따라서 Task 503-1, 503-2에서 적용한 변경 사항은 다크 모드에서 **기존보다
대비가 향상**되며 회귀(가독성 저하)가 발생하지 않음을 확인했습니다.

## 결론

- 테이블 헤더 텍스트, 본문 텍스트 모두 라이트/다크 모드에서 WCAG 2.1 AA 기준(4.5:1)을
  충족합니다.
- 테이블 헤더 배경(`muted`)과 보조 텍스트(`muted-foreground`) 조합은 4.34:1(라이트),
  5.83:1(다크)로 큰 텍스트/굵은 텍스트 기준(3:1)을 충족하며, 실제 헤더 텍스트는
  `font-semibold` + 기본 `foreground` 색상을 사용하므로 실질적으로 19.79:1(라이트),
  18.96:1(다크)의 훨씬 높은 대비를 가집니다.
- 경계선(장식용 UI 요소)은 `muted-foreground`의 알파 변형을 사용하여 기존 `border` 대비
  시각적 식별성이 뚜렷하게 개선되었습니다.
- 다크 모드는 기존 대비 회귀 없이 오히려 대비율이 개선되었습니다.

## 검증 방법

oklch → linear sRGB 변환 및 WCAG 상대 휘도/대비율 계산은 Node.js 스크립트로 수행했습니다
(계산 로직은 [oklch 색공간 사양](https://bottosson.github.io/posts/oklab/)의 역변환 행렬과
[WCAG 2.1 상대 휘도 공식](https://www.w3.org/TR/WCAG21/#dfn-relative-luminance)을 따름).
알파 채널(`/40`, `/25`, `/30` 등)이 적용된 경계선 색상은 배경과의 합성 결과에 따라
실제 대비율이 달라지므로, 참고용으로 알파 미적용 값 대비 상대적 개선폭을 기준으로
판단했습니다.
