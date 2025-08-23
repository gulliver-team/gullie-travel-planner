import os
import json
import math
from typing import Optional, List

import psycopg2
from fastapi import FastAPI, Request
import logging
from fastapi.responses import PlainTextResponse, JSONResponse, StreamingResponse
from pydantic import BaseModel, Field, conint, confloat, ValidationError
from openai import OpenAI, BadRequestError
from .prompts import build_messages


app = FastAPI(title="HTMX + FastAPI Boilerplate")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/hello", response_class=PlainTextResponse)
def hello() -> str:
    return "Hello from FastAPI 👋"


@app.get("/api/db-ping")
def db_ping():
    dsn: Optional[str] = os.getenv("DATABASE_URL")
    if not dsn:
        return JSONResponse(status_code=500, content={"ok": False, "error": "DATABASE_URL not set"})

    try:
        with psycopg2.connect(dsn) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                one = cur.fetchone()[0]
        return {"ok": True, "result": int(one)}
    except Exception as exc:
        return JSONResponse(status_code=500, content={"ok": False, "error": str(exc)})


@app.post("/api/stream")
async def stream_response(request: Request):
    data = await request.json()
    # Structured fields (preferred)
    start_city = data.get("start_city")
    destination_city = data.get("destination_city")
    budget_range = data.get("budget_range")
    move_month = data.get("move_month")
    context = data.get("context")

    # Fallback freeform prompt support
    prompt: str = data.get("prompt")

    # Scenario may be a label (cheapest, fastest, balanced, luxury) or index
    scenario = data.get("scenario")

    def streamer():
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            yield b'{"error": "Missing OPENAI_API_KEY"}\n'
            return

        client = OpenAI(api_key=api_key)

        try:
            # Build messages: structured or fallback
            if start_city or destination_city or budget_range or move_month or context:
                messages = build_messages(
                    {
                        "start_city": start_city,
                        "destination_city": destination_city,
                        "budget_range": budget_range,
                        "move_month": move_month,
                        "context": context,
                    },
                    str(scenario or "balanced").lower(),
                )
            else:
                # freeform prompt as user content
                messages = [{"role": "user", "content": prompt or "Provide a short sample."}]

            # Use non-streaming response to get structured JSON
            resp = client.responses.create(
                model=os.getenv("OPENAI_MODEL", "gpt-5-nano-2025-08-07"),
                input=messages,
            )
            data = _extract_json_obj(resp)
            if data:
                yield json.dumps(data).encode("utf-8")
            else:
                yield b'{"error": "Failed to parse response"}\n'
        except Exception as exc:
            yield f'{{"error": "{str(exc)}"}}\n'.encode("utf-8")

    return StreamingResponse(streamer(), media_type="application/json")


# =========================
# Timeline generation API
# =========================

class TimelineTask(BaseModel):
    title: str
    desc: Optional[str] = None
    cost_usd: Optional[confloat(ge=0)] = None
    duration_weeks: Optional[confloat(ge=0)] = None
    milestone: Optional[bool] = False


class TimelinePhase(BaseModel):
    name: str
    start_month: Optional[conint(ge=0)] = None
    end_month: Optional[conint(ge=0)] = None
    summary: Optional[str] = None
    tasks: List[TimelineTask] = Field(default_factory=list)


class TimelineResponse(BaseModel):
    headline: Optional[str] = None
    budget_total_usd: Optional[confloat(ge=0)] = None
    timeframe_months: Optional[conint(ge=0)] = None
    phases: List[TimelinePhase] = Field(default_factory=list)
    milestones: Optional[List[dict]] = None
    notes: Optional[str] = None
    confidence: Optional[confloat(ge=0, le=1)] = 0.7


class TimelineRequest(BaseModel):
    scenario_key: Optional[str] = None  # cheapest|balanced|fastest|luxury
    scenario_title: Optional[str] = None
    raw_text: str = Field(..., min_length=1)
    preferences: Optional[dict] = None


def _extract_json_obj(resp):
    """Extract a JSON object (dict) from OpenAI Responses API output.

    Supports both output_text (JSON string) and output_json (native dict) parts.
    """
    # 1) Direct text aggregate
    text = getattr(resp, "output_text", None)
    if isinstance(text, str) and text.strip():
        try:
            return json.loads(text)
        except Exception:
            pass

    # 2) Structured parts
    output = getattr(resp, "output", None)
    try:
        if output and len(output) > 0:
            first = output[0]
            content = getattr(first, "content", None)
            if content and len(content) > 0:
                part = content[0]
                ptype = getattr(part, "type", None)
                if ptype == "output_json":
                    pobj = getattr(part, "json", None)
                    if isinstance(pobj, dict):
                        return pobj
                    # Sometimes it can be a string
                    if isinstance(pobj, str):
                        try:
                            return json.loads(pobj)
                        except Exception:
                            pass
                # Fallback to text field
                ptext = getattr(part, "text", None)
                if isinstance(ptext, str) and ptext.strip():
                    try:
                        return json.loads(ptext)
                    except Exception:
                        pass
    except Exception:
        pass

    # 3) Last resort: find JSON substring in any string form
    blob = str(getattr(resp, "output_text", "") or resp)
    start = blob.find("{")
    end = blob.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(blob[start : end + 1])
        except Exception:
            pass
    return {}


@app.post("/api/timeline")
def build_timeline(req: TimelineRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return JSONResponse(status_code=500, content={"ok": False, "error": "Missing OPENAI_API_KEY"})

    client = OpenAI(api_key=api_key)

    # Clip raw text to avoid over-long prompts
    raw_text = req.raw_text.strip()
    if len(raw_text) > 12000:
        raw_text = raw_text[:12000]

    schema_desc = {
        "headline": "string",
        "budget_total_usd": "number",
        "timeframe_months": "integer",
        "phases": [
            {
                "name": "string",
                "start_month": "integer",
                "end_month": "integer",
                "summary": "string",
                "tasks": [
                    {
                        "title": "string",
                        "desc": "string",
                        "cost_usd": "number",
                        "duration_weeks": "number",
                        "milestone": "boolean",
                    }
                ],
            }
        ],
        "milestones": [
            {"title": "string", "month": "number", "note": "string"}
        ],
        "notes": "string",
        "confidence": "number between 0 and 1",
    }

    system = (
        "You are a relocation timeline extractor. Read the scenario text and produce a concise,"
        " normalized timeline JSON matching the provided schema. Use reasonable defaults when needed."
        " Return strictly valid JSON with no prose."
    )
    user = {
        "scenario_key": req.scenario_key,
        "scenario_title": req.scenario_title,
        "preferences": req.preferences or {},
        "schema": schema_desc,
        "scenario_text": raw_text,
        "rules": [
            "Infer total budget (USD) and timeframe (months) if implied",
            "Limit tasks per phase to at most 6 concise items",
            "Mark key steps as milestone: true",
            "Clamp negative numbers to zero and omit impossible fields",
            "Omit null fields where not applicable",
        ],
    }

    def _round_nonneg_int(x: Optional[float]) -> Optional[int]:
        if x is None:
            return None
        try:
            # Round halves up (0.5 -> 1) and clamp negative to 0
            val = int(math.floor(float(x) + 0.5))
            return max(0, val)
        except Exception:
            return None

    def _coerce_timeline_numbers(obj: dict) -> dict:
        # Coerce timeframe_months
        if isinstance(obj.get("timeframe_months"), (int, float)):
            obj["timeframe_months"] = _round_nonneg_int(obj.get("timeframe_months"))

        # Coerce phases' start/end month to ints
        phases = obj.get("phases")
        if isinstance(phases, list):
            for ph in phases:
                if not isinstance(ph, dict):
                    continue
                sm = _round_nonneg_int(ph.get("start_month")) if ph.get("start_month") is not None else None
                em = _round_nonneg_int(ph.get("end_month")) if ph.get("end_month") is not None else None
                if sm is not None:
                    ph["start_month"] = sm
                if em is not None:
                    ph["end_month"] = em
                # If both exist and end < start, align end to start
                if sm is not None and em is not None and em < sm:
                    ph["end_month"] = sm
        return obj

    try:
        resp = client.responses.create(
            model=os.getenv("OPENAI_MODEL", "gpt-5-nano-2025-08-07"),
            input=[
                {"role": "system", "content": system + " Strictly output JSON only."},
                {"role": "user", "content": json.dumps(user)},
            ],
        )
        data = _extract_json_obj(resp)
        data = _coerce_timeline_numbers(data or {})
        timeline = TimelineResponse(**data)
        return timeline.model_dump()
    except BadRequestError as bre:
        # Fallback to chat.completions for older models/configs
        try:
            chat = client.chat.completions.create(
                model=os.getenv("OPENAI_MODEL", "gpt-5-nano-2025-08-07"),
                messages=[
                    {"role": "system", "content": system + " Strictly output JSON only."},
                    {"role": "user", "content": json.dumps(user)},
                ],
            )
            content = chat.choices[0].message.content if chat.choices else "{}"
            data = json.loads(content or "{}")
            data = _coerce_timeline_numbers(data or {})
            timeline = TimelineResponse(**data)
            return timeline.model_dump()
        except Exception:
            logging.exception("/api/timeline chat fallback failed")
            return JSONResponse(status_code=400, content={"ok": False, "error": str(bre)})
    except ValidationError as ve:
        logging.exception("/api/timeline validation error")
        return JSONResponse(status_code=422, content={"ok": False, "error": "ValidationError", "detail": json.loads(ve.json())})
    except Exception as exc:
        logging.exception("/api/timeline failed")
        return JSONResponse(status_code=500, content={"ok": False, "error": str(exc)})
