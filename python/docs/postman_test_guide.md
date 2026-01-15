# Postman으로 테스트용 raw_data 업로드 가이드

## 엔드포인트

**POST** `http://localhost:8000/api/process`

## 요청 방법

### 1. Headers
```
Content-Type: application/json
```

### 2. Body (raw JSON)

테스트용 raw_data JSON을 그대로 복사해서 Body에 넣습니다.

```json
{
  "brands": [
    {
      "brandId": 1,
      "brandName": "테스트 브랜드",
      "brandData": [],
      "projectKeywords": [
        {
          "projectKeywordId": 101,
          "projectId": 1,
          "keyword": "나이키 에어맥스",
          "data": [
            {
              "source": "NAVER",
              "title": "나이키 에어맥스 배송이 너무 늦어요",
              "text": "나이키 에어맥스 주문했는데 배송이 2주나 걸렸어요...",
              "url": "https://blog.naver.com/test/1",
              "publishedAt": "2026-01-15T10:00:00Z",
              "collectedAt": "2026-01-15T12:00:00Z",
              "brandId": 1,
              "projectKeywordId": 101,
              "projectId": 1,
              "competitorId": null,
              "type": "PROJECT",
              "sentiment": "NEG",
              "tokens": ["배송", "늦다", "배송비", "비싸다"]
            }
          ]
        }
      ],
      "competitors": []
    }
  ]
}
```

## 응답 예시

### 성공
```json
{
  "status": "success",
  "message": "raw_data 업로드 및 저장 완료",
  "file": "raw_data/raw_data_20260115_1200.json",
  "brands_count": 1
}
```

### 실패
```json
{
  "status": "error",
  "message": "잘못된 raw_data 형식입니다. 'brands' 필드가 필요합니다."
}
```

## 테스트 데이터 파일

테스트용 raw_data는 다음 파일에 있습니다:
- `python/raw_data/raw_data_test_strategy.json`

이 파일의 내용을 복사해서 Postman Body에 넣으면 됩니다.

### 테스트 데이터 ID 정보
- **brandId**: 4
- **projectId**: 7
- **projectKeywordId**: 1

## 테스트 시나리오

1. **Postman으로 raw_data 업로드**
   - POST `http://localhost:8000/api/process`
   - Body에 `raw_data_test_strategy.json` 내용 복사

2. **전략 분석 API 테스트**
   - POST `http://localhost:8000/rag/ask-strategy`
   - Body:
     ```json
     {
       "brandId": 1,
       "brandName": "테스트 브랜드",
       "projectId": 1,
       "question": "배송 문제가 많은데 해결책을 제안해줘",
       "projectKeywordIds": [101, 102, 103],
       "topK": 3
     }
     ```

## 주의사항

- 업로드된 raw_data는 당일 파일로 저장됩니다
- 기존 당일 파일이 있으면 덮어씌워집니다
- `sentiment` 필드가 있어야 감정분석 통계 추출이 가능합니다
- `tokens` 필드가 있어야 부정 키워드 추출이 가능합니다

