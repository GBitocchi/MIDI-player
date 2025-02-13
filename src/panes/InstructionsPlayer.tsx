import {ChangeEventHandler, useCallback, useEffect, useState} from 'react';
import {Score} from '../types';
import {PlayerModal} from '../visualization/PlayerModal';

const tunes = [
  {name: 'Test 1', data: '5_notes.json'},
  {name: 'Test 2', data: 'item-discovery.json'},
  {name: 'Test 3', data: 'yoshi-s-island.json'},
  {name: 'Tetris', data: 'tetris.json'},
  {name: 'The Legend of Zelda', data: 'zelda.json'},
  {name: 'Super Mario Bros.', data: 'smb.json'},
  {name: 'Megaman 3', data: 'megaman3.json'},
  {name: 'Super Mario Bros. 3', data: 'smb3.json'},
  {name: 'Little Nemo', data: 'dream-1-mushroom-forest.json'},
  {name: 'Duck Tales', data: 'the-moon.json'},
  {name: 'MEGALOVANIA', data: 'megalovania.json'},
];

export const InstructionsPlayer = () => {
  const [tuneFile, setTuneFile] = useState(parseRouteTuneFile() || tunes[0].data);
  const [score, setScore] = useState<Score>();
  const [shouldAutoStart, setShouldAutoStart] = useState(true);

  const isModalOpen = score !== undefined;

  const onSelect: ChangeEventHandler<HTMLSelectElement> = useCallback((event) => {
    setTuneFile(event.target.value);
  }, []);

  const onPlay = useCallback(async () => {
    const response = await fetch(`tunes/${tuneFile}`);
    const newScore = await response.json();

    setScore(newScore);
  }, [tuneFile]);

  const onAutoStart = useCallback(() => setShouldAutoStart(false), []);

  const onCloseModal = useCallback(() => {
    setScore(undefined);
    setShouldAutoStart(true);
  }, []);

  // Store selected file in URL param.
  useEffect(() => {
    const routeTuneFile = parseRouteTuneFile();

    if (routeTuneFile !== tuneFile) {
      window.history.replaceState('', '', `${window.location.pathname}?tune=${tuneFile}`);
    }
  });

  return (
    <>
      <h1>Player</h1>

      <div className="player-controls">
        <div className="select">
          <select onChange={onSelect} defaultValue={tuneFile}>
            {tunes.map((tune) => (
              <option key={tune.data} value={tune.data}>
                {tune.name}
              </option>
            ))}
          </select>
        </div>

        <button className="primary" onClick={onPlay} disabled={isModalOpen}>
          Play
        </button>
      </div>

      {isModalOpen && (
        <PlayerModal
          score={score}
          shouldAutoStart={shouldAutoStart}
          onAutoStart={onAutoStart}
          onRequestClose={onCloseModal}
        />
      )}
    </>
  );
};

function parseRouteTuneFile() {
  const routeTune = new URL(window.location.href).searchParams.get('tune');
  if (!routeTune) {
    return undefined;
  }

  return tunes.some((tune) => tune.data === routeTune) ? routeTune : undefined;
}
