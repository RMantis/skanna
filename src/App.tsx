import { useState } from 'react';
import { useQuiz } from './hooks/useQuiz';
import { SelectionScreen } from './components/SelectionScreen';
import { QuizScreen } from './components/QuizScreen';

function App() {
  const quiz = useQuiz();
  const [selectedHira, setSelectedHira] = useState<string[]>([]);
  const [selectedKata, setSelectedKata] = useState<string[]>([]);

  const handleStartQuiz = (mode: any, hira: string[], kata: string[]) => {
    setSelectedHira(hira);
    setSelectedKata(kata);
    quiz.startQuiz(mode, hira, kata);
  };

  return (
    <>
      <h1>sKANnA</h1>
      <div className="container">
        {!quiz.quizActive ? (
          <SelectionScreen onStartQuiz={handleStartQuiz} />
        ) : (
          <QuizScreen
            quizState={quiz}
            selectedHira={selectedHira}
            selectedKata={selectedKata}
            onStopQuiz={quiz.stopQuiz}
            onCheckAnswer={quiz.checkAnswer}
            onSelectOption={quiz.selectOption}
            onShowSolution={quiz.showSolution}
          />
        )}
      </div>
    </>
  );
}

export default App;
