CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"is_verified" boolean DEFAULT false,
	"shared_secret" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"last_login" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
