"""AI service for generating structured CPA bundles."""

from __future__ import annotations

import json
import logging
import random
import re
from typing import Any, Dict, List, Literal, Optional, Tuple, cast

from app.config import settings
from app.schemas.cpa_bundle import (
    AbstractSpec,
    CPABundle,
    ConcreteGroup,
    ConcreteSpec,
    MathCore,
    MathCoreCommon,
    MathCoreSpecific,
    PictorialGroup,
    PictorialSpec,
)
from app.services.ai.cpa_validator import CPABundleValidator
from app.services.ai.ollama_service import OllamaService
from app.services.ai.rag_service import RAGService
from app.services.ai.topic_family import TopicGenerationMetadata

logger = logging.getLogger(__name__)


class CPABundleGenerator:
    """Generate CPA bundles from deterministic math core + constrained AI specs."""

    def __init__(self, rag_service: Optional[RAGService] = None, validator: Optional[CPABundleValidator] = None):
        self._rag = rag_service or RAGService()
        self._validator = validator or CPABundleValidator()

    def generate_bundles(
        self,
        topic_metadata: TopicGenerationMetadata,
        grade: int,
        objective: str,
        count: int = 3,
        existing_math_cores: Optional[List[MathCore]] = None,
    ) -> Tuple[List[CPABundle], List[str]]:
        seeds, rag_sources = self._retrieve_rag_seeds(
            topic=topic_metadata.topic_name,
            grade=grade,
            objective=objective,
        )

        if topic_metadata.content_family == "arithmetic":
            if topic_metadata.operation_family is None:
                return self._generate_number_sense_bundles(topic_metadata, grade, count), rag_sources

            math_cores = (
                existing_math_cores
                if existing_math_cores
                else self._compute_math_cores(
                    topic=topic_metadata.topic_name,
                    grade=grade,
                    count=count,
                    operation_family=topic_metadata.operation_family,
                )
            )

            bundles: List[CPABundle] = []
            for idx, core in enumerate(math_cores[:count]):
                bundle = self._generate_bundle_with_fallback(
                    math_core=core,
                    topic=topic_metadata.topic_name,
                    grade=grade,
                    objective=objective,
                    seeds=seeds,
                    bundle_index=idx,
                )
                bundles.append(bundle)
            return bundles, rag_sources

        if topic_metadata.content_family == "geometry":
            return self._generate_geometry_bundles(topic_metadata, grade, count), rag_sources

        if topic_metadata.content_family == "measurement":
            return self._generate_measurement_bundles(topic_metadata, grade, count), rag_sources

        if topic_metadata.content_family == "number_sense":
            return self._generate_number_sense_bundles(topic_metadata, grade, count), rag_sources

        raise ValueError(f"bundle-v2 has no generator for family '{topic_metadata.content_family}'")

    def _generate_geometry_bundles(
        self,
        topic_metadata: TopicGenerationMetadata,
        grade: int,
        count: int,
    ) -> List[CPABundle]:
        rng = random.Random(abs(hash(f"geo|{topic_metadata.topic_slug}|{grade}|{count}")) % 100000)
        bundles: List[CPABundle] = []

        shape_configs = [
            ("hinh vuong", "square", "#60A5FA"),
            ("hinh tron", "circle", "#34D399"),
            ("hinh tam giac", "square", "#F59E0B"),
        ]

        for index in range(count):
            target_shape, target_symbol, target_color = shape_configs[index % len(shape_configs)]
            distractor_shape, distractor_symbol, distractor_color = shape_configs[(index + 1) % len(shape_configs)]
            target_count = rng.randint(3, 8 if grade == 1 else 12)
            distractor_count = rng.randint(2, 7 if grade == 1 else 10)

            concrete = ConcreteSpec(
                manipulative_type="khoi_vuong",
                groups=[
                    ConcreteGroup(label=f"Nhom {target_shape}", count=target_count, color=target_color),
                    ConcreteGroup(label=f"Nhom {distractor_shape}", count=distractor_count, color=distractor_color),
                ],
                action_instruction=(
                    f"Dat cac the hinh thanh 2 nhom va tap trung vao nhom {target_shape}, "
                    "sau do dem so luong trong nhom do."
                ),
                result_prompt=f"Co bao nhieu {target_shape}?",
                answer=str(target_count),
            )

            pictorial = PictorialSpec(
                diagram_type="dot_array",
                groups=[
                    PictorialGroup(count=target_count, color=target_color, shape=cast(Literal["circle", "square", "bar"], target_symbol)),
                    PictorialGroup(count=distractor_count, color=distractor_color, shape=cast(Literal["circle", "square", "bar"], distractor_symbol)),
                ],
                question_text=f"Nhin hinh va dem so {target_shape} trong so do.",
                answer=str(target_count),
                layout="horizontal",
            )

            abstract = AbstractSpec(
                expression=f"So {target_shape} = ?",
                answer=str(target_count),
                hint="Dem theo tung hinh giong nhau.",
                show_blank=True,
            )

            bundles.append(
                CPABundle(
                    content_family="geometry",
                    family_payload={
                        "task": "identify_and_count_shape",
                        "target_shape": target_shape,
                        "shape_counts": {
                            target_shape: target_count,
                            distractor_shape: distractor_count,
                        },
                        "primary_numbers": [target_count, distractor_count],
                        "expected_answer": str(target_count),
                    },
                    concrete=concrete,
                    pictorial=pictorial,
                    abstract=abstract,
                )
            )

        return bundles

    def _generate_measurement_bundles(
        self,
        topic_metadata: TopicGenerationMetadata,
        grade: int,
        count: int,
    ) -> List[CPABundle]:
        rng = random.Random(abs(hash(f"measure|{topic_metadata.topic_slug}|{grade}|{count}")) % 100000)
        bundles: List[CPABundle] = []

        unit_sets = {
            1: [("do dai", "cm", "cay but"), ("khoi luong", "kg", "tui gao")],
            2: [("do dai", "m", "day nhay"), ("thoi gian", "gio", "buoi hoc")],
            3: [("do dai", "m", "san truong"), ("the tich", "lit", "binh nuoc")],
        }
        selected_units = unit_sets.get(grade, unit_sets[2])

        for index in range(count):
            quantity_type, unit, object_name = selected_units[index % len(selected_units)]
            value = rng.randint(2, 15 if grade == 1 else 30)

            concrete = ConcreteSpec(
                manipulative_type="dong_xu",
                groups=[
                    ConcreteGroup(label=f"Gia tri do duoc ({unit})", count=value, color="#6366F1"),
                ],
                action_instruction=(
                    f"Mo phong thao tac do {object_name}, dat moi the tuong ung voi 1 {unit}, "
                    "sau do dem tong so the."
                ),
                result_prompt=f"{object_name} dai/nang bao nhieu {unit}?",
                answer=str(value),
            )

            pictorial = PictorialSpec(
                diagram_type="bar_model",
                groups=[PictorialGroup(count=value, color="#6366F1", shape="bar")],
                question_text=f"Nhin so do thanh va cho biet gia tri do {quantity_type} theo don vi {unit}.",
                answer=str(value),
                layout="horizontal",
            )

            abstract = AbstractSpec(
                expression=f"{object_name}: ? {unit}",
                answer=str(value),
                hint=f"Doc gia tri tren so do theo don vi {unit}.",
                show_blank=True,
            )

            bundles.append(
                CPABundle(
                    content_family="measurement",
                    family_payload={
                        "task": "read_measurement",
                        "quantity_type": quantity_type,
                        "unit": unit,
                        "object": object_name,
                        "primary_numbers": [value],
                        "expected_answer": str(value),
                    },
                    concrete=concrete,
                    pictorial=pictorial,
                    abstract=abstract,
                )
            )

        return bundles

    def _generate_number_sense_bundles(
        self,
        topic_metadata: TopicGenerationMetadata,
        grade: int,
        count: int,
    ) -> List[CPABundle]:
        """Generate CPA bundles for number sense topics (e.g. 'Cac so den 10', 'Doc viet so')."""
        rng = random.Random(abs(hash(f"ns|{topic_metadata.topic_slug}|{grade}|{count}")) % 100000)
        bundles: List[CPABundle] = []

        slug = topic_metadata.topic_slug
        if "100" in slug:
            max_num = 100
        elif "20" in slug:
            max_num = 20
        else:
            max_num = 10

        tasks = ["count_objects", "order_numbers", "compare_numbers"]

        for index in range(count):
            task = tasks[index % len(tasks)]
            target = rng.randint(2, min(max_num, 10 if grade == 1 else 20))

            if task == "count_objects":
                answer = str(target)
                concrete = ConcreteSpec(
                    manipulative_type="khoi_vuong",
                    groups=[ConcreteGroup(label=f"Nhom {target} vat", count=target, color="#6366F1")],
                    action_instruction=f"Lay {target} khoi vuong, dat thanh 1 nhom va dem lai.",
                    result_prompt="Co bao nhieu khoi vuong?",
                    answer=answer,
                )
                pictorial = PictorialSpec(
                    diagram_type="dot_array",
                    groups=[PictorialGroup(count=target, color="#6366F1", shape="circle")],
                    question_text="Nhin vao hinh va dem so cham tron.",
                    answer=answer,
                    layout="horizontal",
                )
                abstract = AbstractSpec(
                    expression="Co ? vat",
                    answer=answer,
                    hint="Dem tung vat mot.",
                    show_blank=True,
                )

            elif task == "order_numbers":
                sample_max = min(max_num, 20 if grade >= 2 else 10)
                nums = sorted(rng.sample(range(1, sample_max + 1), 3))
                answer = str(nums[-1])
                concrete = ConcreteSpec(
                    manipulative_type="khoi_vuong",
                    groups=[ConcreteGroup(label=f"So {n}", count=n, color="#F59E0B") for n in nums],
                    action_instruction=f"Lay {len(nums)} nhom khoi co so luong khac nhau, sap xep tu it den nhieu.",
                    result_prompt="So lon nhat la so nao?",
                    answer=answer,
                )
                pictorial = PictorialSpec(
                    diagram_type="bar_model",
                    groups=[PictorialGroup(count=n, color="#F59E0B", shape="bar") for n in nums],
                    question_text=f"Nhin so do thanh, so nao lon nhat trong {', '.join(str(n) for n in nums)}?",
                    answer=answer,
                    layout="horizontal",
                )
                abstract = AbstractSpec(
                    expression=f"So lon nhat trong {nums} la ?",
                    answer=answer,
                    hint="So sanh tung so de tim so lon nhat.",
                    show_blank=True,
                )

            else:  # compare_numbers
                a = rng.randint(1, max(1, min(max_num - 1, 9)))
                b = rng.randint(a + 1, min(max_num, a + 5))
                answer = "lon hon"
                concrete = ConcreteSpec(
                    manipulative_type="khoi_vuong",
                    groups=[
                        ConcreteGroup(label=f"So {a}", count=a, color="#10B981"),
                        ConcreteGroup(label=f"So {b}", count=b, color="#EF4444"),
                    ],
                    action_instruction=f"Lay {a} khoi xanh va {b} khoi do. Nhom nao nhieu hon?",
                    result_prompt=f"So {b} so voi so {a} la?",
                    answer=answer,
                )
                pictorial = PictorialSpec(
                    diagram_type="dot_array",
                    groups=[
                        PictorialGroup(count=a, color="#10B981", shape="circle"),
                        PictorialGroup(count=b, color="#EF4444", shape="circle"),
                    ],
                    question_text=f"Nhin 2 hang cham. {b} so voi {a} la?",
                    answer=answer,
                    layout="horizontal",
                )
                abstract = AbstractSpec(
                    expression=f"{b} ... {a}",
                    answer=answer,
                    hint="So sanh hai so bang cach dem so du.",
                    show_blank=True,
                )

            bundles.append(
                CPABundle(
                    content_family="number_sense",
                    family_payload={
                        "task": task,
                        "target_number": target,
                        "max_number": max_num,
                        "expected_answer": answer,
                    },
                    concrete=concrete,
                    pictorial=pictorial,
                    abstract=abstract,
                )
            )

        return bundles

    def _compute_math_cores(
        self,
        topic: str,
        grade: int,
        count: int,
        operation_family: Literal[
            "addition",
            "subtraction",
            "multiplication",
            "division_with_remainder",
        ],
    ) -> List[MathCore]:
        if grade not in (1, 2, 3):
            raise ValueError("grade must be 1, 2, or 3")

        grade_literal = cast(Literal[1, 2, 3], grade)
        seed_value = abs(hash(f"{topic}|{grade}|{count}")) % 100000
        rng = random.Random(seed_value)
        cores: List[MathCore] = []

        for _ in range(count):
            if operation_family == "division_with_remainder":
                divisor = rng.randint(2, 9 if grade >= 2 else 5)
                quotient = rng.randint(2, 10)
                remainder = rng.randint(1, divisor - 1)
                dividend = divisor * quotient + remainder
                core = MathCore(
                    common=MathCoreCommon(
                        topic=topic,
                        grade=grade_literal,
                        operation_family="division_with_remainder",
                        difficulty_band="standard",
                    ),
                    specific=MathCoreSpecific(
                        dividend=dividend,
                        divisor=divisor,
                        quotient=quotient,
                        remainder=remainder,
                    ),
                )
                cores.append(core)
                continue

            if operation_family == "subtraction":
                max_value = 20 if grade == 1 else 100
                operand_a = rng.randint(5, max_value)
                operand_b = rng.randint(1, operand_a - 1)
                result = operand_a - operand_b
                family = "subtraction"
            elif operation_family == "multiplication":
                operand_a = rng.choice([2, 3, 4, 5] if grade <= 2 else [2, 3, 4, 5, 6, 7, 8, 9])
                operand_b = rng.randint(1, 10)
                result = operand_a * operand_b
                family = "multiplication"
            elif operation_family == "addition":
                max_result = 20 if grade == 1 else 100
                operand_a = rng.randint(1, min(50, max_result - 1))
                operand_b = rng.randint(1, max_result - operand_a)
                result = operand_a + operand_b
                family = "addition"
            else:
                raise ValueError("Unsupported operation family for bundle-v1")

            cores.append(
                MathCore(
                    common=MathCoreCommon(
                        topic=topic,
                        grade=grade_literal,
                        operation_family=family,
                        difficulty_band="standard",
                    ),
                    specific=MathCoreSpecific(
                        operand_a=operand_a,
                        operand_b=operand_b,
                        result=result,
                    ),
                )
            )

        return cores

    def _retrieve_rag_seeds(self, topic: str, grade: int, objective: str) -> Tuple[List[str], List[str]]:
        docs = self._rag.retrieve(query=f"Lop {grade} {topic} {objective}", grade=grade, k=3)
        seeds: List[str] = []
        sources: List[str] = []
        for doc in docs:
            content = (doc.page_content or "").strip().replace("\n", " ")
            if content:
                seeds.append(content[:220])
            source = str(doc.metadata.get("source_file", "")) if isinstance(doc.metadata, dict) else ""
            if source:
                sources.append(source)
        unique_sources = sorted(list(set(sources)))
        return seeds, unique_sources

    def _generate_bundle_with_fallback(
        self,
        math_core: MathCore,
        topic: str,
        grade: int,
        objective: str,
        seeds: List[str],
        bundle_index: int,
    ) -> CPABundle:
        max_rounds = max(1, int(getattr(settings, "AI_GEN_MAX_REPAIR_ROUNDS", 2)))

        bundle = self._generate_bundle_once(math_core, topic, grade, objective, seeds, bundle_index)
        result = self._validator.validate(bundle)
        if result.passed:
            return bundle

        # Tier 1: repair invalid bundle with validator feedback.
        for _ in range(max_rounds):
            bundle = self._repair_bundle(bundle, result.issues)
            result = self._validator.validate(bundle)
            if result.passed:
                return bundle

        # Tier 2: regenerate specs with same math_core.
        bundle = self._generate_bundle_once(math_core, topic, grade, objective, seeds, bundle_index)
        result = self._validator.validate(bundle)
        if result.passed:
            return bundle

        # Tier 3: hard fallback to deterministic template.
        return self._hard_fallback_bundle(math_core)

    def _generate_bundle_once(
        self,
        math_core: MathCore,
        topic: str,
        grade: int,
        objective: str,
        seeds: List[str],
        bundle_index: int,
    ) -> CPABundle:
        prompt = self._build_bundle_prompt(math_core, topic, grade, objective, seeds, bundle_index)
        system = (
            "Ban la chuyen gia giao duc Toan tieu hoc Viet Nam. "
            "Sinh JSON object dung schema, khong chen mo ta ngoai JSON. CHI TRA VE JSON HOP LE, KHONG DUNG MARKDOWN."
        )

        response = OllamaService.generate_cloud(
            prompt=prompt,
            system=system,
            temperature=0.2,
            max_tokens=2048,
            format="json",
        )
        payload = self._extract_json_object(response)

        try:
            parsed = json.loads(payload)
        except json.JSONDecodeError:
            return self._hard_fallback_bundle(math_core)

        return self._bundle_from_ai_payload(math_core, parsed)

    def _repair_bundle(self, bundle: CPABundle, issues: List[Any]) -> CPABundle:
        if bundle.math_core is None:
            return bundle

        issue_lines = [f"- {issue.code}: {issue.message}" for issue in issues]
        prompt = "\n".join(
            [
                "Sua JSON CPA bundle sau cho hop le, KHONG doi math_core.",
                "LOI CAN SUA:",
                *issue_lines,
                "OUTPUT CHI LA JSON object voi 3 key: concrete, pictorial, abstract. KHONG GIAI THICH, KHONG DUNG MARKDOWN.",
                json.dumps(
                    {
                        "math_core": bundle.math_core.model_dump(),
                        "concrete": bundle.concrete.model_dump(),
                        "pictorial": bundle.pictorial.model_dump(),
                        "abstract": bundle.abstract.model_dump(),
                    },
                    ensure_ascii=False,
                ),
            ]
        )
        repaired_text = OllamaService.generate_cloud(prompt=prompt, temperature=0.1, max_tokens=2048, format="json")
        payload = self._extract_json_object(repaired_text)

        try:
            parsed = json.loads(payload)
            return self._bundle_from_ai_payload(bundle.math_core, parsed)
        except Exception:
            return bundle

    def _build_bundle_prompt(
        self,
        math_core: MathCore,
        topic: str,
        grade: int,
        objective: str,
        seeds: List[str],
        bundle_index: int,
    ) -> str:
        seed_text = "\n".join(f"- {seed}" for seed in seeds[:3]) or "- khong co seed"
        expected_answer = math_core.expected_answer()

        if math_core.common.operation_family == "division_with_remainder":
            expression = f"{math_core.specific.dividend} : {math_core.specific.divisor} = ? (du ?)"
        else:
            op_map = {"addition": "+", "subtraction": "-", "multiplication": "x"}
            symbol = op_map.get(math_core.common.operation_family, "+")
            expression = f"{math_core.specific.operand_a} {symbol} {math_core.specific.operand_b} = ?"

        return f"""
NHIEM VU: Sinh CPA bundle #{bundle_index + 1} cho hoc sinh lop {grade}.
CHU DE: {topic}
MUC TIEU: {objective}

MATH_CORE (KHONG DUOC DOI SO):
{json.dumps(math_core.model_dump(), ensure_ascii=False)}

SEED VAN PHONG THAM KHAO (chi tham khao ngon ngu):
{seed_text}

YEU CAU:
1) concrete.action_instruction KHONG duoc chua ky hieu toan (+ - = x :).
2) concrete.action_instruction PHAI nhac ro vat that theo manipulative_type (vi du: que tinh/vien bi).
3) pictorial.diagram_type PHAI thuoc: dot_array, bar_model, number_bond, ten_frame.
4) pictorial.question_text PHAI co cue truc quan nhu "nhin hinh", "so do", "khung".
5) abstract.expression PHAI dung so cua math_core, dang goi y: "{expression}".
6) answer cua 3 tang phai dong nhat: "{expected_answer}".

OUTPUT JSON OBJECT:
{{
  "concrete": {{
    "manipulative_type": "que_tinh",
    "groups": [{{"label": "Nhom 1", "count": 1, "color": "#4CAF50"}}, {{"label": "Nhom 2", "count": 1, "color": "#2196F3"}}],
    "action_instruction": "...",
    "result_prompt": "...",
    "answer": "{expected_answer}"
  }},
  "pictorial": {{
    "diagram_type": "dot_array",
    "groups": [{{"count": 1, "color": "#4CAF50", "shape": "circle"}}, {{"count": 1, "color": "#2196F3", "shape": "circle"}}],
    "question_text": "...",
    "answer": "{expected_answer}",
    "layout": "horizontal"
  }},
  "abstract": {{
    "expression": "{expression}",
    "answer": "{expected_answer}",
    "hint": "...",
    "show_blank": true
  }}
}}
TRA VE DUY NHAT JSON OBJECT. KHONG GIAI THICH, KHONG DUNG MARKDOWN.
""".strip()

    def _bundle_from_ai_payload(self, math_core: MathCore, payload: Dict[str, Any]) -> CPABundle:
        expected_answer = math_core.expected_answer()

        concrete_data = payload.get("concrete", {}) if isinstance(payload, dict) else {}
        pictorial_data = payload.get("pictorial", {}) if isinstance(payload, dict) else {}
        abstract_data = payload.get("abstract", {}) if isinstance(payload, dict) else {}

        concrete = ConcreteSpec(
            manipulative_type=concrete_data.get("manipulative_type", "que_tinh"),
            groups=[ConcreteGroup(**group) for group in concrete_data.get("groups", [])],
            action_instruction=concrete_data.get(
                "action_instruction",
                "Dung vat that de tao 2 nhom, thao tac theo yeu cau roi dem ket qua.",
            ),
            result_prompt=concrete_data.get("result_prompt", "Tat ca co ?"),
            answer=str(concrete_data.get("answer", expected_answer)),
        )

        pictorial = PictorialSpec(
            diagram_type=pictorial_data.get("diagram_type", "dot_array"),
            groups=[PictorialGroup(**group) for group in pictorial_data.get("groups", [])],
            question_text=pictorial_data.get("question_text", "Nhin hinh va tim ket qua."),
            answer=str(pictorial_data.get("answer", expected_answer)),
            layout=pictorial_data.get("layout", "horizontal"),
            target=pictorial_data.get("target"),
        )

        abstract = AbstractSpec(
            expression=str(abstract_data.get("expression", self._default_expression(math_core))),
            answer=str(abstract_data.get("answer", expected_answer)),
            hint=abstract_data.get("hint") or "Dem tiep de tim dap an.",
            show_blank=bool(abstract_data.get("show_blank", True)),
        )

        return CPABundle(
            content_family="arithmetic",
            family_payload={
                "operation_family": math_core.common.operation_family,
                "expected_answer": expected_answer,
                "primary_numbers": math_core.primary_numbers(),
            },
            math_core=math_core,
            concrete=concrete,
            pictorial=pictorial,
            abstract=abstract,
        )

    def _hard_fallback_bundle(self, math_core: MathCore) -> CPABundle:
        expected_answer = math_core.expected_answer()
        numbers = math_core.primary_numbers()

        concrete = ConcreteSpec(
            manipulative_type="que_tinh",
            groups=[
                ConcreteGroup(label="Nhom 1", count=max(numbers[0], 0), color="#4CAF50"),
                ConcreteGroup(label="Nhom 2", count=max(numbers[1], 0), color="#2196F3"),
            ],
            action_instruction="Lay cac que tinh theo tung nhom, sau do thao tac va dem ket qua.",
            result_prompt="Ket qua la bao nhieu?",
            answer=expected_answer,
        )

        pictorial = PictorialSpec(
            diagram_type="dot_array",
            groups=[
                PictorialGroup(count=max(numbers[0], 0), color="#4CAF50", shape="circle"),
                PictorialGroup(count=max(numbers[1], 0), color="#2196F3", shape="circle"),
            ],
            question_text="Nhin vao hinh va tra loi ket qua.",
            answer=expected_answer,
            layout="horizontal",
        )

        abstract = AbstractSpec(
            expression=self._default_expression(math_core),
            answer=expected_answer,
            hint="Tinh theo tung buoc ngan gon.",
            show_blank=True,
        )

        return CPABundle(
            content_family="arithmetic",
            family_payload={
                "operation_family": math_core.common.operation_family,
                "expected_answer": expected_answer,
                "primary_numbers": numbers,
            },
            math_core=math_core,
            concrete=concrete,
            pictorial=pictorial,
            abstract=abstract,
        )

    def _default_expression(self, math_core: MathCore) -> str:
        if math_core.common.operation_family == "division_with_remainder":
            return f"{math_core.specific.dividend} : {math_core.specific.divisor} = ? (du ?)"

        symbol_map = {
            "addition": "+",
            "subtraction": "-",
            "multiplication": "x",
        }
        symbol = symbol_map.get(math_core.common.operation_family, "+")
        return f"{math_core.specific.operand_a} {symbol} {math_core.specific.operand_b} = ?"

    def _extract_json_object(self, text: str) -> str:
        if not text:
            return "{}"
        stripped = text.strip()
        if stripped.startswith("{") and stripped.endswith("}"):
            return stripped

        match = re.search(r"\{.*\}", stripped, flags=re.DOTALL)
        if match:
            return match.group(0)
        return "{}"