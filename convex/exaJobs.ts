import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { createExaService } from "./services/exaService";

type Scenario = "cheapest" | "fastest" | "balanced" | "luxury";

export const createJob = mutation({
  args: {
    originCity: v.string(),
    originCountry: v.optional(v.string()),
    destinationCity: v.string(),
    destinationCountry: v.optional(v.string()),
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
    moveMonth: v.optional(v.string()),
    context: v.optional(v.string()),
    scenario: v.union(
      v.literal("cheapest"),
      v.literal("fastest"),
      v.literal("balanced"),
      v.literal("luxury"),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const jobId = await ctx.db.insert("exa_jobs", {
      status: "pending",
      params: args,
      results: {},
      errors: {},
      createdAt: now,
      updatedAt: now,
    } as any);
    return jobId;
  },
});

export const getJob = query({
  args: { jobId: v.optional(v.id("exa_jobs")) },
  handler: async (ctx, { jobId }) => {
    if (!jobId) return null;
    return await ctx.db.get(jobId);
  },
});

// Internal helper mutations used by the action
export const _startJob = mutation({
  args: { jobId: v.id("exa_jobs") },
  handler: async (ctx, { jobId }) => {
    await ctx.db.patch(jobId, { status: "running", updatedAt: Date.now() } as any);
  },
});

export const _patchCategory = mutation({
  args: {
    jobId: v.id("exa_jobs"),
    category: v.string(),
    items: v.array(
      v.object({
        title: v.string(),
        url: v.string(),
        text: v.optional(v.string()),
        snippet: v.optional(v.string()),
        publishedDate: v.optional(v.string()),
        score: v.optional(v.number()),
        author: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { jobId, category, items }) => {
    const current = (await ctx.db.get(jobId)) as any;
    const merged = { ...(current?.results || {}), [category]: items };
    await ctx.db.patch(jobId, { results: merged, updatedAt: Date.now() } as any);
  },
});

export const _patchError = mutation({
  args: { jobId: v.id("exa_jobs"), category: v.string(), error: v.string() },
  handler: async (ctx, { jobId, category, error }) => {
    const current = (await ctx.db.get(jobId)) as any;
    const merged = { ...(current?.errors || {}), [category]: error };
    await ctx.db.patch(jobId, { errors: merged, updatedAt: Date.now() } as any);
  },
});

export const _setStatus = mutation({
  args: { jobId: v.id("exa_jobs"), status: v.union(v.literal("completed"), v.literal("error")) },
  handler: async (ctx, { jobId, status }) => {
    await ctx.db.patch(jobId, { status, updatedAt: Date.now() } as any);
  },
});

export const runJob = action({
  args: { jobId: v.id("exa_jobs") },
  handler: async (ctx, { jobId }) => {
    const job = await ctx.runQuery(api.exaJobs.getJob, { jobId: jobId as Id<"exa_jobs"> });
    if (!job) throw new Error("Job not found");

    // Mark running
    await ctx.runMutation(api.exaJobs._startJob, { jobId: jobId as Id<"exa_jobs"> });

    const { originCity = "", destinationCity = "", scenario, budgetMin, budgetMax, moveMonth, context } = (job as any).params as {
      originCity: string;
      destinationCity: string;
      scenario: Scenario;
      budgetMin?: number;
      budgetMax?: number;
      moveMonth?: string;
      context?: string;
    };

    const exaService = createExaService();

    const scenarioModifiers: Record<Scenario, string> = {
      cheapest: "budget affordable cheap low-cost DIY",
      fastest: "expedited fast-track premium processing quick",
      balanced: "reasonable practical moderate standard",
      luxury: "premium luxury high-end exclusive concierge",
    };
    const modifier = scenarioModifiers[scenario];
    const budgetContext = budgetMin && budgetMax ? `budget $${budgetMin}-$${budgetMax}` : "";
    const familyContext = context?.toLowerCase().includes("family") ? "family" : "";
    const petContext = context?.toLowerCase().match(/pet|dog|cat/) ? "pet dog cat animal" : "";

    const searchQueries: Record<string, string[]> = {
      visaRequirements: [
        `${destinationCity} visa requirements immigration process from ${originCity} ${modifier}`,
        `relocating to ${destinationCity} visa pathways residency permits ${moveMonth || "2025"}`,
      ],
      housingMarket: [
        `${destinationCity} rental housing apartments ${modifier} ${budgetContext} ${familyContext}`,
        `${destinationCity} real estate rental prices neighborhoods expat areas ${moveMonth || "2025"}`,
      ],
      costOfLiving: [
        `${destinationCity} cost of living expenses ${budgetContext} compared to ${originCity}`,
        `${destinationCity} monthly expenses utilities groceries transportation ${modifier}`,
      ],
      transportOptions: [
        `${originCity} to ${destinationCity} moving shipping relocation services ${modifier}`,
        `international moving companies shipping costs ${originCity} ${destinationCity}`,
      ],
      schoolsEducation: familyContext
        ? [
            `${destinationCity} international schools education ${familyContext} ${modifier}`,
            `${destinationCity} school districts family neighborhoods children education`,
          ]
        : [],
      petRelocation: petContext
        ? [
            `${destinationCity} pet relocation import requirements ${petContext} from ${originCity}`,
            `bringing pets to ${destinationCity} quarantine vaccination requirements ${petContext}`,
          ]
        : [],
      localInsights: [
        `${destinationCity} expat community living experience tips advice ${moveMonth || "2025"}`,
        `${destinationCity} neighborhoods safety quality of life ${familyContext} ${modifier}`,
      ],
    };

    // Helper to patch incremental results
    const patchCategory = async (category: string, items: any[]) => {
      await ctx.runMutation(api.exaJobs._patchCategory, {
        jobId: jobId as Id<"exa_jobs">,
        category,
        items: items.map((r: any) => ({
          title: r.title || "",
          url: r.url || "",
          text: r.text,
          snippet: r.snippet,
          publishedDate: r.publishedDate,
          score: r.score,
          author: r.author,
        })),
      });
    };

    try {
      // Process categories in parallel, patching as each set of queries completes
      await Promise.all(
        Object.entries(searchQueries).map(async ([category, queries]) => {
          if (!queries.length) {
            await patchCategory(category, []);
            return;
          }
          try {
            const batches = await Promise.all(
              queries.map((q) =>
                exaService.search({
                  query: q,
                  numResults: 5,
                  type: "neural",
                  startPublishedDate: "2024-01-01",
                  text: { maxCharacters: 800 },
                }).catch(() => [])
              )
            );
            // Flatten and de-dupe by URL
            const flat = batches.flat();
            const seen = new Set<string>();
            const deduped = flat.filter((r: any) => {
              if (!r?.url) return false;
              if (seen.has(r.url)) return false;
              seen.add(r.url);
              return true;
            });
            await patchCategory(category, deduped);
          } catch (err) {
            await ctx.runMutation(api.exaJobs._patchError, {
              jobId: jobId as Id<"exa_jobs">,
              category,
              error: String(err),
            });
          }
        })
      );

      await ctx.runMutation(api.exaJobs._setStatus, { jobId: jobId as Id<"exa_jobs">, status: "completed" });
    } catch (error) {
      await ctx.runMutation(api.exaJobs._patchError, {
        jobId: jobId as Id<"exa_jobs">,
        category: "_job",
        error: String(error),
      });
      await ctx.runMutation(api.exaJobs._setStatus, { jobId: jobId as Id<"exa_jobs">, status: "error" });
    }
  },
});
