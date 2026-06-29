import { Router, Response } from 'express';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { categorizeIssue, generateInsights } from '../services/gemini';
import { getDb } from '../config/firebase';

const router = Router();

router.post('/categorize', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { description, title, imageBase64, mimeType } = req.body as {
      description?: string;
      title?: string;
      imageBase64?: string;
      mimeType?: string;
    };

    if (!description?.trim() && !imageBase64) {
      res.status(400).json({ error: 'Description or image is required' });
      return;
    }

    const result = await categorizeIssue(
      description ?? '',
      title,
      imageBase64,
      mimeType,
    );
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI categorization failed';
    res.status(500).json({ error: message });
  }
});

router.post('/insights', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const snapshot = await getDb()
      .collection('issues')
      .orderBy('createdAt', 'desc')
      .limit(30)
      .get();

    if (snapshot.empty) {
      res.json({
        summary: 'No issues reported yet. Report community problems to unlock AI insights.',
        hotspots: [],
        trends: [],
        recommendations: ['Encourage citizens to report their first issue'],
        predictedCategories: [],
      });
      return;
    }

    const lines = snapshot.docs.map((doc) => {
      const d = doc.data();
      const loc = d.location as { address?: string } | undefined;
      return `- ${d.title} | ${d.category} | ${d.status} | ${loc?.address ?? 'unknown'}`;
    });

    const result = await generateInsights(lines.join('\n'));
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Insights generation failed';
    res.status(500).json({ error: message });
  }
});

export default router;
