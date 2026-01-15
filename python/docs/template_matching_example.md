# 벡터 → 템플릿 매칭 예시

## 시나리오: 나이키 프로젝트의 감정분석 결과

### 1단계: 감정분석 통계 데이터 수집

```json
{
  "projectId": 7,
  "projectName": "나이키 런칭 캠페인",
  "keywords": [
    {
      "keyword": "나이키 에어맥스",
      "mentionCount": 150,
      "sentiment": {
        "positive": 30.0,  // 30%
        "negative": 65.0,   // 65%
        "neutral": 5.0     // 5%
      },
      "topTokens": ["가격", "비싸다", "품질", "불만", "배송"]
    },
    {
      "keyword": "나이키 운동화",
      "mentionCount": 200,
      "sentiment": {
        "positive": 20.0,
        "negative": 70.0,
        "neutral": 10.0
      },
      "topTokens": ["가격", "비싸다", "경쟁사", "할인", "프리미엄"]
    },
    {
      "keyword": "나이키 신발",
      "mentionCount": 100,
      "sentiment": {
        "positive": 40.0,
        "negative": 50.0,
        "neutral": 10.0
      },
      "topTokens": ["배송", "지연", "품질", "만족", "서비스"]
    }
  ]
}
```

### 2단계: 감정분석 결과를 텍스트로 요약

```python
# 감정분석 통계를 자연어로 변환
summary_text = """
프로젝트 '나이키 런칭 캠페인'의 분석 결과:
- 총 언급량: 450건
- 부정 반응 비율: 65% (높음)
- 긍정 반응 비율: 25% (낮음)
- 중립 반응 비율: 10%

주요 키워드별 이슈:
1. 나이키 에어맥스: 가격 관련 부정 반응 65%, 주요 토큰: 가격, 비싸다, 품질, 불만
2. 나이키 운동화: 가격 경쟁력 부족 70%, 주요 토큰: 가격, 비싸다, 경쟁사, 할인
3. 나이키 신발: 배송 지연 문제 50%, 주요 토큰: 배송, 지연, 품질

핵심 문제점:
- 가격에 대한 불만이 매우 높음 (평균 67.5%)
- 경쟁사 대비 가격 경쟁력 부족
- 배송 지연 문제 발생
- 품질에 대한 일부 불만 존재
"""
```

### 3단계: 요약 텍스트를 벡터로 변환

```python
from sentence_transformers import SentenceTransformer

embed_model = SentenceTransformer("nlpai-lab/KoE5")

# 요약 텍스트를 벡터로 변환
query_vector = embed_model.encode([summary_text], normalize_embeddings=True)[0].tolist()
# 결과: [0.123, -0.456, 0.789, ..., 0.234] (768차원 벡터)
```

### 4단계: 템플릿 데이터 구조 (Qdrant에 저장된 형태)

```json
{
  "id": "cause_001",
  "vector": [0.125, -0.450, 0.785, ..., 0.230],  // 벡터 임베딩
  "payload": {
    "type": "cause",
    "id": "cause_001",
    "title": "가격 경쟁력 부족",
    "description": "경쟁사 대비 가격 경쟁력이 떨어지는 문제",
    "examples": ["가격이 비싸다", "경쟁사보다 비싸다", "가격 경쟁력 부족", "비싼 가격"],
    "category": "pricing",
    "keywords": ["가격", "비싸다", "경쟁력", "비용", "할인"],
    "text_for_embedding": "가격 경쟁력 부족 경쟁사 대비 가격 경쟁력이 떨어지는 문제 가격이 비싸다 경쟁사보다 비싸다 가격 경쟁력 부족 비싼 가격 가격 비싸다 경쟁력 비용 할인"
  },
  "score": 0.0  // 검색 시 유사도 점수로 채워짐
}
```

### 5단계: Qdrant 벡터 유사도 검색

```python
# Qdrant에서 유사한 템플릿 검색
search_results = [
    {
        "id": "cause_001",
        "score": 0.89,  # 유사도 점수 (높을수록 유사)
        "payload": {
            "type": "cause",
            "title": "가격 경쟁력 부족",
            "description": "경쟁사 대비 가격 경쟁력이 떨어지는 문제",
            "category": "pricing"
        }
    },
    {
        "id": "cause_004",
        "score": 0.72,
        "payload": {
            "type": "cause",
            "title": "배송 지연 및 문제",
            "description": "배송이 지연되거나 배송 관련 문제가 발생하는 원인",
            "category": "logistics"
        }
    },
    {
        "id": "cause_002",
        "score": 0.65,
        "payload": {
            "type": "cause",
            "title": "제품 품질 문제",
            "description": "제품의 품질이 기대에 못 미치는 문제",
            "category": "quality"
        }
    }
]
```

### 6단계: 매칭된 템플릿에서 솔루션 추출

```python
# 문제점 템플릿에 매칭된 솔루션 템플릿 검색
# cause_001 (가격 경쟁력 부족) → sol_001 (가격 전략 개선)
# cause_004 (배송 지연) → sol_005 (배송 및 물류 개선)
# cause_002 (품질 문제) → sol_002 (제품 품질 개선)

matched_solutions = [
    {
        "id": "sol_001",
        "score": 0.91,
        "payload": {
            "type": "solution",
            "title": "가격 전략 개선",
            "description": "가격 관련 문제 해결을 위한 전략",
            "examples": ["가격 인하", "할인 전략", "프리미엄 포지셔닝", "가격 경쟁력 강화"],
            "category": "pricing",
            "keywords": ["가격", "비용", "할인", "프리미엄", "경쟁력"]
        }
    },
    {
        "id": "sol_005",
        "score": 0.78,
        "payload": {
            "type": "solution",
            "title": "배송 및 물류 개선",
            "description": "배송 및 물류 관련 문제 해결을 위한 전략",
            "examples": ["배송 속도 개선", "배송비 절감", "물류 효율화", "배송 서비스 강화"],
            "category": "logistics"
        }
    },
    {
        "id": "sol_002",
        "score": 0.68,
        "payload": {
            "type": "solution",
            "title": "제품 품질 개선",
            "description": "제품 품질 관련 문제 해결을 위한 전략",
            "examples": ["품질 향상", "제품 개선", "품질 관리", "불만 해소"],
            "category": "quality"
        }
    }
]
```

### 7단계: 최종 결과 반환

```json
{
  "ok": true,
  "data": {
    "insights": [
      {
        "id": "insight_001",
        "title": "가격 민감도 분석",
        "description": "고객의 가격에 대한 민감도 및 반응 분석",
        "score": 0.85
      }
    ],
    "problems": [
      {
        "id": "cause_001",
        "title": "가격 경쟁력 부족",
        "description": "경쟁사 대비 가격 경쟁력이 떨어지는 문제",
        "score": 0.89,
        "statistics": {
          "mentionCount": 350,
          "negativeRatio": 67.5
        }
      },
      {
        "id": "cause_004",
        "title": "배송 지연 및 문제",
        "description": "배송이 지연되거나 배송 관련 문제가 발생하는 원인",
        "score": 0.72,
        "statistics": {
          "mentionCount": 100,
          "negativeRatio": 50.0
        }
      },
      {
        "id": "cause_002",
        "title": "제품 품질 문제",
        "description": "제품의 품질이 기대에 못 미치는 문제",
        "score": 0.65,
        "statistics": {
          "mentionCount": 80,
          "negativeRatio": 45.0
        }
      }
    ],
    "solutions": [
      {
        "id": "sol_001",
        "title": "가격 전략 개선",
        "description": "가격 관련 문제 해결을 위한 전략",
        "examples": ["가격 인하", "할인 전략", "프리미엄 포지셔닝", "가격 경쟁력 강화"],
        "score": 0.91,
        "matchedProblem": "cause_001"
      },
      {
        "id": "sol_005",
        "title": "배송 및 물류 개선",
        "description": "배송 및 물류 관련 문제 해결을 위한 전략",
        "examples": ["배송 속도 개선", "배송비 절감", "물류 효율화", "배송 서비스 강화"],
        "score": 0.78,
        "matchedProblem": "cause_004"
      },
      {
        "id": "sol_002",
        "title": "제품 품질 개선",
        "description": "제품 품질 관련 문제 해결을 위한 전략",
        "examples": ["품질 향상", "제품 개선", "품질 관리", "불만 해소"],
        "score": 0.68,
        "matchedProblem": "cause_002"
      }
    ]
  }
}
```

## 매칭 로직 상세

### 템플릿 임베딩 생성 방법

```python
# 템플릿 데이터를 하나의 텍스트로 결합
def create_template_text(template):
    parts = [
        template["title"],
        template["description"],
        " ".join(template.get("examples", [])),
        " ".join(template.get("keywords", []))
    ]
    return " ".join(parts)

# 예시:
# "가격 경쟁력 부족 경쟁사 대비 가격 경쟁력이 떨어지는 문제 가격이 비싸다 경쟁사보다 비싸다 가격 경쟁력 부족 비싼 가격 가격 비싸다 경쟁력 비용 할인"
```

### 유사도 점수 해석

- **0.8 이상**: 매우 유사 (강력한 매칭)
- **0.6 ~ 0.8**: 유사 (적절한 매칭)
- **0.4 ~ 0.6**: 약간 유사 (보완 검토 필요)
- **0.4 미만**: 유사하지 않음 (제외)

### 매칭 우선순위

1. **문제점 매칭**: 감정분석 요약 → 문제점 템플릿 (top 3)
2. **솔루션 매칭**: 매칭된 문제점의 category → 솔루션 템플릿 (top 3)
3. **인사이트 매칭**: 전체 요약 → 인사이트 템플릿 (top 3)

## 실제 코드 예시

```python
# python/app/services/strategy/template_matcher.py

def match_templates(sentiment_summary: str, embed_model, qdrant_client):
    # 1. 요약 텍스트를 벡터로 변환
    query_vector = embed_model.encode([sentiment_summary])[0].tolist()
    
    # 2. 문제점 템플릿 검색
    problem_results = qdrant_client.search(
        collection_name="strategy_templates",
        query_vector=query_vector,
        query_filter={"must": [{"key": "type", "match": {"value": "cause"}}]},
        limit=3
    )
    
    # 3. 매칭된 문제점의 카테고리로 솔루션 검색
    solutions = []
    for problem in problem_results:
        category = problem.payload["category"]
        solution_results = qdrant_client.search(
            collection_name="strategy_templates",
            query_vector=query_vector,
            query_filter={
                "must": [
                    {"key": "type", "match": {"value": "solution"}},
                    {"key": "category", "match": {"value": category}}
                ]
            },
            limit=1
        )
        if solution_results:
            solutions.append({
                **solution_results[0].payload,
                "matchedProblem": problem.payload["id"],
                "score": solution_results[0].score
            })
    
    return {
        "problems": [p.payload for p in problem_results],
        "solutions": solutions
    }
```

