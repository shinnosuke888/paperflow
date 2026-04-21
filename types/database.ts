export type Database = {
  public: {
    Tables: {
      favorite_papers: {
        Row: {
          user_id: string;
          paper_id: string;
          source: string;
          title: string;
          summary: string;
          authors: string[];
          categories: string[];
          primary_category: string | null;
          arxiv_url: string;
          pdf_url: string | null;
          comment: string | null;
          published_at: string | null;
          updated_at: string | null;
          saved_at: string;
        };
        Insert: {
          user_id: string;
          paper_id: string;
          source?: string;
          title: string;
          summary?: string;
          authors?: string[];
          categories?: string[];
          primary_category?: string | null;
          arxiv_url: string;
          pdf_url?: string | null;
          comment?: string | null;
          published_at?: string | null;
          updated_at?: string | null;
          saved_at?: string;
        };
        Update: {
          user_id?: string;
          paper_id?: string;
          source?: string;
          title?: string;
          summary?: string;
          authors?: string[];
          categories?: string[];
          primary_category?: string | null;
          arxiv_url?: string;
          pdf_url?: string | null;
          comment?: string | null;
          published_at?: string | null;
          updated_at?: string | null;
          saved_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
