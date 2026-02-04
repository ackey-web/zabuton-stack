export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string;
          code: string;
          name: string;
          host_name: string;
          current_topic: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          host_name: string;
          current_topic?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          host_name?: string;
          current_topic?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          room_id: string;
          name: string;
          color_seed: number;
          is_host: boolean;
          total_zabuton: number;
          joined_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          name: string;
          color_seed?: number;
          is_host?: boolean;
          total_zabuton?: number;
          joined_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          name?: string;
          color_seed?: number;
          is_host?: boolean;
          total_zabuton?: number;
          joined_at?: string;
        };
      };
      answers: {
        Row: {
          id: string;
          room_id: string;
          player_id: string;
          topic: string;
          content: string;
          zabuton_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          player_id: string;
          topic: string;
          content: string;
          zabuton_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          player_id?: string;
          topic?: string;
          content?: string;
          zabuton_count?: number;
          created_at?: string;
        };
      };
      zabutons: {
        Row: {
          id: string;
          answer_id: string;
          voter_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          answer_id: string;
          voter_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          answer_id?: string;
          voter_id?: string;
          created_at?: string;
        };
      };
    };
  };
}

// 便利な型エイリアス
export type Room = Database['public']['Tables']['rooms']['Row'];
export type Player = Database['public']['Tables']['players']['Row'];
export type Answer = Database['public']['Tables']['answers']['Row'];
export type Zabuton = Database['public']['Tables']['zabutons']['Row'];

// プレイヤー情報付きの回答
export interface AnswerWithPlayer extends Answer {
  player: Player;
}
