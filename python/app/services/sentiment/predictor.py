# 감성 예측 로직
import torch

LABEL_MAP = {
    0: "negative",
    1: "neutral",
    2: "positive"
}

def predict_sentiment(text, tokenizer, model):
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
        score, label_id = torch.max(probs, dim=1)

    return LABEL_MAP[label_id.item()], float(score)