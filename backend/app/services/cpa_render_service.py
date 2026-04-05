"""Render CPA specs into lightweight HTML/SVG for preview."""

from __future__ import annotations

import html
from typing import List

from app.schemas.cpa_bundle import AbstractSpec, ConcreteSpec, PictorialGroup, PictorialSpec


class CPARenderService:
    """Pure rendering layer, independent from AI pipeline."""

    _symbol_map = {
        "que_tinh": "|",
        "vien_bi": "●",
        "khoi_vuong": "■",
        "dong_xu": "◉",
        "trai_cay": "○",
    }

    def render_concrete_html(self, spec: ConcreteSpec) -> str:
        symbol = self._symbol_map.get(spec.manipulative_type, "●")
        group_lines = []
        for group in spec.groups:
            tokens = " ".join([symbol for _ in range(max(group.count, 0))])
            group_lines.append(
                f"<div><strong>{html.escape(group.label)}:</strong> "
                f"<span style='color:{html.escape(group.color)}'>{tokens}</span></div>"
            )

        return "".join(
            [
                "<div class='cpa-concrete'>",
                f"<p>{html.escape(spec.action_instruction)}</p>",
                "<div class='cpa-groups'>",
                *group_lines,
                "</div>",
                f"<p><em>{html.escape(spec.result_prompt)}</em></p>",
                "</div>",
            ]
        )

    def render_pictorial_svg(self, spec: PictorialSpec) -> str:
        if spec.diagram_type == "dot_array":
            return self._render_dot_array(spec.groups, spec.layout)
        if spec.diagram_type == "bar_model":
            return self._render_bar_model(spec.groups)
        if spec.diagram_type == "number_bond":
            return self._render_number_bond(spec.groups)
        if spec.diagram_type == "ten_frame":
            return self._render_ten_frame(spec.groups)
        return self._render_dot_array(spec.groups, spec.layout)

    def render_abstract_latex(self, spec: AbstractSpec) -> str:
        return spec.expression

    def _render_dot_array(self, groups: List[PictorialGroup], layout: str) -> str:
        x = 20
        y = 25
        dot_radius = 5
        gap = 14
        svg_parts = ["<svg xmlns='http://www.w3.org/2000/svg' width='480' height='180' viewBox='0 0 480 180'>"]

        for group in groups:
            for idx in range(group.count):
                cx = x + (idx % 12) * gap
                cy = y + (idx // 12) * gap
                svg_parts.append(
                    f"<circle cx='{cx}' cy='{cy}' r='{dot_radius}' fill='{html.escape(group.color)}' />"
                )

            if layout == "vertical":
                y += 48
            else:
                x += 180

        svg_parts.append("</svg>")
        return "".join(svg_parts)

    def _render_bar_model(self, groups: List[PictorialGroup]) -> str:
        scale = 8
        y = 20
        svg_parts = ["<svg xmlns='http://www.w3.org/2000/svg' width='520' height='160' viewBox='0 0 520 160'>"]

        for group in groups:
            width = max(20, group.count * scale)
            svg_parts.append(
                f"<rect x='20' y='{y}' width='{width}' height='24' fill='{html.escape(group.color)}' rx='4' />"
            )
            svg_parts.append(
                f"<text x='{30 + width}' y='{y + 16}' font-size='12' fill='#334155'>{group.count}</text>"
            )
            y += 34

        svg_parts.append("</svg>")
        return "".join(svg_parts)

    def _render_number_bond(self, groups: List[PictorialGroup]) -> str:
        total = sum(g.count for g in groups)
        left = groups[0].count if groups else 0
        right = groups[1].count if len(groups) > 1 else 0
        return (
            "<svg xmlns='http://www.w3.org/2000/svg' width='380' height='200' viewBox='0 0 380 200'>"
            "<circle cx='190' cy='50' r='28' fill='#E2E8F0' />"
            f"<text x='182' y='56' font-size='14'>{total}</text>"
            "<line x1='170' y1='72' x2='110' y2='130' stroke='#64748B' />"
            "<line x1='210' y1='72' x2='270' y2='130' stroke='#64748B' />"
            "<circle cx='100' cy='140' r='24' fill='#DBEAFE' />"
            "<circle cx='280' cy='140' r='24' fill='#DCFCE7' />"
            f"<text x='94' y='146' font-size='13'>{left}</text>"
            f"<text x='274' y='146' font-size='13'>{right}</text>"
            "</svg>"
        )

    def _render_ten_frame(self, groups: List[PictorialGroup]) -> str:
        dots = []
        counts = []
        for group in groups:
            counts.extend([group.color] * group.count)

        for idx in range(min(len(counts), 20)):
            row = idx // 10
            col = idx % 10
            x = 20 + col * 24
            y = 20 + row * 32
            dots.append(f"<rect x='{x}' y='{y}' width='20' height='20' fill='{counts[idx]}' rx='3' />")

        grid = []
        for idx in range(20):
            row = idx // 10
            col = idx % 10
            x = 20 + col * 24
            y = 20 + row * 32
            grid.append(f"<rect x='{x}' y='{y}' width='20' height='20' fill='none' stroke='#CBD5E1' rx='3' />")

        return (
            "<svg xmlns='http://www.w3.org/2000/svg' width='300' height='110' viewBox='0 0 300 110'>"
            + "".join(grid)
            + "".join(dots)
            + "</svg>"
        )