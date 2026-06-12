import { useState, useEffect, useRef } from 'react';
import { useQuiz } from './hooks/useQuiz';
import { SelectionScreen } from './components/SelectionScreen';
import { QuizScreen } from './components/QuizScreen';
import { Language, translations } from './constants/translations';
import { storageService, JapaneseFont } from './services/storageService';

function App() {
  const [lang, setLang] = useState<Language>(storageService.loadLanguage());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('sKANnA_theme');
      return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    } catch (e) {
      return 'dark';
    }
  });
  const [font, setFont] = useState<JapaneseFont>(() => storageService.loadFont());
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fontDropdownRef = useRef<HTMLDivElement>(null);

  const quiz = useQuiz(lang);
  const [selectedHira, setSelectedHira] = useState<string[]>([]);
  const [selectedKata, setSelectedKata] = useState<string[]>([]);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('sKANnA_theme', theme);
    } catch (e) {
      console.error("Error saving theme preference:", e);
    }
  }, [theme]);

  // Click outside handling for custom dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(event.target as Node)) {
        setFontDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleStartQuiz = (mode: any, hira: string[], kata: string[]) => {
    setSelectedHira(hira);
    setSelectedKata(kata);
    storageService.saveLastMode(mode);
    quiz.startQuiz(mode, hira, kata);
  };

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    storageService.saveLanguage(newLang);
  };

  const handleFontChange = (newFont: JapaneseFont) => {
    setFont(newFont);
    storageService.saveFont(newFont);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleResetStats = () => {
    if (window.confirm(t.resetConfirm)) {
      storageService.clearStats();
      window.alert(t.resetSuccess);
      window.location.reload();
    }
  };

  const t = translations[lang];

  return (
    <>
      <div className="header-controls">
        <button 
          type="button"
          className="reset-btn" 
          onClick={handleResetStats} 
          title={t.resetStats}
        >
          🔄
        </button>

        <button 
          type="button"
          className="theme-toggle-btn" 
          onClick={toggleTheme} 
          title={theme === 'dark' ? t.switchToLight : t.switchToDark}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <div className="custom-dropdown" ref={fontDropdownRef}>
          <button 
            type="button"
            className="dropdown-trigger" 
            onClick={() => setFontDropdownOpen(!fontDropdownOpen)}
            title={t.fontSelection}
          >
            🔤
          </button>
          {fontDropdownOpen && (
            <div className="dropdown-menu">
              <button 
                type="button"
                className={`dropdown-item ${font === 'random' ? 'active' : ''}`} 
                onClick={() => { handleFontChange('random'); setFontDropdownOpen(false); }}
              >
                🎲 {t.fontRandom}
              </button>
              <button 
                type="button"
                className={`dropdown-item font-gothic ${font === 'gothic' ? 'active' : ''}`} 
                onClick={() => { handleFontChange('gothic'); setFontDropdownOpen(false); }}
              >
                A {t.fontGothic}
              </button>
              <button 
                type="button"
                className={`dropdown-item font-mincho ${font === 'mincho' ? 'active' : ''}`} 
                onClick={() => { handleFontChange('mincho'); setFontDropdownOpen(false); }}
              >
                A {t.fontMincho}
              </button>
              <button 
                type="button"
                className={`dropdown-item font-handwriting ${font === 'handwriting' ? 'active' : ''}`} 
                onClick={() => { handleFontChange('handwriting'); setFontDropdownOpen(false); }}
              >
                A {t.fontHandwriting}
              </button>
            </div>
          )}
        </div>

        <div className="custom-dropdown" ref={dropdownRef}>
          <button 
            type="button"
            className="dropdown-trigger" 
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            title={t.changeLanguage}
          >
            🌐
          </button>
          {langDropdownOpen && (
            <div className="dropdown-menu">
              <button 
                type="button"
                className={`dropdown-item ${lang === 'en' ? 'active' : ''}`} 
                onClick={() => { handleLanguageChange('en'); setLangDropdownOpen(false); }}
              >
                <span className="flag">🇬🇧</span> English
              </button>
              <button 
                type="button"
                className={`dropdown-item ${lang === 'it' ? 'active' : ''}`} 
                onClick={() => { handleLanguageChange('it'); setLangDropdownOpen(false); }}
              >
                <span className="flag">🇮🇹</span> Italiano
              </button>
            </div>
          )}
        </div>
      </div>

      <h1>sKANnA</h1>
      <div className="container">
        {!quiz.quizActive ? (
          <SelectionScreen t={t} onStartQuiz={handleStartQuiz} />
        ) : (
          <QuizScreen
            t={t}
            quizState={quiz}
            selectedHira={selectedHira}
            selectedKata={selectedKata}
            japaneseFont={font}
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
