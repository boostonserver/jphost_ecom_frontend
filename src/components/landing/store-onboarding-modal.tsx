"use client";

import { useState, useEffect, useId } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Mail,
  Phone,
  Store,
  User,
  X,
  Sparkles,
  CreditCard,
  ExternalLink,
  Eye,
  EyeOff,
  Building2,
} from "lucide-react";
import {
  publicOnboardingApi,
  type PublicPackage,
  type OnboardStoreResponse,
  type PlatformBillingSettings,
} from "@/services/platform";

interface StoreOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedPlanId?: number | null;
  preselectedBillingCycle?: "monthly" | "yearly";
}

export function StoreOnboardingModal({
  isOpen,
  onClose,
  preselectedPlanId,
  preselectedBillingCycle = "monthly",
}: StoreOnboardingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [storeName, setStoreName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [category, setCategory] = useState("Fashion & Clothing");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Package & Billing State
  const [packages, setPackages] = useState<PublicPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(preselectedBillingCycle);

  // Payment Confirmation State
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "bank" | "trial">("trial");
  const [transactionId, setTransactionId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [instructions, setInstructions] = useState<PlatformBillingSettings["payment_instructions"] | null>(null);

  // Subdomain Validation State
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  const [subdomainStatus, setSubdomainStatus] = useState<{
    checked: boolean;
    available: boolean;
    message: string;
  }>({ checked: false, available: false, message: "" });

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdStore, setCreatedStore] = useState<OnboardStoreResponse | null>(null);

  // Load packages & billing instructions
  useEffect(() => {
    if (!isOpen) return;

    publicOnboardingApi
      .getPackages()
      .then((res) => {
        setPackages(res.items);
        if (preselectedPlanId) {
          setSelectedPackageId(preselectedPlanId);
        } else if (res.items.length > 0 && !selectedPackageId) {
          // Default to popular/growth or first package
          const growth = res.items.find((p) => p.slug.toLowerCase().includes("growth"));
          setSelectedPackageId(growth ? growth.id : res.items[0].id);
        }
      })
      .catch(() => {});

    publicOnboardingApi
      .getBillingInstructions()
      .then((res) => setInstructions(res))
      .catch(() => {});
  }, [isOpen, preselectedPlanId]);

  // Synchronize billingCycle prop if changed
  useEffect(() => {
    if (preselectedBillingCycle) {
      setBillingCycle(preselectedBillingCycle);
    }
  }, [preselectedBillingCycle]);

  // Auto-generate subdomain from store name if user hasn't typed a custom one
  const handleStoreNameChange = (val: string) => {
    setStoreName(val);
    const suggested = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    if (!subdomainStatus.checked || subdomain === "") {
      setSubdomain(suggested);
    }
  };

  // Debounced check subdomain
  useEffect(() => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainStatus({ checked: false, available: false, message: "" });
      return;
    }

    const timer = setTimeout(() => {
      setIsCheckingSubdomain(true);
      publicOnboardingApi
        .checkSubdomain(subdomain)
        .then((res) => {
          setSubdomainStatus({
            checked: true,
            available: res.available,
            message: res.message,
          });
        })
        .catch(() => {
          setSubdomainStatus({
            checked: true,
            available: false,
            message: "Could not verify subdomain at this moment.",
          });
        })
        .finally(() => {
          setIsCheckingSubdomain(false);
        });
    }, 450);

    return () => clearTimeout(timer);
  }, [subdomain]);

  if (!isOpen) return null;

  const selectedPackage = packages.find((p) => p.id === selectedPackageId);
  const monthlyPrice = selectedPackage ? parseFloat(selectedPackage.price) : 0;
  const price = billingCycle === "yearly" ? monthlyPrice * 10 : monthlyPrice;
  const isTrial = selectedPackage && selectedPackage.trial_days > 0;

  // Step 1 Validation
  const canProceedStep1 =
    storeName.trim().length >= 2 &&
    subdomain.trim().length >= 3 &&
    subdomainStatus.checked &&
    subdomainStatus.available;

  // Step 2 Validation
  const canProceedStep2 =
    ownerName.trim().length >= 2 &&
    email.includes("@") &&
    phone.trim().length >= 10 &&
    password.length >= 8;

  // Final Submit
  const handleCompleteOrder = async () => {
    if (!selectedPackageId) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await publicOnboardingApi.onboard({
        store_name: storeName.trim(),
        subdomain: subdomain.trim().toLowerCase(),
        category,
        owner_name: ownerName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        package_id: selectedPackageId,
        billing_cycle: billingCycle,
        payment_method: paymentMethod,
        transaction_id: transactionId.trim() || undefined,
        sender_number: senderNumber.trim() || undefined,
      });

      setCreatedStore(res);
      setStep(4);
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          "An error occurred while creating your store. Please verify your details."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-stone-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl text-white overflow-hidden my-auto">
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-stone-950 shadow-md">
              <Store className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                Launch Your Online Store
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  14 Days Free
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Create your branded store in less than 2 minutes
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Multi-step Progress Indicator (Steps 1 to 3) */}
        {step < 4 && (
          <div className="px-6 py-3 bg-stone-950/30 border-b border-stone-800/80 flex items-center justify-between gap-2 text-xs">
            <div
              className={`flex items-center gap-2 ${
                step >= 1 ? "text-emerald-400 font-bold" : "text-stone-500"
              }`}
            >
              <span
                className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step > 1
                    ? "bg-emerald-500 text-stone-950"
                    : step === 1
                    ? "bg-emerald-500/20 border border-emerald-500 text-emerald-400"
                    : "bg-stone-800 text-stone-500"
                }`}
              >
                {step > 1 ? <Check className="size-3 stroke-[3]" /> : "1"}
              </span>
              <span>1. Store Identity</span>
            </div>

            <div className="h-0.5 flex-1 bg-stone-800 mx-2" />

            <div
              className={`flex items-center gap-2 ${
                step >= 2 ? "text-emerald-400 font-bold" : "text-stone-500"
              }`}
            >
              <span
                className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step > 2
                    ? "bg-emerald-500 text-stone-950"
                    : step === 2
                    ? "bg-emerald-500/20 border border-emerald-500 text-emerald-400"
                    : "bg-stone-800 text-stone-500"
                }`}
              >
                {step > 2 ? <Check className="size-3 stroke-[3]" /> : "2"}
              </span>
              <span>2. Owner Account</span>
            </div>

            <div className="h-0.5 flex-1 bg-stone-800 mx-2" />

            <div
              className={`flex items-center gap-2 ${
                step >= 3 ? "text-emerald-400 font-bold" : "text-stone-500"
              }`}
            >
              <span
                className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 3
                    ? "bg-emerald-500/20 border border-emerald-500 text-emerald-400"
                    : "bg-stone-800 text-stone-500"
                }`}
              >
                3
              </span>
              <span>3. Plan &amp; Launch</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="size-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Store Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Store Name (দোকানের নাম) <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-500" />
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => handleStoreNameChange(e.target.value)}
                    placeholder="e.g. Arif Fashion or Dhaka Gadgets"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-600 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Subdomain Address (আপনার স্টোর এর লিঙ্ক){" "}
                  <span className="text-emerald-400">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    value={subdomain}
                    onChange={(e) =>
                      setSubdomain(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "")
                      )
                    }
                    placeholder="ariffashion"
                    className="flex-1 px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-l-xl text-sm text-white placeholder-stone-600 font-mono focus:outline-hidden focus:border-emerald-500"
                  />
                  <span className="px-3.5 py-2.5 bg-stone-800 text-stone-300 border border-stone-700 rounded-r-xl text-xs font-semibold select-none">
                    .bdbazz.com
                  </span>
                </div>

                {/* Subdomain availability indicator */}
                <div className="mt-2 min-h-[1.25rem] text-xs flex items-center gap-1.5">
                  {isCheckingSubdomain && (
                    <span className="text-stone-400 flex items-center gap-1">
                      <Loader2 className="size-3 animate-spin text-emerald-400" />
                      Checking address availability...
                    </span>
                  )}
                  {!isCheckingSubdomain && subdomainStatus.checked && (
                    <span
                      className={`flex items-center gap-1 font-medium ${
                        subdomainStatus.available
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {subdomainStatus.available ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : (
                        <AlertCircle className="size-3.5" />
                      )}
                      {subdomainStatus.message}
                    </span>
                  )}
                  {!isCheckingSubdomain && !subdomainStatus.checked && (
                    <span className="text-stone-500 text-[11px]">
                      Only lowercase letters, numbers, and hyphens (3-40 chars).
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Store Category (ব্যবসার ধরণ)
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-500" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="Fashion & Clothing">Fashion &amp; Clothing (পোশাক ও ফ্যাশন)</option>
                    <option value="Grocery & Supermarket">Grocery &amp; Supermarket (মুদি ও নিত্যপণ্য)</option>
                    <option value="Gadgets & Electronics">Gadgets &amp; Electronics (ইলেকট্রনিক্স)</option>
                    <option value="Health, Beauty & Cosmetics">Health, Beauty &amp; Cosmetics (প্রসাধন)</option>
                    <option value="Organic & Agro Foods">Organic &amp; Agro Foods (অর্গানিক খাবার)</option>
                    <option value="General Store">General Multi-Product Store</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!canProceedStep1}
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all active:scale-95"
                >
                  <span>Continue to Owner Account</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Owner Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Owner Full Name (মালিকের নাম) <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-500" />
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Arifur Rahman"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-600 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Email Address (লগইন ইমেইল) <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="arif@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-600 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Mobile / WhatsApp (মোবাইল নম্বর) <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-500" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-600 focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Store Admin Password (এডমিন পাসওয়ার্ড){" "}
                  <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full pl-10 pr-10 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-600 focus:outline-hidden focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-stone-500">
                  This password will be used to log in to your store management dashboard.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white hover:bg-stone-800 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={!canProceedStep2}
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all active:scale-95"
                >
                  <span>Select Plan &amp; Launch</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Plan Selection & Payment */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Billing Cycle Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-950 border border-stone-800">
                <span className="text-xs font-semibold text-stone-300">
                  Select Billing Period:
                </span>
                <div className="flex items-center gap-2 bg-stone-900 p-1 rounded-xl border border-stone-800">
                  <button
                    type="button"
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      billingCycle === "monthly"
                        ? "bg-emerald-500 text-stone-950 shadow-xs"
                        : "text-stone-400 hover:text-white"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle("yearly")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      billingCycle === "yearly"
                        ? "bg-emerald-500 text-stone-950 shadow-xs"
                        : "text-stone-400 hover:text-white"
                    }`}
                  >
                    <span>Yearly</span>
                    <span className="text-[10px] uppercase font-black bg-amber-400 text-stone-950 px-1.5 py-0.2 rounded">
                      2 Mo Free
                    </span>
                  </button>
                </div>
              </div>

              {/* Package Cards List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {packages.map((pkg) => {
                  const isSelected = pkg.id === selectedPackageId;
                  const pkgMonthly = parseFloat(pkg.price);
                  const pkgPrice = billingCycle === "yearly" ? pkgMonthly * 10 : pkgMonthly;

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all text-left relative ${
                        isSelected
                          ? "bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50"
                          : "bg-stone-950/60 border-stone-800 hover:border-stone-700"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5">
                          <CheckCircle2 className="size-4 text-emerald-400" />
                        </div>
                      )}
                      <h4 className="text-sm font-bold text-white">{pkg.name}</h4>
                      <p className="mt-1 text-lg font-black text-emerald-400">
                        ৳{pkgPrice.toLocaleString()}
                        <span className="text-[11px] text-stone-400 font-normal">
                          /{billingCycle === "yearly" ? "yr" : "mo"}
                        </span>
                      </p>
                      <div className="mt-2 text-[11px] text-stone-400 space-y-0.5">
                        <div>
                          {pkg.trial_days > 0 ? (
                            <span className="text-amber-300 font-semibold">
                              ✓ {pkg.trial_days} Days Free Trial
                            </span>
                          ) : (
                            <span>Instant Store Setup</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Trial Guarantee Banner */}
              {isTrial && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                  <Sparkles className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-stone-300">
                    <p className="font-bold text-white">
                      14-Day Full Free Trial Included!
                    </p>
                    <p className="mt-0.5 text-stone-400">
                      No upfront payment is required right now. Your store and invoice
                      will be generated immediately, and you can test all features free for
                      14 days.
                    </p>
                  </div>
                </div>
              )}

              {/* Optional Upfront bKash / Nagad payment accordion */}
              <div className="rounded-2xl border border-stone-800 bg-stone-950 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="size-4 text-stone-400" />
                    <span className="text-xs font-bold text-white">
                      {isTrial ? "Want to pay now? (Optional)" : "Payment Instructions (bKash/Nagad)"}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-500">
                    Pay ৳{price.toLocaleString()}
                  </span>
                </div>

                {instructions && (
                  <div className="text-xs bg-stone-900/80 p-3 rounded-xl border border-stone-800/80 space-y-2 text-stone-300">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-stone-400">bKash Merchant:</span>{" "}
                        <span className="font-mono font-bold text-white">
                          {instructions.bkash_merchant || "01981900308"}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400">Nagad Merchant:</span>{" "}
                        <span className="font-mono font-bold text-white">
                          {instructions.nagad_merchant || "01981900308"}
                        </span>
                      </div>
                    </div>
                    {instructions.bank_name && (
                      <div className="text-[11px] text-stone-400 border-t border-stone-800 pt-1.5">
                        Bank: <span className="text-stone-200">{instructions.bank_name}</span> ({instructions.account_name} - A/C: {instructions.account_number})
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500"
                    >
                      <option value="trial">Free Trial / Pay Later</option>
                      <option value="bkash">bKash Transfer</option>
                      <option value="nagad">Nagad Transfer</option>
                      <option value="bank">Bank Deposit / BEFTN</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-400 mb-1">
                      Transaction ID (TrxID)
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                      placeholder={paymentMethod === "trial" ? "Optional if trial" : "e.g. TRX99882233"}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-white placeholder-stone-600 font-mono focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white hover:bg-stone-800 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || !selectedPackageId}
                  onClick={handleCompleteOrder}
                  className="px-8 py-3 rounded-xl font-black text-xs flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Creating Your Store...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      <span>{isTrial ? "Launch Store with 14-Day Trial" : "Complete Order & Launch"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success & Celebration Screen */}
          {step === 4 && createdStore && (
            <div className="py-4 text-center space-y-5">
              <div className="size-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-stone-950 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 animate-bounce">
                <Check className="size-8 stroke-[3]" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  Store Successfully Launched
                </span>
                <h3 className="mt-3 text-2xl font-black text-white">
                  Congratulations, {createdStore.store_name}!
                </h3>
                <p className="mt-1.5 text-xs text-stone-400 max-w-md mx-auto">
                  Your e-commerce shop is provisioned and ready to sell. We have also sent
                  all credentials and invoice details to{" "}
                  <strong className="text-white">{createdStore.admin_email}</strong>.
                </p>
              </div>

              {/* Store & Credentials Summary Box */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 text-left space-y-3 max-w-lg mx-auto">
                <div className="flex items-center justify-between text-xs border-b border-stone-800/80 pb-2.5">
                  <span className="text-stone-400">Storefront URL:</span>
                  <a
                    href={createdStore.store_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono font-bold text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>{createdStore.hostname}</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>

                <div className="flex items-center justify-between text-xs border-b border-stone-800/80 pb-2.5">
                  <span className="text-stone-400">Admin Dashboard:</span>
                  <span className="font-mono text-stone-300">
                    {createdStore.hostname}/admin
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs border-b border-stone-800/80 pb-2.5">
                  <span className="text-stone-400">Selected Plan:</span>
                  <span className="font-bold text-white">
                    {createdStore.package_name} ({createdStore.billing_cycle})
                  </span>
                </div>

                {createdStore.invoice && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-400">Invoice Generated:</span>
                    <span className="font-mono font-semibold text-amber-300">
                      #{createdStore.invoice.number} (৳{parseFloat(createdStore.invoice.total).toLocaleString()})
                    </span>
                  </div>
                )}
              </div>

              {/* Direct Store Admin Link */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={createdStore.admin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 shadow-xl shadow-emerald-500/25 transition-all"
                >
                  <span>Go to Store Admin Panel</span>
                  <ArrowRight className="size-4" />
                </a>

                <a
                  href={createdStore.store_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 text-white transition-all"
                >
                  <span>View Public Storefront</span>
                  <ExternalLink className="size-3.5 text-stone-400" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
