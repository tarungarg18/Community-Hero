import { GoogleGenerativeAI } from '@google/generative-ai';

const CATEGORIES = [
  'Pothole',
  'Water Leakage',
  'Streetlight',
  'Waste Management',
  'Road Damage',
  'Public Safety',
  'Parks & Recreation',
  'Signage',
  'Other',
] as const;

export type IssueCategory = (typeof CATEGORIES)[number];

export interface CategorizationResult {
  category: IssueCategory;
  priority: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  suggestedTitle: string;
  tags: string[];
}

export interface InsightResult {
  summary: string;
  hotspots: string[];
  trends: string[];
  recommendations: string[];
  predictedCategories: { category: string; likelihood: string }[];
}

const MODEL_NAME = process.env.GEMINI_MODEL ?? 'gemini-3.5-flash';

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: MODEL_NAME });
}

function parseJson<T>(text: string): T {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned) as T;
}

function normalizeCategory(parsed: CategorizationResult): CategorizationResult {
  if (!CATEGORIES.includes(parsed.category as IssueCategory)) {
    parsed.category = 'Other';
  }
  return parsed;
}

async function callGeminiOnce(
  content: string | Array<string | { inlineData: { data: string; mimeType: string } }>,
): Promise<string> {
  const model = getModel();
  const result = await model.generateContent(content);
  return result.response.text();
}

export async function categorizeIssue(
  description: string,
  title?: string,
  imageBase64?: string,
  mimeType?: string,
): Promise<CategorizationResult> {
  const jsonShape = `{
  "category": one of ${JSON.stringify(CATEGORIES)},
  "priority": "low"|"medium"|"high"|"critical",
  "summary": "one sentence summary",
  "suggestedTitle": "concise title under 80 chars",
  "tags": ["tag1", "tag2"]
}`;

  let text: string;

  if (imageBase64 && mimeType) {
    const prompt = `Analyze this civic infrastructure issue photo. User description: "${description}"
Respond with ONLY valid JSON (no markdown):
${jsonShape}`;
    text = await callGeminiOnce([
      prompt,
      { inlineData: { data: imageBase64, mimeType } },
    ]);
  } else {
    const prompt = `You are a civic issue classifier. Analyze this report. Respond with ONLY valid JSON (no markdown):
${jsonShape}

Title: ${title ?? 'Not provided'}
Description: ${description}`;
    text = await callGeminiOnce(prompt);
  }

  return normalizeCategory(parseJson<CategorizationResult>(text));
}

export async function generateInsights(issuesSummary: string): Promise<InsightResult> {
  const prompt = `You are a civic analytics assistant. Based on community issue data, provide predictive insights.
Respond with ONLY valid JSON (no markdown):
{
  "summary": "2-3 sentence overview",
  "hotspots": ["area or pattern descriptions"],
  "trends": ["observed trends"],
  "recommendations": ["actionable recommendations for authorities"],
  "predictedCategories": [{"category": "name", "likelihood": "high|medium|low"}]
}

Issue data:
${issuesSummary}`;

  const text = await callGeminiOnce(prompt);
  return parseJson<InsightResult>(text);
}
