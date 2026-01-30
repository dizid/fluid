import type { Module } from '@/types'

export const modules: Module[] = [
  {
    id: 'anatomy',
    title: 'Anatomy & Science',
    description: 'Understand the fascinating science behind pleasure and arousal.',
    icon: 'anatomy',
    isFree: true,
    order: 1,
    lessons: [
      {
        id: 'intro',
        title: 'Introduction',
        description: 'Setting expectations and understanding the journey ahead.',
        duration: 5,
        order: 1,
        content: [
          { type: 'heading', content: 'Welcome to Your Journey', level: 2 },
          {
            type: 'text',
            content: 'Before we dive into the science, let\'s set some important expectations. This module is about understanding, not performing. There are no tests, no grades, and absolutely no pressure.'
          },
          {
            type: 'callout',
            variant: 'info',
            content: 'Studies suggest 40-58% of women have experienced some form of female ejaculation in their lifetime. But whether you do or don\'t, both are completely normal.'
          },
          {
            type: 'text',
            content: 'What matters most is understanding your body (or your partner\'s body) with curiosity and compassion. Every body is unique, and that\'s something to celebrate.'
          },
          {
            type: 'reflection',
            prompt: 'What brought you here today? What are you hoping to learn or discover?',
            placeholder: 'Take a moment to reflect...'
          }
        ]
      },
      {
        id: 'anatomy-basics',
        title: 'The Anatomy of Pleasure',
        description: 'Exploring the clitoral network and surrounding structures.',
        duration: 10,
        order: 2,
        content: [
          { type: 'heading', content: 'More Than Meets the Eye', level: 2 },
          {
            type: 'text',
            content: 'Most of us were taught a simplified version of anatomy in school. The truth is far more fascinating. The clitoris isn\'t just a small external structure – it\'s an extensive network that extends inside the body.'
          },
          { type: 'heading', content: 'The Clitoral Network', level: 3 },
          {
            type: 'text',
            content: 'The visible part of the clitoris (the glans) is just the tip of the iceberg. Internally, the clitoris extends into two "legs" called crura that wrap around the vaginal canal, plus two bulbs that swell with arousal.'
          },
          { type: 'heading', content: 'The Urethral Sponge', level: 3 },
          {
            type: 'text',
            content: 'The urethral sponge (sometimes called the "G-spot area") is erectile tissue surrounding the urethra. It contains the Skene\'s glands, also known as the paraurethral glands, which can produce fluid during arousal.'
          },
          {
            type: 'callout',
            variant: 'tip',
            content: 'The Skene\'s glands are sometimes called the "female prostate" because they\'re embryologically similar to the male prostate.'
          },
          {
            type: 'text',
            content: 'This area can be particularly sensitive when properly aroused. The key word is "properly" – rushing to this area without building arousal first often feels uncomfortable rather than pleasurable.'
          }
        ]
      },
      {
        id: 'science',
        title: 'The Science Explained',
        description: 'What we know (and don\'t know) about female ejaculation.',
        duration: 8,
        order: 3,
        content: [
          { type: 'heading', content: 'What Does the Research Say?', level: 2 },
          {
            type: 'text',
            content: 'Female ejaculation has been documented throughout history, but scientific research is still catching up. Here\'s what current studies suggest:'
          },
          { type: 'heading', content: 'Two Different Phenomena', level: 3 },
          {
            type: 'text',
            content: 'Research distinguishes between two types of fluid release:'
          },
          {
            type: 'callout',
            variant: 'info',
            content: '**Female ejaculation**: A small amount (typically a few milliliters) of thick, whitish fluid from the Skene\'s glands, containing PSA (prostate-specific antigen).'
          },
          {
            type: 'callout',
            variant: 'info',
            content: '**Squirting**: A larger volume of dilute fluid that originates from the bladder, though its composition differs from urine and often occurs during intense arousal.'
          },
          {
            type: 'text',
            content: 'Many people experience a combination of both. Neither is "better" or more valid than the other.'
          },
          { type: 'heading', content: 'The Sensation Myth', level: 3 },
          {
            type: 'text',
            content: 'One important point: female ejaculation doesn\'t always accompany orgasm, and orgasm doesn\'t always include ejaculation. They\'re related but separate experiences. Some people find the release pleasurable, others find it neutral, and some prefer the sensations of holding back.'
          },
          {
            type: 'reflection',
            prompt: 'What surprised you most about what you\'ve learned so far?'
          }
        ]
      }
    ]
  },
  {
    id: 'mindset',
    title: 'Mindset & Arousal',
    description: 'Learn why relaxation and mental state are crucial for pleasure.',
    icon: 'mindset',
    isFree: true,
    order: 2,
    lessons: [
      {
        id: 'relaxation',
        title: 'The Relaxation Paradox',
        description: 'Why trying too hard works against you.',
        duration: 8,
        order: 1,
        content: [
          { type: 'heading', content: 'Let Go to Let It Flow', level: 2 },
          {
            type: 'text',
            content: 'Here\'s the paradox: the more you try to make something happen, the less likely it is to occur. This is especially true with sexual experiences, where tension and goal-orientation can block pleasure.'
          },
          {
            type: 'callout',
            variant: 'warning',
            content: 'Performance pressure is the #1 barrier to sexual pleasure. When we focus on achieving a specific outcome, we activate our stress response – the opposite of what our bodies need.'
          },
          { type: 'heading', content: 'The Science of Letting Go', level: 3 },
          {
            type: 'text',
            content: 'Sexual arousal requires activation of the parasympathetic nervous system – our "rest and digest" state. Stress, anxiety, and goal-fixation activate the sympathetic nervous system instead, which literally inhibits arousal.'
          },
          {
            type: 'text',
            content: 'This is why experiences often happen unexpectedly, when we\'re not trying – during moments of deep relaxation and connection.'
          },
          { type: 'heading', content: 'Shifting Your Focus', level: 3 },
          {
            type: 'text',
            content: 'Instead of focusing on an end goal, try shifting attention to:'
          },
          {
            type: 'callout',
            variant: 'tip',
            content: '• What sensations feel pleasurable right now?\n• How does your breath feel?\n• What would feel good in this moment?\n• How connected do you feel to yourself or your partner?'
          }
        ]
      },
      {
        id: 'arousal',
        title: 'Building Arousal',
        description: 'Understanding the arousal cycle and why time matters.',
        duration: 10,
        order: 2,
        content: [
          { type: 'heading', content: 'Arousal Takes Time', level: 2 },
          {
            type: 'text',
            content: 'One of the biggest misconceptions is that arousal should happen quickly. In reality, full physiological arousal – where blood flow increases, tissues swell, and the body is truly ready – typically takes 20-40 minutes.'
          },
          {
            type: 'callout',
            variant: 'info',
            content: 'Think of arousal like a simmer, not a boil. Rushing to high heat often burns the dish. Gentle, sustained warmth creates the best results.'
          },
          { type: 'heading', content: 'The Arousal Cycle', level: 3 },
          {
            type: 'text',
            content: 'Arousal isn\'t linear – it naturally ebbs and flows. This is normal and healthy. Allowing these waves, rather than fighting them, often leads to more intense experiences.'
          },
          {
            type: 'text',
            content: 'During high arousal, the urethral sponge becomes engorged with blood and the Skene\'s glands may begin producing fluid. Without sufficient arousal, stimulating these areas can feel uncomfortable or even painful.'
          },
          { type: 'heading', content: 'Creating the Right Conditions', level: 3 },
          {
            type: 'text',
            content: 'What helps build arousal:'
          },
          {
            type: 'callout',
            variant: 'tip',
            content: '• Mental engagement (fantasy, presence, connection)\n• Whole-body touch before genital focus\n• Breathing deeply and slowly\n• Feeling safe and unrushed\n• Communication about what feels good'
          },
          {
            type: 'reflection',
            prompt: 'What helps you feel most relaxed and present during intimate moments?'
          }
        ]
      },
      {
        id: 'breathwork',
        title: 'Breath & Body',
        description: 'Simple breathing techniques to enhance pleasure.',
        duration: 6,
        order: 3,
        content: [
          { type: 'heading', content: 'The Power of Breath', level: 2 },
          {
            type: 'text',
            content: 'Breath is one of the few bodily functions we can consciously control, making it a powerful tool for shifting our nervous system state. Slow, deep breathing activates relaxation responses.'
          },
          { type: 'heading', content: 'Basic Relaxation Breath', level: 3 },
          {
            type: 'callout',
            variant: 'tip',
            content: '1. Inhale slowly through your nose for 4 counts\n2. Hold gently for 2 counts\n3. Exhale through your mouth for 6 counts\n4. Repeat 5-10 times'
          },
          {
            type: 'text',
            content: 'The longer exhale is key – it signals safety to your nervous system. Practice this technique during daily activities so it becomes natural during intimate moments.'
          },
          { type: 'heading', content: 'Breath During Pleasure', level: 3 },
          {
            type: 'text',
            content: 'Many people unconsciously hold their breath during arousal, which can actually limit sensation and create tension. Try maintaining slow, deep breaths even as pleasure builds.'
          },
          {
            type: 'text',
            content: 'Some find that synchronized breathing with a partner creates deeper connection and enhances the experience for both people.'
          }
        ]
      }
    ]
  },
  {
    id: 'communication',
    title: 'Communication',
    description: 'Essential scripts and prompts for talking with your partner.',
    icon: 'communication',
    isFree: true,
    order: 3,
    lessons: [
      {
        id: 'opening-up',
        title: 'Starting the Conversation',
        description: 'How to broach intimate topics with your partner.',
        duration: 8,
        order: 1,
        content: [
          { type: 'heading', content: 'Breaking the Ice', level: 2 },
          {
            type: 'text',
            content: 'Talking about desires, curiosities, and intimate exploration can feel vulnerable. But communication is the foundation of satisfying sexual experiences. Here are some ways to start.'
          },
          { type: 'heading', content: 'Choose the Right Moment', level: 3 },
          {
            type: 'callout',
            variant: 'tip',
            content: 'Best times to talk: During a calm, relaxed moment – maybe during a walk, over dinner, or while cuddling. Avoid starting these conversations right before or during intimacy.'
          },
          { type: 'heading', content: 'Opening Lines', level: 3 },
          {
            type: 'text',
            content: 'Try framing the conversation around curiosity and learning together:'
          },
          {
            type: 'callout',
            variant: 'info',
            content: '"I\'ve been reading about something and I\'m curious to explore it with you..."\n\n"I want to learn more about what feels good for you. Can we talk about it?"\n\n"I found this app about intimacy education. Would you want to go through it together?"'
          },
          {
            type: 'text',
            content: 'The key is framing it as a shared journey of discovery rather than something one partner "does to" the other.'
          }
        ]
      },
      {
        id: 'boundaries',
        title: 'Boundaries & Consent',
        description: 'Establishing safety and ongoing consent.',
        duration: 7,
        order: 2,
        content: [
          { type: 'heading', content: 'Creating Safety', level: 2 },
          {
            type: 'text',
            content: 'Feeling safe is a prerequisite for pleasure. Clear boundaries and ongoing consent aren\'t just ethical requirements – they\'re practical tools for better experiences.'
          },
          { type: 'heading', content: 'Boundary-Setting Language', level: 3 },
          {
            type: 'callout',
            variant: 'tip',
            content: '"I\'d like to try X, but I\'m not ready for Y yet."\n\n"If I say \'pause,\' can we stop and check in?"\n\n"I might change my mind during – and that\'s okay."'
          },
          { type: 'heading', content: 'Ongoing Consent', level: 3 },
          {
            type: 'text',
            content: 'Consent isn\'t a one-time checkbox – it\'s an ongoing conversation. Check in throughout intimate experiences:'
          },
          {
            type: 'callout',
            variant: 'info',
            content: '"How does this feel?"\n\n"Do you want more or less pressure?"\n\n"Should I keep doing this or try something else?"\n\n"I\'m noticing you tensed up – are you okay?"'
          },
          {
            type: 'text',
            content: 'These check-ins don\'t break the mood – they build trust and often enhance connection.'
          }
        ]
      },
      {
        id: 'feedback',
        title: 'Giving & Receiving Feedback',
        description: 'How to guide your partner without criticism.',
        duration: 8,
        order: 3,
        content: [
          { type: 'heading', content: 'The Art of Feedback', level: 2 },
          {
            type: 'text',
            content: 'Guiding a partner toward what feels good requires both honesty and kindness. The goal is helping them succeed, not making them feel inadequate.'
          },
          { type: 'heading', content: 'Positive Redirection', level: 3 },
          {
            type: 'text',
            content: 'Instead of saying what\'s wrong, guide toward what would feel better:'
          },
          {
            type: 'callout',
            variant: 'tip',
            content: 'Instead of: "That\'s too hard"\nTry: "A little softer feels amazing"\n\nInstead of: "Not there"\nTry: "Move a little higher – yes, right there"\n\nInstead of: "You\'re doing it wrong"\nTry: "Let me show you what I love"'
          },
          { type: 'heading', content: 'Receiving Feedback', level: 3 },
          {
            type: 'text',
            content: 'When your partner gives feedback:'
          },
          {
            type: 'callout',
            variant: 'info',
            content: '• Thank them for communicating\n• Don\'t take it personally – they\'re helping you please them\n• Ask follow-up questions if needed\n• Try what they suggest and check in'
          },
          {
            type: 'reflection',
            prompt: 'What\'s one thing you\'ve wanted to communicate to your partner but haven\'t yet? How might you phrase it?'
          }
        ]
      }
    ]
  },
  {
    id: 'preparation',
    title: 'Preparation & Safety',
    description: 'Practical guidance for comfortable, safe exploration.',
    icon: 'preparation',
    isFree: true,
    order: 4,
    lessons: [
      {
        id: 'physical-prep',
        title: 'Physical Preparation',
        description: 'Hydration, environment, and practical considerations.',
        duration: 6,
        order: 1,
        content: [
          { type: 'heading', content: 'Setting Up for Success', level: 2 },
          {
            type: 'text',
            content: 'A little preparation goes a long way in creating comfortable, relaxed experiences. Here are practical considerations that are often overlooked.'
          },
          { type: 'heading', content: 'Hydration', level: 3 },
          {
            type: 'text',
            content: 'Being well-hydrated is important for all bodily functions, including sexual response. Drink water throughout the day – but don\'t overdo it right before, as a very full bladder can be distracting.'
          },
          { type: 'heading', content: 'Environment', level: 3 },
          {
            type: 'callout',
            variant: 'tip',
            content: '• Comfortable temperature (slightly warm is often best)\n• Soft lighting or candles\n• Clean, comfortable bedding\n• Towels nearby (dark colored towels are practical)\n• Privacy and freedom from interruption'
          },
          { type: 'heading', content: 'Practical Matters', level: 3 },
          {
            type: 'text',
            content: 'Some experiences involve more fluid than others. Waterproof mattress protectors or absorbent bed pads can remove worry about mess and help everyone relax and be present.'
          },
          {
            type: 'text',
            content: 'Keep tissues, a warm washcloth, and water nearby for aftercare. Small preparations show care and help maintain intimacy after.'
          }
        ]
      },
      {
        id: 'pelvic-floor',
        title: 'Pelvic Floor Awareness',
        description: 'Understanding tension and release in your body.',
        duration: 8,
        order: 2,
        content: [
          { type: 'heading', content: 'The Pelvic Floor Paradox', level: 2 },
          {
            type: 'text',
            content: 'You\'ve probably heard of Kegel exercises for strengthening the pelvic floor. But for many people, the issue isn\'t weakness – it\'s chronic tension. Learning to relax these muscles can be transformative.'
          },
          { type: 'heading', content: 'Identifying Tension', level: 3 },
          {
            type: 'text',
            content: 'The pelvic floor muscles can hold stress just like shoulders or jaw muscles. Many people unconsciously clench these muscles throughout the day, which can interfere with pleasure and release.'
          },
          { type: 'heading', content: 'Relaxation Exercise', level: 3 },
          {
            type: 'callout',
            variant: 'tip',
            content: '1. Lie down comfortably with knees bent\n2. Take several deep breaths\n3. As you exhale, consciously release your pelvic floor – imagine it softening downward\n4. Notice the difference between clenched and released\n5. Practice this release throughout daily life'
          },
          {
            type: 'text',
            content: 'The "need to pee" sensation that sometimes occurs during arousal is often a sign of pelvic floor tension. The instinct is to clench, but releasing (which feels counterintuitive) often leads to more pleasure.'
          },
          {
            type: 'callout',
            variant: 'info',
            content: 'Key insight: During intense pleasure, the body may want to release. Fighting this release by clenching can block the experience many people are seeking.'
          }
        ]
      },
      {
        id: 'hygiene',
        title: 'Hygiene & Safety',
        description: 'Clean hands, appropriate products, and health considerations.',
        duration: 5,
        order: 3,
        content: [
          { type: 'heading', content: 'Practical Safety', level: 2 },
          {
            type: 'text',
            content: 'Sexual health is an important part of any intimate practice. Here are essential safety considerations.'
          },
          { type: 'heading', content: 'Hand Hygiene', level: 3 },
          {
            type: 'callout',
            variant: 'warning',
            content: 'Clean hands are non-negotiable. Wash thoroughly with soap and water. Trim nails short and file any rough edges. Consider wearing latex or nitrile gloves if nails are long or for easier cleanup.'
          },
          { type: 'heading', content: 'Lubrication', level: 3 },
          {
            type: 'text',
            content: 'While the body produces natural lubrication during arousal, additional lubricant often enhances comfort. Water-based lubricants are safest for all purposes. Avoid anything with glycerin, parabens, or fragrances.'
          },
          { type: 'heading', content: 'When to Pause', level: 3 },
          {
            type: 'callout',
            variant: 'warning',
            content: 'Stop immediately if you experience:\n• Sharp pain (different from pleasurable pressure)\n• Burning sensation\n• Bleeding\n• Any sign of infection\n\nConsult a healthcare provider if symptoms persist.'
          },
          {
            type: 'text',
            content: 'Some soreness after sustained stimulation is normal. True pain is not. Trust your body and prioritize health over any goal.'
          }
        ]
      }
    ]
  }
]

export function getModule(id: string): Module | undefined {
  return modules.find(m => m.id === id)
}

export function getLesson(moduleId: string, lessonId: string) {
  const module = getModule(moduleId)
  return module?.lessons.find(l => l.id === lessonId)
}
