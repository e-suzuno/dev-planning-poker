# コーディングガイドライン

本プロジェクトでは、Next.js + TypeScript を用いた開発を行う。  
以下のガイドラインに従ってコーディングを行うこと。

---

## 1. 言語・フレームワーク
- **言語**: TypeScript
- **フレームワーク**: Next.js (App Router)
- **スタイル**: React + Hooks ベース

---

## 2. コーディング規約
- Lint/Formatter は **ESLint + Prettier** を利用する
- インデントは **2スペース**
- 変数・関数・ファイル名は **camelCase**
- コンポーネントは **PascalCase**
- 定数は **UPPER_SNAKE_CASE**

---

## 3. ディレクトリ構造（MVP想定）
```
src/
  app/              # Next.js App Router
  components/       # 再利用可能なUIコンポーネント
  features/         # 機能単位のモジュール
  lib/              # 共通ユーティリティ
  types/            # 型定義
```

---

## 4. 型付け
- すべての関数・props・戻り値に型を定義する
- `any` の使用は禁止
- 外部APIのレスポンス型は `types/` に定義し、再利用する

---

## 5. Reactコンポーネント
- 可能な限り **関数コンポーネント + Hooks** を使用する
- Props には必ず型をつける (`React.FC<Props>` は非推奨)
- UI ロジックとビジネスロジックは分離する

---

## 6. 状態管理
- MVP 段階では **React Hooks (useState, useReducer)** を基本とする
- グローバル状態が必要になった場合のみ **Context API** を導入する

---

## 7. 命名規則
- ファイル名：`kebab-case.tsx` / `kebab-case.ts`
- コンポーネント名：`PascalCase`
- イベントハンドラ：`handleXxx`
- ブール値：`isXxx`, `hasXxx`, `canXxx`

---

## 8. Git 運用
- main ブランチは常にデプロイ可能状態を保つ
- 作業は `feature/xxx` ブランチを切って行う
- コミットメッセージは以下を推奨する
  - `feat: 機能追加`
  - `fix: バグ修正`
  - `refactor: リファクタリング`
  - `docs: ドキュメント変更`

---

## 9. テスト
- 単体テストは **Jest + React Testing Library** を利用
- コンポーネント単位でテストを作成
- MVP 段階では重要ロジックのみカバー（カード投票や集計など）

---

## 10. その他
- コメントは「なぜそうしたか」を書く（処理内容は型とコードで説明できる）
- TODO は `// TODO: xxx` の形で明示する
