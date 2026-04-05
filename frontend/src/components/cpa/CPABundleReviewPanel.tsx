import { CheckCheck, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CPABundle } from '@/types/cpaBundle';
import { CPABundleCard, type BundleReviewStatus } from './CPABundleCard';

interface CPABundleReviewPanelProps {
    bundles: CPABundle[];
    reviewStatuses: Record<string, BundleReviewStatus>;
    dirtyBundleMap: Record<string, boolean>;
    onBundleChange: (index: number, nextBundle: CPABundle) => void;
    onStatusChange: (bundleKey: string, nextStatus: BundleReviewStatus) => void;
    onApproveAll: () => void;
    onResetAll: () => void;
}

const bundleKeyOf = (bundle: CPABundle, index: number) => bundle.bundle_id || `bundle-${index}`;

export function CPABundleReviewPanel({
    bundles,
    reviewStatuses,
    dirtyBundleMap,
    onBundleChange,
    onStatusChange,
    onApproveAll,
    onResetAll,
}: CPABundleReviewPanelProps) {
    const approvedCount = bundles.filter((bundle, index) => reviewStatuses[bundleKeyOf(bundle, index)] === 'approved').length;
    const rejectedCount = bundles.filter((bundle, index) => reviewStatuses[bundleKeyOf(bundle, index)] === 'rejected').length;
    const pendingCount = bundles.length - approvedCount - rejectedCount;
    const dirtyApprovedCount = bundles.filter(
        (bundle, index) =>
            reviewStatuses[bundleKeyOf(bundle, index)] === 'approved' &&
            Boolean(dirtyBundleMap[bundleKeyOf(bundle, index)])
    ).length;

    return (
        <Card className="glass-panel border-white/60 rounded-3xl overflow-hidden shadow-soft-lg">
            <CardHeader className="bg-white/50 border-b border-white/60 pb-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle className="text-lg font-bold text-slate-800">Bundle Review Panel</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">Duyet: {approvedCount}</span>
                        <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">Tu choi: {rejectedCount}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">Cho xu ly: {pendingCount}</span>
                    </div>
                </div>
                <p className="text-sm text-slate-600">
                    Moi bundle duoc review doc lap theo CPA. Chi bundle duoc duyet moi duoc luu vao worksheet.
                </p>
            </CardHeader>

            <CardContent className="space-y-4 p-5">
                {dirtyApprovedCount > 0 && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        Co {dirtyApprovedCount} bundle da duoc chinh sua sau khi generate. He thong se re-validate lai khi bam luu.
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    <Button type="button" onClick={onApproveAll} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <CheckCheck className="h-4 w-4" /> Duyet tat ca
                    </Button>
                    <Button type="button" variant="outline" onClick={onResetAll}>
                        <RefreshCcw className="h-4 w-4" /> Dat lai trang thai
                    </Button>
                </div>

                <div className="space-y-4">
                    {bundles.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm font-medium text-slate-500">
                            Chua co bundle. Hay tao ban nhap AI tu panel ben trai.
                        </div>
                    ) : (
                        bundles.map((bundle, index) => {
                            const bundleKey = bundleKeyOf(bundle, index);
                            return (
                                <CPABundleCard
                                    key={bundleKey}
                                    bundle={bundle}
                                    index={index}
                                    reviewStatus={reviewStatuses[bundleKey] || 'pending'}
                                    isDirty={Boolean(dirtyBundleMap[bundleKey])}
                                    onStatusChange={(next) => onStatusChange(bundleKey, next)}
                                    onBundleChange={(nextBundle) => onBundleChange(index, nextBundle)}
                                />
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
