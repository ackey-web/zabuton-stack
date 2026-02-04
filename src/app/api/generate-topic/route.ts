import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { theme } = await request.json();

    if (!theme) {
      return NextResponse.json(
        { error: 'テーマを入力してください' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      // APIキーがない場合はフォールバック
      return NextResponse.json({
        topic: generateFallbackTopic(theme),
        source: 'fallback',
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `あなたは笑点の司会者のような、大喜利のお題を考える天才です。
指定されたテーマから、回答者の創造性を刺激する秀逸なお題を生成してください。

【お題のスタイル（ランダムに選んで）】
1. 状況設定型：「○○が△△したときの一言」「○○の最後の言葉」
2. なぞかけ型：「○○とかけて△△と解く、その心は？」
3. 穴埋め型：「○○すぎる△△の特徴：＿＿」
4. 対比型：「理想の○○ vs 現実の○○」「昔の○○ vs 令和の○○」
5. シチュエーション型：「こんな○○は嫌だ」「○○が言ってはいけない一言」
6. 創作型：「○○の取扱説明書に書いてありそうなこと」「○○のレビュー欄に書かれていそうな口コミ」
7. 意外な組み合わせ型：「○○×△△のコラボ商品」
8. 架空設定型：「○○専用SNSにありがちな投稿」「○○オリンピックの競技種目」

【良いお題の条件】
- 具体的でイメージしやすい
- ボケの余地が広い（いろんな角度から回答できる）
- 少しひねりがある
- 短すぎず長すぎない（20〜50文字程度）

お題のみを1つ出力してください。説明や前置きは不要です。`,
        },
        {
          role: 'user',
          content: `テーマ: ${theme}`,
        },
      ],
      max_tokens: 150,
      temperature: 1.0,
    });

    const topic = completion.choices[0]?.message?.content?.trim() || generateFallbackTopic(theme);

    return NextResponse.json({
      topic,
      source: 'openai',
    });
  } catch (error) {
    console.error('Error generating topic:', error);

    // エラー時はフォールバック
    const { theme } = await request.json().catch(() => ({ theme: '日常' }));
    return NextResponse.json({
      topic: generateFallbackTopic(theme),
      source: 'fallback',
      error: 'AI生成に失敗しました',
    });
  }
}

// フォールバック用のお題テンプレート
function generateFallbackTopic(theme: string): string {
  const templates = [
    `「${theme}」が深夜3時に送ってきそうなLINE`,
    `${theme}専用マッチングアプリにありそうなプロフィール`,
    `こんな「${theme}」は絶対に売れない`,
    `${theme}オリンピックで金メダルを取る方法`,
    `「${theme}」の取扱説明書に小さく書いてある注意事項`,
    `${theme}のレビュー欄に書かれていた星1の口コミ`,
    `世界一${theme}な人の朝のルーティン`,
    `${theme}が言ってはいけない一言`,
    `${theme}×ラーメン屋のコラボメニュー`,
    `令和の${theme} vs 昭和の${theme}`,
    `${theme}が転職したら就きそうな意外な職業`,
    `${theme}の隠しコマンド`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}
