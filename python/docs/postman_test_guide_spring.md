# Postman 테스트 가이드 (Spring Boot)

## 1. Raw Data 업로드 (Python 서버)

먼저 Python 서버에 raw_data를 업로드합니다.

**URL**: `POST http://localhost:8000/api/process`

**Headers**:
```
Content-Type: application/json
```

**Body** (raw JSON):
- `python/raw_data/raw_data_test_strategy.json` 파일 전체 내용 복사해서 붙여넣기

**응답 예시**:
```json
{
  "status": "success",
  "message": "raw_data 업로드 및 저장 완료",
  "file": "raw_data/raw_data_20260115_1200.json",
  "brands_count": 1
}
```

---

## 2. 분석 처리 (Spring Boot 서버)

업로드된 raw_data 파일을 분석하고 DB에 저장합니다.

**URL**: `POST http://localhost:8080/api/analytics/process`

**Headers**:
```
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "filePath": "raw_data/raw_data_20260115_1200.json",
  "brandId": 4
}
```

**참고**: 
- `filePath`는 Python 서버의 `raw_data` 디렉토리 기준 상대 경로입니다
- 위 1번 단계에서 받은 `file` 값을 사용하면 됩니다

**응답 예시**:
```json
{
  "status": "success",
  "daily_stats": [...],
  "sentiment_stats": [...],
  "token_stats": [...],
  "baseline_stats": [...],
  "insights": [...]
}
```

---

## 3. 전략 분석 API 테스트 (Spring Boot 서버)

**URL**: `POST http://localhost:8080/api/4/ai/ask`

**Headers**:
```
Content-Type: application/json
```

**Body** (raw JSON):
```json
{
  "projectId": 7,
  "question": "배송 문제가 많은데 해결책을 제안해줘",
  "topK": 3
}
```

**참고**: 
- URL의 `4`는 brandId입니다
- `projectId`는 필수입니다

---

## 테스트 데이터 정보

- **brandId**: 4
- **projectId**: 7
- **projectKeywordId**: 1
- **파일 경로**: `python/raw_data/raw_data_test_strategy.json`

---

## 전체 테스트 순서

1. **Python 서버에 raw_data 업로드**
   - `POST http://localhost:8000/api/process`
   - Body에 `raw_data_test_strategy.json` 내용 복사

2. **Spring Boot 서버로 분석 요청**
   - `POST http://localhost:8080/api/analytics/process`
   - Body에 `filePath`와 `brandId` 전달

3. **전략 분석 API 테스트**
   - `POST http://localhost:8080/api/4/ai/ask`
   - Body에 `projectId`, `question`, `topK` 전달

