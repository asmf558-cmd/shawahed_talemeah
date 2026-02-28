import { createBrowserClient } from "@supabase/ssr";

export type Database = {
  public: {
    Tables: {
      teachers: {
        Row: {
          id: string;
          auth_id: string;
          name: string;
          email: string;
          phone: string | null;
          gender: "male" | "female" | null;
          school: string | null;
          subject: string | null;
          is_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Teachers["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Teachers["Insert"]>;
      };
      reports: {
        Row: {
          id: string;
          teacher_id: string;
          title: string;
          date: string;
          grade: string;
          subject: string;
          activity_type: string;
          description: string | null;
          objectives: string | null;
          steps: string | null;
          outcomes: string | null;
          tools: string | null;
          evaluation: string | null;
          criteria_id: string | null;
          criteria_label: string | null;
          teacher_gender: string;
          status: "draft" | "ready" | "shared";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Reports["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Reports["Insert"]>;
      };
      report_images: {
        Row: {
          id: string;
          report_id: string;
          storage_path: string;
          is_blurred: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<ReportImages["Row"], "id" | "created_at">;
        Update: Partial<ReportImages["Insert"]>;
      };
    };
  };
};

// Helper types
type Teachers    = Database["public"]["Tables"]["teachers"];
type Reports     = Database["public"]["Tables"]["reports"];
type ReportImages = Database["public"]["Tables"]["report_images"];

export type TeacherRow     = Teachers["Row"];
export type ReportRow      = Reports["Row"];
export type ReportImageRow = ReportImages["Row"];

// ── Browser client (for client components) ──
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseBrowser() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return browserClient;
}
