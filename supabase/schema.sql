-- 大喜利ゲーム データベーススキーマ

-- ルーム（部屋）テーブル
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(8) UNIQUE NOT NULL, -- ルームコード（例: OGIRI-AB）
  name VARCHAR(100) NOT NULL, -- ルーム名
  host_name VARCHAR(50) NOT NULL, -- ホスト名
  current_topic TEXT, -- 現在のお題
  is_active BOOLEAN DEFAULT true, -- ルームがアクティブか
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- プレイヤーテーブル
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  color_seed INTEGER DEFAULT 0, -- キャラクターの色シード
  is_host BOOLEAN DEFAULT false,
  total_zabuton INTEGER DEFAULT 0, -- 累計座布団数
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 回答テーブル
CREATE TABLE answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  topic TEXT NOT NULL, -- 回答時のお題
  content TEXT NOT NULL, -- 回答内容
  zabuton_count INTEGER DEFAULT 0, -- この回答の座布団数
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 座布団（投票）テーブル
CREATE TABLE zabutons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  answer_id UUID REFERENCES answers(id) ON DELETE CASCADE,
  voter_id UUID REFERENCES players(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(answer_id, voter_id) -- 1人1回答につき1票
);

-- インデックス
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_players_room_id ON players(room_id);
CREATE INDEX idx_answers_room_id ON answers(room_id);
CREATE INDEX idx_zabutons_answer_id ON zabutons(answer_id);

-- ルームコード生成関数
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS VARCHAR(8) AS $$
DECLARE
  chars VARCHAR(26) := 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  code VARCHAR(8);
  i INTEGER;
BEGIN
  code := 'OG-';
  FOR i IN 1..4 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- 座布団追加時に回答の座布団数とプレイヤーの累計を更新するトリガー
CREATE OR REPLACE FUNCTION update_zabuton_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- 回答の座布団数を更新
  UPDATE answers
  SET zabuton_count = zabuton_count + 1
  WHERE id = NEW.answer_id;

  -- プレイヤーの累計座布団数を更新
  UPDATE players
  SET total_zabuton = total_zabuton + 1
  WHERE id = (SELECT player_id FROM answers WHERE id = NEW.answer_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_zabuton_insert
AFTER INSERT ON zabutons
FOR EACH ROW
EXECUTE FUNCTION update_zabuton_counts();

-- RLS（Row Level Security）ポリシー
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE zabutons ENABLE ROW LEVEL SECURITY;

-- 全員が読み取り可能（匿名アクセス）
CREATE POLICY "Rooms are viewable by everyone" ON rooms FOR SELECT USING (true);
CREATE POLICY "Players are viewable by everyone" ON players FOR SELECT USING (true);
CREATE POLICY "Answers are viewable by everyone" ON answers FOR SELECT USING (true);
CREATE POLICY "Zabutons are viewable by everyone" ON zabutons FOR SELECT USING (true);

-- 全員が作成可能（匿名アクセス）
CREATE POLICY "Anyone can create rooms" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can join as player" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can post answers" ON answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can give zabutons" ON zabutons FOR INSERT WITH CHECK (true);

-- ルームのお題更新はホストのみ（簡易版：とりあえず全員許可）
CREATE POLICY "Anyone can update rooms" ON rooms FOR UPDATE USING (true);
CREATE POLICY "Anyone can update players" ON players FOR UPDATE USING (true);

-- Realtime有効化
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE answers;
ALTER PUBLICATION supabase_realtime ADD TABLE zabutons;
