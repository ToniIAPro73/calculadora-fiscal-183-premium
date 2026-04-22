import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ className, ...props }) => (
  <div className={cn("rounded-2xl border glass text-card-foreground shadow-2xl", className)} {...props} />
);

export const CardHeader: React.FC<CardProps> = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
);

export const CardTitle: React.FC<CardProps> = ({ className, ...props }) => (
  <div className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
);

export const CardDescription: React.FC<CardProps> = ({ className, ...props }) => (
  <div className={cn("text-sm text-muted-foreground", className)} {...props} />
);

export const CardContent: React.FC<CardProps> = ({ className, ...props }) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
);

export const CardFooter: React.FC<CardProps> = ({ className, ...props }) => (
  <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
);
