"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, Hospital, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface TotalLossCounterProps {
  totalAmount: number;
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    const duration = 1500; // Animation duration in ms
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsedTime = now - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      setCurrentValue(Math.floor(progress * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span className="font-headline font-bold text-5xl md:text-7xl text-destructive">
      {currentValue.toLocaleString()}
    </span>
  );
};

export default function TotalLossCounter({ totalAmount }: TotalLossCounterProps) {
  const hospitalsCouldBuild = Math.floor(totalAmount / 50000000); // Assuming KES 50M per hospital
  const scholarshipsCouldFund = Math.floor(totalAmount / 200000); // Assuming KES 200K per scholarship

  return (
    <Card className="w-full shadow-xl border-accent border-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-headline text-primary">
            Total Alleged Misappropriation
          </CardTitle>
          <TrendingUp className="h-8 w-8 text-accent" />
        </div>
      </CardHeader>
      <CardContent className="text-center py-6">
        <div className="mb-4">
          <span className="text-3xl md:text-4xl font-bold text-muted-foreground mr-2">KES</span>
          <AnimatedNumber value={totalAmount} />
        </div>
        <CardDescription className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
          This staggering amount underscores the scale of alleged financial irregularities. 
          With these funds, Kenya could have potentially:
        </CardDescription>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="flex items-center p-3 bg-secondary/50 rounded-lg">
                <Hospital className="h-6 w-6 text-primary mr-3 shrink-0" />
                <p><span className="font-bold">{hospitalsCouldBuild.toLocaleString()}</span> fully equipped level 4 hospitals.</p>
            </div>
            <div className="flex items-center p-3 bg-secondary/50 rounded-lg">
                <GraduationCap className="h-6 w-6 text-primary mr-3 shrink-0" />
                <p><span className="font-bold">{scholarshipsCouldFund.toLocaleString()}</span> university scholarships for deserving students.</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
