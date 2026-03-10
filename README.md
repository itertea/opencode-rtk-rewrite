# opencode-rtk-rewrite

OpenCode plugin that rewrites standard shell commands through RTK by calling the real `rtk rewrite` subcommand.

This plugin is for people who want [RTK](https://github.com/rtk-ai/rtk) command-rewrite savings in OpenCode without maintaining a hardcoded rewrite table inside the plugin.

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

1. Install [RTK](https://github.com/rtk-ai/rtk):

```bash
cargo install --git https://github.com/rtk-ai/rtk
```

2. Add this to `opencode.json`:

```json
{
  "plugin": ["opencode-rtk-rewrite"]
}
```

3. Add the plugin dependency in `package.json`:

Edit `package.json` file:

- Linux: `~/.config/opencode/package.json`
- macOS: `~/.config/opencode/package.json`
- Windows: `%USERPROFILE%\\.config\\opencode\\package.json`

```json
{
  "dependencies": {
    "@opencode-ai/plugin": "1.2.24",
    "opencode-rtk-rewrite": "github:itertea/opencode-rtk-rewrite"
  }
}
```

If you skip this step, `"plugin": ["opencode-rtk-rewrite"]` may not resolve correctly.

4. Restart OpenCode Desktop.

## Alternative: direct GitHub plugin reference

You can also load the plugin directly from GitHub without adding `opencode-rtk-rewrite` to `dependencies`:

```json
{
  "plugin": ["github:itertea/opencode-rtk-rewrite"]
}
```

In this mode, keep `@opencode-ai/plugin` in dependencies.

Important: on some OpenCode builds, including `1.2.24` in our testing, direct `github:` plugin loading can fail during the internal install step. If that happens, use the recommended setup above: `plugin: ["opencode-rtk-rewrite"]` plus the dependency entry in `~/.config/opencode/package.json`.

Related upstream issues:

- https://github.com/anomalyco/opencode/issues/12378
- https://github.com/anomalyco/opencode/issues/8763

## How it works

When OpenCode is about to run a standard shell command through its command-execution tool, the plugin:

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

- Only standard local shell commands are rewritten
- SSH rewriting is intentionally disabled to avoid surprising behavior with complex remote commands
- If you want RTK on remote hosts, install and configure it there separately
- Interactive shell behavior is outside this plugin's scope
- If RTK is unavailable or cannot rewrite a command, OpenCode runs the original command unchanged

## Remote host setup

This plugin only handles the local OpenCode side.

If you also want RTK compression on a remote server, install RTK on that server and configure the remote shell separately. For example, a non-interactive `fish` setup can alias supported commands to `rtk <cmd>` on the remote side.

## Comparison with alternatives

### Versus `openrtk`

[`openrtk`](https://github.com/martinstannard/openrtk) is the closest public alternative.

Main difference:

- `openrtk` uses a hardcoded rewrite table inside the plugin
- `opencode-rtk-rewrite` calls the installed RTK binary through `rtk rewrite`

Why that matters:

- This plugin follows the RTK version you actually have installed
- There is no duplicated rewrite logic to maintain manually
- If RTK adds or changes supported rewrites, this plugin picks that up immediately

Tradeoff:

- This plugin requires a local RTK binary that is installed and available in `PATH`

### Versus `tokf`

[`tokf`](https://github.com/mpecan/tokf) is a broader shell-output filtering system, not an RTK plugin.

Main difference:

- `tokf` is a programmable output-filtering framework
- `opencode-rtk-rewrite` is a thin RTK bridge for OpenCode

Use `tokf` if you want:

- custom filtering rules
- project-specific output transformations
- a general-purpose filtering framework

Use this plugin if you want:

- Actual RTK behavior
- Less configuration
- RTK to remain the source of truth

## Troubleshooting

### RTK is installed in your terminal, but OpenCode cannot find it

Desktop apps often start with a more limited `PATH` than your shell.

This plugin already prepends these common locations:

- `~/.local/bin`
- `~/.cargo/bin`
- `/usr/local/bin`
- `/opt/homebrew/bin`

On Windows, the plugin prepends:

- `%USERPROFILE%\\.cargo\\bin`
- `%USERPROFILE%\\.local\\bin`

If OpenCode still cannot find RTK, check where it is installed:

```bash
which rtk
```

### A command was not rewritten

This usually means one of the following:

- RTK does not support rewriting that command
- The command is too complex for `rtk rewrite`
- The command is already prefixed with `rtk`
- The command is multiline, which this plugin intentionally skips

### A remote SSH command was not rewritten

That is expected. SSH-specific rewriting is intentionally disabled in this plugin.

## Design goals

- Keep behavior predictable
- Keep the plugin small
- Let RTK define rewrite semantics
- Avoid extra visible shell noise in OpenCode

## License

MIT
