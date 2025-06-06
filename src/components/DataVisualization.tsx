"use client"

import { LedgerEntry } from '@/lib/types';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMemo } from 'react';

interface DataVisualizationProps {
  data: LedgerEntry[];
}

const CHART_TEXT_COLOR = "hsl(var(--foreground))"; // Using CSS variable for dynamic color

export default function DataVisualization({ data }: DataVisualizationProps) {
  const aggregateData = (key: keyof LedgerEntry | ((entry: LedgerEntry) => string)) => {
    const aggregation = data.reduce((acc, entry) => {
      const keyValue = typeof key === 'function' ? key(entry) : String(entry[key]);
      acc[keyValue] = (acc[keyValue] || 0) + entry.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(aggregation)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount) // Sort by amount descending
      .slice(0, 10); // Take top 10
  };

  const dataByGiver = useMemo(() => aggregateData('giver'), [data]);
  const dataByLocation = useMemo(() => aggregateData(entry => entry.location.county), [data]);
  
  const dataByCategory = useMemo(() => {
    const aggregation = data.reduce((acc, entry) => {
      entry.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + entry.amount;
      });
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(aggregation)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [data]);

  const dataByMonth = useMemo(() => {
    const aggregation = data.reduce((acc, entry) => {
      const monthYear = new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      acc[monthYear] = (acc[monthYear] || 0) + entry.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Sort by date before formatting for chart
    return Object.entries(aggregation)
      .map(([name, amount]) => ({ name, date: new Date(name), amount }))
      .sort((a,b) => a.date.getTime() - b.date.getTime())
      .map(({name, amount}) => ({name, amount})) // Revert to original structure after sorting
      .slice(-12); // Last 12 months
  }, [data]);

  const ChartComponent = ({ chartData, dataKey, title }: { chartData: {name: string, amount: number}[], dataKey: string, title: string}) => (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 70 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="name" 
          angle={-45} 
          textAnchor="end" 
          height={100} 
          interval={0} 
          stroke={CHART_TEXT_COLOR}
          tick={{ fontSize: 12 }} 
        />
        <YAxis 
          stroke={CHART_TEXT_COLOR} 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value)}
        />
        <Tooltip
          contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
          cursor={{ fill: "hsla(var(--accent), 0.2)" }}
          formatter={(value: number) => [`KES ${value.toLocaleString()}`, "Amount"]}
        />
        <Legend wrapperStyle={{ color: CHART_TEXT_COLOR, paddingTop: '20px' }} />
        <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Amount (KES)" />
      </BarChart>
    </ResponsiveContainer>
  );

  if (data.length === 0) {
    return (
      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Data Visualizations</CardTitle>
          <CardDescription>Trends and patterns in alleged irregular donations.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Not enough data to display visualizations.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-12 shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">Data Visualizations</CardTitle>
        <CardDescription>Trends and patterns in alleged irregular donations. Showing top 10 by amount or last 12 months.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="giver">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
            <TabsTrigger value="giver">By Giver</TabsTrigger>
            <TabsTrigger value="location">By Location</TabsTrigger>
            <TabsTrigger value="category">By Category</TabsTrigger>
            <TabsTrigger value="time">By Time Period</TabsTrigger>
          </TabsList>
          <TabsContent value="giver">
            <ChartComponent chartData={dataByGiver} dataKey="giver" title="Top 10 Givers by Amount" />
          </TabsContent>
          <TabsContent value="location">
            <ChartComponent chartData={dataByLocation} dataKey="location" title="Top 10 Locations by Amount" />
          </TabsContent>
          <TabsContent value="category">
            <ChartComponent chartData={dataByCategory} dataKey="category" title="Top 10 Categories by Amount" />
          </TabsContent>
          <TabsContent value="time">
             <ChartComponent chartData={dataByMonth} dataKey="time" title="Amounts by Month (Last 12)" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
