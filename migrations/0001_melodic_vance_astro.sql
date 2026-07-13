CREATE TABLE "leaderboard" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_name" text NOT NULL,
	"score" integer NOT NULL,
	"level" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
