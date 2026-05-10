"use client";

import { useState } from "react";
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

const categories = ["All", "Electronics", "Books", "Lab Equipment", "Furniture", "Clothing", "Services"];


const listings = [
  { id: "1", title: "MacBook Air M2 (2023)", price: 65000, condition: "Like New", category: "Electronics", seller: "Arjun M.", location: "Block A Hostel", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80", likes: 23, messages: 5, rating: 4.8, aiPrice: 62000 },
  { id: "2", title: "Data Structures & Algorithms (Cormen)", price: 350, condition: "Good", category: "Books", seller: "Priya S.", location: "Library Gate", image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80", likes: 12, messages: 3, rating: 4.5, aiPrice: 400 },
  { id: "3", title: "Arduino Mega Starter Kit", price: 2800, condition: "New", category: "Electronics", seller: "Rahul K.", location: "CS Lab", image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400&q=80", likes: 18, messages: 7, rating: 5.0, aiPrice: 3200 },
  { id: "4", title: "Ergonomic Study Chair", price: 4500, condition: "Like New", category: "Furniture", seller: "Sneha P.", location: "Girls Hostel", image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&q=80", likes: 8, messages: 2, rating: 4.2, aiPrice: 5000 },
  { id: "5", title: "TI-84 Calculator", price: 1800, condition: "Good", category: "Electronics", seller: "Vikram S.", location: "Main Gate", image: "https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400&q=80", likes: 6, messages: 1, rating: 4.0, aiPrice: 2000 },
  { id: "6", title: "Organic Chemistry Lab Coat", price: 200, condition: "New", category: "Clothing", seller: "Ananya D.", location: "Chemistry Dept", image: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=400&q=80", likes: 4, messages: 0, rating: 4.7, aiPrice: 250 },
];

const stagger = {
  container: { transition: { staggerChildren: 0.05 } },
  item: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }
};

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = listings.filter((l) => {
    const matchCat = selectedCategory === "All" || l.category === selectedCategory;
    const matchSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase());
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
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-mint to-accent px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_25px_rgba(56,242,181,0.25)] transition-shadow hover:shadow-[0_0_35px_rgba(56,242,181,0.35)]">
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
                <GlassCard hover className="group h-full">
                  {/* Image */}
                  <div className="relative -mx-5 -mt-5 mb-4 h-40 overflow-hidden rounded-t-2xl">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent" />
                    <NeonBadge color={item.condition === "New" ? "mint" : "blue"} size="sm" className="absolute bottom-3 left-3">{item.condition}</NeonBadge>
                    <button className="absolute right-3 top-3 rounded-lg bg-black/40 p-1.5 text-white/60 backdrop-blur-sm transition-colors hover:text-rose">
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>

                  <h3 className="font-heading text-base font-semibold line-clamp-1">{item.title}</h3>

                  {/* Price */}
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-heading text-xl font-bold text-mint">₹{item.price.toLocaleString("en-IN")}</span>
                    {item.aiPrice !== item.price && (
                      <span className="text-xs text-slate line-through">₹{item.aiPrice.toLocaleString("en-IN")} AI est.</span>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.location}</span>
                    <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-blaze" /> {item.rating}</span>
                  </div>

                  {/* Seller + Actions */}
                  <div className="mt-3 flex items-center justify-between border-t border-white/[0.04] pt-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={item.seller} size="sm" />
                      <span className="text-xs text-slate">{item.seller}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate">
                      <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" /> {item.likes}</span>
                      <span className="flex items-center gap-0.5"><MessageCircle className="h-3 w-3" /> {item.messages}</span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </AppShell>
  );
}
