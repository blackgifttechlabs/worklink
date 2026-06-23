import { useEffect, useMemo, useState } from 'react';
import './MarketplaceConversation.css';

type SpeakerTone = 'buyer' | 'seller';

type ConversationStep = {
  speaker: string;
  tone: SpeakerTone;
  text: string;
  spotlight?: boolean;
};

const conversationSequence: ConversationStep[] = [
  {
    speaker: 'Client',
    tone: 'buyer',
    text: 'I need a reliable worker for this job.'
  },
  {
    speaker: 'Worker',
    tone: 'seller',
    text: 'I am available and ready to help today.'
  },
  {
    speaker: 'Client',
    tone: 'buyer',
    text: 'Can you start soon and send your price?'
  },
  {
    speaker: 'Worker',
    tone: 'seller',
    text: 'Yes. ServiceLoop matched us nearby.'
  },
  {
    speaker: 'Client',
    tone: 'buyer',
    text: 'Great. I will pay once we agree.'
  },
  {
    speaker: 'Worker',
    tone: 'seller',
    text: 'Thanks to ServiceLoop, I found real work today.',
    spotlight: true
  }
];

export function MarketplaceConversation() {
  const [stepIndex, setStepIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const currentStep = conversationSequence[stepIndex];

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setTypedText(currentStep.text);
      setIsTyping(false);
      return;
    }

    let cancelled = false;
    let charIndex = 0;
    let typingTimer: number;
    let nextMessageTimer: number;
    let exitTimer: number;

    setTypedText('');
    setIsExiting(false);
    setIsTyping(false);

    const startTypingTimer = window.setTimeout(() => {
      if (cancelled) return;

      setIsTyping(true);

      const typeNextCharacter = () => {
        if (cancelled) return;

        setTypedText(currentStep.text.slice(0, charIndex));
        charIndex += 1;

        if (charIndex <= currentStep.text.length) {
          typingTimer = window.setTimeout(typeNextCharacter, 34);
          return;
        }

        setIsTyping(false);

        nextMessageTimer = window.setTimeout(
          () => {
            if (cancelled) return;

            setIsExiting(true);

            exitTimer = window.setTimeout(() => {
              if (cancelled) return;

              setStepIndex((previousIndex) => {
                return (previousIndex + 1) % conversationSequence.length;
              });
            }, currentStep.spotlight ? 760 : 420);
          },
          currentStep.spotlight ? 2300 : 1250
        );
      };

      typeNextCharacter();
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(startTypingTimer);
      window.clearTimeout(typingTimer);
      window.clearTimeout(nextMessageTimer);
      window.clearTimeout(exitTimer);
    };
  }, [currentStep, prefersReducedMotion]);

  return (
    <section className="sl-market-scene" aria-label="ServiceLoop conversation example">
      <div className="sl-market-scene-bg" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="sl-market-copy">
        <span>Local hiring made simple</span>
        <h2>Find the right worker, agree on the job, and get it done locally.</h2>
        <p>
          ServiceLoop connects clients with nearby workers, specialists, jobs,
          and local products.
        </p>
      </div>

      <div
        className={`sl-market-stage ${currentStep.spotlight ? 'is-worker-spotlight' : ''}`}
      >
        <div className="sl-market-person-wrap sl-market-seller-wrap">
          <span className="sl-market-float-shadow" aria-hidden="true" />
          <img
            className="sl-market-person sl-market-seller"
            src="https://i.postimg.cc/jdLzwCJs/man-selling.png"
            alt="ServiceLoop worker ready to help"
            loading="lazy"
            decoding="async"
          />
        </div>

        <SpeechBubble
          tone="buyer"
          active={currentStep.tone === 'buyer'}
          exiting={isExiting && currentStep.tone === 'buyer'}
          typing={isTyping && currentStep.tone === 'buyer'}
          spotlight={false}
          speaker={currentStep.tone === 'buyer' ? currentStep.speaker : 'Client'}
          text={currentStep.tone === 'buyer' ? typedText : ''}
        />

        <SpeechBubble
          tone="seller"
          active={currentStep.tone === 'seller'}
          exiting={isExiting && currentStep.tone === 'seller'}
          typing={isTyping && currentStep.tone === 'seller'}
          spotlight={Boolean(currentStep.spotlight)}
          speaker={currentStep.tone === 'seller' ? currentStep.speaker : 'Worker'}
          text={currentStep.tone === 'seller' ? typedText : ''}
        />

        <div className="sl-market-cash" aria-hidden={!currentStep.spotlight}>
          <span className="sl-market-cash-icon">💵</span>
          <span>Paid</span>
        </div>

        <div className="sl-market-person-wrap sl-market-buyer-wrap">
          <span className="sl-market-float-shadow" aria-hidden="true" />
          <img
            className="sl-market-person sl-market-buyer"
            src="https://i.postimg.cc/ZKCrB0vs/woman-lending-money.png"
            alt="ServiceLoop client paying for local work"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}

type SpeechBubbleProps = {
  tone: SpeakerTone;
  active: boolean;
  exiting: boolean;
  typing: boolean;
  spotlight: boolean;
  speaker: string;
  text: string;
};

function SpeechBubble({
  tone,
  active,
  exiting,
  typing,
  spotlight,
  speaker,
  text
}: SpeechBubbleProps) {
  const className = [
    'sl-market-bubble',
    `is-${tone}`,
    active ? 'is-active' : '',
    exiting ? 'is-exiting' : '',
    typing ? 'is-typing' : '',
    spotlight ? 'is-spotlight' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className} aria-live="polite">
      <span className="sl-market-speaker">{speaker}</span>
      <span className="sl-market-line">
        {text}
        {!typing && active && tone === 'seller' && (
          <span className="material-symbols-outlined ml-1.5 align-middle text-[#53bdeb] text-[18px] inline-flex -mt-0.5">
            done_all
          </span>
        )}
      </span>
    </div>
  );
}
