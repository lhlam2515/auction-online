DROP INDEX "idx_products_name_trigram";--> statement-breakpoint
CREATE INDEX "idx_products_name_fts" ON "products" USING gin (to_tsvector('simple', "name"));--> statement-breakpoint
CREATE INDEX "idx_products_name_trgm" ON "products" USING gin ("name" gin_trgm_ops);
