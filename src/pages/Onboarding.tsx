import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserPreferences } from '@/types/journal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Sparkles, BookOpen, Brain, TrendingUp, PenLine, Mic, Keyboard, Shield, Cloud, Lock } from 'lucide-react';

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>('quillio-preferences', {
    thinkingStyle: 'journal',
    inputMethods: { handwriting: false, voice: true, typing: true },
    privacyLevel: 'balanced',
    hasCompletedOnboarding: false,
  });

  const completeOnboarding = () => {
    setPreferences({ ...preferences, hasCompletedOnboarding: true });
    navigate('/');
  };

  const steps = [
    // Screen 1: Welcome
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <Sparkles className="h-16 w-16 text-primary mb-6" />
      <h1 className="text-4xl font-bold mb-4">You think in 3 ways</h1>
      <p className="text-xl text-muted-foreground mb-2">Daily, deeply, over time.</p>
      <p className="text-lg text-muted-foreground mb-8">Quillio keeps them together.</p>
      <Button size="lg" onClick={() => setStep(1)} className="mt-4">
        Show me
      </Button>
    </div>,

    // Screen 2: Thinking Style
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Choose your thinking style</h2>
      <div className="space-y-4 w-full max-w-md">
        {[
          { value: 'journal', icon: BookOpen, label: 'I journal / reflect a lot' },
          { value: 'overthink', icon: Brain, label: 'I overthink decisions' },
          { value: 'patterns', icon: TrendingUp, label: 'I want to see patterns' },
        ].map(({ value, icon: Icon, label }) => (
          <Card
            key={value}
            className={`p-6 cursor-pointer transition-all hover:border-primary ${
              preferences.thinkingStyle === value ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => setPreferences({ ...preferences, thinkingStyle: value as any })}
          >
            <div className="flex items-center gap-4">
              <Icon className="h-6 w-6 text-primary" />
              <span className="text-lg">{label}</span>
            </div>
          </Card>
        ))}
      </div>
      <Button size="lg" onClick={() => setStep(2)} className="mt-8">
        Continue
      </Button>
    </div>,

    // Screen 3: Input Preferences
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">How do you like to think?</h2>
      <div className="space-y-4 w-full max-w-md">
        {[
          { key: 'handwriting', icon: PenLine, label: 'Handwriting' },
          { key: 'voice', icon: Mic, label: 'Voice' },
          { key: 'typing', icon: Keyboard, label: 'Typing' },
        ].map(({ key, icon: Icon, label }) => (
          <Card
            key={key}
            className={`p-6 cursor-pointer transition-all hover:border-primary ${
              preferences.inputMethods[key as keyof typeof preferences.inputMethods]
                ? 'border-primary bg-primary/5'
                : ''
            }`}
            onClick={() =>
              setPreferences({
                ...preferences,
                inputMethods: {
                  ...preferences.inputMethods,
                  [key]: !preferences.inputMethods[key as keyof typeof preferences.inputMethods],
                },
              })
            }
          >
            <div className="flex items-center gap-4">
              <Icon className="h-6 w-6 text-primary" />
              <span className="text-lg">{label}</span>
            </div>
          </Card>
        ))}
      </div>
      <Button size="lg" onClick={() => setStep(3)} className="mt-8">
        Continue
      </Button>
    </div>,

    // Screen 4: Privacy Level
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Choose your privacy level</h2>
      <div className="space-y-4 w-full max-w-md">
        {[
          {
            value: 'device',
            icon: Lock,
            label: 'On-device',
            desc: 'Everything stays on your device',
          },
          {
            value: 'balanced',
            icon: Shield,
            label: 'Balanced',
            desc: 'Encrypted processing, best experience',
          },
          {
            value: 'cloud',
            icon: Cloud,
            label: 'Cloud',
            desc: 'Full features, cloud sync',
          },
        ].map(({ value, icon: Icon, label, desc }) => (
          <Card
            key={value}
            className={`p-6 cursor-pointer transition-all hover:border-primary ${
              preferences.privacyLevel === value ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => setPreferences({ ...preferences, privacyLevel: value as any })}
          >
            <div className="flex items-start gap-4">
              <Icon className="h-6 w-6 text-primary mt-1" />
              <div>
                <div className="text-lg font-medium">{label}</div>
                <div className="text-sm text-muted-foreground">{desc}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Button size="lg" onClick={() => setStep(4)} className="mt-8">
        Continue
      </Button>
    </div>,

    // Screen 5: First Prompt
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">What's on your mind today?</h2>
      <p className="text-muted-foreground text-center mb-8 max-w-md">
        Your first thought. There's no wrong answer.
      </p>
      <Button size="lg" onClick={completeOnboarding}>
        Start journaling
      </Button>
    </div>,
  ];

  return <div className="bg-background">{steps[step]}</div>;
};

export default Onboarding;
