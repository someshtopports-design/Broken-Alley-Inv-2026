"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

type Size = "S" | "M" | "L" | "XL";

// ─── Add Inward (Receive Stock) ───────────────────────────────────────────────
export async function addInward(data: {
    productId: string;
    size: Size;
    quantity: number;
}) {
    if (data.quantity <= 0) throw new Error("Quantity must be greater than 0");

    await prisma.transaction.create({
        data: {
            productId: data.productId,
            type: "INWARD",
            recipientType: "NONE",
            size: data.size,
            quantity: data.quantity,
            amountPaid: 0,
        },
    });

    revalidatePath("/dashboard");
    revalidatePath("/operations");
    return { success: true, message: "Stock received successfully" };
}

// ─── Add Outward (Dispatch) ───────────────────────────────────────────────────
export async function addOutward(data: {
    productId: string;
    size: Size;
    quantity: number;
    recipientType: "CUSTOMER" | "INFLUENCER";
    customerName?: string;
    customerMobile?: string;
    customerArea?: string;
    amountPaid: number;
}) {
    const stock = await getStockForProductSize(data.productId, data.size);
    if (stock < data.quantity) {
        throw new Error(
            `Insufficient stock. Available: ${stock}, Requested: ${data.quantity}`
        );
    }

    let customerId: string | undefined = undefined;

    if (data.recipientType === "CUSTOMER") {
        if (!data.customerMobile || !data.customerName) {
            throw new Error("Customer name and mobile are required");
        }
        if (!/^\d{10}$/.test(data.customerMobile)) {
            throw new Error("Mobile number must be exactly 10 digits");
        }

        const customer = await prisma.customer.upsert({
            where: { mobile: data.customerMobile },
            update: { purchaseCount: { increment: 1 } },
            create: {
                name: data.customerName,
                mobile: data.customerMobile,
                area: data.customerArea ?? "",
                purchaseCount: 1,
            },
        });

        if (customer.purchaseCount >= 2) {
            await prisma.customer.update({
                where: { id: customer.id },
                data: { isPremium: true },
            });
        }

        customerId = customer.id;
    }

    await prisma.transaction.create({
        data: {
            productId: data.productId,
            type: "OUTWARD",
            recipientType: data.recipientType,
            size: data.size,
            quantity: data.quantity,
            amountPaid: data.recipientType === "INFLUENCER" ? 0 : (data.amountPaid ?? 0),
            customerId: customerId,
        },
    });

    revalidatePath("/dashboard");
    revalidatePath("/operations");
    revalidatePath("/customers");
    return { success: true, message: "Order dispatched successfully" };
}

// ─── Add Return ───────────────────────────────────────────────────────────────
export async function addReturn(data: {
    productId: string;
    size: Size;
    quantity: number;
    reason?: string;
}) {
    if (data.quantity <= 0) throw new Error("Quantity must be greater than 0");

    await prisma.transaction.create({
        data: {
            productId: data.productId,
            type: "RETURN",
            recipientType: "NONE",
            size: data.size,
            quantity: data.quantity,
            amountPaid: 0,
            reason: data.reason ?? "",
        },
    });

    revalidatePath("/dashboard");
    revalidatePath("/operations");
    return { success: true, message: "Return processed successfully" };
}

// ─── Stock Calculation Helper ─────────────────────────────────────────────────
export async function getStockForProductSize(
    productId: string,
    size: string
): Promise<number> {
    const result = await prisma.transaction.groupBy({
        by: ["type"],
        where: { productId, size },
        _sum: { quantity: true },
    });

    let inward = 0, outward = 0, returned = 0;
    for (const r of result) {
        if (r.type === "INWARD") inward = r._sum.quantity ?? 0;
        if (r.type === "OUTWARD") outward = r._sum.quantity ?? 0;
        if (r.type === "RETURN") returned = r._sum.quantity ?? 0;
    }

    return inward - outward + returned;
}

// ─── Get All Products ─────────────────────────────────────────────────────────
export async function getProducts() {
    return prisma.product.findMany({ orderBy: { name: "asc" } });
}

// ─── Create Product ───────────────────────────────────────────────────────────
export async function createProduct(data: { name: string; sku: string }) {
    if (!data.name.trim() || !data.sku.trim()) {
        throw new Error("Product name and SKU are required");
    }
    return prisma.product.create({ data });
}
