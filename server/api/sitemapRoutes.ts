import { Express } from "express";
import sitemapRouter from "./sitemaps";

export function registerSitemapRoutes(app: Express): void {
  app.use("/api/sitemaps", sitemapRouter);
}