CREATE TABLE IF NOT EXISTS "chats" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" integer NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "chats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

CREATE TABLE IF NOT EXISTS "chat_messages" (
    "id" serial PRIMARY KEY NOT NULL,
    "chat_id" integer NOT NULL,
    "content" text NOT NULL,
    "role" varchar(20) NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "chat_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id")
);

CREATE INDEX IF NOT EXISTS "idx_chats_user_id" ON "chats"("user_id");
CREATE INDEX IF NOT EXISTS "idx_chat_messages_chat_id" ON "chat_messages"("chat_id");