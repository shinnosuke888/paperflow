import { redirect } from "next/navigation";

import { getOptionalAuth } from "@/lib/auth";
import { firstParam, getSafeRedirectPath } from "@/lib/utils";

import { loginAction, signupAction } from "./actions";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const error = firstParam(params.error);
  const message = firstParam(params.message);
  const next = getSafeRedirectPath(firstParam(params.next));
  const { userId } = await getOptionalAuth();

  if (userId) {
    redirect(next);
  }

  return (
    <main className="auth-page">
      <section className="auth-hero panel">
        <div className="auth-badge">PaperFlow</div>
        <h1>論文収集を、タイムライン体験に変える。</h1>
        <p>
          arXiv の公開論文を X ライクな UI で一覧し、気になる論文はワンクリックで保存。
          共有まで同じ流れで完了します。
        </p>

        <div className="hero-grid">
          <article className="hero-card">
            <strong>ライブフィード</strong>
            <span>新着論文を時系列で取得</span>
          </article>
          <article className="hero-card">
            <strong>あとで保存</strong>
            <span>Supabase にお気に入り保存</span>
          </article>
          <article className="hero-card">
            <strong>すぐ共有</strong>
            <span>X 共有にそのまま接続</span>
          </article>
        </div>
      </section>

      <section className="auth-card panel">
        <div className="section-heading">
          <p className="eyebrow">Supabase Auth</p>
          <h2>ログイン / 新規登録</h2>
          <p>メールアドレスとパスワードでアカウントを作成できます。</p>
        </div>

        {message ? <p className="notice success">{message}</p> : null}
        {error ? <p className="notice error">{error}</p> : null}
        {next !== "/" ? (
          <p className="notice neutral">ログイン後は元のページに戻ります。</p>
        ) : null}

        <form className="auth-form">
          <input name="redirectTo" type="hidden" value={next} />
          <label className="field">
            <span>メールアドレス</span>
            <input name="email" placeholder="name@example.com" required type="email" />
          </label>

          <label className="field">
            <span>パスワード</span>
            <input name="password" placeholder="8文字以上" required type="password" />
          </label>

          <div className="form-actions">
            <button className="primary-button" formAction={loginAction}>
              ログイン
            </button>
            <button className="secondary-button" formAction={signupAction}>
              新規登録
            </button>
          </div>
        </form>

        <p className="auth-footnote">
          新規登録時は、Supabase の設定に応じて確認メールが送信されます。
        </p>
      </section>
    </main>
  );
}
