"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  ExternalLink,
  Plus,
  Save,
  Trash2,
  Sparkles,
  Palette,
  MessageSquareQuote,
  HelpCircle,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormAlert } from "@/components/ui/field";
import { ApiError } from "@/lib/api";
import {
  platformService,
  type LandingCmsSettings,
  type LandingThemeItem,
  type LandingTestimonialItem,
  type LandingFaqItem,
} from "@/services/platform";

type TabKey = "hero" | "themes" | "testimonials" | "faqs" | "contact";

export default function LandingCmsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("hero");
  const [settings, setSettings] = useState<LandingCmsSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const { data, mutate, isLoading, error } = useSWR(
    "/platform/landing-cms",
    () => platformService.getLandingCms(),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

  useEffect(() => {
    if (data?.settings) {
      setSettings(data.settings);
    }
  }, [data]);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setNotice(null);
    setErrorNotice(null);

    try {
      await platformService.updateLandingCms(settings);
      await mutate();
      setNotice("Landing page CMS settings have been saved and published successfully!");
    } catch (err) {
      setErrorNotice(
        err instanceof ApiError ? err.displayMessage : "Failed to update landing page CMS",
      );
    } finally {
      setSaving(false);
    }
  }

  // --- Sub-handlers ---
  const updateHero = (field: keyof LandingCmsSettings["hero"], val: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      hero: { ...settings.hero, [field]: val },
    });
  };

  const updateContact = (field: keyof LandingCmsSettings["contact"], val: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      contact: { ...settings.contact, [field]: val },
    });
  };

  const updateTheme = (index: number, field: keyof LandingThemeItem, val: any) => {
    if (!settings) return;
    const themes = [...settings.themes];
    themes[index] = { ...themes[index], [field]: val };
    setSettings({ ...settings, themes });
  };

  const updateTestimonial = (
    index: number,
    field: keyof LandingTestimonialItem,
    val: any,
  ) => {
    if (!settings) return;
    const testimonials = [...settings.testimonials];
    testimonials[index] = { ...testimonials[index], [field]: val };
    setSettings({ ...settings, testimonials });
  };

  const addTestimonial = () => {
    if (!settings) return;
    const newItem: LandingTestimonialItem = {
      id: Date.now(),
      author: "New Merchant",
      role: "Store Owner",
      business: "My Brand Store",
      location: "Dhaka",
      theme_tag: "Shwapno Express Theme",
      quote: "BDBazz helped scale our retail sales with effortless order routing and instant delivery dispatch.",
      rating: 5,
    };
    setSettings({
      ...settings,
      testimonials: [...settings.testimonials, newItem],
    });
  };

  const removeTestimonial = (index: number) => {
    if (!settings) return;
    const testimonials = settings.testimonials.filter((_, i) => i !== index);
    setSettings({ ...settings, testimonials });
  };

  const updateFaq = (index: number, field: keyof LandingFaqItem, val: any) => {
    if (!settings) return;
    const faqs = [...settings.faqs];
    faqs[index] = { ...faqs[index], [field]: val };
    setSettings({ ...settings, faqs });
  };

  const addFaq = () => {
    if (!settings) return;
    const newItem: LandingFaqItem = {
      id: Date.now(),
      question: "New Frequently Asked Question?",
      answer: "Detailed answer explaining the platform policy or feature benefits clearly.",
    };
    setSettings({
      ...settings,
      faqs: [...settings.faqs, newItem],
    });
  };

  const removeFaq = (index: number) => {
    if (!settings) return;
    const faqs = settings.faqs.filter((_, i) => i !== index);
    setSettings({ ...settings, faqs });
  };

  if (isLoading || !settings) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">
        Loading SaaS Landing CMS configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Main Website CMS</h1>
          <p className="text-muted-foreground text-sm">
            Control headlines, hero banners, theme showcases, merchant reviews, FAQs and
            contact info for <span className="font-semibold text-foreground">bdbazz.com</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://bdbazz.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground border rounded-md px-3 py-2 transition-colors"
          >
            <ExternalLink className="size-3.5" />
            View Live Site
          </a>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Save className="size-4" />
            {saving ? "Publishing..." : "Save & Publish"}
          </Button>
        </div>
      </div>

      {notice && (
        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-600 dark:text-emerald-400 text-sm">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {errorNotice && <FormAlert message={errorNotice} />}
      {error && <FormAlert message="Failed to load CMS data from server" />}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b overflow-x-auto pb-1 text-sm font-medium">
        <button
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all ${
            activeTab === "hero"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="size-4" />
          Hero & Metrics
        </button>

        <button
          onClick={() => setActiveTab("themes")}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all ${
            activeTab === "themes"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Palette className="size-4" />
          Theme Showcase ({settings.themes?.length ?? 0})
        </button>

        <button
          onClick={() => setActiveTab("testimonials")}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all ${
            activeTab === "testimonials"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquareQuote className="size-4" />
          Testimonials ({settings.testimonials?.length ?? 0})
        </button>

        <button
          onClick={() => setActiveTab("faqs")}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all ${
            activeTab === "faqs"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <HelpCircle className="size-4" />
          FAQs ({settings.faqs?.length ?? 0})
        </button>

        <button
          onClick={() => setActiveTab("contact")}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-all ${
            activeTab === "contact"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <PhoneCall className="size-4" />
          Contact & Footer
        </button>
      </div>

      {/* Tab 1: Hero & Metrics */}
      {activeTab === "hero" && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold">Hero Headlines & Call to Actions</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Top Badge Tagline
              </label>
              <input
                type="text"
                value={settings.hero.badge}
                onChange={(e) => updateHero("badge", e.target.value)}
                className="w-full text-sm rounded-md border bg-background px-3 py-2 focus:ring-1 focus:ring-emerald-500 outline-none"
                placeholder="e.g. ⚡ Bangladesh's #1 Multi-Tenant E-Commerce SaaS"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Main Headline
              </label>
              <input
                type="text"
                value={settings.hero.headline}
                onChange={(e) => updateHero("headline", e.target.value)}
                className="w-full text-sm font-semibold rounded-md border bg-background px-3 py-2 focus:ring-1 focus:ring-emerald-500 outline-none"
                placeholder="Launch Your Brand Store in 60 Seconds"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Sub-Headline / Description
              </label>
              <textarea
                rows={3}
                value={settings.hero.subheadline}
                onChange={(e) => updateHero("subheadline", e.target.value)}
                className="w-full text-sm rounded-md border bg-background px-3 py-2 focus:ring-1 focus:ring-emerald-500 outline-none"
                placeholder="Description of the SaaS platform features..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  value={settings.hero.primary_cta_text}
                  onChange={(e) => updateHero("primary_cta_text", e.target.value)}
                  className="w-full text-sm rounded-md border bg-background px-3 py-2 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Primary Button Link
                </label>
                <input
                  type="text"
                  value={settings.hero.primary_cta_link}
                  onChange={(e) => updateHero("primary_cta_link", e.target.value)}
                  className="w-full text-sm rounded-md border bg-background px-3 py-2 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Secondary Button Text
                </label>
                <input
                  type="text"
                  value={settings.hero.secondary_cta_text}
                  onChange={(e) => updateHero("secondary_cta_text", e.target.value)}
                  className="w-full text-sm rounded-md border bg-background px-3 py-2 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Secondary Button Link
                </label>
                <input
                  type="text"
                  value={settings.hero.secondary_cta_link}
                  onChange={(e) => updateHero("secondary_cta_link", e.target.value)}
                  className="w-full text-sm rounded-md border bg-background px-3 py-2 outline-none"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold">Key Platform Statistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5 p-3 rounded-lg border bg-muted/20">
                <label className="text-xs font-semibold text-muted-foreground">Active Stores</label>
                <input
                  type="text"
                  value={settings.hero.stat_stores}
                  onChange={(e) => updateHero("stat_stores", e.target.value)}
                  className="w-full text-sm font-bold rounded-md border bg-background px-2.5 py-1.5 outline-none"
                />
                <input
                  type="text"
                  value={settings.hero.stat_stores_label}
                  onChange={(e) => updateHero("stat_stores_label", e.target.value)}
                  className="w-full text-xs text-muted-foreground rounded-md border bg-background px-2.5 py-1 outline-none"
                />
              </div>

              <div className="space-y-1.5 p-3 rounded-lg border bg-muted/20">
                <label className="text-xs font-semibold text-muted-foreground">Monthly GMV</label>
                <input
                  type="text"
                  value={settings.hero.stat_gmv}
                  onChange={(e) => updateHero("stat_gmv", e.target.value)}
                  className="w-full text-sm font-bold rounded-md border bg-background px-2.5 py-1.5 outline-none"
                />
                <input
                  type="text"
                  value={settings.hero.stat_gmv_label}
                  onChange={(e) => updateHero("stat_gmv_label", e.target.value)}
                  className="w-full text-xs text-muted-foreground rounded-md border bg-background px-2.5 py-1 outline-none"
                />
              </div>

              <div className="space-y-1.5 p-3 rounded-lg border bg-muted/20">
                <label className="text-xs font-semibold text-muted-foreground">Uptime SLA</label>
                <input
                  type="text"
                  value={settings.hero.stat_uptime}
                  onChange={(e) => updateHero("stat_uptime", e.target.value)}
                  className="w-full text-sm font-bold rounded-md border bg-background px-2.5 py-1.5 outline-none"
                />
                <input
                  type="text"
                  value={settings.hero.stat_uptime_label}
                  onChange={(e) => updateHero("stat_uptime_label", e.target.value)}
                  className="w-full text-xs text-muted-foreground rounded-md border bg-background px-2.5 py-1 outline-none"
                />
              </div>

              <div className="space-y-1.5 p-3 rounded-lg border bg-muted/20">
                <label className="text-xs font-semibold text-muted-foreground">Dhaka Latency</label>
                <input
                  type="text"
                  value={settings.hero.stat_speed}
                  onChange={(e) => updateHero("stat_speed", e.target.value)}
                  className="w-full text-sm font-bold rounded-md border bg-background px-2.5 py-1.5 outline-none"
                />
                <input
                  type="text"
                  value={settings.hero.stat_speed_label}
                  onChange={(e) => updateHero("stat_speed_label", e.target.value)}
                  className="w-full text-xs text-muted-foreground rounded-md border bg-background px-2.5 py-1 outline-none"
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Theme Showcase */}
      {activeTab === "themes" && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Configure the pre-built themes highlighted on the BDBazz SaaS landing page.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.themes.map((theme, idx) => (
              <Card key={theme.id} className="p-5 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Theme #{idx + 1} ({theme.id})
                    </span>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={theme.is_active}
                      onChange={(e) => updateTheme(idx, "is_active", e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Active on Landing</span>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Theme Name</label>
                  <input
                    type="text"
                    value={theme.title}
                    onChange={(e) => updateTheme(idx, "title", e.target.value)}
                    className="w-full text-sm font-bold rounded-md border bg-background px-3 py-1.5 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Category</label>
                    <input
                      type="text"
                      value={theme.category}
                      onChange={(e) => updateTheme(idx, "category", e.target.value)}
                      className="w-full text-xs rounded-md border bg-background px-2.5 py-1.5 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Tag Badge</label>
                    <input
                      type="text"
                      value={theme.badge}
                      onChange={(e) => updateTheme(idx, "badge", e.target.value)}
                      className="w-full text-xs rounded-md border bg-background px-2.5 py-1.5 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Description</label>
                  <textarea
                    rows={2}
                    value={theme.description}
                    onChange={(e) => updateTheme(idx, "description", e.target.value)}
                    className="w-full text-xs rounded-md border bg-background px-2.5 py-1.5 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Demo URL</label>
                  <input
                    type="text"
                    value={theme.preview_url}
                    onChange={(e) => updateTheme(idx, "preview_url", e.target.value)}
                    className="w-full text-xs rounded-md border bg-background px-2.5 py-1.5 outline-none"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Testimonials */}
      {activeTab === "testimonials" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Manage client feedback and social proof displayed to merchants.
            </p>
            <Button
              onClick={addTestimonial}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
            >
              <Plus className="size-3.5" />
              Add Testimonial
            </Button>
          </div>

          <div className="space-y-4">
            {settings.testimonials.map((item, idx) => (
              <Card key={item.id} className="p-5 space-y-3 relative">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-bold text-muted-foreground">
                    Review #{idx + 1}
                  </span>
                  <button
                    onClick={() => removeTestimonial(idx)}
                    className="text-red-500 hover:text-red-700 p-1 transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Author</label>
                    <input
                      type="text"
                      value={item.author}
                      onChange={(e) => updateTestimonial(idx, "author", e.target.value)}
                      className="w-full text-xs rounded-md border bg-background px-2.5 py-1.5 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Role</label>
                    <input
                      type="text"
                      value={item.role}
                      onChange={(e) => updateTestimonial(idx, "role", e.target.value)}
                      className="w-full text-xs rounded-md border bg-background px-2.5 py-1.5 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Business & Location</label>
                    <input
                      type="text"
                      value={item.business}
                      onChange={(e) => updateTestimonial(idx, "business", e.target.value)}
                      className="w-full text-xs rounded-md border bg-background px-2.5 py-1.5 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Quote / Feedback</label>
                  <textarea
                    rows={2}
                    value={item.quote}
                    onChange={(e) => updateTestimonial(idx, "quote", e.target.value)}
                    className="w-full text-xs rounded-md border bg-background px-2.5 py-1.5 outline-none"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: FAQs */}
      {activeTab === "faqs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Frequently asked questions answered for potential subscribers.
            </p>
            <Button onClick={addFaq} variant="outline" size="sm" className="gap-1.5 text-xs">
              <Plus className="size-3.5" />
              Add FAQ
            </Button>
          </div>

          <div className="space-y-4">
            {settings.faqs.map((faq, idx) => (
              <Card key={faq.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-bold text-muted-foreground">FAQ #{idx + 1}</span>
                  <button
                    onClick={() => removeFaq(idx)}
                    className="text-red-500 hover:text-red-700 p-1 transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Question</label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => updateFaq(idx, "question", e.target.value)}
                    className="w-full text-xs font-bold rounded-md border bg-background px-3 py-1.5 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Answer</label>
                  <textarea
                    rows={2}
                    value={faq.answer}
                    onChange={(e) => updateFaq(idx, "answer", e.target.value)}
                    className="w-full text-xs rounded-md border bg-background px-3 py-1.5 outline-none"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Contact & Footer */}
      {activeTab === "contact" && (
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-bold">Platform Support & Contact Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Hotline Number</label>
              <input
                type="text"
                value={settings.contact.hotline}
                onChange={(e) => updateContact("hotline", e.target.value)}
                className="w-full text-sm rounded-md border bg-background px-3 py-2 outline-none"
                placeholder="16469 / +880 9612-BDBAZZ"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Support Email</label>
              <input
                type="text"
                value={settings.contact.email}
                onChange={(e) => updateContact("email", e.target.value)}
                className="w-full text-sm rounded-md border bg-background px-3 py-2 outline-none"
                placeholder="support@bdbazz.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Sales Email</label>
              <input
                type="text"
                value={settings.contact.sales_email}
                onChange={(e) => updateContact("sales_email", e.target.value)}
                className="w-full text-sm rounded-md border bg-background px-3 py-2 outline-none"
                placeholder="sales@bdbazz.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">WhatsApp Hotline</label>
              <input
                type="text"
                value={settings.contact.whatsapp_number}
                onChange={(e) => updateContact("whatsapp_number", e.target.value)}
                className="w-full text-sm rounded-md border bg-background px-3 py-2 outline-none"
                placeholder="+8801700000000"
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-muted-foreground">Dhaka Headquarters Address</label>
            <input
              type="text"
              value={settings.contact.address}
              onChange={(e) => updateContact("address", e.target.value)}
              className="w-full text-sm rounded-md border bg-background px-3 py-2 outline-none"
            />
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-muted-foreground">Official Facebook Page URL</label>
            <input
              type="text"
              value={settings.contact.facebook_url}
              onChange={(e) => updateContact("facebook_url", e.target.value)}
              className="w-full text-sm rounded-md border bg-background px-3 py-2 outline-none"
            />
          </div>
        </Card>
      )}

      {/* Floating Save Action Footer */}
      <div className="sticky bottom-4 bg-card/95 backdrop-blur border p-4 rounded-xl shadow-lg flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">
          Changes are instantly served to visitors on <strong className="text-foreground">bdbazz.com</strong> upon saving.
        </span>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
        >
          <Save className="size-4" />
          {saving ? "Publishing..." : "Save & Publish"}
        </Button>
      </div>
    </div>
  );
}
