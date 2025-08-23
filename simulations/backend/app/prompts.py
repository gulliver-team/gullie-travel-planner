from typing import Dict, List


SCENARIO_LABELS = {
    "cheapest": "The Frugal Mover",
    "balanced": "The Balanced Mover",
    "fastest": "The Fast-Track Mover",
    "luxury": "The Premier Mover",
}


def build_messages(payload: Dict, scenario: str) -> List[Dict]:
    """Build OpenAI Responses API messages from structured inputs and scenario.

    Returns a list of dicts with role/content, suitable for the `input` parameter.
    """
    start = (payload.get("start_city") or "").strip()
    dest = (payload.get("destination_city") or "").strip()
    budget = (payload.get("budget_range") or "").strip()
    month = (payload.get("move_month") or "").strip()
    context = (payload.get("context") or "").strip()

    scenario_label = SCENARIO_LABELS.get(scenario, scenario.title())

    scenario_bias = {
        "cheapest": (
            "Prioritize minimizing cost. Prefer DIY options, budget flights,"
            " shared or modest housing, and longer timelines if it saves money."
        ),
        "balanced": (
            "Balance cost, time, and convenience. Choose realistic, middle-of-the-road"
            " options likely for most movers."
        ),
        "fastest": (
            "Prioritize speed. Use approaches that reduce waiting time even at higher cost;"
            " consider premium processing, temporary housing to accelerate arrival, etc."
        ),
        "luxury": (
            "Prioritize convenience and service quality. Assume use of relocation agents,"
            " premium services, and higher budgets to reduce stress and delays."
        ),
    }.get(scenario, "Balance cost, time, and convenience.")

    system = f"""
ROLE AND GOAL
You are an expert relocation logistics simulator. Your goal is to generate one distinct, realistic simulation for the mover based on the provided inputs and the specified scenario style.

CORE VARIABLES (INPUTS)
- Profile: Not provided explicitly; infer a reasonable baseline family profile unless context specifies otherwise.
- Origin: {start}
- Destination: {dest}
- Budget Range: {budget}
- Ideal Move Month: {month}
- Additional Context: {context}

SIMULATION LOGIC (PROCESS)
For the destination, simulate the full relocation process and estimate both cost and time for:
1) Visa & Immigration (path, docs, processing times, fees)
2) Pet Relocation (requirements, costs, timeline) if relevant
3) Housing (rental process, average rent, deposits, agent fees)
4) Cost of Living Adjustment (salary vs. taxes and expenses)
5) Setup Costs (shipping, flights, temporary housing)
6) Timeline Estimation (Gantt-style phases with dependencies)

SCENARIO STYLE
Scenario: {scenario_label}
Guidance: {scenario_bias}

OUTPUT FORMAT
Return a structured JSON response with:
- headline: Short title for the scenario
- budget_total_usd: Total estimated cost in USD
- timeframe_months: Timeline in months
- phases: Array of phase objects with tasks
- feasibility_score: 1-10 rating
- pros: Array of major advantages
- cons: Array of major disadvantages
""".strip()

    user = (
        "Using the inputs above, produce the simulation. Be concrete and avoid filler."
    )

    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]

