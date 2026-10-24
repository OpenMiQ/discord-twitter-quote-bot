import ky, { HTTPError, TimeoutError } from "ky";

/**
 * FxTwitter (FxEmbed) API クライアント。
 * @see https://docs.fxembed.com/api/twitter/
 */

const API_BASE = "https://api.fxtwitter.com";

/** FxTwitter API が返すツイート作者情報 (必要な項目のみ)。 */
export interface FxAuthor {
  name: string;
  screen_name: string;
  avatar_url: string | null;
}

/** FxTwitter API が返すツイート情報 (必要な項目のみ)。 */
export interface FxTweet {
  id: string;
  url: string;
  text: string;
  author: FxAuthor;
}

interface FxResponse {
  code: number;
  message: string;
  tweet?: FxTweet;
}

/** FxTwitter API 呼び出し時のエラー。 */
export class FxTwitterError extends Error {
  constructor(
    message: string,
    readonly code?: number
  ) {
    super(message);
    this.name = "FxTwitterError";
  }
}

/**
 * ツイート ID からツイート情報を取得する。
 * @throws {FxTwitterError} ツイートが取得できない、または通信に失敗した場合。
 */
export async function fetchTweet(id: string): Promise<FxTweet> {
  let body: FxResponse;
  try {
    body = await ky
      .get(`${API_BASE}/status/${id}`, {
        timeout: 10_000,
        retry: 1,
        throwHttpErrors: false,
        headers: { "User-Agent": "discord-twitter-quote-bot" },
      })
      .json<FxResponse>();
  } catch (error) {
    if (error instanceof TimeoutError) {
      throw new FxTwitterError(
        "FxTwitter API への接続がタイムアウトしました。"
      );
    }
    if (error instanceof HTTPError) {
      throw new FxTwitterError(
        `FxTwitter API がエラーを返しました (HTTP ${error.response.status})。`
      );
    }
    throw new FxTwitterError("FxTwitter API への接続に失敗しました。");
  }

  if (body.code !== 200 || !body.tweet) {
    throw new FxTwitterError(
      `ツイートを取得できませんでした (${body.message ?? "unknown"})。`,
      body.code
    );
  }

  return body.tweet;
}
