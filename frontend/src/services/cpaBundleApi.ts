import api from './api';
import aiApi from './aiApi';
import type {
    CPABundle,
    CPABundleGenerationRequest,
    CPABundleGenerationResponse,
    SaveCPABundlesResponse,
} from '@/types/cpaBundle';

type LegacyQuestionItem = {
    question: string;
    answer: string;
    hint?: string;
};

type LegacyCPAResponse = {
    concrete: LegacyQuestionItem[];
    pictorial: LegacyQuestionItem[];
    abstract: LegacyQuestionItem[];
    rag_sources?: string[];
};

const makeDefaultQuestion = (label: string): LegacyQuestionItem => ({
    question: `${label}: Vui long tao lai noi dung cho phu hop.`,
    answer: '',
    hint: '',
});

const buildFallbackBundles = (
    payload: LegacyCPAResponse,
    bundleCount: number,
): CPABundleGenerationResponse => {
    const concreteItems = payload.concrete || [];
    const pictorialItems = payload.pictorial || [];
    const abstractItems = payload.abstract || [];

    const maxLength = Math.max(bundleCount, concreteItems.length, pictorialItems.length, abstractItems.length, 1);

    const bundles: CPABundle[] = Array.from({ length: maxLength }).map((_, index) => {
        const concrete = concreteItems[index] || concreteItems[0] || makeDefaultQuestion('Concrete');
        const pictorial = pictorialItems[index] || pictorialItems[0] || makeDefaultQuestion('Pictorial');
        const abstract = abstractItems[index] || abstractItems[0] || makeDefaultQuestion('Abstract');

        return {
            bundle_id: `legacy-${index + 1}`,
            content_family: 'arithmetic',
            concrete: {
                manipulative_type: 'que_tinh',
                groups: [{ label: 'Nhom mau', count: 1, color: '#F97316' }],
                action_instruction: concrete.question,
                result_prompt: concrete.hint || 'Tim dap an phu hop.',
                answer: concrete.answer,
            },
            pictorial: {
                diagram_type: 'dot_array',
                groups: [{ count: 1, color: '#0EA5E9', shape: 'circle' }],
                question_text: pictorial.question,
                answer: pictorial.answer,
                layout: 'horizontal',
            },
            abstract: {
                expression: abstract.question,
                answer: abstract.answer,
                hint: abstract.hint || undefined,
                show_blank: true,
            },
            validation_status: 'warning',
            validator_messages: [
                {
                    code: 'legacy_fallback',
                    severity: 'warning',
                    message: 'Chu de chua ho tro bundle-v2. He thong da dung che do tuong thich generate-cpa.',
                    layer: 'bundle',
                },
            ],
        };
    });

    return {
        bundles,
        rag_sources: payload.rag_sources || [],
        generation_mode: 'bundle-v1',
    };
};


export const cpaBundleApi = {
    generateBundlesFromLegacy: async (
        request: CPABundleGenerationRequest
    ): Promise<CPABundleGenerationResponse> => {
        const legacyResult = (await aiApi.generateCPA({
            topic_id: request.topic_id,
            grade: request.grade,
            objective: request.objective,
            counts: {
                concrete: request.bundle_count ?? 3,
                pictorial: request.bundle_count ?? 3,
                abstract: request.bundle_count ?? 3,
            },
        })) as LegacyCPAResponse;

        return buildFallbackBundles(legacyResult, request.bundle_count ?? 3);
    },

    generateBundles: async (
        request: CPABundleGenerationRequest
    ): Promise<CPABundleGenerationResponse> => {
        try {
            const { data } = await api.post<CPABundleGenerationResponse>('/ai/generate-cpa-bundle', request);
            return data;
        } catch (error: any) {
            const statusCode = error?.response?.status;
            const detail = error?.response?.data?.detail;
            const errorCode = typeof detail === 'object' ? detail?.error_code : undefined;

            if (statusCode !== 422 || errorCode !== 'unsupported_bundle_family') {
                throw error;
            }

            return cpaBundleApi.generateBundlesFromLegacy(request);
        }
    },

    saveBundles: async (
        worksheetId: number,
        bundles: CPABundle[]
    ): Promise<SaveCPABundlesResponse> => {
        const { data } = await api.post<SaveCPABundlesResponse>(
            `/ai/worksheets/${worksheetId}/cpa-bundles`,
            { bundles }
        );
        return data;
    },

    getBundles: async (worksheetId: number): Promise<CPABundle[]> => {
        const { data } = await api.get<CPABundle[]>(`/ai/worksheets/${worksheetId}/cpa-bundles`);
        return data;
    },
};

export default cpaBundleApi;