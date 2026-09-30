CREATE SCHEMA "modern";
--> statement-breakpoint
CREATE TYPE "modern"."attendance_status" AS ENUM('working', 'on_break', 'completed', 'flagged');--> statement-breakpoint
CREATE TYPE "modern"."break_type" AS ENUM('lunch', 'tea', 'personal_gap');--> statement-breakpoint
CREATE TYPE "modern"."face_verification_status" AS ENUM('PASSED', 'MISSED', 'FAILED');--> statement-breakpoint
CREATE TYPE "modern"."user_role" AS ENUM('admin', 'employee');--> statement-breakpoint
CREATE TYPE "modern"."user_status" AS ENUM('pending', 'active', 'inactive');--> statement-breakpoint
CREATE TABLE "modern"."attendance_breaks" (
	"id" serial PRIMARY KEY NOT NULL,
	"attendance_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"break_type" "modern"."break_type" NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone,
	"duration_minutes" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modern"."attendance_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"work_date" varchar(10) NOT NULL,
	"check_in" timestamp with time zone,
	"check_out" timestamp with time zone,
	"net_working_minutes" integer DEFAULT 0 NOT NULL,
	"break_minutes" integer DEFAULT 0 NOT NULL,
	"status" "modern"."attendance_status" DEFAULT 'working' NOT NULL,
	"session_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modern"."company_shifts" (
	"id" serial PRIMARY KEY NOT NULL,
	"shift_name" varchar(100) DEFAULT 'Standard Office Hours' NOT NULL,
	"start_time" time DEFAULT '08:30:00' NOT NULL,
	"end_time" time DEFAULT '17:00:00' NOT NULL,
	"early_checkin_grace_minutes" integer DEFAULT 15 NOT NULL,
	"is_strict_enforced" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modern"."face_verification_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"attendance_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "modern"."face_verification_status" NOT NULL,
	"confidence_score" integer NOT NULL,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modern"."user_biometrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"face_descriptor" jsonb NOT NULL,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modern"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" varchar(20) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(150) NOT NULL,
	"password_hash" varchar(255),
	"role" "modern"."user_role" DEFAULT 'employee' NOT NULL,
	"status" "modern"."user_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "modern"."attendance_breaks" ADD CONSTRAINT "attendance_breaks_attendance_id_attendance_records_id_fk" FOREIGN KEY ("attendance_id") REFERENCES "modern"."attendance_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modern"."attendance_breaks" ADD CONSTRAINT "attendance_breaks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "modern"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modern"."attendance_records" ADD CONSTRAINT "attendance_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "modern"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modern"."face_verification_logs" ADD CONSTRAINT "face_verification_logs_attendance_id_attendance_records_id_fk" FOREIGN KEY ("attendance_id") REFERENCES "modern"."attendance_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modern"."face_verification_logs" ADD CONSTRAINT "face_verification_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "modern"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modern"."user_biometrics" ADD CONSTRAINT "user_biometrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "modern"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attendance_breaks_attendance_id_idx" ON "modern"."attendance_breaks" USING btree ("attendance_id");--> statement-breakpoint
CREATE INDEX "attendance_breaks_user_id_idx" ON "modern"."attendance_breaks" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "attendance_records_user_day_unique" ON "modern"."attendance_records" USING btree ("user_id","work_date");--> statement-breakpoint
CREATE INDEX "attendance_records_work_date_idx" ON "modern"."attendance_records" USING btree ("work_date");--> statement-breakpoint
CREATE INDEX "company_shifts_is_active_idx" ON "modern"."company_shifts" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "company_shifts_single_active_unique" ON "modern"."company_shifts" USING btree ("is_active") WHERE "modern"."company_shifts"."is_active" = true;--> statement-breakpoint
CREATE INDEX "face_verification_logs_attendance_id_idx" ON "modern"."face_verification_logs" USING btree ("attendance_id");--> statement-breakpoint
CREATE INDEX "face_verification_logs_user_id_idx" ON "modern"."face_verification_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_biometrics_user_id_idx" ON "modern"."user_biometrics" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_employee_id_unique" ON "modern"."users" USING btree ("employee_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "modern"."users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "modern"."users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "modern"."users" USING btree ("status");