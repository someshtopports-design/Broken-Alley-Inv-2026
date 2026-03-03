"use server";

import { prisma } from "@/lib/db";

export async function getCustomers() {
    return prisma.customer.findMany({
        orderBy: [{ isPremium: "desc" }, { purchaseCount: "desc" }],
        include: {
            transactions: {
                where: { type: "OUTWARD" },
                select: { amountPaid: true },
            },
        },
    });
}

export async function getCustomerByMobile(mobile: string) {
    return prisma.customer.findUnique({ where: { mobile } });
}
