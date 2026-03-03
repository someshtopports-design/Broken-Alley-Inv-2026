"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
    addInward,
    addOutward,
    addReturn,
    getProducts,
} from "@/actions/inventory";
import { createProduct } from "@/actions/inventory";
import type { Product } from "@prisma/client";
import {
    PackagePlus,
    Send,
    Undo2,
    Plus,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "inward" | "outward" | "return";

const SIZES = ["S", "M", "L", "XL"] as const;

function FormRow({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-col gap-1.5">{children}</div>;
}

// ─── Inward Form ──────────────────────────────────────────────────────────────
function InwardForm({ products }: { products: Product[] }) {
    const { toast } = useToast();
    const [pending, startTransition] = useTransition();
    const [form, setForm] = useState({
        productId: "",
        size: "M" as "S" | "M" | "L" | "XL",
        quantity: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.productId) return toast({ title: "Select a product", variant: "destructive" });
        if (!form.quantity || Number(form.quantity) <= 0)
            return toast({ title: "Enter a valid quantity", variant: "destructive" });

        startTransition(async () => {
            try {
                const res = await addInward({
                    productId: form.productId,
                    size: form.size,
                    quantity: Number(form.quantity),
                });
                toast({ title: "✓ Stock Updated", description: res.message });
                setForm({ productId: "", size: "M", quantity: "" });
            } catch (err) {
                toast({
                    title: "Error",
                    description: err instanceof Error ? err.message : "Something went wrong",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormRow>
                <Label>Product</Label>
                <Select
                    value={form.productId}
                    onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
                    required
                >
                    <option value="">Select a product...</option>
                    {products.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name} — {p.sku}
                        </option>
                    ))}
                </Select>
            </FormRow>

            <FormRow>
                <Label>Size</Label>
                <div className="grid grid-cols-4 gap-2">
                    {SIZES.map((s) => (
                        <button
                            type="button"
                            key={s}
                            onClick={() => setForm((f) => ({ ...f, size: s }))}
                            className={cn(
                                "h-12 rounded-xl text-sm font-semibold border-2 transition-all",
                                form.size === s
                                    ? "border-zinc-900 bg-zinc-900 text-white"
                                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </FormRow>

            <FormRow>
                <Label>Quantity Received</Label>
                <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 50"
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                    className="h-12 text-base"
                    required
                />
            </FormRow>

            <Button type="submit" disabled={pending} className="w-full h-12 text-base">
                {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackagePlus className="w-4 h-4" />}
                {pending ? "Updating..." : "Receive Stock"}
            </Button>
        </form>
    );
}

// ─── Outward Form ─────────────────────────────────────────────────────────────
function OutwardForm({ products }: { products: Product[] }) {
    const { toast } = useToast();
    const [pending, startTransition] = useTransition();
    const [recipientType, setRecipientType] = useState<"CUSTOMER" | "INFLUENCER">("CUSTOMER");
    const [form, setForm] = useState({
        productId: "",
        size: "M" as "S" | "M" | "L" | "XL",
        quantity: "",
        customerName: "",
        customerMobile: "",
        customerArea: "",
        amountPaid: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.productId) return toast({ title: "Select a product", variant: "destructive" });
        if (!form.quantity || Number(form.quantity) <= 0)
            return toast({ title: "Enter a valid quantity", variant: "destructive" });
        if (recipientType === "CUSTOMER") {
            if (!form.customerName.trim())
                return toast({ title: "Enter customer name", variant: "destructive" });
            if (!/^\d{10}$/.test(form.customerMobile))
                return toast({ title: "Mobile must be 10 digits", variant: "destructive" });
        }

        startTransition(async () => {
            try {
                const res = await addOutward({
                    productId: form.productId,
                    size: form.size,
                    quantity: Number(form.quantity),
                    recipientType,
                    customerName: form.customerName,
                    customerMobile: form.customerMobile,
                    customerArea: form.customerArea,
                    amountPaid: Number(form.amountPaid) || 0,
                });
                toast({ title: "✓ Order Dispatched", description: res.message });
                setForm({
                    productId: "",
                    size: "M",
                    quantity: "",
                    customerName: "",
                    customerMobile: "",
                    customerArea: "",
                    amountPaid: "",
                });
            } catch (err) {
                toast({
                    title: "Dispatch Failed",
                    description: err instanceof Error ? err.message : "Something went wrong",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Toggle: Customer vs Influencer */}
            <div className="flex rounded-xl border border-zinc-200 p-1 gap-1">
                {(["CUSTOMER", "INFLUENCER"] as const).map((type) => (
                    <button
                        type="button"
                        key={type}
                        onClick={() => setRecipientType(type)}
                        className={cn(
                            "flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all",
                            recipientType === type
                                ? "bg-zinc-900 text-white shadow-sm"
                                : "text-zinc-500 hover:text-zinc-700"
                        )}
                    >
                        {type === "CUSTOMER" ? "👤 Customer" : "⭐ Influencer"}
                    </button>
                ))}
            </div>

            {recipientType === "CUSTOMER" && (
                <>
                    <FormRow>
                        <Label>Customer Name</Label>
                        <Input
                            placeholder="Full Name"
                            value={form.customerName}
                            onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                            className="h-12"
                            required
                        />
                    </FormRow>
                    <div className="grid grid-cols-2 gap-3">
                        <FormRow>
                            <Label>Mobile (10-digit)</Label>
                            <Input
                                type="tel"
                                placeholder="9876543210"
                                maxLength={10}
                                value={form.customerMobile}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, customerMobile: e.target.value.replace(/\D/g, "") }))
                                }
                                className="h-12"
                                required
                            />
                        </FormRow>
                        <FormRow>
                            <Label>Area</Label>
                            <Input
                                placeholder="e.g. Bandra"
                                value={form.customerArea}
                                onChange={(e) => setForm((f) => ({ ...f, customerArea: e.target.value }))}
                                className="h-12"
                            />
                        </FormRow>
                    </div>
                </>
            )}

            <FormRow>
                <Label>Product</Label>
                <Select
                    value={form.productId}
                    onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
                    required
                >
                    <option value="">Select a product...</option>
                    {products.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name} — {p.sku}
                        </option>
                    ))}
                </Select>
            </FormRow>

            <FormRow>
                <Label>Size</Label>
                <div className="grid grid-cols-4 gap-2">
                    {SIZES.map((s) => (
                        <button
                            type="button"
                            key={s}
                            onClick={() => setForm((f) => ({ ...f, size: s }))}
                            className={cn(
                                "h-12 rounded-xl text-sm font-semibold border-2 transition-all",
                                form.size === s
                                    ? "border-zinc-900 bg-zinc-900 text-white"
                                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </FormRow>

            <div className="grid grid-cols-2 gap-3">
                <FormRow>
                    <Label>Quantity</Label>
                    <Input
                        type="number"
                        min="1"
                        placeholder="e.g. 2"
                        value={form.quantity}
                        onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                        className="h-12 text-base"
                        required
                    />
                </FormRow>
                {recipientType === "CUSTOMER" && (
                    <FormRow>
                        <Label>Amount Paid (₹)</Label>
                        <Input
                            type="number"
                            min="0"
                            placeholder="e.g. 2500"
                            value={form.amountPaid}
                            onChange={(e) => setForm((f) => ({ ...f, amountPaid: e.target.value }))}
                            className="h-12 text-base"
                        />
                    </FormRow>
                )}
            </div>

            {recipientType === "INFLUENCER" && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                    <strong>Influencer dispatch</strong> — Amount Paid automatically set to ₹0
                </div>
            )}

            <Button type="submit" disabled={pending} className="w-full h-12 text-base">
                {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {pending ? "Dispatching..." : "Dispatch Order"}
            </Button>
        </form>
    );
}

// ─── Return Form ──────────────────────────────────────────────────────────────
function ReturnForm({ products }: { products: Product[] }) {
    const { toast } = useToast();
    const [pending, startTransition] = useTransition();
    const [form, setForm] = useState({
        productId: "",
        size: "M" as "S" | "M" | "L" | "XL",
        quantity: "",
        reason: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.productId) return toast({ title: "Select a product", variant: "destructive" });
        if (!form.quantity || Number(form.quantity) <= 0)
            return toast({ title: "Enter a valid quantity", variant: "destructive" });

        startTransition(async () => {
            try {
                const res = await addReturn({
                    productId: form.productId,
                    size: form.size,
                    quantity: Number(form.quantity),
                    reason: form.reason,
                });
                toast({ title: "✓ Return Processed", description: res.message });
                setForm({ productId: "", size: "M", quantity: "", reason: "" });
            } catch (err) {
                toast({
                    title: "Error",
                    description: err instanceof Error ? err.message : "Something went wrong",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormRow>
                <Label>Product</Label>
                <Select
                    value={form.productId}
                    onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
                    required
                >
                    <option value="">Select a product...</option>
                    {products.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name} — {p.sku}
                        </option>
                    ))}
                </Select>
            </FormRow>

            <FormRow>
                <Label>Size</Label>
                <div className="grid grid-cols-4 gap-2">
                    {SIZES.map((s) => (
                        <button
                            type="button"
                            key={s}
                            onClick={() => setForm((f) => ({ ...f, size: s }))}
                            className={cn(
                                "h-12 rounded-xl text-sm font-semibold border-2 transition-all",
                                form.size === s
                                    ? "border-zinc-900 bg-zinc-900 text-white"
                                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400"
                            )}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </FormRow>

            <FormRow>
                <Label>Quantity Returned</Label>
                <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 1"
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                    className="h-12 text-base"
                    required
                />
            </FormRow>

            <FormRow>
                <Label>Reason (optional)</Label>
                <Input
                    placeholder="e.g. Wrong size, Defective, Customer changed mind"
                    value={form.reason}
                    onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                    className="h-12"
                />
            </FormRow>

            <Button type="submit" disabled={pending} variant="outline" className="w-full h-12 text-base">
                {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Undo2 className="w-4 h-4" />}
                {pending ? "Processing..." : "Process Return"}
            </Button>
        </form>
    );
}

// ─── Add Product Modal ────────────────────────────────────────────────────────
function AddProductModal({ onAdded }: { onAdded: () => void }) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const [name, setName] = useState("");
    const [sku, setSku] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            try {
                await createProduct({ name: name.trim(), sku: sku.trim().toUpperCase() });
                toast({ title: "✓ Product Created", description: `${name} added successfully` });
                setName("");
                setSku("");
                setOpen(false);
                onAdded();
            } catch (err) {
                toast({
                    title: "Error",
                    description: err instanceof Error ? err.message : "Could not create product",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                <Plus className="w-3.5 h-3.5" />
                Add Product
            </Button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
                        <h2 className="text-lg font-semibold mb-4">New Product</h2>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <FormRow>
                                <Label>Product Name</Label>
                                <Input
                                    placeholder="e.g. Classic White Tee"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </FormRow>
                            <FormRow>
                                <Label>SKU</Label>
                                <Input
                                    placeholder="e.g. BA-CWT-001"
                                    value={sku}
                                    onChange={(e) => setSku(e.target.value)}
                                    required
                                />
                            </FormRow>
                            <div className="flex gap-2 pt-2">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1" disabled={pending}>
                                    {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

// ─── Main Operations Page ─────────────────────────────────────────────────────
export default function OperationsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("inward");
    const [products, setProducts] = useState<Product[]>([]);

    const fetchProducts = async () => {
        const res = await getProducts();
        setProducts(res);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: "inward", label: "Receive Stock", icon: PackagePlus },
        { id: "outward", label: "Dispatch", icon: Send },
        { id: "return", label: "Process Return", icon: Undo2 },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Operations</h1>
                    <p className="text-sm text-zinc-500 mt-0.5">
                        Log stock movements and orders
                    </p>
                </div>
                <AddProductModal onAdded={fetchProducts} />
            </div>

            {/* Tab Navigation */}
            <div className="flex rounded-2xl border border-zinc-200 bg-white p-1.5 gap-1">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-sm font-semibold transition-all",
                                activeTab === tab.id
                                    ? "bg-zinc-900 text-white shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
                            )}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className="sm:hidden">
                                {tab.id === "inward" ? "In" : tab.id === "outward" ? "Out" : "Return"}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Form Card */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>
                        {activeTab === "inward"
                            ? "Receive Stock (Inward)"
                            : activeTab === "outward"
                                ? "Dispatch Order (Outward)"
                                : "Process Return"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    {activeTab === "inward" && <InwardForm products={products} />}
                    {activeTab === "outward" && <OutwardForm products={products} />}
                    {activeTab === "return" && <ReturnForm products={products} />}
                </CardContent>
            </Card>
        </div>
    );
}
