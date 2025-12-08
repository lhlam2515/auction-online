CREATE TYPE "public"."otp_purpose" AS ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET');--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"otp_record_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "otp_verifications" ADD COLUMN "purpose" "otp_purpose" DEFAULT 'EMAIL_VERIFICATION' NOT NULL;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_otp_record_id_otp_verifications_id_fk" FOREIGN KEY ("otp_record_id") REFERENCES "public"."otp_verifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_reset_token" ON "password_reset_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_reset_token_email" ON "password_reset_tokens" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_reset_token_expires_at" ON "password_reset_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_otp_email_purpose" ON "otp_verifications" USING btree ("email","purpose");