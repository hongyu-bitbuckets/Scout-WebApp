import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Badge } from "@/core/components/ui/badge";
import { ProgressCard } from "@/core/components/team-stats/ProgressCard";
import { MatchStatsDialog } from "./MatchStatsDialog";
import { MatchProgressionChart } from "@/core/components/team-stats/MatchProgressionChart";
import { DefenseAgainstTeamAnalysis } from "./DefenseAgainstTeamAnalysis";
import type { TeamStats } from "@/core/types/team-stats";
import type { RateSectionDefinition, MatchBadgeDefinition } from "@/types/team-stats-display";

interface PerformanceAnalysisProps {
    teamStats: TeamStats;
    compareStats: TeamStats | null;
    rateSections: RateSectionDefinition[];
    matchBadges: MatchBadgeDefinition[];
    selectedTeam: string;
    selectedEvent: string;
}

export function PerformanceAnalysis({
    teamStats,
    compareStats,
    rateSections,
    matchBadges,
    selectedTeam,
    selectedEvent,
}: PerformanceAnalysisProps) {
    if (teamStats.matchesPlayed === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground">No performance data available</p>
                </CardContent>
            </Card>
        );
    }

    const sections = rateSections.filter(s => s.tab === 'performance');

    const getStatValue = (stats: TeamStats, key: string): number => {
        const value = (stats as Record<string, unknown>)[key];
        return typeof value === 'number' ? value : 0;
    };

    const hasMatchBreakdown = (match: Record<string, unknown>) => {
        if (match['brokeDown'] === true) return true;

        const gameData = match['gameData'];
        if (!gameData || typeof gameData !== 'object') return false;

        const auto = (gameData as Record<string, unknown>)['auto'];
        const teleop = (gameData as Record<string, unknown>)['teleop'];

        const autoBrokenDownCount = auto && typeof auto === 'object'
            ? Number((auto as Record<string, unknown>)['brokenDownCount'] || 0)
            : 0;
        const teleopBrokenDownCount = teleop && typeof teleop === 'object'
            ? Number((teleop as Record<string, unknown>)['brokenDownCount'] || 0)
            : 0;

        return autoBrokenDownCount > 0 || teleopBrokenDownCount > 0;
    };

    const hasMatchNoShow = (match: Record<string, unknown>) => {
        if (match['noShow'] === true) return true;
        return typeof match['comment'] === 'string' && /no\s*show/i.test(match['comment']);
    };

    const getEndgameRecord = (match: Record<string, unknown>): Record<string, unknown> => {
        const gameData = match['gameData'];
        if (!gameData || typeof gameData !== 'object') return {};
        const endgame = (gameData as Record<string, unknown>)['endgame'];
        if (!endgame || typeof endgame !== 'object') return {};
        return endgame as Record<string, unknown>;
    };

    const getMatchSignalBadges = (match: Record<string, unknown>): string[] => {
        const endgame = getEndgameRecord(match);
        const badges: string[] = [];

        if (endgame['ratingExcellentStable'] === true) badges.push('Rated Excellent');
        if (endgame['ratingMediocre'] === true) badges.push('Rated Mediocre');
        if (endgame['ratingBad'] === true) badges.push('Rated Bad');

        if (endgame['statusHighMobility'] === true) badges.push('High Mobility');
        if (endgame['hardwareBigHopper'] === true) badges.push('Big Hopper');
        if (endgame['hardwareDefenseBot'] === true) badges.push('Defense Bot');
        if (endgame['statusAutoStoppedSuddenly'] === true) badges.push('Stopped in Auto');
        if (endgame['statusDisabledVoltageBurnout'] === true) badges.push('Disabled / Burnout');
        if (endgame['statusBrokeOnField'] === true) badges.push('Broke On Field');
        if (endgame['statusStuckOnTrenchSignificant'] === true) badges.push('Significant Trench Stuck');
        if (endgame['statusStuckOnBumpSignificant'] === true) badges.push('Significant Bump Stuck');
        if (endgame['statusStuckOnGamePieceCongestionSignificant'] === true) badges.push('Significant Congestion Stuck');

        if (endgame['shootingStyleStaticStill'] === true) badges.push('Style: Static and Still');
        if (endgame['shootingStyleDynamicStill'] === true) badges.push('Style: Dynamic and Still');
        if (endgame['shootingStyleDynamicTraversal'] === true) badges.push('Style: Dynamic and Traversals');

        return badges;
    };

    const getMatchSignalNotes = (match: Record<string, unknown>): string[] => {
        const endgame = getEndgameRecord(match);
        const notes: string[] = [];

        const shooterNote = endgame['shooterMalfunctionComment'];
        const hopperNote = endgame['hopperMalfunctionComment'];
        const intakeNote = endgame['intakeMalfunctionComment'];
        const ratingNote = endgame['ratingComment'];

        if (typeof shooterNote === 'string' && shooterNote.trim()) notes.push(`Shooter: ${shooterNote.trim()}`);
        if (typeof hopperNote === 'string' && hopperNote.trim()) notes.push(`Hopper: ${hopperNote.trim()}`);
        if (typeof intakeNote === 'string' && intakeNote.trim()) notes.push(`Intake: ${intakeNote.trim()}`);
        if (typeof ratingNote === 'string' && ratingNote.trim()) notes.push(`Rating: ${ratingNote.trim()}`);

        return notes;
    };

    // Extract match results for progression chart
    const matchResults = (teamStats as TeamStats & { matchResults?: any[] })?.matchResults || [];
    const compareMatchResults = compareStats ? (compareStats as TeamStats & { matchResults?: any[] })?.matchResults || [] : undefined;

    const renderMatchResults = () => {
        const matchResults = (teamStats as TeamStats & { matchResults?: Record<string, unknown>[] })?.matchResults;
        if (!matchResults || !Array.isArray(matchResults)) {
            return <p className="text-muted-foreground text-center py-4">No match data available</p>;
        }

        return (
            <div className="space-y-3">
                {matchResults.map((match, index: number) => {
                    const eventKey = typeof match['eventKey'] === 'string' ? match['eventKey'] : null;
                    const matchNumber = String(match['matchNumber'] || '');
                    const alliance = String(match['alliance'] || '');
                    const startPos = typeof match['startPosition'] === 'number' ? match['startPosition'] : null;
                    const totalPoints = String(match['totalPoints'] || 0);
                    const autoPoints = String(match['autoPoints'] || 0);
                    const teleopPoints = String(match['teleopPoints'] || 0);
                    const endgamePoints = String(match['endgamePoints'] || 0);
                    const comment = typeof match['comment'] === 'string' ? match['comment'] : "";
                    const matchHasBreakdown = hasMatchBreakdown(match);
                    const matchHasNoShow = hasMatchNoShow(match);
                    const matchSignalBadges = getMatchSignalBadges(match);
                    const matchSignalNotes = getMatchSignalNotes(match);

                    return (
                        <div key={index} className="flex flex-col p-3 border rounded gap-3">
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    {eventKey && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                            {eventKey}
                                        </Badge>
                                    )}
                                    <Badge variant="outline">Match {matchNumber}</Badge>
                                    <Badge
                                        variant={alliance.toLowerCase() === "red" ? "destructive" : "default"}
                                        className={alliance.toLowerCase() === "blue" ? "bg-blue-600" : ""}
                                    >
                                        {alliance}
                                    </Badge>
                                    {startPos !== null && startPos >= 0 && (
                                        <Badge variant="secondary">Pos {startPos}</Badge>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {matchHasNoShow && (
                                        <Badge variant="destructive">No Show</Badge>
                                    )}
                                    {matchHasBreakdown && (
                                        <Badge variant="destructive">Broke Down</Badge>
                                    )}
                                    {matchBadges.map(badge => {
                                        const matchValue = match[badge.key];
                                        if (matchValue === badge.showWhen) {
                                            return (
                                                <Badge key={badge.key} variant={badge.variant}>
                                                    {badge.label}
                                                </Badge>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                                {matchSignalBadges.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-2">
                                        {matchSignalBadges.map((badgeLabel, badgeIndex) => (
                                            <Badge key={`${badgeLabel}-${badgeIndex}`} variant="secondary">
                                                {badgeLabel}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="font-bold text-lg">{totalPoints} pts</div>
                                <div className="text-sm text-muted-foreground flex gap-2">
                                    <span className="bg-blue-500/10 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400">A: {autoPoints}</span>
                                    <span className="bg-purple-500/10 px-1.5 py-0.5 rounded text-purple-600 dark:text-purple-400">T: {teleopPoints}</span>
                                    <span className="bg-orange-500/10 px-1.5 py-0.5 rounded text-orange-600 dark:text-orange-400">E: {endgamePoints}</span>
                                </div>
                            </div>
                            {comment.trim() !== "" && (
                                <div className="text-xs text-muted-foreground italic border-t pt-2">
                                    "{comment}"
                                </div>
                            )}
                            {matchSignalNotes.length > 0 && (
                                <div className="text-xs text-muted-foreground border-t pt-2 space-y-1">
                                    {matchSignalNotes.map((note, noteIndex) => (
                                        <div key={`${note}-${noteIndex}`}>{note}</div>
                                    ))}
                                </div>
                            )}
                            <MatchStatsDialog
                                matchData={{
                                    matchNumber,
                                    teamNumber: typeof match['teamNumber'] === 'number' ? match['teamNumber'] : undefined,
                                    alliance,
                                    eventKey: eventKey || '',
                                    scoutName: typeof match['scoutName'] === 'string' ? match['scoutName'] : undefined,
                                    startPosition: startPos ?? undefined,
                                    comment,
                                    autoPoints: typeof match['autoPoints'] === 'number' ? match['autoPoints'] : 0,
                                    teleopPoints: typeof match['teleopPoints'] === 'number' ? match['teleopPoints'] : 0,
                                    endgamePoints: typeof match['endgamePoints'] === 'number' ? match['endgamePoints'] : 0,
                                    totalPoints: typeof match['totalPoints'] === 'number' ? match['totalPoints'] : 0,
                                    autoPassedMobilityLine: !!match['autoPassedMobilityLine'],
                                    climbAttempted: !!match['climbAttempted'],
                                    climbSucceeded: !!match['endgameSuccess'],
                                    parkAttempted: !!match['parkAttempted'],
                                    brokeDown: !!match['brokeDown'],
                                    playedDefense: !!match['playedDefense'],
                                    autoPath: Array.isArray(match['autoPath']) ? match['autoPath'] : [],
                                    teleopPath: Array.isArray(match['teleopPath']) ? match['teleopPath'] : [],
                                    autoFuel: typeof match['autoFuel'] === 'number' ? match['autoFuel'] : 0,
                                    autoFuelPassed: typeof match['autoFuelPassed'] === 'number' ? match['autoFuelPassed'] : 0,
                                    climbLevel: typeof match['climbLevel'] === 'number' ? match['climbLevel'] : undefined,
                                    gameData: match['gameData'] as {
                                        auto?: Record<string, unknown>;
                                        teleop?: Record<string, unknown>;
                                        endgame?: Record<string, unknown>;
                                    } | undefined,
                                }}
                                variant="outline"
                                size="default"
                                className="w-full mt-2"
                            />
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-6">            {/* Match Progression Chart */}
            <MatchProgressionChart
                matchResults={matchResults}
                compareMatchResults={compareMatchResults}
                teamNumber={teamStats.teamNumber}
                compareTeamNumber={compareStats?.teamNumber}
            />

            <DefenseAgainstTeamAnalysis
                teamNumber={selectedTeam}
                selectedEvent={selectedEvent}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Fixed: Points by Phase */}
                            <div>
                                <p className="text-sm font-medium mb-3">Points by Phase</p>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded">
                                        <span className="text-sm font-medium">Auto</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-blue-600">{getStatValue(teamStats, 'avgAutoPoints').toFixed(1)} pts</span>
                                            {compareStats && (
                                                <span className={`text-xs font-medium ${(getStatValue(teamStats, 'avgAutoPoints') - getStatValue(compareStats, 'avgAutoPoints')) > 0 ? 'text-green-600' :
                                                    (getStatValue(teamStats, 'avgAutoPoints') - getStatValue(compareStats, 'avgAutoPoints')) < 0 ? 'text-red-600' : 'text-gray-500'
                                                    }`}>
                                                    ({(getStatValue(teamStats, 'avgAutoPoints') - getStatValue(compareStats, 'avgAutoPoints')) > 0 ? '+' : ''}{(getStatValue(teamStats, 'avgAutoPoints') - getStatValue(compareStats, 'avgAutoPoints')).toFixed(1)})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded">
                                        <span className="text-sm font-medium">Teleop</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-purple-600">{getStatValue(teamStats, 'avgTeleopPoints').toFixed(1)} pts</span>
                                            {compareStats && (
                                                <span className={`text-xs font-medium ${(getStatValue(teamStats, 'avgTeleopPoints') - getStatValue(compareStats, 'avgTeleopPoints')) > 0 ? 'text-green-600' :
                                                    (getStatValue(teamStats, 'avgTeleopPoints') - getStatValue(compareStats, 'avgTeleopPoints')) < 0 ? 'text-red-600' : 'text-gray-500'
                                                    }`}>
                                                    ({(getStatValue(teamStats, 'avgTeleopPoints') - getStatValue(compareStats, 'avgTeleopPoints')) > 0 ? '+' : ''}{(getStatValue(teamStats, 'avgTeleopPoints') - getStatValue(compareStats, 'avgTeleopPoints')).toFixed(1)})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded">
                                        <span className="text-sm font-medium">Endgame</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-orange-600">{getStatValue(teamStats, 'avgEndgamePoints').toFixed(1)} pts</span>
                                            {compareStats && (
                                                <span className={`text-xs font-medium ${(getStatValue(teamStats, 'avgEndgamePoints') - getStatValue(compareStats, 'avgEndgamePoints')) > 0 ? 'text-green-600' :
                                                    (getStatValue(teamStats, 'avgEndgamePoints') - getStatValue(compareStats, 'avgEndgamePoints')) < 0 ? 'text-red-600' : 'text-gray-500'
                                                    }`}>
                                                    ({(getStatValue(teamStats, 'avgEndgamePoints') - getStatValue(compareStats, 'avgEndgamePoints')) > 0 ? '+' : ''}{(getStatValue(teamStats, 'avgEndgamePoints') - getStatValue(compareStats, 'avgEndgamePoints')).toFixed(1)})
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Configurable: Rate sections (e.g., Reliability Metrics) */}
                            {sections.map(section => (
                                <div key={section.id}>
                                    <p className="text-sm font-medium mb-3">{section.title}</p>
                                    <div className="space-y-3">
                                        {section.rates.map(rate => (
                                            <ProgressCard
                                                key={rate.key}
                                                title={rate.label}
                                                value={getStatValue(teamStats, rate.key)}
                                                compareValue={compareStats ? getStatValue(compareStats, rate.key) : undefined}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="self-start">
                    <CardHeader>
                        <CardTitle>Match-by-Match Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {renderMatchResults()}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
