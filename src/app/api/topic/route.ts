import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { style, level } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is missing.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.9 }
    });
    let targetPrompt = "";
    let formats: string[] = [];

    if (style === 'Casual Conversation') {
      if (level === 'Beginner') {
        targetPrompt = "Korean adult English learners at a beginner level practicing casual, everyday spoken English.";
        formats = [
          "A chat between coworkers discussing lunch options",
          "A dialogue between a customer and a barista at a coffee shop",
          "Two friends catching up after a long time no see",
          "A chat between neighbors about the weather or community news",
          "A dialogue asking for directions on the street",
          "Two people discussing their hobbies and weekend activities",
          "A casual conversation about trying a new restaurant",
          "A dialogue about shopping for clothes at a mall",
          "Two friends discussing their favorite music or concerts",
          "Two golfers discussing the course conditions before teeing off",
          "A casual chat between friends discussing the latest tech gadget",
          "A chat about a funny video they saw on social media",
          "A conversation about a surprisingly good deal found at a store",
          "Friends discussing their dream travel destinations",
          "A casual chat about trying out a new recipe at home",
          "Two people discussing their favorite sports team's recent performance",
          "A conversation about what to watch on Netflix tonight",
          "A chat between classmates about an upcoming exam",
          "A conversation about buying a gift for a friend's birthday",
          "A dialogue about returning a library book",
          "Two friends talking about their morning routines",
          "A chat about their favorite types of desserts",
          "A casual talk about a popular new cafe in town",
          "A conversation about taking public transportation versus driving",
          "Friends discussing their favorite seasonal weather",
          "A chat about learning how to ride a bike or swim",
          "A dialogue at a grocery store asking for an item's location",
          "Two coworkers talking about traffic on their commute",
          "A conversation about favorite childhood snacks",
          "A casual chat about home decoration ideas",
          "Friends talking about a recent pop concert they attended",
          "A chat about growing indoor plants",
          "A conversation about the benefits of drinking more water",
          "Two people talking about a new bakery that opened nearby",
          "A dialogue asking a stranger for the time",
          "A chat about favorite smartphone apps",
          "Friends discussing what they usually do on a Sunday afternoon",
          "A casual conversation about their favorite pizza toppings",
          "A talk about the best places to take a walk in the city",
          "Two coworkers discussing their coffee preferences",
          "A chat about adopting a new morning habit",
          "A conversation about favorite board games",
          "Friends talking about finding a good gym",
          "A dialogue about buying tickets for a movie",
          "A casual chat about a cute dog they saw in the park",
          "A conversation about how they usually celebrate their birthday",
          "Two friends discussing a new fashion trend",
          "A chat about the easiest meals to cook at home",
          "A dialogue between a passenger and a taxi driver",
          "Friends talking about their favorite ice cream flavors"
        ];
      } else {
        targetPrompt = "Korean adult English learners at an intermediate level practicing casual, everyday spoken English.";
        formats = [
          "A casual conversation between friends about planning a weekend trip",
          "A casual conversation about a recently watched movie or TV show",
          "A chat between friends discussing their fitness routines",
          "A conversation between roommates about splitting household chores",
          "A chat about adopting a pet",
          "A casual dialogue about an upcoming holiday or festival",
          "A conversation between two golfers where Person A just made a birdie",
          "A conversation between two golfers where Person B just made a terrible miss shot and A is comforting them",
          "Coworkers talking about their plans for the upcoming long weekend",
          "A conversation at a networking event between two strangers",
          "Friends talking about a recent book they both read",
          "A dialogue between parents discussing their children's school activities",
          "A chat about learning a new language or skill",
          "Coworkers discussing a challenging project over coffee",
          "A conversation about favorite childhood memories",
          "Friends talking about how to manage stress from work",
          "A dialogue about returning an item at a customer service desk",
          "A conversation about navigating a career change",
          "Friends discussing the pros and cons of working from home",
          "A chat about resolving a minor conflict with a neighbor",
          "A dialogue discussing how to reduce screen time",
          "Two people debating the best way to invest small savings",
          "A conversation about planning a surprise party for a mutual friend",
          "Friends talking about cultural differences they experienced while traveling",
          "A dialogue about negotiating a better price at a flea market",
          "A chat about the challenges of maintaining a healthy diet",
          "Two coworkers sharing tips on improving productivity",
          "A conversation about whether social media is more helpful or harmful",
          "Friends discussing their goals for the next five years",
          "A dialogue giving advice to a friend who is going through a breakup",
          "A chat about the ethics of artificial intelligence in daily life",
          "A conversation about the impact of climate change on their local area",
          "Two people sharing their experiences with volunteering",
          "A dialogue discussing a controversial news headline",
          "Friends talking about the importance of mental health awareness",
          "A conversation about how to politely decline an invitation",
          "A chat about the most valuable lessons learned in their 20s",
          "A dialogue discussing strategies for dealing with difficult coworkers",
          "Two parents talking about the challenges of raising teenagers",
          "A conversation about the minimalist lifestyle and decluttering",
          "Friends debating the value of traditional education versus online learning",
          "A chat about the experience of moving to a new city",
          "A dialogue planning a community charity event",
          "Two people discussing the psychological effects of modern advertising",
          "A conversation about how they overcame a significant fear",
          "Friends talking about the balance between saving money and enjoying life",
          "A chat about the role of luck versus hard work in success",
          "A dialogue about organizing a successful family reunion",
          "A conversation about how they handle constructive criticism",
          "Two coworkers discussing the dynamics of leadership in their team"
        ];
      }
    } else {
      if (level === 'Beginner') {
        targetPrompt = "Korean adult English learners at a beginner level practicing essay writing. Focus on simple, highly relatable, and highly diverse topics like daily life, hobbies, food, family, and personal preferences.";
        formats = [
          "Describe your favorite hobby and why you love it",
          "Write about a memorable trip you took with your family",
          "Explain how to cook your favorite simple meal",
          "Describe your ideal weekend routine",
          "What is your favorite season and why?",
          "Write about a person who has strongly influenced your life",
          "If you could have any superpower, what would it be and how would you use it?",
          "Describe the best gift you have ever received",
          "Would you rather live in a big city or a quiet countryside? Why?",
          "Write a review of the last movie you watched",
          "Explain your morning routine step by step",
          "Describe a typical day in your life",
          "Write about your favorite childhood memory",
          "What are the benefits of having a pet?",
          "Describe your dream vacation destination",
          "Write about a book that changed your perspective",
          "What is your favorite holiday and how do you celebrate it?",
          "Explain the importance of eating healthy food",
          "Describe a skill you would like to learn in the future",
          "Write about your favorite music genre or artist",
          "What are three things you cannot live without?",
          "Describe a time when you helped someone in need",
          "Would you rather travel to the past or the future? Explain your choice",
          "Write about your favorite place to relax",
          "Explain how you manage your time during a busy week",
          "Describe a goal you achieved recently and how you felt",
          "Write about your best friend and what makes your friendship special",
          "What do you like most about your hometown?",
          "Describe a funny incident that happened to you recently",
          "Write a diary entry about a really good day you had",
          "Explain why learning English is important to you",
          "Describe your favorite sports team or athlete",
          "Would you rather read a book or watch a movie? Why?",
          "Write about a time you tried something new for the first time",
          "Explain the benefits of exercising regularly",
          "Describe your favorite type of weather and how it makes you feel",
          "Write about a tradition your family has",
          "What is the most interesting thing you learned recently?",
          "Describe a museum or historical place you visited",
          "Would you rather have a lot of money or a lot of free time? Explain",
          "Write about a time you overcame a small fear",
          "Explain how to play your favorite game or sport",
          "Describe your favorite article of clothing and why you like it",
          "Write about the best meal you have ever eaten",
          "What do you usually do to relieve stress?",
          "Describe a time you got lost and how you found your way",
          "Write about a habit you want to break",
          "Would you rather work in an office or work from home? Why?",
          "Explain how you celebrate your birthday",
          "Describe a typical breakfast in your country"
        ];
      } else {
        targetPrompt = "Korean adult English learners at an intermediate level practicing essay writing. Focus on moderately complex, highly diverse topics like career, relationships, modern culture, technology, or social trends.";
        formats = [
          "Argue whether technology isolates us or brings us closer together",
          "Discuss the ethical implications of artificial intelligence in the workplace",
          "What are the biggest challenges facing modern education today?",
          "Analyze the impact of social media on mental health among young adults",
          "Compare and contrast the benefits of a minimalist lifestyle versus consumerism",
          "Write an editorial on the importance of environmental conservation",
          "Discuss the role of remote work in the future of employment",
          "Explain the psychological effects of modern advertising on consumers",
          "Debate the pros and cons of implementing a universal basic income",
          "Analyze the cultural differences in how people view success",
          "Discuss the importance of financial literacy in high school curriculums",
          "What is the most significant technological invention of the 21st century?",
          "Write about the challenges and rewards of navigating a career change",
          "Evaluate the effectiveness of online learning compared to traditional classrooms",
          "Discuss the ethics of genetic engineering and cloning",
          "Analyze how globalization has affected local cultures and traditions",
          "Write a persuasive essay on the need for stricter data privacy laws",
          "Compare the advantages of starting a business versus working for a corporation",
          "Discuss the psychological impact of living in a hyper-connected world",
          "What are the long-term consequences of an aging population?",
          "Debunk a common myth regarding productivity and work ethic",
          "Discuss the societal impacts of the rise of freelance and gig economy work",
          "Analyze the importance of emotional intelligence in leadership roles",
          "Write about the challenges of balancing professional ambition with personal life",
          "Discuss how modern architecture reflects societal values",
          "Evaluate the role of art and literature in addressing political issues",
          "What are the ethical responsibilities of social media platforms regarding misinformation?",
          "Discuss the benefits and drawbacks of space exploration funding",
          "Analyze the impact of fast fashion on the global environment",
          "Write a critical review of a recent cultural trend or phenomenon",
          "Compare the problem-solving approaches of two different generations",
          "Discuss the implications of a cashless society on privacy and security",
          "Evaluate the effectiveness of renewable energy sources in replacing fossil fuels",
          "Write about the importance of mental health days in corporate culture",
          "Discuss the ethical dilemma of autonomous vehicles in unavoidable accidents",
          "Analyze how historical events continue to shape modern foreign policies",
          "What is the role of traditional media in the age of citizen journalism?",
          "Discuss the psychological barriers to making sustainable lifestyle choices",
          "Evaluate the pros and cons of adopting a four-day work week",
          "Write an essay on the philosophical meaning of happiness in the modern world",
          "Analyze the role of sports in bridging cultural divides",
          "Discuss the challenges of urban planning in rapidly growing megacities",
          "Write a persuasive argument for or against the privatization of space travel",
          "Discuss the social implications of deepfake technology",
          "Analyze how consumer behavior shifts during economic recessions",
          "Evaluate the moral arguments surrounding animal testing for medical research",
          "Write about the long-term societal effects of declining birth rates",
          "Discuss the role of corporate social responsibility in today's business landscape",
          "Analyze the intersection of ethics and profitability in the pharmaceutical industry",
          "Evaluate the societal impact of the true crime genre in popular media"
        ];
      }
    }
    const randomFormat = formats[Math.floor(Math.random() * formats.length)];
    
    const randomSeed = Math.floor(Math.random() * 100000);
    
    const prompt = `Generate a single, random, highly engaging English writing prompt. 
    The prompt MUST be designed for: ${targetPrompt}.
    Format requirement: The prompt MUST be of this specific format/style: "${randomFormat}".
    Make the topic highly specific, relatable, and thought-provoking so the user has a lot to write about. DO NOT generate generic topics.
    Use this random seed to ensure the topic is entirely different from previous ones: ${randomSeed}.
    Return ONLY the prompt text without any quotes, numbering, or extra words. Output should be in English.`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    return NextResponse.json({ topic: text });
  } catch (error: unknown) {
    console.error('Error generating topic:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
