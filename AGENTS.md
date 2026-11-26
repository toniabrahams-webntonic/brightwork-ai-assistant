<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- No database or auth; the only server code is the AI server function `generateAi` (`src/lib/ai.functions.ts`). Why: the owner wants built-in AI with no user key, which needs a server boundary for the gateway key.
- AI calls use `@lovable.dev/ai-gateway` inside `generateAi`; prompts are built server-side from a zod-validated request (`src/lib/ai-schema.ts`) with size limits. Why: the endpoint is public, so callers must not supply system instructions or unbounded input.
- All generated output flows through `runAi` (`src/lib/ai.ts`); there is no demo/template fallback, so a failed call throws. Why: the owner wants every response to be AI-generated.
- Persisted client state uses `createLocalStore` (`src/lib/storage.ts`). Why: it is SSR-safe and avoids hydration mismatches.
