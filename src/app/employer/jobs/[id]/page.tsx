'use client';

import EmployerDashboardPage from '../../dashboard/page';

export default function JobPipelinePage({ params }: { params: { id: string } }) {
  const PageContent = (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center py-12 text-muted-foreground">
        <h1 className="text-2xl font-bold">Hiring Pipeline</h1>
        <p>This page is ready to be rebuilt.</p>
      </div>
    </div>
  );

  return <EmployerDashboardPage>{PageContent}</EmployerDashboardPage>;
}
