import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRepoErrorLogs, markErrorLogAsResolved } from "@/lib/actions";
import { AlertTriangle, GitBranch, Calendar, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";

export default async function ErrorLogDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const repo = await getRepoErrorLogs(params.id);

  if (!repo) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Repository Not Found</h3>
            <p className="text-muted-foreground mt-2">
              The repository you're looking for doesn't exist or you don't have access to it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <GitBranch className="h-6 w-6" />
          <h1 className="text-3xl font-bold">{repo.repoName}</h1>
        </div>
        <p className="text-muted-foreground">
          Error logs for {repo.repoFullName}
        </p>
      </div>

      {repo.repoConfig?.errorLogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No Error Logs</h3>
            <p className="text-muted-foreground mt-2">
              There are no error logs for this repository.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {repo.repoConfig.errorLogs.map((errorLog) => (
            <Card key={errorLog.id} className="border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {errorLog.type} Error
                  </CardTitle>
                  <div className="flex gap-2">
                    {errorLog.resolved ? (
                      <Badge variant="secondary">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolved
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Unresolved
                      </Badge>
                    )}
                    <Badge variant="outline">{errorLog.type}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Error Message:</h4>
                  <p className="text-muted-foreground bg-muted p-3 rounded-md font-mono text-sm">
                    {errorLog.message}
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{errorLog.occurredAt.toLocaleDateString()}</span>
                    <Clock className="h-4 w-4 ml-4 mr-2" />
                    <span>{errorLog.occurredAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  
                  {!errorLog.resolved && (
                    <form action={async () => {
                      "use server";
                      await markErrorLogAsResolved(errorLog.id);
                    }}>
                      <Button size="sm" variant="outline" type="submit">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Resolved
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}