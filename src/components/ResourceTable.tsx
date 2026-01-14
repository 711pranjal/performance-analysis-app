'use client';

import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { ResourceTiming } from '@/types';
import { formatBytes, formatDuration } from '@/lib/utils';
import { FileCode, Image, Link2, File } from 'lucide-react';

interface ResourceTableProps {
  resources: ResourceTiming[];
}

const getResourceIcon = (type: string) => {
  switch (type) {
    case 'script':
      return <FileCode className="h-4 w-4 text-yellow-500" />;
    case 'img':
      return <Image className="h-4 w-4 text-blue-500" />;
    case 'link':
    case 'css':
      return <Link2 className="h-4 w-4 text-purple-500" />;
    default:
      return <File className="h-4 w-4 text-muted-foreground" />;
  }
};

export function ResourceTable({ resources }: ResourceTableProps) {
  const sortedResources = [...resources].sort((a, b) => b.duration - a.duration);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Timings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-sm text-muted-foreground">
                <th className="pb-3 pr-4">Resource</th>
                <th className="pb-3 pr-4">Type</th>
                <th className="pb-3 pr-4">Duration</th>
                <th className="pb-3">Size</th>
              </tr>
            </thead>
            <tbody>
              {sortedResources.map((resource, index) => (
                <tr
                  key={index}
                  className="border-b border-border/50 text-sm transition-colors hover:bg-secondary/30"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      {getResourceIcon(resource.initiatorType)}
                      <span className="max-w-[200px] truncate text-card-foreground">
                        {resource.name.split('/').pop() || resource.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="rounded-full bg-secondary px-2 py-1 text-xs capitalize">
                      {resource.initiatorType}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-mono text-warning">
                    {formatDuration(resource.duration)}
                  </td>
                  <td className="py-3 font-mono text-muted-foreground">
                    {formatBytes(resource.transferSize)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
