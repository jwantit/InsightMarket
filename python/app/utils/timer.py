# [기능] 코드 블록의 실행시간 측정(항상 end 로그 보장)
import time
from contextlib import contextmanager

@contextmanager
def timer(name: str, log_fn):
    t0 = time.perf_counter()
    log_fn(f"{name} start")
    try:
        yield
        sec = time.perf_counter() - t0
        log_fn(f"{name} end elapsed_s={sec:.2f}")
    except Exception as e:
        sec = time.perf_counter() - t0
        log_fn(f"{name} failed elapsed_s={sec:.2f} err={type(e).__name__}: {e}")
        raise
