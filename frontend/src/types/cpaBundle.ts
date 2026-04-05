export type ManipulativeType =
    | 'que_tinh'
    | 'vien_bi'
    | 'khoi_vuong'
    | 'dong_xu'
    | 'trai_cay';

export type DiagramType =
    | 'dot_array'
    | 'bar_model'
    | 'number_bond'
    | 'ten_frame'
    | 'number_line'
    | 'segment';

export type ValidationSeverity = 'info' | 'warning' | 'error';
export type ValidationStatus = 'pending' | 'passed' | 'warning' | 'failed';
export type ContentFamily = 'arithmetic' | 'geometry' | 'measurement' | 'word_problem' | 'data_handling';

export interface MathCoreCommon {
    topic: string;
    grade: 1 | 2 | 3;
    operation_family: 'addition' | 'subtraction' | 'multiplication' | 'division_with_remainder';
    difficulty_band: 'foundation' | 'standard' | 'extension' | 'advanced';
}

export interface MathCoreSpecific {
    operand_a?: number;
    operand_b?: number;
    result?: number;
    dividend?: number;
    divisor?: number;
    quotient?: number;
    remainder?: number;
}

export interface MathCore {
    common: MathCoreCommon;
    specific: MathCoreSpecific;
}

export interface ConcreteGroup {
    label: string;
    count: number;
    color: string;
}

export interface ConcreteSpec {
    manipulative_type: ManipulativeType;
    groups: ConcreteGroup[];
    action_instruction: string;
    result_prompt: string;
    answer: string;
}

export interface PictorialGroup {
    count: number;
    color: string;
    shape: 'circle' | 'square' | 'bar';
}

export interface PictorialSpec {
    diagram_type: DiagramType;
    groups: PictorialGroup[];
    question_text: string;
    answer: string;
    layout: 'horizontal' | 'vertical';
    target?: 'whole' | 'parts';
}

export interface AbstractSpec {
    expression: string;
    answer: string;
    hint?: string;
    show_blank: boolean;
}

export interface ValidationIssue {
    code: string;
    severity: ValidationSeverity;
    message: string;
    layer?: 'math_core' | 'concrete' | 'pictorial' | 'abstract' | 'bundle';
}

export interface CPABundleRendered {
    concrete_html?: string;
    pictorial_svg?: string;
    abstract_latex?: string;
}

export interface CPABundle {
    bundle_id?: string;
    content_family?: ContentFamily;
    family_payload?: Record<string, any>;
    math_core?: MathCore;
    concrete: ConcreteSpec;
    pictorial: PictorialSpec;
    abstract: AbstractSpec;
    validation_status: ValidationStatus;
    validator_messages: ValidationIssue[];
    rendered?: CPABundleRendered;
}

export interface CPABundleGenerationRequest {
    topic_id: number;
    grade: 1 | 2 | 3;
    objective: string;
    bundle_count?: number;
}

export interface CPABundleGenerationResponse {
    bundles: CPABundle[];
    rag_sources: string[];
    generation_mode: 'bundle-v1' | 'bundle-v2';
}

export interface SaveCPABundlesRequest {
    bundles: CPABundle[];
}

export interface SaveCPABundlesResponse {
    worksheet_id: number;
    saved_count: number;
    validation_summary: Record<string, number>;
}