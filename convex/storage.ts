import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const savePDFReference = mutation({
  args: {
    storageId: v.id("_storage"),
    email: v.string(),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    const { storageId, email, fileName } = args;
    
    await ctx.db.insert("documents", {
      pdfStorageId: storageId,
      email,
      fileName,
      uploadedAt: Date.now(),
      type: "relocation-report",
    });
    
    return storageId;
  },
});

export const getPDFUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});