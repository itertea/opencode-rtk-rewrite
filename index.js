export const RtkRewrite = async () => {
  const isWindows = process.platform === "win32"
  const pathSeparator = isWindows ? ";" : ":"

  const buildPath = (currentPath, home, userProfile) => {
    const extra = isWindows
      ? [
          userProfile ? `${userProfile}\\.cargo\\bin` : "",
          userProfile ? `${userProfile}\\.local\\bin` : "",
        ]
      : [
          home ? `${home}/.local/bin` : "",
          home ? `${home}/.cargo/bin` : "",
          "/usr/local/bin",
          "/opt/homebrew/bin",
        ]

    const parts = String(currentPath ?? "").split(pathSeparator).filter(Boolean)
    for (let j = extra.length - 1; j >= 0; j--) {
      if (extra[j] && !parts.includes(extra[j])) parts.unshift(extra[j])
    }
    return parts.join(pathSeparator)
  }

  const rewrite = async (cmd) => {
    if (!cmd || cmd.includes("\n")) return null
    if (cmd.trimStart().startsWith("rtk ")) return null

    const home = String(process.env.HOME ?? "")
    const userProfile = String(process.env.USERPROFILE ?? "")
    const basePath = String(process.env.PATH ?? "")
    const env = {
      ...process.env,
      PATH: buildPath(basePath, home, userProfile),
    }

    try {
      if (typeof Bun !== "undefined" && Bun.spawn) {
        const proc = Bun.spawn(["rtk", "rewrite", cmd], {
          env,
          stdout: "pipe",
          stderr: "ignore",
        })
        const out = await new Response(proc.stdout).text()
        const code = await proc.exited
        if (code !== 0) return null

        const rewritten = out.trim()
        if (!rewritten || rewritten === cmd) return null
        return rewritten
      }
    } catch {
      return null
    }

    return null
  }

  return {
    "shell.env": async (_input, output) => {
      const base = String(output.env.PATH ?? process.env.PATH ?? "")
      const home = String(output.env.HOME ?? process.env.HOME ?? "")
      const userProfile = String(output.env.USERPROFILE ?? process.env.USERPROFILE ?? "")
      output.env.PATH = buildPath(base, home, userProfile)
    },

    "tool.execute.before": async (input, output) => {
      if (input.tool !== "bash") return
      const cmd = String(output.args.command ?? "").trim()
      if (!cmd) return

      const rewritten = await rewrite(cmd)
      if (rewritten) output.args.command = rewritten
    },
  }
}

export default RtkRewrite
