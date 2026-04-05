import api from './api';
import type {
    CPABundle,
    CPABundleGenerationRequest,
    CPABundleGenerationResponse,
    SaveCPABundlesResponse,
} from '@/types/cpaBundle';


export const cpaBundleApi = {
    generateBundles: async (
        request: CPABundleGenerationRequest
    ): Promise<CPABundleGenerationResponse> => {
        const { data } = await api.post<CPABundleGenerationResponse>('/ai/generate-cpa-bundle', request);
        return data;
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