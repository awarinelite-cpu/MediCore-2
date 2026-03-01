import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST'],
}))
app.use(express.json())

// ── Anthropic client ──────────────────────────────────────────
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ── System prompt ─────────────────────────────────────────────
const SYSTEM_PROMPT = `You are MediCore, an expert clinical reference engine for nurses and medical students.

When given a medical diagnosis (and optional type/subtype), respond ONLY with a valid JSON object — no markdown, no explanation, no code fences.

The JSON must follow this EXACT schema:

{
  "description": "string — 2-3 sentence clinical description of the condition",
  "types": [
    {
      "id": "string — slug e.g. type-1",
      "type_name": "string — e.g. Type 1",
      "cause": "string — pathophysiology/cause of this type",
      "lab_tests": [
        {
          "id": "string — slug",
          "test_name": "string",
          "normal_min": number,
          "normal_max": number,
          "unit": "string",
          "critical_high": number or null,
          "critical_low": number or null
        }
      ],
      "medications": [
        {
          "id": "string — slug",
          "drug_name": "string",
          "drug_class": "string",
          "treatment_role": "First-line" | "Second-line" | "Adjunct" | "Emergency",
          "contraindications": "string",
          "monitoring_required": "string",
          "guideline_source": "string — e.g. WHO 2023, ADA 2024",
          "dosages": [
            {
              "dose": "string",
              "form": "string",
              "frequency": "string",
              "route": "string",
              "renal_adjustment": "string",
              "pediatric_adjustment": "string"
            }
          ],
          "side_effects": ["string"]
        }
      ],
      "nursing_considerations": ["string"]
    }
  ]
}

Rules:
- Always include at least 2 types if the condition has known subtypes. If no subtypes exist, return a single type with type_name matching the diagnosis name.
- Include 3–6 relevant lab tests per type with accurate normal ranges and units.
- Include 2–5 medications per type grouped by treatment role (First-line first).
- Include 5–8 nursing considerations per type.
- All numeric values (normal_min, normal_max, critical_high, critical_low) must be plain numbers, not strings.
- critical_high and critical_low must be null if not clinically relevant.
- Base all content on current evidence-based guidelines (WHO, ADA, BTS, IDSA, ESC, JNC, etc.).
- Add disclaimer note: data is for educational use only.
- Never hallucinate drug doses — use established standard dosing ranges.`

// ── Route: generate diagnosis ─────────────────────────────────
app.post('/api/diagnose', async (req, res) => {
  const { diagnosis } = req.body

  if (!diagnosis || typeof diagnosis !== 'string') {
    return res.status(400).json({ error: 'diagnosis field is required' })
  }

  if (diagnosis.trim().length < 2) {
    return res.status(400).json({ error: 'diagnosis too short' })
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Generate a complete clinical reference for: ${diagnosis.trim()}`,
        },
      ],
    })

    const raw = message.content[0]?.text?.trim()

    // Parse and validate JSON
    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      // Try to extract JSON if model added surrounding text
      const match = raw.match(/\{[\s\S]*\}/)
      if (match) {
        parsed = JSON.parse(match[0])
      } else {
        throw new Error('Model returned invalid JSON')
      }
    }

    return res.json({ success: true, data: parsed })
  } catch (err) {
    console.error('Claude API error:', err.message)
    return res.status(500).json({
      error: 'Failed to generate clinical data',
      detail: err.message,
    })
  }
})

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'MediCore API' })
})

// ── Serve React frontend in production ────────────────────────
if (process.env.NODE_ENV === 'production') {
  const clientDist = join(__dirname, '../client/dist')
  app.use(express.static(clientDist))
  app.get('*', (req, res) => {
    res.sendFile(join(clientDist, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`✅ MediCore server running on port ${PORT}`)
})
