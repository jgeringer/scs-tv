import { SportsTicker } from '../utils/contentful';

interface ScoresDisplayProps {
  sportsTicker: SportsTicker;
}

export default function ScoresDisplay({ sportsTicker }: ScoresDisplayProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-emerald-800">Latest Scores</h2>
      <div className="space-y-6">
        {sportsTicker.teams.map((team) => (
          <div key={team.id} className="space-y-2">
            <h3 className="text-lg font-semibold text-emerald-700">{team.name}</h3>
            <div className="space-y-2">
              {team.games.map((game) => (
                <div key={game.id} className="flex items-center justify-between bg-white p-3 rounded shadow">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">SCS</span>
                    <span className="text-emerald-800 font-bold">{game.scsScore}</span>
                    <span className="text-gray-500">vs</span>
                    <span className="font-medium">{game.opponent}</span>
                    <span className="text-emerald-800 font-bold">{game.opponentScore}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {game.location} • {new Date(game.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 