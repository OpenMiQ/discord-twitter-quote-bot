import { MiQ } from "makeitaquote";
import type { FxTweet } from "./fxtwitter.js";

/** 引用画像の生成に失敗した場合のエラー。 */
export class QuoteGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuoteGenerationError";
  }
}

/**
 * FxTwitter のツイート情報から「Make it a Quote」風の画像を生成する。
 * @param tweet FxTwitter API から取得したツイート。
 * @returns 生成された画像の Buffer。
 * @throws {QuoteGenerationError} 画像生成に失敗した場合。
 */
export async function generateQuoteImage(tweet: FxTweet): Promise<Buffer> {
  try {
    // アバターを取得できなかった場合、makeitaquote はプレースホルダーを描画する。
    return await new MiQ()
      .setText(tweet.text)
      .setAvatar(tweet.author.avatar_url)
      // username には `@` を付けない (makeitaquote のテーマ側で `@` が付与されるため)。
      .setUsername(tweet.author.screen_name)
      .setDisplayName(tweet.author.name)
      .setTheme({ avatar: { grayscale: false } })
      .setWatermark("Twitter Quote Bot")
      .toBuffer("png");
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new QuoteGenerationError(`引用画像の生成に失敗しました: ${reason}`);
  }
}
