CREATE TABLE "ai_suggestions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" text NOT NULL,
	"suggestion_type" text NOT NULL,
	"content" text NOT NULL,
	"time_of_day" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "calorie_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" text NOT NULL,
	"calories" integer NOT NULL,
	"protein" integer NOT NULL,
	"carbs" integer NOT NULL,
	"fat" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_meal_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" text NOT NULL,
	"meal_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"estimated_calories" integer NOT NULL,
	"estimated_protein" numeric(8, 2) NOT NULL,
	"estimated_carbs" numeric(8, 2) NOT NULL,
	"estimated_fat" numeric(8, 2) NOT NULL,
	"ingredients" json NOT NULL,
	"instructions" text,
	"is_selected" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "food_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" text NOT NULL,
	"meal_type" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text,
	"calories" integer NOT NULL,
	"protein" numeric(8, 2) NOT NULL,
	"carbs" numeric(8, 2) NOT NULL,
	"fat" numeric(8, 2) NOT NULL,
	"fiber" numeric(8, 2),
	"sugar" numeric(8, 2),
	"sodium" numeric(8, 2),
	"ai_analysis" json,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"subscription_status" text DEFAULT 'trial',
	"trial_ends_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
