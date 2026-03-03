import { getDashboardMetrics, getLiveStock, getTransactionLog } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import {
    ShoppingBag,
    IndianRupee,
    Undo2,
    Star,
    TrendingUp,
    ArrowDownToLine,
    ArrowUpFromLine,
} from "lucide-react";

export const dynamic = "force-dynamic";

// ─── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({
    title,
    value,
    subtitle,
    icon: Icon,
    accent,
}: {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ElementType;
    accent: string;
}) {
    return (
        <Card className="relative overflow-hidden">
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                            {title}
                        </p>
                        <p className="text-3xl font-bold text-zinc-900 tracking-tight">
                            {value}
                        </p>
                        {subtitle && (
                            <p className="text-xs text-zinc-400">{subtitle}</p>
                        )}
                    </div>
                    <div
                        className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-xl",
                            accent
                        )}
                    >
                        <Icon className="w-5 h-5 opacity-90" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Badge pill ───────────────────────────────────────────────────────────────
function Badge({
    children,
    variant,
}: {
    children: React.ReactNode;
    variant: "inward" | "outward" | "return";
}) {
    const styles = {
        inward: "bg-emerald-50 text-emerald-700 border-emerald-200",
        outward: "bg-blue-50 text-blue-700 border-blue-200",
        return: "bg-orange-50 text-orange-700 border-orange-200",
    };
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
                styles[variant]
            )}
        >
            {variant === "inward" && <ArrowDownToLine className="w-3 h-3" />}
            {variant === "outward" && <ArrowUpFromLine className="w-3 h-3" />}
            {variant === "return" && <Undo2 className="w-3 h-3" />}
            {children}
        </span>
    );
}

// ─── Dashboard Page (Server Component) ───────────────────────────────────────
export default async function DashboardPage() {
    const [metrics, liveStock, transactions] = await Promise.all([
        getDashboardMetrics(),
        getLiveStock(),
        getTransactionLog(),
    ]);

    const sizes = ["S", "M", "L", "XL"];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
                <p className="text-sm text-zinc-500 mt-0.5">
                    Real-time analytics and inventory overview
                </p>
            </div>

            {/* ── Metric Cards ── */}
            <section>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <MetricCard
                        title="Sales Volume"
                        value={metrics.totalSalesVolume.toString()}
                        subtitle="Total articles sold"
                        icon={ShoppingBag}
                        accent="bg-blue-100 text-blue-600"
                    />
                    <MetricCard
                        title="Total Revenue"
                        value={formatCurrency(metrics.totalRevenue)}
                        subtitle="From customer orders"
                        icon={IndianRupee}
                        accent="bg-emerald-100 text-emerald-600"
                    />
                    <MetricCard
                        title="Returns"
                        value={metrics.totalReturns.toString()}
                        subtitle="Total articles returned"
                        icon={Undo2}
                        accent="bg-orange-100 text-orange-600"
                    />
                    <MetricCard
                        title="Influencer Outflow"
                        value={metrics.influencerOutflow.toString()}
                        subtitle="Articles for marketing"
                        icon={Star}
                        accent="bg-violet-100 text-violet-600"
                    />
                </div>
            </section>

            {/* ── Live Inventory Table ── */}
            <section>
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-zinc-500" />
                    <h2 className="text-base font-semibold text-zinc-800">
                        Live Inventory
                    </h2>
                    <span className="ml-auto text-xs text-zinc-400">
                        Stock = Inward − Outward + Returns
                    </span>
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-100">
                                    <th className="text-left px-5 py-3 font-semibold text-zinc-500 uppercase text-xs tracking-wide whitespace-nowrap">
                                        Product
                                    </th>
                                    <th className="text-left px-3 py-3 font-semibold text-zinc-500 uppercase text-xs tracking-wide whitespace-nowrap">
                                        SKU
                                    </th>
                                    {sizes.map((s) => (
                                        <th
                                            key={s}
                                            className="text-center px-4 py-3 font-semibold text-zinc-500 uppercase text-xs tracking-wide"
                                        >
                                            {s}
                                        </th>
                                    ))}
                                    <th className="text-center px-5 py-3 font-semibold text-zinc-500 uppercase text-xs tracking-wide">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {liveStock.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="text-center py-12 text-zinc-400 text-sm"
                                        >
                                            No products yet. Add products in Operations.
                                        </td>
                                    </tr>
                                ) : (
                                    liveStock.map(({ product, sizes: sizeData, total }) => (
                                        <tr
                                            key={product.id}
                                            className="border-b border-zinc-50 hover:bg-zinc-50/60 transition-colors"
                                        >
                                            <td className="px-5 py-3.5 font-medium text-zinc-900 whitespace-nowrap">
                                                {product.name}
                                            </td>
                                            <td className="px-3 py-3.5 text-zinc-400 font-mono text-xs whitespace-nowrap">
                                                {product.sku}
                                            </td>
                                            {sizeData.map(({ size, stock }) => (
                                                <td key={size} className="px-4 py-3.5 text-center">
                                                    <span
                                                        className={cn(
                                                            "inline-block min-w-[2rem] px-2 py-0.5 rounded-lg font-semibold text-center",
                                                            stock === 0
                                                                ? "bg-red-50 text-red-500"
                                                                : stock <= 5
                                                                    ? "bg-amber-50 text-amber-700"
                                                                    : "bg-emerald-50 text-emerald-700"
                                                        )}
                                                    >
                                                        {stock}
                                                    </span>
                                                </td>
                                            ))}
                                            <td className="px-5 py-3.5 text-center font-bold text-zinc-900">
                                                {total}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </section>

            {/* ── Master Transaction Log ── */}
            <section>
                <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-base font-semibold text-zinc-800">
                        Transaction Log
                    </h2>
                    <span className="ml-2 px-2 py-0.5 bg-zinc-100 rounded-full text-xs text-zinc-500 font-medium">
                        {transactions.length} records
                    </span>
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-100">
                                    {[
                                        "Date & Time",
                                        "Type",
                                        "Product",
                                        "Size",
                                        "Qty",
                                        "Recipient",
                                        "Amount",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className="text-left px-4 py-3 font-semibold text-zinc-500 uppercase text-xs tracking-wide whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="text-center py-12 text-zinc-400 text-sm"
                                        >
                                            No transactions yet.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((t) => (
                                        <tr
                                            key={t.id}
                                            className="border-b border-zinc-50 hover:bg-zinc-50/60 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-zinc-400 text-xs whitespace-nowrap">
                                                {formatDate(t.createdAt)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <Badge
                                                    variant={
                                                        t.type === "INWARD"
                                                            ? "inward"
                                                            : t.type === "OUTWARD"
                                                                ? "outward"
                                                                : "return"
                                                    }
                                                >
                                                    {t.type}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-zinc-800 whitespace-nowrap">
                                                {t.product.name}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-block px-2 py-0.5 bg-zinc-100 rounded text-xs font-semibold text-zinc-600">
                                                    {t.size}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-zinc-900">
                                                {t.quantity}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-500 whitespace-nowrap text-xs">
                                                {t.recipientType === "CUSTOMER" && t.customer
                                                    ? `${t.customer.name}`
                                                    : t.recipientType === "INFLUENCER"
                                                        ? "⭐ Influencer"
                                                        : "—"}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-zinc-800 whitespace-nowrap">
                                                {t.amountPaid > 0
                                                    ? formatCurrency(t.amountPaid)
                                                    : "—"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </section>
        </div>
    );
}
