"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, ChevronDown, ChevronRight, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Stream, Team } from "@/types/goals-kold";

interface StreamsListProps {
  streams: Stream[];
  selectedStream: Stream | null;
  selectedTeam: Team | null;
  expandedStreams: Set<string>;
  onSelectStream: (stream: Stream) => void;
  onSelectTeam: (team: Team) => void;
  onToggleStream: (streamId: string, e: React.MouseEvent) => void;
}

export function StreamsList({
  streams,
  selectedStream,
  selectedTeam,
  expandedStreams,
  onSelectStream,
  onSelectTeam,
  onToggleStream,
}: StreamsListProps) {
  return (
    <div className="w-[320px] flex-shrink-0 flex flex-col border rounded-lg overflow-hidden bg-card h-[calc(100vh-280px)]">
      <div className="p-2 border-b bg-muted/30 flex-shrink-0">
        <h3 className="font-semibold text-sm">Стримы и команды</h3>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="space-y-1 p-2">
          {streams.map((stream) => (
            <div key={stream.id} className="space-y-1">
              {/* Стрим */}
              <div
                className={cn(
                  "p-2 rounded-md cursor-pointer transition-colors",
                  selectedStream?.id === stream.id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                )}
                onClick={() => onSelectStream(stream)}
              >
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStream(stream.id, e);
                    }}
                  >
                    {expandedStreams.has(stream.id) ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm break-words">{stream.name}</div>
                  </div>
                  <Badge variant="outline" className="text-sm flex-shrink-0">
                    {stream.teams.length}
                  </Badge>
                </div>
              </div>
              
              {/* Команды стрима */}
              {expandedStreams.has(stream.id) && (
                <div className="ml-6 space-y-1">
                  {stream.teams.map((team) => (
                    <div
                      key={team.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTeam(team);
                      }}
                      className={cn(
                        "p-2 rounded-md cursor-pointer transition-colors text-sm",
                        selectedTeam?.id === team.id
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium break-words">{team.name}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
