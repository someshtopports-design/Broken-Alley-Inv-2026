import { getCustomers } from "@/actions/customers";
import { Card } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import { Crown, Phone, MapPin, ShoppingBag, Users, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
    let customers: Awaited<ReturnType<typeof getCustomers>> = [];
    let dbError = false;

    try {
        customers = await getCustomers();
    } catch {
        dbError = true;
    }

    const premiumCount = customers.filter((c) => c.isPremium).length;
    const totalCustomers = customers.length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Customers</h1>
                    <p className="text-sm text-zinc-500 mt-0.5">
                        CRM — {totalCustomers} customers · {premiumCount} premium
                    </p>
                </div>
                {premiumCount > 0 && (
                    <div className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl text-sm font-semibold text-amber-800">
                        <Crown className="w-4 h-4" />
                        {premiumCount} Premium
                    </div>
                )}
            </div>

            {/* DB Error Banner */}
            {dbError && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-3 text-amber-800">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-sm">Database not connected</p>
                        <p className="text-xs mt-0.5 text-amber-700">
                            Add a <code className="font-mono bg-amber-100 px-1 rounded">DATABASE_URL</code> in Vercel → Project Settings → Environment Variables, then redeploy.
                        </p>
                    </div>
                </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500">Total</p>
                            <p className="text-xl font-bold text-zinc-900">{totalCustomers}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                            <Crown className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500">Premium</p>
                            <p className="text-xl font-bold text-zinc-900">{premiumCount}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 col-span-2 sm:col-span-1">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500">Total Orders</p>
                            <p className="text-xl font-bold text-zinc-900">
                                {customers.reduce((s, c) => s + c.purchaseCount, 0)}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Customer List */}
            {customers.length === 0 ? (
                <Card className="py-20 flex items-center justify-center">
                    <div className="text-center">
                        <Users className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                        <p className="text-zinc-500 font-medium">No customers yet</p>
                        <p className="text-zinc-400 text-sm mt-1">
                            Customers are created automatically when you dispatch an order.
                        </p>
                    </div>
                </Card>
            ) : (
                <>
                    {/* Desktop Table */}
                    <Card className="hidden md:block">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-100">
                                        {["Customer", "Mobile", "Area", "Purchases", "Total Spent", "Status"].map((h) => (
                                            <th key={h} className="text-left px-5 py-3 font-semibold text-zinc-500 uppercase text-xs tracking-wide whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.map((customer) => {
                                        const totalSpent = customer.transactions.reduce((s, t) => s + t.amountPaid, 0);
                                        return (
                                            <tr key={customer.id} className={cn("border-b border-zinc-50 hover:bg-zinc-50/60 transition-colors", customer.isPremium && "bg-amber-50/30 hover:bg-amber-50/50")}>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0", customer.isPremium ? "bg-amber-200 text-amber-800" : "bg-zinc-100 text-zinc-600")}>
                                                            {customer.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-semibold text-zinc-900">{customer.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-zinc-500 font-mono text-xs">{customer.mobile}</td>
                                                <td className="px-5 py-3.5 text-zinc-500">{customer.area || "—"}</td>
                                                <td className="px-5 py-3.5 font-bold text-zinc-900">{customer.purchaseCount}</td>
                                                <td className="px-5 py-3.5 font-medium text-zinc-800">{totalSpent > 0 ? formatCurrency(totalSpent) : "—"}</td>
                                                <td className="px-5 py-3.5">
                                                    {customer.isPremium ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full border border-amber-300">
                                                            <Crown className="w-3 h-3" />Premium
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 text-zinc-500 text-xs font-medium rounded-full">Regular</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-2">
                        {customers.map((customer) => {
                            const totalSpent = customer.transactions.reduce((s, t) => s + t.amountPaid, 0);
                            return (
                                <Card key={customer.id} className={cn("p-4", customer.isPremium && "border-amber-200 bg-amber-50/30")}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0", customer.isPremium ? "bg-amber-200 text-amber-800" : "bg-zinc-100 text-zinc-600")}>
                                                {customer.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-zinc-900">{customer.name}</p>
                                                <div className="flex items-center gap-1 text-xs text-zinc-500 mt-0.5">
                                                    <Phone className="w-3 h-3" />{customer.mobile}
                                                </div>
                                            </div>
                                        </div>
                                        {customer.isPremium ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full border border-amber-200">
                                                <Crown className="w-3 h-3" />Premium
                                            </span>
                                        ) : (
                                            <span className="inline-flex px-2 py-0.5 bg-zinc-100 text-zinc-500 text-xs font-medium rounded-full">Regular</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-100 text-xs text-zinc-500">
                                        {customer.area && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{customer.area}</span>}
                                        <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" />{customer.purchaseCount} orders</span>
                                        {totalSpent > 0 && <span className="font-semibold text-zinc-700 ml-auto">{formatCurrency(totalSpent)}</span>}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
