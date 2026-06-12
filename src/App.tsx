import { useState, useEffect, useRef } from 'react';
import { useQuiz } from './hooks/useQuiz';
import { SelectionScreen } from './components/SelectionScreen';
import { QuizScreen } from './components/QuizScreen';
import { Language, translations } from './constants/translations';
import { storageService, JapaneseFont } from './services/storageService';
import packageJson from '../package.json';
import appIcon from './assets/icon.png';

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
      <header className="header-bar">
        <div className="logo-container" onClick={() => { if (quiz.quizActive) quiz.stopQuiz(); }} title="Home / Reset Filters">
          <img src={appIcon} alt="sKANnA Logo" className="logo-img" />
          <h1 className="visually-hidden">sKANnA</h1>
        </div>

        <div className="header-controls">
          <button
            type="button"
            className="reset-btn"
            onClick={handleResetStats}
            title={t.resetStats}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          </button>

          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? t.switchToLight : t.switchToDark}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
          </button>

          <div className="custom-dropdown" ref={fontDropdownRef}>
            <button
              type="button"
              className="dropdown-trigger"
              onClick={() => setFontDropdownOpen(!fontDropdownOpen)}
              title={t.fontSelection}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 7 4 4 20 4 20 7" />
                <line x1="9" y1="20" x2="15" y2="20" />
                <line x1="12" y1="4" x2="12" y2="20" />
              </svg>
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
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                <path d="M2 12h20" />
              </svg>
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
      </header>

      <main className={`main-content ${quiz.quizActive ? 'quiz-layout' : ''}`}>
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
      </main>
      <footer className="footer">
        <span className="footer-group brand-text">
          <span className="brand-muted">s</span>
          <span className="brand-highlight">KAN</span>
          <span className="brand-muted">n</span>
          <span className="brand-highlight">A</span>
          <span className="footer-version">&nbsp;v{packageJson.version}</span>
        </span>
        <span className="footer-group">
          by Alessandro Rossini <span className="credit-divider">&bull;</span> <a href="https://github.com/RMantis/skanna" target="_blank" rel="noopener noreferrer">GitHub</a>
        </span>
      </footer>
    </>
  );
}

export default App;
