"use client";

import { useState, useEffect } from "react";
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

const STORE_CATEGORIES = [
  { value: "Fashion & Clothing", label: "Fashion, Clothing & Boutique (পোশাক ও ফ্যাশন)" },
  { value: "Footwear & Leather Goods", label: "Footwear & Leather (জুতা, ব্যাগ ও চামড়াজাত পণ্য)" },
  { value: "Grocery & Supermarket", label: "Grocery & Supermarket (মুদি ও নিত্যপ্রয়োজনীয় পণ্য)" },
  { value: "Organic & Agro Foods", label: "Organic & Natural Foods (অর্গানিক, মধু ও কৃষি খাদ্য)" },
  { value: "Gadgets & Electronics", label: "Mobile, Gadgets & Electronics (মোবাইল ও ইলেকট্রনিক্স)" },
  { value: "Computer & IT Accessories", label: "Computer, Laptop & IT (কম্পিউটার ও আইটি এক্সেসরিজ)" },
  { value: "Home Appliances & Kitchenware", label: "Home & Kitchenware (হোম অ্যাপ্লায়েন্স ও ক্রোকারিজ)" },
  { value: "Health, Beauty & Cosmetics", label: "Health, Beauty & Skin Care (প্রসাধন ও স্কিনকেয়ার)" },
  { value: "Baby Care, Kids & Toys", label: "Baby, Kids & Toys (বাচ্চাদের পণ্য ও খেলনা সামগ্রী)" },
  { value: "Books, Stationery & Publications", label: "Books & Stationery (বই, প্রকাশনী ও স্টেশনারি)" },
  { value: "Furniture, Decor & Home Living", label: "Furniture & Home Decor (আসবাবপত্র ও হোম ডেকর)" },
  { value: "Jewellery, Watches & Accessories", label: "Jewellery, Watches & Optics (জুয়েলারি ও ঘড়ি)" },
  { value: "Sports, Gym & Fitness", label: "Sports & Fitness Gear (খেলাধুলা ও জিম সামগ্রী)" },
  { value: "Automobile, Bike & Spare Parts", label: "Automobile & Bike Parts (বাইক ও গাড়ি এক্সেসরিজ)" },
  { value: "Medicine & Healthcare Products", label: "Pharmacy & Healthcare (ঔষধ ও স্বাস্থ্যসেবা পণ্য)" },
  { value: "Handicrafts & Traditional Crafts", label: "Handicraft & Jute Products (হস্তশিল্প ও পাটজাত পণ্য)" },
  { value: "General Multi-Product Store", label: "General Store (অল-ইন-ওয়ান মাল্টি-প্রোডাক্ট শপ)" },
];

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

  // Auto-generate subdomain from store name
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
    }, 400);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-stone-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Light Theme Card Modal */}
      <div className="relative w-full max-w-2xl bg-white border border-stone-200 rounded-3xl shadow-2xl text-stone-900 overflow-hidden my-auto">
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-stone-200/80 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Store className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-stone-900">
                  Launch Your Online Store
                </h2>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  14 Days Free Trial
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Create your branded shop in less than 2 minutes
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Multi-step Clean Progress Indicator (Steps 1 to 3) */}
        {step < 4 && (
          <div className="px-6 py-3.5 bg-stone-50/40 border-b border-stone-200/80 flex items-center justify-between gap-3 text-xs">
            <div
              className={`flex items-center gap-2 ${
                step >= 1 ? "text-emerald-700 font-bold" : "text-stone-400 font-medium"
              }`}
            >
              <span
                className={`size-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > 1
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                    : step === 1
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                    : "bg-stone-100 text-stone-400 border border-stone-200"
                }`}
              >
                {step > 1 ? <Check className="size-3.5 stroke-[3]" /> : "1"}
              </span>
              <span>1. Store Identity</span>
            </div>

            <div className={`h-0.5 flex-1 transition-colors ${step > 1 ? "bg-emerald-500" : "bg-stone-200"}`} />

            <div
              className={`flex items-center gap-2 ${
                step >= 2 ? "text-emerald-700 font-bold" : "text-stone-400 font-medium"
              }`}
            >
              <span
                className={`size-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > 2
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                    : step === 2
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                    : "bg-stone-100 text-stone-400 border border-stone-200"
                }`}
              >
                {step > 2 ? <Check className="size-3.5 stroke-[3]" /> : "2"}
              </span>
              <span>2. Owner Account</span>
            </div>

            <div className={`h-0.5 flex-1 transition-colors ${step > 2 ? "bg-emerald-500" : "bg-stone-200"}`} />

            <div
              className={`flex items-center gap-2 ${
                step >= 3 ? "text-emerald-700 font-bold" : "text-stone-400 font-medium"
              }`}
            >
              <span
                className={`size-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === 3
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                    : "bg-stone-100 text-stone-400 border border-stone-200"
                }`}
              >
                3
              </span>
              <span>3. Plan &amp; Launch</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-7">
          {errorMessage && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
              <AlertCircle className="size-4 shrink-0 text-rose-600" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Store Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Store Name (দোকানের নাম) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => handleStoreNameChange(e.target.value)}
                    placeholder="e.g. Arif Fashion or Dhaka Gadgets"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50/70 hover:bg-stone-50 border border-stone-300 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 rounded-xl text-sm text-stone-900 placeholder-stone-400 shadow-xs transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Subdomain Address (আপনার স্টোর এর লিঙ্ক){" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center shadow-xs rounded-xl overflow-hidden">
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
                    className="flex-1 px-3.5 py-2.5 bg-stone-50/70 hover:bg-stone-50 border border-stone-300 border-r-0 focus:bg-white focus:border-emerald-600 focus:ring-0 rounded-l-xl text-sm text-stone-900 placeholder-stone-400 font-mono transition-all"
                  />
                  <span className="px-4 py-2.5 bg-stone-100 text-stone-700 border border-stone-300 text-xs font-bold select-none rounded-r-xl">
                    .bdbazz.com
                  </span>
                </div>

                {/* Subdomain availability indicator */}
                <div className="mt-2 min-h-[1.5rem] text-xs flex items-center gap-1.5">
                  {isCheckingSubdomain && (
                    <span className="text-stone-500 flex items-center gap-1.5">
                      <Loader2 className="size-3.5 animate-spin text-emerald-600" />
                      Checking address availability...
                    </span>
                  )}
                  {!isCheckingSubdomain && subdomainStatus.checked && (
                    <span
                      className={`inline-flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-lg text-xs ${
                        subdomainStatus.available
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {subdomainStatus.available ? (
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="size-3.5 text-rose-600" />
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
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Store Category (ব্যবসার ধরণ)
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50/70 hover:bg-stone-50 border border-stone-300 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 rounded-xl text-sm text-stone-900 shadow-xs transition-all"
                  >
                    {STORE_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!canProceedStep1}
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
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
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Owner Full Name (মালিকের নাম) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Arifur Rahman"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50/70 hover:bg-stone-50 border border-stone-300 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 rounded-xl text-sm text-stone-900 placeholder-stone-400 shadow-xs transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    Email Address (লগইন ইমেইল) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="arif@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50/70 hover:bg-stone-50 border border-stone-300 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 rounded-xl text-sm text-stone-900 placeholder-stone-400 shadow-xs transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    Mobile / WhatsApp (মোবাইল নম্বর) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50/70 hover:bg-stone-50 border border-stone-300 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 rounded-xl text-sm text-stone-900 placeholder-stone-400 shadow-xs transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Store Admin Password (এডমিন পাসওয়ার্ড){" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full pl-10 pr-10 py-2.5 bg-stone-50/70 hover:bg-stone-50 border border-stone-300 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 rounded-xl text-sm text-stone-900 placeholder-stone-400 shadow-xs transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
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
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={!canProceedStep2}
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
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
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                <span className="text-xs font-bold text-stone-800">
                  Select Billing Period:
                </span>
                <div className="flex items-center gap-1.5 bg-stone-200/70 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      billingCycle === "monthly"
                        ? "bg-white text-stone-950 shadow-xs"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle("yearly")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      billingCycle === "yearly"
                        ? "bg-white text-stone-950 shadow-xs"
                        : "text-stone-600 hover:text-stone-900"
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
                          ? "bg-emerald-50/70 border-2 border-emerald-600 shadow-md shadow-emerald-600/10 ring-1 ring-emerald-600/30"
                          : "bg-white border-stone-200 hover:border-stone-300 hover:shadow-xs"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5">
                          <CheckCircle2 className="size-4 text-emerald-600" />
                        </div>
                      )}
                      <h4 className="text-sm font-extrabold text-stone-900">{pkg.name}</h4>
                      <p className="mt-1 text-lg font-black text-emerald-700">
                        ৳{pkgPrice.toLocaleString()}
                        <span className="text-[11px] text-stone-500 font-normal">
                          /{billingCycle === "yearly" ? "yr" : "mo"}
                        </span>
                      </p>
                      <div className="mt-2 text-[11px] text-stone-600 space-y-0.5">
                        <div>
                          {pkg.trial_days > 0 ? (
                            <span className="text-emerald-700 font-bold bg-emerald-100/70 px-1.5 py-0.5 rounded">
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
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/90 flex items-start gap-3">
                  <Sparkles className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-stone-700">
                    <p className="font-extrabold text-emerald-950">
                      14-Day Full Free Trial Included!
                    </p>
                    <p className="mt-0.5 text-stone-600">
                      No upfront payment is required right now. Your store and invoice
                      will be generated immediately, and you can test all features free for
                      14 days.
                    </p>
                  </div>
                </div>
              )}

              {/* Optional Upfront bKash / Nagad payment accordion */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="size-4 text-stone-600" />
                    <span className="text-xs font-bold text-stone-900">
                      {isTrial ? "Want to pay now? (Optional)" : "Payment Instructions (bKash/Nagad)"}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-stone-600">
                    Total: ৳{price.toLocaleString()}
                  </span>
                </div>

                {instructions && (
                  <div className="text-xs bg-white p-3 rounded-xl border border-stone-200 space-y-2 text-stone-700 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-stone-500">bKash Merchant:</span>{" "}
                        <span className="font-mono font-bold text-stone-900">
                          {instructions.bkash_merchant || "01981900308"}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-500">Nagad Merchant:</span>{" "}
                        <span className="font-mono font-bold text-stone-900">
                          {instructions.nagad_merchant || "01981900308"}
                        </span>
                      </div>
                    </div>
                    {instructions.bank_name && (
                      <div className="text-[11px] text-stone-500 border-t border-stone-100 pt-1.5">
                        Bank: <span className="text-stone-800 font-medium">{instructions.bank_name}</span> ({instructions.account_name} - A/C: {instructions.account_number})
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:border-emerald-600"
                    >
                      <option value="trial">Free Trial / Pay Later</option>
                      <option value="bkash">bKash Transfer</option>
                      <option value="nagad">Nagad Transfer</option>
                      <option value="bank">Bank Deposit / BEFTN</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Transaction ID (TrxID)
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                      placeholder={paymentMethod === "trial" ? "Optional if trial" : "e.g. TRX99882233"}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 font-mono focus:outline-hidden focus:border-emerald-600"
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
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || !selectedPackageId}
                  onClick={handleCompleteOrder}
                  className="px-8 py-3.5 rounded-xl font-black text-xs flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-600/25 transition-all active:scale-95 cursor-pointer"
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
              <div className="size-16 rounded-3xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-600/25 animate-bounce">
                <Check className="size-8 stroke-[3]" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  Store Successfully Launched
                </span>
                <h3 className="mt-3 text-2xl font-black text-stone-900">
                  Congratulations, {createdStore.store_name}!
                </h3>
                <p className="mt-1.5 text-xs text-stone-600 max-w-md mx-auto">
                  Your e-commerce shop is provisioned and ready to sell. We have also sent
                  all credentials and invoice details to{" "}
                  <strong className="text-stone-900 font-bold">{createdStore.admin_email}</strong>.
                </p>
              </div>

              {/* Store & Credentials Summary Box */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-3 max-w-lg mx-auto">
                <div className="flex items-center justify-between text-xs border-b border-stone-200/80 pb-2.5">
                  <span className="text-stone-500 font-medium">Storefront URL:</span>
                  <a
                    href={createdStore.store_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <span>{createdStore.hostname}</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>

                <div className="flex items-center justify-between text-xs border-b border-stone-200/80 pb-2.5">
                  <span className="text-stone-500 font-medium">Admin Dashboard:</span>
                  <span className="font-mono font-bold text-stone-800">
                    {createdStore.hostname}/admin
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs border-b border-stone-200/80 pb-2.5">
                  <span className="text-stone-500 font-medium">Selected Plan:</span>
                  <span className="font-bold text-stone-900">
                    {createdStore.package_name} ({createdStore.billing_cycle})
                  </span>
                </div>

                {createdStore.invoice && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500 font-medium">Invoice Generated:</span>
                    <span className="font-mono font-bold text-emerald-700">
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
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/25 transition-all cursor-pointer"
                >
                  <span>Go to Store Admin Panel</span>
                  <ArrowRight className="size-4" />
                </a>

                <a
                  href={createdStore.store_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 transition-all cursor-pointer"
                >
                  <span>View Public Storefront</span>
                  <ExternalLink className="size-3.5 text-stone-500" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
