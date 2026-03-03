"use server";

import { prisma } from "@/lib/db";

// ─── Dashboard Metrics ────────────────────────────────────────────────────────
export async function getDashboardMetrics() {
    const [outwardTxns, returnTxns, influencerTxns] = await Promise.all([
        prisma.transaction.findMany({
            where: { type: "OUTWARD", recipientType: "CUSTOMER" },
            select: { quantity: true, amountPaid: true },
        }),
        prisma.transaction.findMany({
            where: { type: "RETURN" },
            select: { quantity: true },
        }),
        prisma.transaction.findMany({
            where: { type: "OUTWARD", recipientType: "INFLUENCER" },
            select: { quantity: true },
        }),
    ]);

    const totalSalesVolume = outwardTxns.reduce((s, t) => s + t.quantity, 0);
    const totalRevenue = outwardTxns.reduce((s, t) => s + t.amountPaid, 0);
    const totalReturns = returnTxns.reduce((s, t) => s + t.quantity, 0);
    const influencerOutflow = influencerTxns.reduce((s, t) => s + t.quantity, 0);

    return { totalSalesVolume, totalRevenue, totalReturns, influencerOutflow };
}

// ─── Live Stock Table ─────────────────────────────────────────────────────────
export async function getLiveStock() {
    const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
    const sizes = ["S", "M", "L", "XL"];

    const stockData = await Promise.all(
        products.map(async (product) => {
            const sizeStocks = await Promise.all(
                sizes.map(async (size) => {
                    const txns = await prisma.transaction.groupBy({
                        by: ["type"],
                        where: { productId: product.id, size },
                        _sum: { quantity: true },
                    });

                    let inward = 0, outward = 0, returned = 0;
                    for (const t of txns) {
                        if (t.type === "INWARD") inward = t._sum.quantity ?? 0;
                        if (t.type === "OUTWARD") outward = t._sum.quantity ?? 0;
                        if (t.type === "RETURN") returned = t._sum.quantity ?? 0;
                    }

                    return { size, stock: inward - outward + returned };
                })
            );

            return {
                product,
                sizes: sizeStocks,
                total: sizeStocks.reduce((s, x) => s + x.stock, 0),
            };
        })
    );

    return stockData;
}

// ─── Transaction Log ──────────────────────────────────────────────────────────
export async function getTransactionLog(filters?: {
    from?: string;
    to?: string;
}) {
    const where: Record<string, unknown> = {};

    if (filters?.from || filters?.to) {
        where.createdAt = {
            ...(filters.from ? { gte: new Date(filters.from) } : {}),
            ...(filters.to
                ? { lte: new Date(new Date(filters.to).setHours(23, 59, 59, 999)) }
                : {}),
        };
    }

    return prisma.transaction.findMany({
        where,
        include: {
            product: { select: { name: true, sku: true } },
            customer: { select: { name: true, mobile: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 200,
    });
}
