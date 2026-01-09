# 감성 예측 로직
import torch

LABEL_MAP = {
    0: "negative",
    1: "neutral",
    2: "positive"
}

def predict_sentiment(text, tokenizer, model):
    """
    감정 분석 수행
    중립 결과가 나왔을 때, 긍정/부정 확률 차이를 확인하여 더 극단적으로 판단
    """
    # 모델과 입력을 CPU로 명시
    model.to("cpu")
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=128
    )
    inputs = {k: v.to("cpu") for k, v in inputs.items()}
    
    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1)
        prob_values = probs[0]  # [negative, neutral, positive]
        
        # 확률값 추출
        neg_prob = float(prob_values[0])
        neu_prob = float(prob_values[1])
        pos_prob = float(prob_values[2])
        
        # 최대 확률 라벨
        score, label_id = torch.max(probs, dim=1)
        predicted_label = LABEL_MAP[label_id.item()]
        confidence = float(score)
        
        # 중립으로 예측된 경우, 긍정/부정 확률 차이를 확인하여 재분류
        if predicted_label == "neutral":
            # 긍정과 부정 확률 차이 계산
            pos_neg_diff = pos_prob - neg_prob
            
            # 중립 확률이 낮고 (0.6 미만), 긍정/부정 확률 차이가 크면 (0.15 이상) 극단적으로 판단
            if confidence < 0.6:
                if pos_neg_diff > 0.15:
                    # 긍정 확률이 부정보다 15%p 이상 높으면 긍정으로 재분류
                    return "positive", pos_prob
                elif pos_neg_diff < -0.15:
                    # 부정 확률이 긍정보다 15%p 이상 높으면 부정으로 재분류
                    return "negative", neg_prob
                # 차이가 작으면 중립 유지 (confidence가 낮을 때만)
                if confidence < 0.5:
                    # 중립 확률이 50% 미만이면 더 극단적으로 판단
                    if pos_prob > neg_prob:
                        return "positive", pos_prob
                    else:
                        return "negative", neg_prob

    return predicted_label, confidence