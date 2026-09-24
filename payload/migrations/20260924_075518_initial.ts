import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Payload's tables live in their own schema, apart from the site's `public`
  // tables (products, orders, profiles). Created here so a fresh database needs
  // no manual step.
  await db.execute(sql`CREATE SCHEMA IF NOT EXISTS "payload";`)
  await db.execute(sql`
   CREATE TYPE "payload"."enum_users_role" AS ENUM('admin', 'marketing');
  CREATE TYPE "payload"."enum_home_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__home_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum_announcement_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__announcement_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum_about_values_icon" AS ENUM('shield', 'home', 'wrench', 'headset');
  CREATE TYPE "payload"."enum_about_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__about_v_version_values_icon" AS ENUM('shield', 'home', 'wrench', 'headset');
  CREATE TYPE "payload"."enum__about_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum_contact_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__contact_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum_seo_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__seo_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "payload"."users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "payload"."users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "payload"."enum_users_role" DEFAULT 'marketing' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric
  );
  
  CREATE TABLE "payload"."payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload"."payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "payload"."payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload"."payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."home_hero_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "payload"."home_feature_showcase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"heading_en" varchar,
  	"heading_th" varchar,
  	"body_en" varchar,
  	"body_th" varchar
  );
  
  CREATE TABLE "payload"."home_video_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"poster_id" integer,
  	"title" varchar,
  	"tag" varchar,
  	"author" varchar
  );
  
  CREATE TABLE "payload"."home_trust_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" numeric,
  	"decimals" numeric DEFAULT 0,
  	"suffix" varchar,
  	"label_en" varchar,
  	"label_th" varchar
  );
  
  CREATE TABLE "payload"."home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_headline_en" varchar,
  	"hero_headline_th" varchar,
  	"hero_accent_en" varchar,
  	"hero_accent_th" varchar,
  	"hero_sub_en" varchar,
  	"hero_sub_th" varchar,
  	"trust_heading_en" varchar,
  	"trust_heading_th" varchar,
  	"trust_body_en" varchar,
  	"trust_body_th" varchar,
  	"_status" "payload"."enum_home_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."_home_v_version_hero_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_home_v_version_feature_showcase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"heading_en" varchar,
  	"heading_th" varchar,
  	"body_en" varchar,
  	"body_th" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_home_v_version_video_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"poster_id" integer,
  	"title" varchar,
  	"tag" varchar,
  	"author" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_home_v_version_trust_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" numeric,
  	"decimals" numeric DEFAULT 0,
  	"suffix" varchar,
  	"label_en" varchar,
  	"label_th" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_home_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_headline_en" varchar,
  	"version_hero_headline_th" varchar,
  	"version_hero_accent_en" varchar,
  	"version_hero_accent_th" varchar,
  	"version_hero_sub_en" varchar,
  	"version_hero_sub_th" varchar,
  	"version_trust_heading_en" varchar,
  	"version_trust_heading_th" varchar,
  	"version_trust_body_en" varchar,
  	"version_trust_body_th" varchar,
  	"version__status" "payload"."enum__home_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."announcement_messages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"message_en" varchar,
  	"message_th" varchar
  );
  
  CREATE TABLE "payload"."announcement" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"_status" "payload"."enum_announcement_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."_announcement_v_version_messages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"message_en" varchar,
  	"message_th" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_announcement_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_enabled" boolean DEFAULT true,
  	"version__status" "payload"."enum__announcement_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."about_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label_en" varchar,
  	"label_th" varchar
  );
  
  CREATE TABLE "payload"."about_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "payload"."enum_about_values_icon" DEFAULT 'shield',
  	"title_en" varchar,
  	"title_th" varchar,
  	"body_en" varchar,
  	"body_th" varchar
  );
  
  CREATE TABLE "payload"."about_milestones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"when" varchar,
  	"title_en" varchar,
  	"title_th" varchar,
  	"body_en" varchar,
  	"body_th" varchar
  );
  
  CREATE TABLE "payload"."about_team" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role_en" varchar,
  	"role_th" varchar,
  	"photo_id" integer
  );
  
  CREATE TABLE "payload"."about" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"intro_en" varchar,
  	"intro_th" varchar,
  	"story_body_en" varchar,
  	"story_body_th" varchar,
  	"story_image_id" integer,
  	"partner_enabled" boolean DEFAULT true,
  	"partner_eyebrow_en" varchar,
  	"partner_eyebrow_th" varchar,
  	"partner_name" varchar,
  	"partner_status_en" varchar,
  	"partner_status_th" varchar,
  	"partner_body_en" varchar,
  	"partner_body_th" varchar,
  	"partner_logo_id" integer,
  	"_status" "payload"."enum_about_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."_about_v_version_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label_en" varchar,
  	"label_th" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_about_v_version_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "payload"."enum__about_v_version_values_icon" DEFAULT 'shield',
  	"title_en" varchar,
  	"title_th" varchar,
  	"body_en" varchar,
  	"body_th" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_about_v_version_milestones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"when" varchar,
  	"title_en" varchar,
  	"title_th" varchar,
  	"body_en" varchar,
  	"body_th" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_about_v_version_team" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role_en" varchar,
  	"role_th" varchar,
  	"photo_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_about_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_intro_en" varchar,
  	"version_intro_th" varchar,
  	"version_story_body_en" varchar,
  	"version_story_body_th" varchar,
  	"version_story_image_id" integer,
  	"version_partner_enabled" boolean DEFAULT true,
  	"version_partner_eyebrow_en" varchar,
  	"version_partner_eyebrow_th" varchar,
  	"version_partner_name" varchar,
  	"version_partner_status_en" varchar,
  	"version_partner_status_th" varchar,
  	"version_partner_body_en" varchar,
  	"version_partner_body_th" varchar,
  	"version_partner_logo_id" integer,
  	"version__status" "payload"."enum__about_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."contact" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"phone" varchar,
  	"email" varchar,
  	"phone_hours_en" varchar,
  	"phone_hours_th" varchar,
  	"line_id" varchar,
  	"line_url" varchar,
  	"line_qr_image_id" integer,
  	"socials_facebook" varchar,
  	"socials_youtube" varchar,
  	"socials_tiktok" varchar,
  	"_status" "payload"."enum_contact_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."_contact_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_phone" varchar,
  	"version_email" varchar,
  	"version_phone_hours_en" varchar,
  	"version_phone_hours_th" varchar,
  	"version_line_id" varchar,
  	"version_line_url" varchar,
  	"version_line_qr_image_id" integer,
  	"version_socials_facebook" varchar,
  	"version_socials_youtube" varchar,
  	"version_socials_tiktok" varchar,
  	"version__status" "payload"."enum__contact_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."seo_products" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" varchar,
  	"title_en" varchar,
  	"title_th" varchar,
  	"description_en" varchar,
  	"description_th" varchar
  );
  
  CREATE TABLE "payload"."seo" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_title_en" varchar,
  	"site_title_th" varchar,
  	"site_description_en" varchar,
  	"site_description_th" varchar,
  	"share_image_id" integer,
  	"_status" "payload"."enum_seo_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."_seo_v_version_products" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" varchar,
  	"title_en" varchar,
  	"title_th" varchar,
  	"description_en" varchar,
  	"description_th" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "payload"."_seo_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_site_title_en" varchar,
  	"version_site_title_th" varchar,
  	"version_site_description_en" varchar,
  	"version_site_description_th" varchar,
  	"version_share_image_id" integer,
  	"version__status" "payload"."enum__seo_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "payload"."users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "payload"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."home_hero_videos" ADD CONSTRAINT "home_hero_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."home_feature_showcase" ADD CONSTRAINT "home_feature_showcase_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."home_feature_showcase" ADD CONSTRAINT "home_feature_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."home_video_gallery" ADD CONSTRAINT "home_video_gallery_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."home_video_gallery" ADD CONSTRAINT "home_video_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."home_trust_stats" ADD CONSTRAINT "home_trust_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_home_v_version_hero_videos" ADD CONSTRAINT "_home_v_version_hero_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_home_v_version_feature_showcase" ADD CONSTRAINT "_home_v_version_feature_showcase_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_home_v_version_feature_showcase" ADD CONSTRAINT "_home_v_version_feature_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_home_v_version_video_gallery" ADD CONSTRAINT "_home_v_version_video_gallery_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_home_v_version_video_gallery" ADD CONSTRAINT "_home_v_version_video_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_home_v_version_trust_stats" ADD CONSTRAINT "_home_v_version_trust_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."announcement_messages" ADD CONSTRAINT "announcement_messages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."announcement"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_announcement_v_version_messages" ADD CONSTRAINT "_announcement_v_version_messages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_announcement_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."about_stats" ADD CONSTRAINT "about_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."about_values" ADD CONSTRAINT "about_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."about_milestones" ADD CONSTRAINT "about_milestones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."about_team" ADD CONSTRAINT "about_team_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."about_team" ADD CONSTRAINT "about_team_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."about" ADD CONSTRAINT "about_story_image_id_media_id_fk" FOREIGN KEY ("story_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."about" ADD CONSTRAINT "about_partner_logo_id_media_id_fk" FOREIGN KEY ("partner_logo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_about_v_version_stats" ADD CONSTRAINT "_about_v_version_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_about_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_about_v_version_values" ADD CONSTRAINT "_about_v_version_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_about_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_about_v_version_milestones" ADD CONSTRAINT "_about_v_version_milestones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_about_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_about_v_version_team" ADD CONSTRAINT "_about_v_version_team_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_about_v_version_team" ADD CONSTRAINT "_about_v_version_team_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_about_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_about_v" ADD CONSTRAINT "_about_v_version_story_image_id_media_id_fk" FOREIGN KEY ("version_story_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_about_v" ADD CONSTRAINT "_about_v_version_partner_logo_id_media_id_fk" FOREIGN KEY ("version_partner_logo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."contact" ADD CONSTRAINT "contact_line_qr_image_id_media_id_fk" FOREIGN KEY ("line_qr_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_contact_v" ADD CONSTRAINT "_contact_v_version_line_qr_image_id_media_id_fk" FOREIGN KEY ("version_line_qr_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."seo_products" ADD CONSTRAINT "seo_products_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."seo"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."seo" ADD CONSTRAINT "seo_share_image_id_media_id_fk" FOREIGN KEY ("share_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_seo_v_version_products" ADD CONSTRAINT "_seo_v_version_products_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."_seo_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_seo_v" ADD CONSTRAINT "_seo_v_version_share_image_id_media_id_fk" FOREIGN KEY ("version_share_image_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "payload"."users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "payload"."users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "payload"."users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "payload"."users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "payload"."users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "payload"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "payload"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "payload"."media" USING btree ("filename");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload"."payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload"."payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload"."payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload"."payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload"."payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload"."payload_migrations" USING btree ("created_at");
  CREATE INDEX "home_hero_videos_order_idx" ON "payload"."home_hero_videos" USING btree ("_order");
  CREATE INDEX "home_hero_videos_parent_id_idx" ON "payload"."home_hero_videos" USING btree ("_parent_id");
  CREATE INDEX "home_feature_showcase_order_idx" ON "payload"."home_feature_showcase" USING btree ("_order");
  CREATE INDEX "home_feature_showcase_parent_id_idx" ON "payload"."home_feature_showcase" USING btree ("_parent_id");
  CREATE INDEX "home_feature_showcase_image_idx" ON "payload"."home_feature_showcase" USING btree ("image_id");
  CREATE INDEX "home_video_gallery_order_idx" ON "payload"."home_video_gallery" USING btree ("_order");
  CREATE INDEX "home_video_gallery_parent_id_idx" ON "payload"."home_video_gallery" USING btree ("_parent_id");
  CREATE INDEX "home_video_gallery_poster_idx" ON "payload"."home_video_gallery" USING btree ("poster_id");
  CREATE INDEX "home_trust_stats_order_idx" ON "payload"."home_trust_stats" USING btree ("_order");
  CREATE INDEX "home_trust_stats_parent_id_idx" ON "payload"."home_trust_stats" USING btree ("_parent_id");
  CREATE INDEX "home__status_idx" ON "payload"."home" USING btree ("_status");
  CREATE INDEX "_home_v_version_hero_videos_order_idx" ON "payload"."_home_v_version_hero_videos" USING btree ("_order");
  CREATE INDEX "_home_v_version_hero_videos_parent_id_idx" ON "payload"."_home_v_version_hero_videos" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_feature_showcase_order_idx" ON "payload"."_home_v_version_feature_showcase" USING btree ("_order");
  CREATE INDEX "_home_v_version_feature_showcase_parent_id_idx" ON "payload"."_home_v_version_feature_showcase" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_feature_showcase_image_idx" ON "payload"."_home_v_version_feature_showcase" USING btree ("image_id");
  CREATE INDEX "_home_v_version_video_gallery_order_idx" ON "payload"."_home_v_version_video_gallery" USING btree ("_order");
  CREATE INDEX "_home_v_version_video_gallery_parent_id_idx" ON "payload"."_home_v_version_video_gallery" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_video_gallery_poster_idx" ON "payload"."_home_v_version_video_gallery" USING btree ("poster_id");
  CREATE INDEX "_home_v_version_trust_stats_order_idx" ON "payload"."_home_v_version_trust_stats" USING btree ("_order");
  CREATE INDEX "_home_v_version_trust_stats_parent_id_idx" ON "payload"."_home_v_version_trust_stats" USING btree ("_parent_id");
  CREATE INDEX "_home_v_version_version__status_idx" ON "payload"."_home_v" USING btree ("version__status");
  CREATE INDEX "_home_v_created_at_idx" ON "payload"."_home_v" USING btree ("created_at");
  CREATE INDEX "_home_v_updated_at_idx" ON "payload"."_home_v" USING btree ("updated_at");
  CREATE INDEX "_home_v_latest_idx" ON "payload"."_home_v" USING btree ("latest");
  CREATE INDEX "announcement_messages_order_idx" ON "payload"."announcement_messages" USING btree ("_order");
  CREATE INDEX "announcement_messages_parent_id_idx" ON "payload"."announcement_messages" USING btree ("_parent_id");
  CREATE INDEX "announcement__status_idx" ON "payload"."announcement" USING btree ("_status");
  CREATE INDEX "_announcement_v_version_messages_order_idx" ON "payload"."_announcement_v_version_messages" USING btree ("_order");
  CREATE INDEX "_announcement_v_version_messages_parent_id_idx" ON "payload"."_announcement_v_version_messages" USING btree ("_parent_id");
  CREATE INDEX "_announcement_v_version_version__status_idx" ON "payload"."_announcement_v" USING btree ("version__status");
  CREATE INDEX "_announcement_v_created_at_idx" ON "payload"."_announcement_v" USING btree ("created_at");
  CREATE INDEX "_announcement_v_updated_at_idx" ON "payload"."_announcement_v" USING btree ("updated_at");
  CREATE INDEX "_announcement_v_latest_idx" ON "payload"."_announcement_v" USING btree ("latest");
  CREATE INDEX "about_stats_order_idx" ON "payload"."about_stats" USING btree ("_order");
  CREATE INDEX "about_stats_parent_id_idx" ON "payload"."about_stats" USING btree ("_parent_id");
  CREATE INDEX "about_values_order_idx" ON "payload"."about_values" USING btree ("_order");
  CREATE INDEX "about_values_parent_id_idx" ON "payload"."about_values" USING btree ("_parent_id");
  CREATE INDEX "about_milestones_order_idx" ON "payload"."about_milestones" USING btree ("_order");
  CREATE INDEX "about_milestones_parent_id_idx" ON "payload"."about_milestones" USING btree ("_parent_id");
  CREATE INDEX "about_team_order_idx" ON "payload"."about_team" USING btree ("_order");
  CREATE INDEX "about_team_parent_id_idx" ON "payload"."about_team" USING btree ("_parent_id");
  CREATE INDEX "about_team_photo_idx" ON "payload"."about_team" USING btree ("photo_id");
  CREATE INDEX "about_story_image_idx" ON "payload"."about" USING btree ("story_image_id");
  CREATE INDEX "about_partner_logo_idx" ON "payload"."about" USING btree ("partner_logo_id");
  CREATE INDEX "about__status_idx" ON "payload"."about" USING btree ("_status");
  CREATE INDEX "_about_v_version_stats_order_idx" ON "payload"."_about_v_version_stats" USING btree ("_order");
  CREATE INDEX "_about_v_version_stats_parent_id_idx" ON "payload"."_about_v_version_stats" USING btree ("_parent_id");
  CREATE INDEX "_about_v_version_values_order_idx" ON "payload"."_about_v_version_values" USING btree ("_order");
  CREATE INDEX "_about_v_version_values_parent_id_idx" ON "payload"."_about_v_version_values" USING btree ("_parent_id");
  CREATE INDEX "_about_v_version_milestones_order_idx" ON "payload"."_about_v_version_milestones" USING btree ("_order");
  CREATE INDEX "_about_v_version_milestones_parent_id_idx" ON "payload"."_about_v_version_milestones" USING btree ("_parent_id");
  CREATE INDEX "_about_v_version_team_order_idx" ON "payload"."_about_v_version_team" USING btree ("_order");
  CREATE INDEX "_about_v_version_team_parent_id_idx" ON "payload"."_about_v_version_team" USING btree ("_parent_id");
  CREATE INDEX "_about_v_version_team_photo_idx" ON "payload"."_about_v_version_team" USING btree ("photo_id");
  CREATE INDEX "_about_v_version_version_story_image_idx" ON "payload"."_about_v" USING btree ("version_story_image_id");
  CREATE INDEX "_about_v_version_version_partner_logo_idx" ON "payload"."_about_v" USING btree ("version_partner_logo_id");
  CREATE INDEX "_about_v_version_version__status_idx" ON "payload"."_about_v" USING btree ("version__status");
  CREATE INDEX "_about_v_created_at_idx" ON "payload"."_about_v" USING btree ("created_at");
  CREATE INDEX "_about_v_updated_at_idx" ON "payload"."_about_v" USING btree ("updated_at");
  CREATE INDEX "_about_v_latest_idx" ON "payload"."_about_v" USING btree ("latest");
  CREATE INDEX "contact_line_qr_image_idx" ON "payload"."contact" USING btree ("line_qr_image_id");
  CREATE INDEX "contact__status_idx" ON "payload"."contact" USING btree ("_status");
  CREATE INDEX "_contact_v_version_version_line_qr_image_idx" ON "payload"."_contact_v" USING btree ("version_line_qr_image_id");
  CREATE INDEX "_contact_v_version_version__status_idx" ON "payload"."_contact_v" USING btree ("version__status");
  CREATE INDEX "_contact_v_created_at_idx" ON "payload"."_contact_v" USING btree ("created_at");
  CREATE INDEX "_contact_v_updated_at_idx" ON "payload"."_contact_v" USING btree ("updated_at");
  CREATE INDEX "_contact_v_latest_idx" ON "payload"."_contact_v" USING btree ("latest");
  CREATE INDEX "seo_products_order_idx" ON "payload"."seo_products" USING btree ("_order");
  CREATE INDEX "seo_products_parent_id_idx" ON "payload"."seo_products" USING btree ("_parent_id");
  CREATE INDEX "seo_share_image_idx" ON "payload"."seo" USING btree ("share_image_id");
  CREATE INDEX "seo__status_idx" ON "payload"."seo" USING btree ("_status");
  CREATE INDEX "_seo_v_version_products_order_idx" ON "payload"."_seo_v_version_products" USING btree ("_order");
  CREATE INDEX "_seo_v_version_products_parent_id_idx" ON "payload"."_seo_v_version_products" USING btree ("_parent_id");
  CREATE INDEX "_seo_v_version_version_share_image_idx" ON "payload"."_seo_v" USING btree ("version_share_image_id");
  CREATE INDEX "_seo_v_version_version__status_idx" ON "payload"."_seo_v" USING btree ("version__status");
  CREATE INDEX "_seo_v_created_at_idx" ON "payload"."_seo_v" USING btree ("created_at");
  CREATE INDEX "_seo_v_updated_at_idx" ON "payload"."_seo_v" USING btree ("updated_at");
  CREATE INDEX "_seo_v_latest_idx" ON "payload"."_seo_v" USING btree ("latest");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload"."users_sessions" CASCADE;
  DROP TABLE "payload"."users" CASCADE;
  DROP TABLE "payload"."media" CASCADE;
  DROP TABLE "payload"."payload_kv" CASCADE;
  DROP TABLE "payload"."payload_locked_documents" CASCADE;
  DROP TABLE "payload"."payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload"."payload_preferences" CASCADE;
  DROP TABLE "payload"."payload_preferences_rels" CASCADE;
  DROP TABLE "payload"."payload_migrations" CASCADE;
  DROP TABLE "payload"."home_hero_videos" CASCADE;
  DROP TABLE "payload"."home_feature_showcase" CASCADE;
  DROP TABLE "payload"."home_video_gallery" CASCADE;
  DROP TABLE "payload"."home_trust_stats" CASCADE;
  DROP TABLE "payload"."home" CASCADE;
  DROP TABLE "payload"."_home_v_version_hero_videos" CASCADE;
  DROP TABLE "payload"."_home_v_version_feature_showcase" CASCADE;
  DROP TABLE "payload"."_home_v_version_video_gallery" CASCADE;
  DROP TABLE "payload"."_home_v_version_trust_stats" CASCADE;
  DROP TABLE "payload"."_home_v" CASCADE;
  DROP TABLE "payload"."announcement_messages" CASCADE;
  DROP TABLE "payload"."announcement" CASCADE;
  DROP TABLE "payload"."_announcement_v_version_messages" CASCADE;
  DROP TABLE "payload"."_announcement_v" CASCADE;
  DROP TABLE "payload"."about_stats" CASCADE;
  DROP TABLE "payload"."about_values" CASCADE;
  DROP TABLE "payload"."about_milestones" CASCADE;
  DROP TABLE "payload"."about_team" CASCADE;
  DROP TABLE "payload"."about" CASCADE;
  DROP TABLE "payload"."_about_v_version_stats" CASCADE;
  DROP TABLE "payload"."_about_v_version_values" CASCADE;
  DROP TABLE "payload"."_about_v_version_milestones" CASCADE;
  DROP TABLE "payload"."_about_v_version_team" CASCADE;
  DROP TABLE "payload"."_about_v" CASCADE;
  DROP TABLE "payload"."contact" CASCADE;
  DROP TABLE "payload"."_contact_v" CASCADE;
  DROP TABLE "payload"."seo_products" CASCADE;
  DROP TABLE "payload"."seo" CASCADE;
  DROP TABLE "payload"."_seo_v_version_products" CASCADE;
  DROP TABLE "payload"."_seo_v" CASCADE;
  DROP TYPE "payload"."enum_users_role";
  DROP TYPE "payload"."enum_home_status";
  DROP TYPE "payload"."enum__home_v_version_status";
  DROP TYPE "payload"."enum_announcement_status";
  DROP TYPE "payload"."enum__announcement_v_version_status";
  DROP TYPE "payload"."enum_about_values_icon";
  DROP TYPE "payload"."enum_about_status";
  DROP TYPE "payload"."enum__about_v_version_values_icon";
  DROP TYPE "payload"."enum__about_v_version_status";
  DROP TYPE "payload"."enum_contact_status";
  DROP TYPE "payload"."enum__contact_v_version_status";
  DROP TYPE "payload"."enum_seo_status";
  DROP TYPE "payload"."enum__seo_v_version_status";`)
}
