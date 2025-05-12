// 'use server';

/**
 * @fileOverview A first-aid chatbot AI agent.
 *
 * - firstAidChatbot - A function that handles the first-aid chatbot process.
 * - FirstAidChatbotInput - The input type for the firstAidChatbot function.
 * - FirstAidChatbotOutput - The return type for the firstAidChatbot function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FirstAidChatbotInputSchema = z.object({
  emergencyType: z.string().describe('The type of medical emergency.'),
  userMessage: z.string().describe('The user message to the chatbot.'),
});
export type FirstAidChatbotInput = z.infer<typeof FirstAidChatbotInputSchema>;

const FirstAidChatbotOutputSchema = z.object({
  chatbotResponse: z.string().describe('The chatbot response to the user message.'),
});
export type FirstAidChatbotOutput = z.infer<typeof FirstAidChatbotOutputSchema>;

export async function firstAidChatbot(input: FirstAidChatbotInput): Promise<FirstAidChatbotOutput> {
  return firstAidChatbotFlow(input);
}

const provideFirstAidAdvice = ai.defineTool({
  name: 'provideFirstAidAdvice',
  description: 'Provides first aid instructions for a specific medical emergency.',
  inputSchema: z.object({
    emergencyType: z.string().describe('The type of medical emergency.'),
    userMessage: z.string().describe('The user message to the chatbot.'),
  }),
  outputSchema: z.string(),
},
async (input) => {
    // Simulate providing first aid advice based on the emergency type
    if (input.emergencyType.toLowerCase().includes('heart attack')) {
      return 'For a heart attack, immediately call emergency services and administer CPR if the person is unresponsive.';
    } else if (input.emergencyType.toLowerCase().includes('stroke')) {
      return 'For a stroke, remember FAST: Face, Arms, Speech, Time. Call emergency services immediately.';
    } else if (input.emergencyType.toLowerCase().includes('allergic reaction')) {
      return 'For a severe allergic reaction, use an epinephrine auto-injector (EpiPen) if available and call emergency services.';
    } else {
      return `I am an agent designed to help with Heart Attack, Stroke, and Allergic Reaction emergencies. Please provide more details or specify the emergency.`;
    }
  }
);

const prompt = ai.definePrompt({
  name: 'firstAidChatbotPrompt',
  input: {schema: FirstAidChatbotInputSchema},
  output: {schema: FirstAidChatbotOutputSchema},
  tools: [provideFirstAidAdvice],
  prompt: `You are a first-aid chatbot that provides instructions to users based on their selected emergency type and message.

  Emergency Type: {{{emergencyType}}}
  User Message: {{{userMessage}}}

  Use the provideFirstAidAdvice tool to get the appropriate first aid instructions based on the user's emergency type and message. Respond to the user with the instructions provided by the tool.
  `,
});

const firstAidChatbotFlow = ai.defineFlow(
  {
    name: 'firstAidChatbotFlow',
    inputSchema: FirstAidChatbotInputSchema,
    outputSchema: FirstAidChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      chatbotResponse: output!.chatbotResponse,
    };
  }
);
