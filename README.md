# opencode-rtk-rewrite

OpenCode plugin that rewrites normal `bash` tool commands through RTK using the real `rtk rewrite` subcommand.

This plugin is designed for people who want RTK savings in OpenCode without maintaining a hardcoded list of rewrite rules inside the plugin itself.

## What it does

- uses the real `rtk rewrite` binary subcommand as the source of truth
- runs rewrite checks via `Bun.spawn`, so `rtk rewrite` does not appear as a separate shell tool call
- prepends common RTK install locations to `PATH` for GUI-launched OpenCode Desktop sessions
- rewrites ordinary local `bash` commands before execution when RTK supports them

## What it does not do

- no SSH-specific rewriting
- no remote shell bootstrap or remote RTK installation
- no context pruning, summarization, or message compression after the fact
- no attempt to override OpenCode's built-in shell implementation

## Who this is for

Use this plugin if you want:

- RTK-powered command rewriting in OpenCode
- minimal behavior changes
- the installed RTK version to decide what is supported
- less maintenance than a giant regex table in your plugin

This plugin is probably not for you if you want:

- aggressive session history pruning
- SSH-specific magic in the local plugin
- a generic output filtering framework with custom rules for every tool

## Install

1. Install RTK locally:

```bash
cargo install --git https://github.com/rtk-ai/rtk
```

2. Verify RTK works:

```bash
~/.cargo/bin/rtk --version
```

3. Add the plugin to your OpenCode config:

```json
{
  "plugin": ["opencode-rtk-rewrite"]
}
```

4. Restart OpenCode Desktop.

## How it works

When OpenCode is about to run a normal `bash` command, the plugin:

1. reads the command string
2. asks `rtk rewrite` whether RTK supports a better equivalent
3. if supported, replaces the command with the RTK version
4. otherwise leaves the command unchanged

Examples:

```text
git status   -> rtk git status
ls -la       -> rtk ls -la
cat file.md  -> rtk read file.md
```

Because the rewrite check runs through `Bun.spawn`, the helper call itself does not show up as a separate visible shell tool invocation.

## Important behavior notes

- only normal local `bash` commands are rewritten
- SSH rewrite is intentionally disabled to avoid surprising behavior on complex remote commands
- if you want RTK on remote hosts, set it up on the remote shell separately
- interactive shell behavior is outside the scope of this plugin
- if RTK is missing or cannot rewrite a command, the original command still runs normally

## Remote host setup

This plugin only handles the local OpenCode side.

If you also want RTK compression on a remote server, install RTK on that server and configure the remote shell separately. For example, a non-interactive `fish` setup can alias supported commands to `rtk <cmd>` on the remote side.

## Comparison with alternatives

### Versus `openrtk`

`openrtk` is the closest public alternative.

Main difference:

- `openrtk` uses a hardcoded rewrite table inside the plugin
- `opencode-rtk-rewrite` uses the actual `rtk rewrite` command from the installed RTK binary

Why that matters:

- this plugin automatically follows the RTK version you actually installed
- no duplicated rewrite logic to keep in sync manually
- if RTK adds or changes supported rewrites, this plugin picks them up immediately

Tradeoff:

- this plugin depends on the local RTK binary being installed and reachable in `PATH`

### Versus `tokf`

`tokf` is a broader shell-output filtering system, not an RTK plugin.

Main difference:

- `tokf` is a programmable output filter framework
- `opencode-rtk-rewrite` is a thin RTK bridge for OpenCode

Use `tokf` if you want:

- custom filtering rules
- project-specific output transformations
- a general-purpose filtering framework

Use this plugin if you want:

- actual RTK behavior
- less configuration
- RTK to stay the source of truth

## Troubleshooting

### RTK is installed in terminal, but OpenCode cannot find it

Desktop apps often start with a smaller `PATH` than your shell.

This plugin already prepends common locations:

- `~/.local/bin`
- `~/.cargo/bin`
- `/usr/local/bin`
- `/opt/homebrew/bin`

If RTK still is not found, verify where it is installed:

```bash
which rtk
```

### A command was not rewritten

That usually means one of these:

- RTK does not support rewriting that command
- the command is too complex for RTK rewrite
- the command is already prefixed with `rtk`
- the command is multiline and is intentionally skipped

### Remote SSH command was not rewritten

That is expected. SSH-specific rewriting is intentionally disabled in this plugin.

## Design goals

- keep behavior predictable
- keep the plugin small
- let RTK own rewrite semantics
- avoid extra visible shell noise in OpenCode

## License

MIT
