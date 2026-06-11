# sKANnA (KANA school)

A modern, responsive, and visually appealing web application to learn Japanese **Hiragana** and **Katakana** alphabets through smart quizzes, spaced repetition, and keyboard shortcuts.

## 🚀 Key Features

### 📊 Dynamic Character Selection
- **Side-by-Side Tables**: Intuitive selection using checkable rows for Hiragana and Katakana, showing corresponding romaji under each character.
- **Select All Toggles**: Dedicated checkboxes in headers to instantly select or deselect the entire Hiragana or Katakana alphabet.
- **Selection Persistence**: Group configurations are automatically saved in real-time in the browser (`localStorage`) and restored on page reload.
- **Real-Time Counts**: The total count and group split of selected characters (e.g., `Selected: 10 characters (5 Hiragana, 5 Katakana)`) are displayed:
  - Prominently at the bottom of the selection tables.
  - Discreetly at the bottom of the card during a quiz.

### 🧠 Intelligent Learning Algorithm (Spaced Repetition)
- **Performance Tracking**: The app tracks correct and wrong answers for each character, persisting statistics in the browser's `localStorage`.
- **Weighted Selection**: Automatically prioritizes new (unseen) characters and frequently-missed ones, gradually reducing the selection frequency for mastered characters.
- **Gradual Introduction**: Restricts new (unseen) characters to at most 3 active ones in the pool at any given time, preventing the user from being overwhelmed by too many new characters at once.
- **History Exclusion Buffer**: Avoids immediate or close repetitions of recently shown characters using an active history exclusion window (no consecutive or alternate repeats like `A -> B -> A -> C -> A`).

---

## 🎮 Quiz Modes

Directly start a quiz session by selecting one of the four modes at the bottom of the selection page:

1. **Single: Kana → Romaji**
   - Shows a single Kana character (Hiragana or Katakana).
   - User types the corresponding Romaji transliteration.
2. **Single: Romaji → Kana**
   - Shows a Romaji sound.
   - Multiple-choice grid containing 4 options in Kana.
3. **Phrases: Kana → Romaji**
   - Generates random sequences/words of 2 to 5 characters from your selection.
   - User types the corresponding Romaji string.
4. **Phrases: Romaji → Kana (with built-in IME converter)**
   - Generates random Romaji sequences.
   - User types answers using Kana characters.
   - **Real-time Conversion**: Automatically converts typed keys to Kana in the input box on the fly (e.g., typing `k` `a` `k` `i` converts directly to `かき`).

---

## ⌨️ Keyboard Shortcuts

Speed up your training sessions with built-in hotkeys:

- **Space / Enter**: Submits and verifies inputs in typing modes (no mouse click needed).
- **Escape (ESC)**: Acts as "Don't remember" — shows the correct solution in yellow and focuses the input field for mandatory typing to reinforce memorization.
- **Keys 1, 2, 3, 4**: Instantly selects options in multiple-choice mode (Romaji → Kana) without using the mouse.

---

## 🎨 Design & Theme
Designed with a sleek and modern look inspired by the dark **Catppuccin** palette:
- **Hiragana**: Accents and highlighted rows in soft pastel pink/flamingo.
- **Katakana**: Accents and highlighted rows in soft pastel blue/sky.
- **Visual Feedback**: Clean and soft green highlight for correct answers, and soft red highlight for incorrect attempts.
