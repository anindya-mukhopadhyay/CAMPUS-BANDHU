"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, MapPin,
  Heart, MessageCircle, Star, Sparkles
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { marketplaceService } from "@/services";

const categories = ["All", "Electronics", "Books", "Lab Equipment", "Furniture", "Clothing", "Services"];

const stagger = {
  container: { transition: { staggerChildren: 0.05 } },
  item: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }
};

export default function MarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Create Listing Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newListing, setNewListing] = useState({
    title: "",
    description: "",
    category: "Electronics",
    price: "",
    condition: "Good",
    location: "Campus Hostels",
    image: ""
  });

  const fetchListings = async () => {
    try {
      const res = await marketplaceService.getAll();
      setListings(res.data || []);
    } catch (err) {
      console.error("Failed to fetch marketplace listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListing.title || !newListing.description || !newListing.price) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const payload = {
        title: newListing.title,
        description: newListing.description,
        category: newListing.category,
        price: Number(newListing.price),
        condition: newListing.condition,
        location: newListing.location,
        image: newListing.image || "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=400&q=80"
      };

      await marketplaceService.create(payload);
      setIsModalOpen(false);
      // Reset form
      setNewListing({
        title: "",
        description: "",
        category: "Electronics",
        price: "",
        condition: "Good",
        location: "Campus Hostels",
        image: ""
      });
      await fetchListings();
    } catch (err: any) {
      console.error("Failed to create product listing:", err);
      alert(err.message || "Failed to create listing.");
    }
  };

  const filtered = listings.filter((l) => {
    const matchCat = selectedCategory === "All" || l.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        l.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <AppShell>
      <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6">
        {/* Header */}
        <motion.div variants={stagger.item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Campus Marketplace</h1>
            <p className="mt-1 text-sm text-slate">
              <AnimatedCounter value={listings.length} /> items listed · AI-powered pricing
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-mint to-accent px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_25px_rgba(56,242,181,0.25)] transition-shadow hover:shadow-[0_0_35px_rgba(56,242,181,0.35)]"
          >
            <Plus className="h-4 w-4" /> List Item
          </button>
        </motion.div>

        {/* AI Banner */}
        <motion.div variants={stagger.item}>
          <GlassCard variant="subtle" padding="sm" className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-purple shrink-0" />
            <p className="text-sm">
              <span className="font-semibold text-purple">AI Pricing Assistant</span>
              <span className="text-slate"> — Items show AI-suggested fair market prices based on condition, demand, and campus trends.</span>
            </p>
          </GlassCard>
        </motion.div>

        {/* Search + Filters */}
        <motion.div variants={stagger.item}>
          <GlassCard padding="sm" className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-subtle focus:border-accent/30 focus:outline-none"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-mint/15 text-mint border border-mint/30"
                      : "text-slate hover:bg-white/[0.04] hover:text-white border border-transparent"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Listings Grid */}
        {loading && (
          <p className="text-sm text-slate italic text-center py-8">Fetching marketplace inventory...</p>
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-sm text-slate italic text-center py-8">No listings found. Be the first to list an item!</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <GlassCard hover className="group h-full flex flex-col justify-between">
                  <div>
                    {/* Image */}
                    <div className="relative -mx-5 -mt-5 mb-4 h-40 overflow-hidden rounded-t-2xl">
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=400&q=80"}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent" />
                      <NeonBadge color={item.condition === "New" ? "mint" : "blue"} size="sm" className="absolute bottom-3 left-3">
                        {item.condition || "Used"}
                      </NeonBadge>
                      <span className="absolute right-3 top-3 rounded-lg bg-black/40 px-2 py-1 text-xs text-white backdrop-blur-sm">
                        {item.status || "active"}
                      </span>
                    </div>

                    <h3 className="font-heading text-base font-semibold line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-slate line-clamp-2 mt-1 min-h-[32px]">{item.description}</p>

                    {/* Price */}
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-heading text-xl font-bold text-mint">₹{item.price.toLocaleString("en-IN")}</span>
                    </div>

                    {/* Meta */}
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate">
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.location || "Campus"}</span>
                      <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-blaze" /> 5.0</span>
                    </div>
                  </div>

                  {/* Seller + Actions */}
                  <div className="mt-3 flex items-center justify-between border-t border-white/[0.04] pt-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={item.sellerName || "Seller"} size="sm" />
                      <span className="text-xs text-slate truncate max-w-[120px]">{item.sellerName || "Anonymous"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate">
                      <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" /> 5</span>
                      <span className="flex items-center gap-0.5"><MessageCircle className="h-3 w-3" /> 0</span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* List Item Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="List an Item for Sale">
        <form onSubmit={handleCreateListing} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Item Title"
              placeholder="e.g. MacBook Pro M1"
              value={newListing.title}
              onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
              required
            />
            <Input
              label="Price (INR)"
              type="number"
              placeholder="e.g. 45000"
              value={newListing.price}
              onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate mb-1 block">Description</label>
            <textarea
              value={newListing.description}
              onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
              className="w-full rounded-xl border border-white/[0.06] bg-[#12121A] p-3 text-sm text-white placeholder:text-subtle focus:border-accent/50 focus:outline-none min-h-[80px]"
              placeholder="Provide item specs, details, age, condition note..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate mb-1 block">Category</label>
              <select
                value={newListing.category}
                onChange={(e) => setNewListing({ ...newListing, category: e.target.value })}
                className="w-full rounded-xl border border-white/[0.06] bg-[#12121A] p-3 text-sm text-white focus:border-accent/50 focus:outline-none"
              >
                {categories.filter(c => c !== "All").map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate mb-1 block">Condition</label>
              <select
                value={newListing.condition}
                onChange={(e) => setNewListing({ ...newListing, condition: e.target.value })}
                className="w-full rounded-xl border border-white/[0.06] bg-[#12121A] p-3 text-sm text-white focus:border-accent/50 focus:outline-none"
              >
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Location / Handover Point"
              placeholder="e.g. Block C Hostel Gate"
              value={newListing.location}
              onChange={(e) => setNewListing({ ...newListing, location: e.target.value })}
            />
            <Input
              label="Image URL (Optional)"
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={newListing.image}
              onChange={(e) => setNewListing({ ...newListing, image: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 rounded-xl bg-gradient-to-r from-mint to-accent py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(56,242,181,0.2)] transition-shadow hover:shadow-[0_0_30px_rgba(56,242,181,0.3)]"
          >
            List Item on Marketplace
          </button>
        </form>
      </Modal>
    </AppShell>
  );
}
