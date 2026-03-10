# opencode-rtk-rewrite

OpenCode plugin that rewrites normal `bash` tool commands through RTK using the real `rtk rewrite` subcommand.

What it does:

- uses `rtk rewrite` as the source of truth instead of hardcoded regex rules
- runs rewrite checks via `Bun.spawn`, so `rtk rewrite` does not appear as a separate shell tool call
- prepends common RTK install locations to `PATH` for GUI-launched OpenCode Desktop sessions
- only rewrites ordinary local `bash` commands

What it does not do:

- no SSH-specific rewriting
- no remote shell setup
- no context pruning / summary logic

## Install

1. Install RTK:

```bash
cargo install --git https://github.com/rtk-ai/rtk
```

2. Add the plugin to your OpenCode config:

```json
{
  "plugin": ["opencode-rtk-rewrite"]
}
```

3. Restart OpenCode Desktop.
