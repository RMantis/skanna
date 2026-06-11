import { useState } from 'react';
import { useQuiz } from './hooks/useQuiz';
import { SelectionScreen } from './components/SelectionScreen';
import { QuizScreen } from './components/QuizScreen';
import { Language, translations } from './constants/translations';
import { storageService } from './services/storageService';

function App() {
  const [lang, setLang] = useState<Language>(storageService.loadLanguage());
  const quiz = useQuiz(lang);
  const [selectedHira, setSelectedHira] = useState<string[]>([]);
  const [selectedKata, setSelectedKata] = useState<string[]>([]);

  const handleStartQuiz = (mode: any, hira: string[], kata: string[]) => {
    setSelectedHira(hira);
    setSelectedKata(kata);
    quiz.startQuiz(mode, hira, kata);
  };

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    storageService.saveLanguage(newLang);
  };

  const t = translations[lang];

  return (
    <>
      <h1>sKANnA</h1>
      <div className="container" style={{ position: 'relative' }}>
        <div className="language-selector">
          <span className="globe-icon" style={{ fontSize: '1rem' }}>🌐</span>
          <select value={lang} onChange={(e) => handleLanguageChange(e.target.value as Language)}>
            <option value="en">English</option>
            <option value="it">Italiano</option>
          </select>
        </div>

        {!quiz.quizActive ? (
          <SelectionScreen t={t} onStartQuiz={handleStartQuiz} />
        ) : (
          <QuizScreen
            t={t}
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
