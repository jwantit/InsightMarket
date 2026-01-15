# KoBERT 로더 
import os
from transformers import BertTokenizer, BertForSequenceClassification

MODEL_NAME = "monologg/kobert"

def load_kobert():
    os.environ["TOKENIZERS_PARALLELISM"] = "false"

    print("[KoBERT] tokenizer start (BertTokenizer)", flush=True)
    tokenizer = BertTokenizer.from_pretrained(MODEL_NAME)
    print("[KoBERT] tokenizer done", flush=True)

    print("[KoBERT] model start", flush=True)
    model = BertForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=3
    )
    print("[KoBERT] model loaded", flush=True)

    model.to("cpu")
    model.eval()
    print("[KoBERT] model ready", flush=True)
    return tokenizer, model
