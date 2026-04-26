const Z01_SHIM = `
// z01.PrintRune — inlined by Go Pad
func z01PrintRune(r rune) error {
\tl := utf8.RuneLen(r)
\tif l == -1 {
\t\treturn errors.New("The rune is not a valid value to encode in UTF-8")
\t}
\tp := make([]byte, l)
\tutf8.EncodeRune(p, r)
\t_, err := os.Stdout.Write(p)
\treturn err
}
`

const Z01_DEPS = ['errors', 'os', 'unicode/utf8']

export function injectZ01(code: string): string {
  if (!code.includes('z01.PrintRune') && !code.includes('"github.com/01-edu/z01"')) {
    return code
  }

  code = code.replaceAll('z01.PrintRune(', 'z01PrintRune(')
  code = code.replace(/\s*"github\.com\/01-edu\/z01"\n?/g, '\n')
  // Remove empty import blocks/statements left after stripping z01
  code = code.replace(/import\s*\(\s*\)/g, '')
  code = code.replace(/^import\s*$/m, '')

  const hasImportBlock = /import\s*\(/.test(code)
  const hasSingleImport = /import\s+"/.test(code)

  for (const dep of Z01_DEPS) {
    const quoted = `"${dep}"`
    if (!code.includes(quoted)) {
      if (hasImportBlock) {
        code = code.replace(/import\s*\(/, `import (\n\t${quoted}`)
      } else if (hasSingleImport) {
        code = code.replace(/import\s+"([^"]+)"/, `import (\n\t"$1"\n\t${quoted}\n)`)
      } else {
        code = code.replace(/^(package\s+\w+\n)/, `$1\nimport ${quoted}\n`)
      }
    }
  }

  code = code.replace(/(func main\(\))/, Z01_SHIM + '\n$1')
  return code
}

type RunResult = {
  output: string
  error: string
}

export async function runCode(raw: string): Promise<RunResult> {
  const code = injectZ01(raw)
  const body = `version=2&withVet=true&body=${encodeURIComponent(code)}`

  const res = await fetch('https://play.golang.org/compile', {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  const data = await res.json()

  if (data.Errors) {
    return { output: '', error: data.Errors.replaceAll('z01PrintRune', 'z01.PrintRune') }
  }

  const out = (data.Events as { Message: string }[] || []).map(e => e.Message).join('')
  return { output: out || '(no output)', error: '' }
}

export async function formatCode(raw: string): Promise<{ code: string; error: string }> {
  const body = `body=${encodeURIComponent(raw)}&imports=true`
  const res = await fetch('https://play.golang.org/fmt', {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const data = await res.json()
  if (data.Error) return { code: raw, error: data.Error }
  return { code: data.Body, error: '' }
}
