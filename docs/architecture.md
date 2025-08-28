# アーキテクチャ設計 

本書は MVP（必須機能のみ）を最小コストで実装・運用するためのアーキテクチャ定義である。  
将来拡張を見据えつつ、まずは**リアルタイム投票**と**結果オープン**に集中する。

---

## 1. スコープ / 非スコープ

### スコープ（MVP）
- セッション作成・参加（URL 共有）
- 参加者のニックネーム登録
- カード投票（非公開で保持、全員揃ったらオープン）
- 集計（平均/中央値/最頻値）
- 再投票（ラウンド管理）
- リアルタイム同期（WebSocket）
- ブラウザ対応（PC/スマホ）

### 非スコープ（将来）
- 外部認証（Google, GitHub など）
- 永続 DB、履歴の長期保存
- Slack/Teams 通知
- 権限/招待制・パスコード保護
- 多言語 i18n、テーマ拡張

---

## 2. システムコンテキスト（Context）

```
[User Browser] <--(HTTPS/WebSocket)--> [Next.js App + Realtime GW]
                                     \
                                      \--(In-Memory Store)
```

- クライアントは Next.js(SSR/CSR) を利用
- リアルタイム通信は WebSocket (Socket.IO) を採用
- データは **メモリストア**（Node プロセス内）に保存（MVP）。プロセス再起動で消える前提。

---

## 3. 技術選定

- フロントエンド: **Next.js (App Router) + TypeScript + React Hooks**
- リアルタイム: **Socket.IO**（Server + Client）
- サーバ実装: **Next.js Route Handlers** + **Socket.IO サーバ（/api/socket）**
- スタイル: 任意（Tailwind 推奨だが必須ではない）
- テスト: Jest + React Testing Library（重要ロジックのみ）
- デプロイ: Vercel（最初は単一リージョン運用を想定）

> 将来、状態を外部化する場合は Redis or Postgres を検討。Socket.IO は `adapter` でスケールアウト可能。

---

## 4. 論理アーキテクチャ（層と境界）

```
UI (Next.js Pages/Components)
   └── Feature 層 (Session/Vote UI + Hooks)
        └── Application 層 (SessionService, VoteService)
             └── Realtime GW (SocketClient/Server)
                  └── Domain 層 (Entities, UseCases)
                       └── Store 抽象 (SessionStore IF)
                            └── InMemoryStore (MVP 実装)
```

- **UI/Feature**: 表示・入力、リアルタイムイベントの購読
- **Application**: ユースケース調停（参加、投票、開示、リセット）
- **Realtime GW**: WebSocket イベントの Publish/Subscribe
- **Domain**: セッション/参加者/投票/ラウンドの不変条件を保持
- **Store**: データアクセスの抽象化（MVP は `InMemoryStore`）

---

## 5. ディレクトリ構成（提案）

```
src/
  app/
    page.tsx
    api/
      socket/route.ts         # Socket.IO サーバ起動 (Edge不可。Nodeランタイム)
  components/
    session/
      SessionBoard.tsx
      VoteCard.tsx
      Participants.tsx
  features/
    session/
      hooks/
        useSession.ts
        useRealtime.ts
      services/
        SessionService.ts
        VoteService.ts
  lib/
    realtime/
      socket-client.ts        # クライアント接続
      socket-events.ts        # イベント名と型
    store/
      SessionStore.ts         # IF
      InMemorySessionStore.ts # 実装(MVP)
  domain/
    entities.ts               # Session, Participant, Vote, Round
    usecases.ts               # join, vote, reveal, reset
  types/
    index.ts
```

> Vercel の Edge Runtime では Socket.IO が動かないため、`/api/socket` は Node.js ランタイムを明示。

---

## 6. ドメインモデル（最小）

```ts
type CardValue = 0 | 1 | 2 | 3 | 5 | 8 | 13 | 21 | "?";

interface Participant {
  id: string;      // socket.id or uuid
  name: string;
  joinedAt: number;
}

interface Round {
  id: string;
  votes: Record<string, CardValue | null>; // key = participant.id
  revealedAt?: number;
}

interface Session {
  id: string;
  topic?: string;
  participants: Participant[];
  currentRound: Round;
  history: Round[]; // 過去ラウンド
  createdAt: number;
}
```

不変条件（例）:
- 参加者 ID はセッション内で一意
- `currentRound.votes` の key は参加者集合のサブセット
- `revealedAt` が存在するラウンドでは以後 `votes` を変更しない

---

## 7. イベント設計（Socket.IO）

**Name-space**: `/session`  
**Room**: `session:{sessionId}`

### クライアント → サーバ
- `session:create` `{ topic?: string }` → `{ sessionId }`
- `session:join` `{ sessionId, name }` → `{ session }`
- `vote:cast` `{ sessionId, value: CardValue }` → `ok`
- `round:reveal` `{ sessionId }` → `ok`
- `round:reset` `{ sessionId }` → `ok`  // 新ラウンド開始

### サーバ → クライアント（broadcast）
- `session:state` `{ session }`  // 初期/差分同期（単純化のため全量でも可）
- `participant:joined` `{ participant }`
- `participant:left` `{ participantId }`
- `vote:updated` `{ participantId }`
- `round:revealed` `{ stats, round }`
- `round:reset` `{ round }`

> 同期は MVP では**全量 push**を優先（実装容易）。将来は差分イベントに最適化。

---

## 8. シーケンス（代表ユースケース）

### 8.1 参加〜投票〜開示
```
User -> UI: 名前入力, Join
UI -> Socket: session:join
Socket -> Store: upsert participant
Store -> Socket: session snapshot
Socket -> UI(all in room): session:state

User -> UI: カード選択
UI -> Socket: vote:cast
Socket -> Store: set vote
Socket -> UI(all): vote:updated

Facilitator -> UI: Reveal
UI -> Socket: round:reveal
Socket -> Store: freeze round + calc stats
Socket -> UI(all): round:revealed (stats, round)
```

---

## 9. 集計ロジック（MVP）

- **平均**: 数値カードのみ平均（`"?"`は除外）
- **中央値**: 数値カードのみソートして中央値
- **最頻値**: すべての値の最頻出（`"?"`含む）
- 集計は `domain/usecases.ts` に純粋関数で実装（テスト対象）

---

## 10. エラーハンドリング / リトライ

- クライアントの送信は idempotent でなくて良い（MVP）。
- サーバは以下を 4xx として返却し、UI にトースト表示:
  - セッション不存在 / 終了
  - 未参加者の投票
  - Open 後の変更試行
- ネットワーク断は Socket.IO の自動再接続に任せ、復帰時に `session:join` 再送してスナップショットを受け取る。

---

## 11. セキュリティ / プライバシ

- セッション ID はランダム（nanoid など）。推測困難性の確保。
- 認証は行わない（MVP）。ニックネームはクライアント任意入力。
- XSS 対策: ニックネームはエスケープ、最大長制限。
- DoS 簡易対策: 1 接続あたり投票頻度制限（レートリミット）をサーバで実装可。

---

## 12. 可観測性 / ロギング

- サーバ: 重要イベント（create/join/vote/reveal/reset）を構造化ログ出力（JSON）。
- 重要指標（将来）: 同時接続数 / 投票ラウンド時間 / エラー率。

---

## 13. パフォーマンス / スケール戦略

- MVP: 単一 Node プロセス + メモリストア。対象: 10〜20 名/セッション。
- 水平スケール方針（将来）:
  1. ストアを Redis 等に外出し
  2. Socket.IO の `redis-adapter` 導入でマルチインスタンス
  3. セッションを Room 単位でシャーディング

---

## 14. テスト戦略（要点）

- ドメイン純粋関数（集計、不変条件）のユニットテストを優先
- Socket の E2E は 1〜2 本のスモーク（join → vote → reveal）
- UI は重要コンポーネント（カード、結果表示）の描画テスト

---

## 15. デプロイ / ランタイム注意点

- Vercel を想定。`/api/socket` は **Node.js ランタイム**指定（Edge不可）。
- 省コストのためビルドは単体プロジェクト。環境変数は不要（MVP）。
- Keep-Alive 設定は Vercel 既定。クライアントは自動再接続。

---

## 16. ADR（Architectural Decision Records）

`docs/adr/` に重要意思決定を 1 ファイル 1 記録で保存。MVP では以下を用意：

- `0001-realtime-over-socketio.md`  
  - 選定理由: 双方向・Room・エコシステム、実装容易性
  - 代替案: SSE, WebRTC DataChannel（却下理由: 双方向/スケール/実装コスト）
- `0002-inmemory-store-for-mvp.md`  
  - 理由: 実装速度最優先、コスト最小
  - 将来: Redis/DB へ差し替え可能な IF を事前に用意

---

## 17. 参考イベント型（TypeScript）

```ts
// lib/realtime/socket-events.ts
export type CardValue = 0|1|2|3|5|8|13|21|"?";

export type ClientToServer = {
  "session:create": (p: { topic?: string }, cb: (r: { sessionId: string }) => void) => void;
  "session:join": (p: { sessionId: string; name: string }, cb: (r: { session: any }) => void) => void;
  "vote:cast": (p: { sessionId: string; value: CardValue }, cb: (r: { ok: true }) => void) => void;
  "round:reveal": (p: { sessionId: string }, cb: (r: { ok: true }) => void) => void;
  "round:reset": (p: { sessionId: string }, cb: (r: { ok: true }) => void) => void;
};

export type ServerToClient = {
  "session:state": (p: { session: any }) => void;
  "participant:joined": (p: { participant: any }) => void;
  "participant:left": (p: { participantId: string }) => void;
  "vote:updated": (p: { participantId: string }) => void;
  "round:reveal": (p: { stats: any; round: any }) => void;
  "round:reset": (p: { round: any }) => void;
};
```

---

## 18. 既知のリスク

- メモリストアのため、プロセス再起動でセッション消失
- Vercel のサーバレス環境で Socket を常駐させる構成は制約があるため、**Node ランタイム**利用に注意
- 同時接続が急増した場合のスケール障壁（将来 Redis 必須）

---

## 19. 付録：API（HTTP 併用する場合の例 — 任意）

- `POST /api/session` → `{ sessionId }`
- `GET /api/session/:id` → `{ session }`
- WebSocket は状態更新主体、HTTP は読み取り or ディープリンク復元に利用可。

---

以上。MVP 実装は本書の定義に従う。
