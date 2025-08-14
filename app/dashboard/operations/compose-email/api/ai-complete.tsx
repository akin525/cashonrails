// // pages/api/ai-complete.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import { OpenAIApi, Configuration } from 'openai';
//
// const configuration = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);
//
// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     const { content } = req.body;
//
//     try {
//         const completion = await openai.createChatCompletion({
//             model: 'gpt-4',
//             messages: [{ role: 'user', content: `Improve this email:\n\n${content}` }],
//         });
//
//         const completedText = completion.data.choices[0].message?.content || '';
//
//         res.status(200).json({ completedText });
//     } catch (error) {
//         res.status(500).json({ error: 'AI request failed' });
//     }
// }
